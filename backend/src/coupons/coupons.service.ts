import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupons.dto';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.coupon.findMany({ orderBy: { code: 'asc' } });
  }

  async create(dto: CreateCouponDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.coupon.findUnique({ where: { code } });
    if (existing) throw new ConflictException('Coupon code already exists');
    return this.prisma.coupon.create({
      data: {
        code,
        type: dto.type,
        value: new Prisma.Decimal(dto.value),
        minSubtotal: dto.minSubtotal != null ? new Prisma.Decimal(dto.minSubtotal) : null,
        maxUses: dto.maxUses,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    const code = dto.code?.trim().toUpperCase();
    if (code && code !== coupon.code) {
      const existing = await this.prisma.coupon.findUnique({ where: { code } });
      if (existing) throw new ConflictException('Coupon code already exists');
    }
    return this.prisma.coupon.update({
      where: { id },
      data: {
        code,
        type: dto.type,
        value: dto.value !== undefined ? new Prisma.Decimal(dto.value) : undefined,
        minSubtotal:
          dto.minSubtotal === undefined
            ? undefined
            : dto.minSubtotal === null
              ? null
              : new Prisma.Decimal(dto.minSubtotal),
        maxUses: dto.maxUses,
        startsAt:
          dto.startsAt === undefined ? undefined : dto.startsAt ? new Date(dto.startsAt) : null,
        expiresAt:
          dto.expiresAt === undefined ? undefined : dto.expiresAt ? new Date(dto.expiresAt) : null,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    await this.prisma.coupon.delete({ where: { id } });
    return { success: true };
  }

  async validate(dto: ValidateCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: dto.code.trim().toUpperCase() },
    });
    const invalid = (message: string) => ({ valid: false as const, discount: 0, message });
    if (!coupon || !coupon.isActive) return invalid('Invalid coupon code');
    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) return invalid('Coupon is not active yet');
    if (coupon.expiresAt && coupon.expiresAt < now) return invalid('Coupon has expired');
    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
      return invalid('Coupon usage limit reached');
    }
    if (coupon.minSubtotal && dto.subtotal < coupon.minSubtotal.toNumber()) {
      return invalid(`Minimum order of ${coupon.minSubtotal.toNumber()} SAR required`);
    }
    const discount =
      coupon.type === 'PERCENT'
        ? Math.round(((dto.subtotal * coupon.value.toNumber()) / 100) * 100) / 100
        : Math.min(coupon.value.toNumber(), dto.subtotal);
    return {
      valid: true as const,
      discount,
      type: coupon.type,
      value: coupon.value.toNumber(),
    };
  }
}
