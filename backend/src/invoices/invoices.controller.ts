import { Body, Controller, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { ListInvoicesQueryDto, UpdateInvoiceStatusDto } from './dto/invoices.dto';
import { CurrentUser, JwtPayload, Public, RequirePermissions } from '../common/decorators';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @RequirePermissions('invoices:read')
  list(@Query() query: ListInvoicesQueryDto) {
    return this.invoicesService.list(query);
  }

  @Get(':number')
  @Public()
  get(
    @Param('number') invoiceNumber: string,
    @Query('phone') phone?: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    const isAdmin = user?.permissions?.includes('invoices:read') ?? false;
    return this.invoicesService.getByNumber(invoiceNumber, { isAdmin, phone });
  }

  @Get(':number/pdf')
  @Public()
  async pdf(
    @Param('number') invoiceNumber: string,
    @Res() res: Response,
    @Query('phone') phone?: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    const isAdmin = user?.permissions?.includes('invoices:read') ?? false;
    const doc = await this.invoicesService.generatePdf(invoiceNumber, { isAdmin, phone });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoiceNumber}.pdf"`,
    });
    doc.pipe(res);
  }

  @Patch(':number/status')
  @RequirePermissions('orders:write')
  updateStatus(@Param('number') invoiceNumber: string, @Body() dto: UpdateInvoiceStatusDto) {
    return this.invoicesService.updateStatus(invoiceNumber, dto);
  }

  @Post(':number/resend')
  @RequirePermissions('invoices:read')
  resend(@Param('number') invoiceNumber: string) {
    return this.invoicesService.resend(invoiceNumber);
  }
}
