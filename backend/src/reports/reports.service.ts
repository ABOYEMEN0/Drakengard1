import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type Granularity = 'daily' | 'weekly' | 'monthly' | 'yearly';

const notCancelled: Prisma.OrderWhereInput = { status: { not: OrderStatus.CANCELLED } };

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [today, month, pendingCount, soldAgg] = await Promise.all([
      this.prisma.order.aggregate({
        where: { ...notCancelled, createdAt: { gte: startOfDay } },
        _count: true,
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: { ...notCancelled, createdAt: { gte: startOfMonth } },
        _count: true,
        _sum: { total: true },
      }),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.orderItem.aggregate({
        where: { order: { ...notCancelled, createdAt: { gte: startOfMonth } } },
        _sum: { quantity: true },
      }),
    ]);

    return {
      today: { orders: today._count, revenue: today._sum.total?.toNumber() ?? 0 },
      month: { orders: month._count, revenue: month._sum.total?.toNumber() ?? 0 },
      pendingOrders: pendingCount,
      productsSoldThisMonth: soldAgg._sum.quantity ?? 0,
    };
  }

  async sales(granularity: Granularity = 'daily', from?: string, to?: string) {
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from
      ? new Date(from)
      : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const orders = await this.prisma.order.findMany({
      where: { ...notCancelled, createdAt: { gte: fromDate, lte: toDate } },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: 'asc' },
    });

    const buckets = new Map<string, { orders: number; revenue: number }>();
    for (const order of orders) {
      const key = this.bucketKey(order.createdAt, granularity);
      const bucket = buckets.get(key) ?? { orders: 0, revenue: 0 };
      bucket.orders += 1;
      bucket.revenue += order.total.toNumber();
      buckets.set(key, bucket);
    }

    return {
      granularity,
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      series: [...buckets.entries()].map(([period, v]) => ({
        period,
        orders: v.orders,
        revenue: Math.round(v.revenue * 100) / 100,
      })),
    };
  }

  private bucketKey(date: Date, granularity: Granularity): string {
    const iso = date.toISOString();
    switch (granularity) {
      case 'yearly':
        return iso.slice(0, 4);
      case 'monthly':
        return iso.slice(0, 7);
      case 'weekly': {
        // ISO week: yyyy-Www
        const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
        return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
      }
      case 'daily':
      default:
        return iso.slice(0, 10);
    }
  }

  async topProducts(limit = 10) {
    const grouped = await this.prisma.orderItem.groupBy({
      by: ['productId', 'name'],
      where: { order: notCancelled },
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });
    return grouped.map((g) => ({
      productId: g.productId,
      name: g.name,
      unitsSold: g._sum.quantity ?? 0,
      revenue: g._sum.total?.toNumber() ?? 0,
    }));
  }

  async topCustomers(limit = 10) {
    const grouped = await this.prisma.order.groupBy({
      by: ['customerPhone', 'customerName'],
      where: notCancelled,
      _count: true,
      _sum: { total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: limit,
    });
    return grouped.map((g) => ({
      name: g.customerName,
      phone: g.customerPhone,
      orders: g._count,
      totalSpent: g._sum.total?.toNumber() ?? 0,
    }));
  }

  async cities() {
    const grouped = await this.prisma.order.groupBy({
      by: ['city'],
      where: notCancelled,
      _count: true,
      _sum: { total: true },
      orderBy: { _sum: { total: 'desc' } },
    });
    return grouped.map((g) => ({
      city: g.city,
      orders: g._count,
      revenue: g._sum.total?.toNumber() ?? 0,
    }));
  }

  async inventory() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
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
    });
    let stockValue = 0;
    const low: typeof products = [];
    const out: typeof products = [];
    for (const p of products) {
      stockValue += p.price.toNumber() * p.stock;
      if (p.stock <= 0) out.push(p);
      else if (p.stock <= p.lowStockThreshold) low.push(p);
    }
    return {
      totalProducts: products.length,
      stockValue: Math.round(stockValue * 100) / 100,
      lowStock: low,
      outOfStock: out,
    };
  }
}
