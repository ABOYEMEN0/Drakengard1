import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { RequirePermissions } from '../common/decorators';
import { IsDateString, IsIn, IsOptional } from 'class-validator';

class SalesQueryDto {
  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly', 'yearly'])
  granularity?: 'daily' | 'weekly' | 'monthly' | 'yearly';

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

@Controller('reports')
@RequirePermissions('reports:read')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  summary() {
    return this.reportsService.summary();
  }

  @Get('sales')
  sales(@Query() query: SalesQueryDto) {
    return this.reportsService.sales(query.granularity ?? 'daily', query.from, query.to);
  }

  @Get('top-products')
  topProducts() {
    return this.reportsService.topProducts();
  }

  @Get('top-customers')
  topCustomers() {
    return this.reportsService.topCustomers();
  }

  @Get('cities')
  cities() {
    return this.reportsService.cities();
  }

  @Get('inventory')
  inventory() {
    return this.reportsService.inventory();
  }
}
