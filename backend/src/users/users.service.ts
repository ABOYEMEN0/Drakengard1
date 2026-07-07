import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { getPagination, paginate } from '../common/utils/pagination';
import {
  AdminUpdateUserDto,
  ChangePasswordDto,
  ListUsersQueryDto,
  UpdateProfileDto,
} from './dto/users.dto';

const userSelect = {
  id: true,
  email: true,
  phone: true,
  name: true,
  isActive: true,
  loyaltyLevel: true,
  internalNote: true,
  createdAt: true,
  role: { select: { name: true } },
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListUsersQueryDto) {
    const { page, limit, skip, take } = getPagination(query);
    const where: Prisma.UserWhereInput = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
      ];
    }
    if (query.role) where.role = { name: query.role };
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ where, select: userSelect, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.user.count({ where }),
    ]);
    return paginate(users, total, page, limit);
  }

  async get(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { ...userSelect, addresses: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const agg = await this.prisma.order.aggregate({
      where: { userId: id, status: { not: OrderStatus.CANCELLED } },
      _count: true,
      _sum: { total: true },
    });
    return {
      ...user,
      orderCount: agg._count,
      totalSpent: agg._sum.total?.toNumber() ?? 0,
    };
  }

  async adminUpdate(id: string, dto: AdminUpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const data: Prisma.UserUpdateInput = {};
    if (dto.role) {
      const role = await this.prisma.role.findUniqueOrThrow({ where: { name: dto.role } });
      data.role = { connect: { id: role.id } };
    }
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.internalNote !== undefined) data.internalNote = dto.internalNote;
    if (dto.loyaltyLevel) data.loyaltyLevel = dto.loyaltyLevel;

    return this.prisma.user.update({ where: { id }, data, select: userSelect });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
      if (existing && existing.id !== userId) throw new ConflictException('Email already in use');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email?.toLowerCase(),
      },
      select: userSelect,
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new BadRequestException('Current password is incorrect');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(dto.newPassword, 10) },
    });
    // Revoke all refresh tokens after a password change.
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }
}
