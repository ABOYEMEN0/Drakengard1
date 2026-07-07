import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  NotificationType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { getPagination, paginate } from '../common/utils/pagination';
import { JwtPayload } from '../common/decorators';
import {
  CreateOrderDto,
  ListOrdersQueryDto,
  UpdateOrderStatusDto,
} from './dto/orders.dto';

const orderInclude = {
  items: true,
  invoice: { select: { invoiceNumber: true, status: true, issuedAt: true } },
  payments: true,
  statusHistory: { orderBy: { at: 'asc' as const } },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
  ) {}

  // ─────────────────────────── create ───────────────────────────

  async create(dto: CreateOrderDto, user?: JwtPayload) {
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Load products & verify.
      const productIds = dto.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true },
      });
      const byId = new Map(products.map((p) => [p.id, p]));
      for (const item of dto.items) {
        const product = byId.get(item.productId);
        if (!product) throw new BadRequestException(`Product not available: ${item.productId}`);
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for "${product.name}"`);
        }
      }

      // 2. Server-side pricing.
      const lines = dto.items.map((item) => {
        const product = byId.get(item.productId)!;
        const unit = (product.salePrice ?? product.price).toNumber();
        return {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          price: unit,
          quantity: item.quantity,
          total: unit * item.quantity,
        };
      });
      const subtotal = lines.reduce((sum, l) => sum + l.total, 0);

      // 3. Coupon.
      let discount = 0;
      let couponCode: string | undefined;
      if (dto.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: dto.couponCode.trim().toUpperCase() },
        });
        const now = new Date();
        if (
          !coupon ||
          !coupon.isActive ||
          (coupon.startsAt && coupon.startsAt > now) ||
          (coupon.expiresAt && coupon.expiresAt < now) ||
          (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses)
        ) {
          throw new BadRequestException('Invalid or expired coupon code');
        }
        if (coupon.minSubtotal && subtotal < coupon.minSubtotal.toNumber()) {
          throw new BadRequestException(
            `Coupon requires a minimum subtotal of ${coupon.minSubtotal.toNumber()} SAR`,
          );
        }
        discount =
          coupon.type === 'PERCENT'
            ? (subtotal * coupon.value.toNumber()) / 100
            : Math.min(coupon.value.toNumber(), subtotal);
        discount = Math.round(discount * 100) / 100;
        couponCode = coupon.code;
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      // 4. Shipping & tax from settings.
      const settings = await this.loadSettings(tx, [
        'shipping.fee',
        'shipping.freeThreshold',
        'tax.enabled',
        'tax.rate',
        'whatsapp.number',
      ]);
      const shippingFee = Number(settings['shipping.fee'] ?? 25);
      const freeThreshold = Number(settings['shipping.freeThreshold'] ?? 300);
      const shipping = subtotal - discount >= freeThreshold ? 0 : shippingFee;
      const taxEnabled = settings['tax.enabled'] === true;
      const taxRate = Number(settings['tax.rate'] ?? 15);
      const tax = taxEnabled
        ? Math.round((subtotal - discount + shipping) * (taxRate / 100) * 100) / 100
        : 0;
      const total = Math.round((subtotal - discount + shipping + tax) * 100) / 100;

      // 5. Mint numbers (atomic increment inside the tx).
      const year = new Date().getFullYear();
      const orderSeq = await this.nextSequence(tx, `order-${year}`);
      const invoiceSeq = await this.nextSequence(tx, `invoice-${year}`);
      const orderNumber = `LR-${year}${String(orderSeq).padStart(5, '0')}`;
      const invoiceNumber = `INV-${year}${String(invoiceSeq).padStart(5, '0')}`;

      // 6. Create order graph.
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user?.sub ?? null,
          paymentMethod: dto.paymentMethod,
          customerName: dto.customer.name,
          customerPhone: dto.customer.phone,
          customerEmail: dto.customer.email,
          city: dto.customer.city,
          district: dto.customer.district,
          address: dto.customer.address,
          notes: dto.customer.notes,
          subtotal: new Prisma.Decimal(subtotal),
          shipping: new Prisma.Decimal(shipping),
          discount: new Prisma.Decimal(discount),
          tax: new Prisma.Decimal(tax),
          total: new Prisma.Decimal(total),
          couponCode,
          items: {
            create: lines.map((l) => ({
              productId: l.productId,
              name: l.name,
              sku: l.sku,
              price: new Prisma.Decimal(l.price),
              quantity: l.quantity,
              total: new Prisma.Decimal(l.total),
            })),
          },
          invoice: { create: { invoiceNumber } },
          payments: {
            create: {
              method: dto.paymentMethod,
              status: PaymentStatus.UNPAID,
              amount: new Prisma.Decimal(total),
            },
          },
          statusHistory: { create: { status: OrderStatus.PENDING } },
        },
        include: { items: true, invoice: true },
      });

      // 7. Deduct stock + movements.
      await this.inventory.deductForOrder(tx, dto.items, orderNumber);

      // 8. Notifications.
      await tx.notification.create({
        data: {
          type: NotificationType.NEW_ORDER,
          title: 'New order received',
          body: `Order ${orderNumber} — ${total.toFixed(2)} SAR from ${dto.customer.name}`,
          data: { orderNumber, total },
        },
      });
      for (const item of dto.items) {
        const product = byId.get(item.productId)!;
        const before = product.stock;
        const after = before - item.quantity;
        if (before > product.lowStockThreshold && after <= product.lowStockThreshold) {
          await tx.notification.create({
            data: {
              type: NotificationType.LOW_STOCK,
              title: 'Low stock alert',
              body: `"${product.name}" is low on stock (${after} left)`,
              data: { productId: product.id, sku: product.sku, stock: after },
            },
          });
        }
      }

      return { order, whatsappNumber: String(settings['whatsapp.number'] ?? '966500000000') };
    });

    const { order, whatsappNumber } = result;
    return {
      order,
      invoiceNumber: order.invoice?.invoiceNumber,
      whatsappUrl: this.buildWhatsappUrl(whatsappNumber, order, dto),
    };
  }

  private buildWhatsappUrl(
    number: string,
    order: { orderNumber: string; total: Prisma.Decimal; items: { name: string; quantity: number }[] },
    dto: CreateOrderDto,
  ) {
    const productLines = order.items.map((i) => `- ${i.name} x${i.quantity}`).join('\n');
    const paymentLabel =
      dto.paymentMethod === PaymentMethod.COD ? 'Cash on Delivery' : 'Bank Transfer';
    const message =
      `Hello LEOR,\n\nI would like to confirm my order.\n\n` +
      `Order Number: ${order.orderNumber}\n\n` +
      `Products:\n${productLines}\n\n` +
      `Total: ${order.total.toNumber()} SAR\n\n` +
      `Customer:\n${dto.customer.name} / ${dto.customer.phone} / ${dto.customer.city}, ${dto.customer.district}, ${dto.customer.address}\n\n` +
      `Payment Method: ${paymentLabel}`;
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }

  private async nextSequence(tx: Prisma.TransactionClient, id: string): Promise<number> {
    await tx.numberSequence.upsert({ where: { id }, create: { id, value: 0 }, update: {} });
    const seq = await tx.numberSequence.update({
      where: { id },
      data: { value: { increment: 1 } },
    });
    return seq.value;
  }

  private async loadSettings(tx: Prisma.TransactionClient, keys: string[]) {
    const rows = await tx.setting.findMany({ where: { key: { in: keys } } });
    return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, unknown>;
  }

  // ─────────────────────────── read ───────────────────────────

  async list(query: ListOrdersQueryDto) {
    const { page, limit, skip, take } = getPagination(query);
    const where: Prisma.OrderWhereInput = {};
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        { customerName: { contains: query.search, mode: 'insensitive' } },
        { customerPhone: { contains: query.search } },
        { customerEmail: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.status) where.status = query.status;
    if (query.payment) where.paymentMethod = query.payment;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }
    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: { items: true, invoice: { select: { invoiceNumber: true, status: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.order.count({ where }),
    ]);
    return paginate(orders, total, page, limit);
  }

  async mine(user: JwtPayload, query: ListOrdersQueryDto) {
    const { page, limit, skip, take } = getPagination(query);
    const me = await this.prisma.user.findUnique({ where: { id: user.sub } });
    if (!me) throw new ForbiddenException();
    const or: Prisma.OrderWhereInput[] = [{ userId: me.id }, { customerEmail: me.email }];
    if (me.phone) or.push({ customerPhone: me.phone });
    const where: Prisma.OrderWhereInput = { OR: or };
    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: { items: true, invoice: { select: { invoiceNumber: true, status: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.order.count({ where }),
    ]);
    return paginate(orders, total, page, limit);
  }

  async track(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      select: {
        orderNumber: true,
        status: true,
        city: true,
        statusHistory: {
          orderBy: { at: 'asc' },
          select: { status: true, at: true },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getByNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: orderInclude,
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // ─────────────────────────── mutate ───────────────────────────

  async updateStatus(orderNumber: string, dto: UpdateOrderStatusDto, byUser?: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { orderNumber },
        include: { items: true },
      });
      if (!order) throw new NotFoundException('Order not found');
      if (order.status === dto.status) {
        throw new BadRequestException(`Order is already ${dto.status}`);
      }
      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException('Cannot change the status of a cancelled order');
      }

      const updated = await tx.order.update({
        where: { id: order.id },
        data: { status: dto.status },
        include: orderInclude,
      });
      await tx.orderStatusEvent.create({
        data: { orderId: order.id, status: dto.status, note: dto.note, byUser },
      });

      if (order.userId) {
        await tx.notification.create({
          data: {
            userId: order.userId,
            type: NotificationType.ORDER_STATUS,
            title: 'Order status updated',
            body: `Your order ${order.orderNumber} is now ${dto.status.replace(/_/g, ' ').toLowerCase()}`,
            data: { orderNumber: order.orderNumber, status: dto.status },
          },
        });
      }

      if (dto.status === OrderStatus.CANCELLED) {
        const restockItems = order.items
          .filter((i) => i.productId)
          .map((i) => ({ productId: i.productId!, quantity: i.quantity }));
        await this.inventory.restockForOrder(tx, restockItems, order.orderNumber);
        await tx.payment.updateMany({
          where: { orderId: order.id, status: { not: PaymentStatus.REFUNDED } },
          data: {
            status:
              order.paymentMethod === PaymentMethod.BANK_TRANSFER
                ? PaymentStatus.REFUNDED
                : PaymentStatus.UNPAID,
          },
        });
        await tx.notification.create({
          data: {
            type: NotificationType.ORDER_CANCELLED,
            title: 'Order cancelled',
            body: `Order ${order.orderNumber} was cancelled${dto.note ? ` — ${dto.note}` : ''}`,
            data: { orderNumber: order.orderNumber },
          },
        });
      }

      return updated;
    });
  }

  async updateNote(orderNumber: string, internalNote: string) {
    const order = await this.prisma.order.findUnique({ where: { orderNumber } });
    if (!order) throw new NotFoundException('Order not found');
    return this.prisma.order.update({
      where: { id: order.id },
      data: { internalNote },
      select: { orderNumber: true, internalNote: true },
    });
  }
}
