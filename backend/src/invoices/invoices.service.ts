import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType, PaymentMethod, Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';
import { getPagination, paginate } from '../common/utils/pagination';
import { ListInvoicesQueryDto, UpdateInvoiceStatusDto } from './dto/invoices.dto';

const NAVY = '#101d33';
const GOLD = '#c8a24a';
const INK = '#1c1c1c';
const MUTED = '#6b7280';
const HAIRLINE = '#d9d9d9';

type FullInvoice = Prisma.InvoiceGetPayload<{ include: { order: { include: { items: true } } } }>;

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListInvoicesQueryDto) {
    const { page, limit, skip, take } = getPagination(query);
    const where: Prisma.InvoiceWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { invoiceNumber: { contains: query.search, mode: 'insensitive' } },
        { order: { orderNumber: { contains: query.search, mode: 'insensitive' } } },
        { order: { customerName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    const [invoices, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where,
        include: {
          order: {
            select: { orderNumber: true, customerName: true, total: true, paymentMethod: true },
          },
        },
        orderBy: { issuedAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return paginate(invoices, total, page, limit);
  }

  async getByNumber(invoiceNumber: string, opts: { isAdmin: boolean; phone?: string }) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: { order: { include: { items: true } } },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (!opts.isAdmin) {
      if (!opts.phone || invoice.order.customerPhone !== opts.phone) {
        throw new ForbiddenException('Provide the phone number used on the order');
      }
    }
    return invoice;
  }

  async updateStatus(invoiceNumber: string, dto: UpdateInvoiceStatusDto) {
    const invoice = await this.prisma.invoice.findUnique({ where: { invoiceNumber } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    const updated = await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: dto.status },
    });
    await this.prisma.payment.updateMany({
      where: { orderId: invoice.orderId },
      data: { status: dto.status },
    });
    return updated;
  }

  async resend(invoiceNumber: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: { order: { select: { orderNumber: true, customerName: true, userId: true } } },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    await this.prisma.notification.create({
      data: {
        userId: invoice.order.userId,
        type: NotificationType.SYSTEM,
        title: 'Invoice resent',
        body: `Invoice ${invoice.invoiceNumber} for order ${invoice.order.orderNumber} was resent to ${invoice.order.customerName}`,
        data: { invoiceNumber: invoice.invoiceNumber },
      },
    });
    return { success: true };
  }

  // ─────────────────────────── PDF ───────────────────────────

  async generatePdf(invoiceNumber: string, opts: { isAdmin: boolean; phone?: string }) {
    const invoice = await this.getByNumber(invoiceNumber, opts);
    return this.renderPdf(invoice);
  }

  private renderPdf(invoice: FullInvoice): PDFKit.PDFDocument {
    const { order } = invoice;
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const M = 50; // content margin
    const W = doc.page.width;

    // Header band.
    doc.rect(0, 0, W, 120).fill(NAVY);
    doc.font('Times-Bold').fontSize(34).fillColor('#ffffff').text('LEOR', M, 40);
    doc.rect(M, 84, 90, 2).fill(GOLD);
    doc.font('Helvetica-Bold').fontSize(16).fillColor(GOLD).text('INVOICE', W - 250, 42, {
      width: 200,
      align: 'right',
    });
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#e5e7eb')
      .text(`Invoice: ${invoice.invoiceNumber}`, W - 250, 66, { width: 200, align: 'right' })
      .text(`Order: ${order.orderNumber}`, W - 250, 79, { width: 200, align: 'right' })
      .text(`Issued: ${invoice.issuedAt.toISOString().slice(0, 10)}`, W - 250, 92, {
        width: 200,
        align: 'right',
      });

    // Billed to.
    let y = 155;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(MUTED).text('BILLED TO', M, y);
    y += 14;
    doc.font('Helvetica-Bold').fontSize(11).fillColor(INK).text(order.customerName, M, y);
    y += 15;
    doc.font('Helvetica').fontSize(9).fillColor(INK);
    doc.text(order.customerPhone, M, y);
    y += 12;
    if (order.customerEmail) {
      doc.text(order.customerEmail, M, y);
      y += 12;
    }
    doc.text(`${order.address}, ${order.district}, ${order.city}`, M, y, { width: 300 });
    y += 30;

    // Items table.
    const colX = { name: M, qty: 330, unit: 400, total: 480 };
    doc.rect(M, y, W - 2 * M, 0.75).fill(HAIRLINE);
    y += 8;
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(MUTED);
    doc.text('ITEM', colX.name, y);
    doc.text('QTY', colX.qty, y, { width: 40, align: 'right' });
    doc.text('UNIT PRICE', colX.unit, y, { width: 60, align: 'right' });
    doc.text('TOTAL', colX.total, y, { width: 65, align: 'right' });
    y += 14;
    doc.rect(M, y, W - 2 * M, 0.75).fill(HAIRLINE);
    y += 10;

    doc.font('Helvetica').fontSize(9.5).fillColor(INK);
    for (const item of order.items) {
      doc.text(item.name, colX.name, y, { width: 260 });
      doc.text(String(item.quantity), colX.qty, y, { width: 40, align: 'right' });
      doc.text(item.price.toNumber().toFixed(2), colX.unit, y, { width: 60, align: 'right' });
      doc.text(item.total.toNumber().toFixed(2), colX.total, y, { width: 65, align: 'right' });
      y += Math.max(16, doc.heightOfString(item.name, { width: 260 }) + 4);
      doc.rect(M, y - 4, W - 2 * M, 0.5).fill('#ececec');
      doc.fillColor(INK);
    }

    // Totals block.
    y += 12;
    const totalsX = 380;
    const totalRow = (label: string, value: string, bold = false) => {
      doc
        .font(bold ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(bold ? 11 : 9.5)
        .fillColor(bold ? NAVY : INK);
      doc.text(label, totalsX, y, { width: 95 });
      doc.text(value, totalsX + 95, y, { width: 70, align: 'right' });
      y += bold ? 18 : 15;
    };
    totalRow('Subtotal', `${order.subtotal.toNumber().toFixed(2)} SAR`);
    totalRow('Shipping', `${order.shipping.toNumber().toFixed(2)} SAR`);
    if (order.discount.toNumber() > 0) {
      totalRow('Discount', `-${order.discount.toNumber().toFixed(2)} SAR`);
    }
    if (order.tax.toNumber() > 0) {
      totalRow('Tax (VAT)', `${order.tax.toNumber().toFixed(2)} SAR`);
    }
    doc.rect(totalsX, y, 165, 0.75).fill(GOLD);
    y += 8;
    totalRow('TOTAL', `${order.total.toNumber().toFixed(2)} SAR`, true);

    // Payment.
    y += 15;
    const methodLabel =
      order.paymentMethod === PaymentMethod.COD ? 'Cash on Delivery' : 'Bank Transfer';
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(MUTED)
      .text(`Payment Method: ${methodLabel}    ·    Payment Status: ${invoice.status}`, M, y);

    // Footer.
    doc.rect(M, doc.page.height - 70, W - 2 * M, 0.75).fill(HAIRLINE);
    doc
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor(MUTED)
      .text('LEOR · Riyadh, Saudi Arabia · care@leor.sa', M, doc.page.height - 55, {
        width: W - 2 * M,
        align: 'center',
      });

    doc.end();
    return doc;
  }
}
