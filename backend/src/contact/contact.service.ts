import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getPagination, paginate, PaginationQueryDto } from '../common/utils/pagination';
import { CreateContactMessageDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContactMessageDto) {
    const message = await this.prisma.contactMessage.create({ data: dto });
    await this.prisma.notification.create({
      data: {
        type: NotificationType.CUSTOMER_MESSAGE,
        title: 'New customer message',
        body: `${dto.name}: ${dto.subject ?? dto.body.slice(0, 80)}`,
        data: { contactMessageId: message.id },
      },
    });
    return { id: message.id, message: 'Thank you — we will get back to you shortly.' };
  }

  async list(query: PaginationQueryDto & { handled?: boolean }) {
    const { page, limit, skip, take } = getPagination(query);
    const where: Prisma.ContactMessageWhereInput = {};
    if (query.handled !== undefined) where.handled = query.handled;
    const [messages, total] = await this.prisma.$transaction([
      this.prisma.contactMessage.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.contactMessage.count({ where }),
    ]);
    return paginate(messages, total, page, limit);
  }

  async setHandled(id: string, handled: boolean) {
    const message = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!message) throw new NotFoundException('Message not found');
    return this.prisma.contactMessage.update({ where: { id }, data: { handled } });
  }
}
