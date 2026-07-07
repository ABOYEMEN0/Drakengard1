import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getPagination, paginate } from '../common/utils/pagination';
import {
  AdminListReviewsQueryDto,
  CreateReviewDto,
  ListReviewsQueryDto,
} from './dto/reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReviewDto, userId?: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, isActive: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    const review = await this.prisma.review.create({
      data: {
        productId: dto.productId,
        userId: userId ?? null,
        authorName: dto.authorName,
        rating: dto.rating,
        title: dto.title,
        body: dto.body,
        isApproved: false,
        isVerified: !!userId,
      },
    });
    return { id: review.id, message: 'Thank you! Your review is pending approval.' };
  }

  async listPublic(query: ListReviewsQueryDto) {
    const { page, limit, skip, take } = getPagination(query);
    const where: Prisma.ReviewWhereInput = { isApproved: true };
    if (query.productId) where.productId = query.productId;
    const [reviews, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        select: {
          id: true,
          productId: true,
          authorName: true,
          rating: true,
          title: true,
          body: true,
          isVerified: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.review.count({ where }),
    ]);
    return paginate(reviews, total, page, limit);
  }

  async listAdmin(query: AdminListReviewsQueryDto) {
    const { page, limit, skip, take } = getPagination(query);
    const where: Prisma.ReviewWhereInput = {};
    if (query.productId) where.productId = query.productId;
    if (query.approved !== undefined) where.isApproved = query.approved;
    const [reviews, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        include: { product: { select: { name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.review.count({ where }),
    ]);
    return paginate(reviews, total, page, limit);
  }

  async setApproval(id: string, isApproved: boolean) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    return this.prisma.review.update({ where: { id }, data: { isApproved } });
  }

  async remove(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    await this.prisma.review.delete({ where: { id } });
    return { success: true };
  }
}
