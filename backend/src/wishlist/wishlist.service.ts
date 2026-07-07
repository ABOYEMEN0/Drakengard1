import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const productSummary = {
  id: true,
  slug: true,
  name: true,
  price: true,
  salePrice: true,
  stock: true,
  images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
};

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: { select: productSummary } },
      orderBy: { addedAt: 'desc' },
    });
  }

  async toggle(userId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      await this.prisma.wishlistItem.delete({
        where: { userId_productId: { userId, productId } },
      });
      return { inWishlist: false };
    }
    await this.prisma.wishlistItem.create({ data: { userId, productId } });
    return { inWishlist: true };
  }

  async remove(userId: string, productId: string) {
    await this.prisma.wishlistItem.deleteMany({ where: { userId, productId } });
    return { success: true };
  }
}
