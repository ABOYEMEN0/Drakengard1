/* eslint-disable no-console */
import { PrismaClient, Prisma, RoleName, CouponType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PERMISSIONS: { key: string; label: string }[] = [
  { key: 'orders:read', label: 'View orders' },
  { key: 'orders:write', label: 'Manage orders' },
  { key: 'products:read', label: 'View products' },
  { key: 'products:write', label: 'Manage products' },
  { key: 'customers:read', label: 'View customers' },
  { key: 'customers:write', label: 'Manage customers' },
  { key: 'invoices:read', label: 'View invoices' },
  { key: 'inventory:write', label: 'Manage inventory' },
  { key: 'reports:read', label: 'View reports' },
  { key: 'settings:write', label: 'Manage settings' },
];

const ALL = PERMISSIONS.map((p) => p.key);
const ROLE_MATRIX: Record<RoleName, string[]> = {
  SUPER_ADMIN: ALL,
  ADMIN: ALL,
  MANAGER: [
    'orders:read',
    'orders:write',
    'products:read',
    'products:write',
    'inventory:write',
    'reports:read',
  ],
  EMPLOYEE: ['orders:read', 'orders:write'],
  CUSTOMER: [],
};

const CATEGORIES = [
  { slug: 'coffee', name: 'Coffee', nameAr: 'قهوة', sortOrder: 1, description: 'Single-origin and signature roasts.' },
  { slug: 'chocolate', name: 'Chocolate', nameAr: 'شوكولاتة', sortOrder: 2, description: 'Artisan chocolate and pralines.' },
  { slug: 'nuts', name: 'Nuts', nameAr: 'مكسرات', sortOrder: 3, description: 'Premium roasted nuts and mixes.' },
  { slug: 'accessories', name: 'Accessories', nameAr: 'إكسسوارات', sortOrder: 4, description: 'Brewing and serving essentials.' },
  { slug: 'gift-boxes', name: 'Gift Boxes', nameAr: 'صناديق هدايا', sortOrder: 5, description: 'Curated luxury gift sets.' },
  { slug: 'seasonal', name: 'Seasonal', nameAr: 'موسمي', sortOrder: 6, description: 'Limited seasonal collections.' },
];

interface SeedProduct {
  slug: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  shortDescription: string;
  weight?: string;
  origin?: string;
  stock: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  tags: string[];
}

const PRODUCTS: SeedProduct[] = [
  { slug: 'ethiopian-yirgacheffe', sku: 'LEOR-CF-001', name: 'Ethiopian Yirgacheffe Single Origin', category: 'coffee', price: 89, shortDescription: 'Floral, citrus-bright light roast from the Gedeo zone.', weight: '250g', origin: 'Ethiopia', stock: 60, isFeatured: true, isBestSeller: true, tags: ['coffee', 'single-origin', 'light-roast'] },
  { slug: 'saudi-golden-blend', sku: 'LEOR-CF-002', name: 'Saudi Golden Blend with Cardamom', category: 'coffee', price: 75, salePrice: 65, shortDescription: 'Traditional Saudi coffee with premium Indian cardamom.', weight: '500g', origin: 'Saudi Arabia', stock: 120, isBestSeller: true, tags: ['coffee', 'arabic', 'cardamom'] },
  { slug: 'colombian-supremo-espresso', sku: 'LEOR-CF-003', name: 'Colombian Supremo Espresso Roast', category: 'coffee', price: 82, shortDescription: 'Caramel-sweet dark roast built for espresso.', weight: '250g', origin: 'Colombia', stock: 45, tags: ['coffee', 'espresso', 'dark-roast'] },
  { slug: 'dark-truffle-collection', sku: 'LEOR-CH-001', name: 'Dark Chocolate Truffle Collection', category: 'chocolate', price: 145, shortDescription: '16 handcrafted 70% dark truffles with ganache centers.', weight: '320g', origin: 'Belgium', stock: 35, isFeatured: true, tags: ['chocolate', 'truffles', 'dark'] },
  { slug: 'saffron-milk-chocolate-bar', sku: 'LEOR-CH-002', name: 'Saffron Milk Chocolate Bar', category: 'chocolate', price: 48, salePrice: 39, shortDescription: 'Silky milk chocolate infused with premium saffron.', weight: '90g', origin: 'Switzerland', stock: 80, tags: ['chocolate', 'saffron', 'milk'] },
  { slug: 'royal-pistachio-mix', sku: 'LEOR-NT-001', name: 'Royal Pistachio & Almond Mix', category: 'nuts', price: 95, shortDescription: 'Slow-roasted Iranian pistachios and Marcona almonds.', weight: '400g', origin: 'Iran / Spain', stock: 70, isBestSeller: true, tags: ['nuts', 'pistachio', 'almond'] },
  { slug: 'honey-glazed-cashews', sku: 'LEOR-NT-002', name: 'Honey Glazed Cashews with Sea Salt', category: 'nuts', price: 68, shortDescription: 'Whole cashews in Sidr honey glaze, finished with sea salt.', weight: '350g', origin: 'Vietnam', stock: 8, tags: ['nuts', 'cashew', 'honey'] },
  { slug: 'brass-dallah-pot', sku: 'LEOR-AC-001', name: 'Handcrafted Brass Dallah Pot', category: 'accessories', price: 320, shortDescription: 'Traditional Saudi coffee pot, hand-etched brass, 700ml.', weight: '1.1kg', origin: 'Saudi Arabia', stock: 15, isFeatured: true, tags: ['accessories', 'dallah', 'brass'] },
  { slug: 'leor-signature-gift-box', sku: 'LEOR-GB-001', name: 'LEOR Signature Gift Box', category: 'gift-boxes', price: 380, salePrice: 340, shortDescription: 'Coffee, truffles, and royal nut mix in a navy keepsake box.', weight: '1.5kg', stock: 25, isFeatured: true, isBestSeller: true, tags: ['gift', 'box', 'signature'] },
  { slug: 'ramadan-nights-collection', sku: 'LEOR-SE-001', name: 'Ramadan Nights Collection', category: 'seasonal', price: 260, shortDescription: 'Dates, chocolate, and Arabic coffee for the holy month.', weight: '1.2kg', stock: 40, tags: ['seasonal', 'ramadan', 'dates'] },
];

const COUPONS = [
  { code: 'WELCOME10', type: CouponType.PERCENT, value: 10 },
  { code: 'LEOR50', type: CouponType.FIXED, value: 50, minSubtotal: 400 },
  { code: 'GOLD15', type: CouponType.PERCENT, value: 15, minSubtotal: 250 },
];

const SETTINGS: { key: string; value: Prisma.InputJsonValue }[] = [
  { key: 'store.name', value: 'LEOR' },
  { key: 'whatsapp.number', value: '966500000000' },
  { key: 'shipping.fee', value: 25 },
  { key: 'shipping.freeThreshold', value: 300 },
  { key: 'tax.enabled', value: false },
  { key: 'tax.rate', value: 15 },
  { key: 'social.instagram', value: 'https://instagram.com/leor.sa' },
];

async function main() {
  // Permissions
  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: p.key },
      create: p,
      update: { label: p.label },
    });
  }
  const permissions = await prisma.permission.findMany();
  const permByKey = new Map(permissions.map((p) => [p.key, p.id]));

  // Roles + matrix
  for (const name of Object.values(RoleName)) {
    const role = await prisma.role.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    for (const key of ROLE_MATRIX[name]) {
      const permissionId = permByKey.get(key)!;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        create: { roleId: role.id, permissionId },
        update: {},
      });
    }
  }

  // Super admin
  const superAdmin = await prisma.role.findUniqueOrThrow({
    where: { name: RoleName.SUPER_ADMIN },
  });
  await prisma.user.upsert({
    where: { email: 'admin@leor.sa' },
    create: {
      email: 'admin@leor.sa',
      name: 'LEOR Admin',
      passwordHash: await bcrypt.hash('ChangeMe123!', 10),
      roleId: superAdmin.id,
    },
    update: { roleId: superAdmin.id },
  });

  // Categories
  for (const c of CATEGORIES) {
    await prisma.category.upsert({ where: { slug: c.slug }, create: c, update: c });
  }
  const categories = await prisma.category.findMany();
  const catBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  // Products
  for (const p of PRODUCTS) {
    const { category, price, salePrice, ...rest } = p;
    const data = {
      ...rest,
      categoryId: catBySlug.get(category)!,
      price: new Prisma.Decimal(price),
      salePrice: salePrice !== undefined ? new Prisma.Decimal(salePrice) : null,
    };
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: data,
      update: data,
    });
    const imageUrl = `/images/products/${p.slug}-1.svg`;
    const existingImage = await prisma.productImage.findFirst({
      where: { productId: product.id, url: imageUrl },
    });
    if (!existingImage) {
      await prisma.productImage.create({
        data: { productId: product.id, url: imageUrl, alt: p.name, sortOrder: 0 },
      });
    }
  }

  // Coupons
  for (const c of COUPONS) {
    const data = {
      code: c.code,
      type: c.type,
      value: new Prisma.Decimal(c.value),
      minSubtotal: c.minSubtotal !== undefined ? new Prisma.Decimal(c.minSubtotal) : null,
      isActive: true,
    };
    await prisma.coupon.upsert({ where: { code: c.code }, create: data, update: data });
  }

  // Settings
  for (const s of SETTINGS) {
    await prisma.setting.upsert({
      where: { key: s.key },
      create: s,
      update: { value: s.value },
    });
  }

  console.log('Seed complete: roles, permissions, admin user, categories, products, coupons, settings.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
