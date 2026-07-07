import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getPagination, paginate, PaginationQueryDto } from '../common/utils/pagination';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async mine(userId: string, unread: boolean | undefined, query: PaginationQueryDto) {
    const { page, limit, skip, take } = getPagination(query);
    const where: Prisma.NotificationWhereInput = { userId };
    if (unread) where.readAt = null;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.notification.count({ where }),
    ]);
    return paginate(items, total, page, limit);
  }

  async adminFeed(unread: boolean | undefined, query: PaginationQueryDto) {
    const { page, limit, skip, take } = getPagination(query);
    const where: Prisma.NotificationWhereInput = { userId: null };
    if (unread) where.readAt = null;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.notification.count({ where }),
    ]);
    return paginate(items, total, page, limit);
  }

  async markRead(id: string, userId: string, isAdmin: boolean) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId && !(isAdmin && notification.userId === null)) {
      throw new NotFoundException('Notification not found');
    }
    return this.prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }

  async markAllRead(userId: string, isAdmin: boolean) {
    const or: Prisma.NotificationWhereInput[] = [{ userId }];
    if (isAdmin) or.push({ userId: null });
    const result = await this.prisma.notification.updateMany({
      where: { OR: or, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: result.count };
  }
}
