import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { getPagination, paginate } from '../common/utils/pagination';
import { CreateProductDto, ListProductsQueryDto, UpdateProductDto } from './dto/products.dto';

const CACHE_PREFIX = 'products:list:';

const listInclude = {
  category: { select: { slug: true, name: true } },
  images: { orderBy: { sortOrder: 'asc' as const } },
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async list(query: ListProductsQueryDto) {
    const cacheKey =
      CACHE_PREFIX +
      JSON.stringify({
        category: query.category,
        q: query.q,
        sale: query.sale,
        featured: query.featured,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        sort: query.sort,
        page: query.page,
        limit: query.limit,
      });
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const { page, limit, skip, take } = getPagination(query);
    const where: Prisma.ProductWhereInput = { isActive: true };

    if (query.category) where.category = { slug: query.category, isActive: true };
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { sku: { contains: query.q, mode: 'insensitive' } },
        { tags: { has: query.q.toLowerCase() } },
      ];
    }
    if (query.sale) where.salePrice = { not: null };
    if (query.featured) where.isFeatured = true;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = new Prisma.Decimal(query.minPrice);
      if (query.maxPrice !== undefined) where.price.lte = new Prisma.Decimal(query.maxPrice);
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[];
    switch (query.sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'bestselling':
        orderBy = [{ isBestSeller: 'desc' }, { orderItems: { _count: 'desc' } }];
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, include: listInclude, orderBy, skip, take }),
      this.prisma.product.count({ where }),
    ]);
    const result = paginate(products, total, page, limit);
    await this.redis.set(cacheKey, result, 60);
    return result;
  }

  async getBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isActive: true },
      include: {
        category: { select: { slug: true, name: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            authorName: true,
            rating: true,
            title: true,
            body: true,
            isVerified: true,
            createdAt: true,
          },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');

    const related = await this.prisma.product.findMany({
      where: { categoryId: product.categoryId, isActive: true, id: { not: product.id } },
      include: listInclude,
      orderBy: { createdAt: 'desc' },
      take: 4,
    });

    return { ...product, related };
  }

  async create(dto: CreateProductDto) {
    await this.assertUnique(dto.slug, dto.sku);
    const { images, salePrice, price, ...rest } = dto;
    const product = await this.prisma.product.create({
      data: {
        ...rest,
        price: new Prisma.Decimal(price),
        salePrice: salePrice != null ? new Prisma.Decimal(salePrice) : null,
        images: images?.length
          ? { create: images.map((img, i) => ({ ...img, sortOrder: img.sortOrder ?? i })) }
          : undefined,
      },
      include: listInclude,
    });
    await this.bustCache();
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Product not found');
    if ((dto.slug && dto.slug !== existing.slug) || (dto.sku && dto.sku !== existing.sku)) {
      await this.assertUnique(
        dto.slug !== existing.slug ? dto.slug : undefined,
        dto.sku !== existing.sku ? dto.sku : undefined,
      );
    }

    const { images, salePrice, price, ...rest } = dto;
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        price: price !== undefined ? new Prisma.Decimal(price) : undefined,
        salePrice:
          salePrice === undefined ? undefined : salePrice === null ? null : new Prisma.Decimal(salePrice),
        images: images
          ? {
              // Replace the image set wholesale.
              deleteMany: {},
              create: images.map((img, i) => ({ ...img, sortOrder: img.sortOrder ?? i })),
            }
          : undefined,
      },
      include: listInclude,
    });
    await this.bustCache();
    return product;
  }

  async remove(id: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Product not found');
    // Soft delete — preserves order history.
    await this.prisma.product.update({ where: { id }, data: { isActive: false } });
    await this.bustCache();
    return { success: true };
  }

  private async assertUnique(slug?: string, sku?: string) {
    if (slug) {
      const bySlug = await this.prisma.product.findUnique({ where: { slug } });
      if (bySlug) throw new ConflictException('Slug already in use');
    }
    if (sku) {
      const bySku = await this.prisma.product.findUnique({ where: { sku } });
      if (bySku) throw new ConflictException('SKU already in use');
    }
  }

  private bustCache() {
    return this.redis.delPrefix(CACHE_PREFIX);
  }
}
