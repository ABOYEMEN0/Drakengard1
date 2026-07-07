import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InventoryReason, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getPagination, paginate } from '../common/utils/pagination';
import { AdjustStockDto, MovementsQueryDto, StockListQueryDto } from './dto/inventory.dto';

export interface OrderStockItem {
  productId: string;
  quantity: number;
}

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async stockList(query: StockListQueryDto) {
    const { page, limit, skip, take } = getPagination(query);
    const where: Prisma.ProductWhereInput = { isActive: true };
    if (query.filter === 'out') where.stock = { lte: 0 };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.filter === 'low') {
      // stock <= lowStockThreshold requires a column comparison — filter in SQL via raw compare is
      // overkill at this scale; fetch matching ids first.
      const lowIds = await this.lowStockIds();
      where.id = { in: lowIds };
    }

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        select: {
          id: true,
          slug: true,
          sku: true,
          name: true,
          stock: true,
          lowStockThreshold: true,
          price: true,
          salePrice: true,
        },
        orderBy: { stock: 'asc' },
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);
    return paginate(products, total, page, limit);
  }

  async adjust(dto: AdjustStockDto, byUser?: string) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: dto.productId } });
      if (!product) throw new NotFoundException('Product not found');
      const newStock = product.stock + dto.change;
      if (newStock < 0) {
        throw new BadRequestException(
          `Adjustment would take stock below zero (current: ${product.stock})`,
        );
      }
      const updated = await tx.product.update({
        where: { id: dto.productId },
        data: { stock: newStock },
        select: { id: true, sku: true, name: true, stock: true, lowStockThreshold: true },
      });
      const movement = await tx.inventoryMovement.create({
        data: {
          productId: dto.productId,
          change: dto.change,
          reason: dto.reason as InventoryReason,
          reference: dto.note,
          byUser,
        },
      });
      return { product: updated, movement };
    });
  }

  async movements(query: MovementsQueryDto) {
    const { page, limit, skip, take } = getPagination(query);
    const where: Prisma.InventoryMovementWhereInput = {};
    if (query.productId) where.productId = query.productId;
    const [movements, total] = await this.prisma.$transaction([
      this.prisma.inventoryMovement.findMany({
        where,
        include: { product: { select: { name: true, sku: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.inventoryMovement.count({ where }),
    ]);
    return paginate(movements, total, page, limit);
  }

  async alerts() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, slug: true, sku: true, name: true, stock: true, lowStockThreshold: true },
      orderBy: { stock: 'asc' },
    });
    return products.filter((p) => p.stock <= p.lowStockThreshold);
  }

  /** Deduct stock for order items inside an existing transaction. Throws if stock is insufficient. */
  async deductForOrder(tx: Prisma.TransactionClient, items: OrderStockItem[], orderNumber: string) {
    for (const item of items) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        throw new BadRequestException('Insufficient stock for one or more products');
      }
      await tx.inventoryMovement.create({
        data: {
          productId: item.productId,
          change: -item.quantity,
          reason: InventoryReason.ORDER,
          reference: orderNumber,
        },
      });
    }
  }

  /** Return stock for a cancelled order inside an existing transaction. */
  async restockForOrder(tx: Prisma.TransactionClient, items: OrderStockItem[], orderNumber: string) {
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
      await tx.inventoryMovement.create({
        data: {
          productId: item.productId,
          change: item.quantity,
          reason: InventoryReason.CANCELLATION,
          reference: orderNumber,
        },
      });
    }
  }

  private async lowStockIds(): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>(
      Prisma.sql`SELECT id FROM "Product" WHERE "isActive" = true AND stock <= "lowStockThreshold" AND stock > 0`,
    );
    return rows.map((r) => r.id);
  }
}
