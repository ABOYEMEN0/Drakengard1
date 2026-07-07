import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AdjustStockDto, MovementsQueryDto, StockListQueryDto } from './dto/inventory.dto';
import { CurrentUser, JwtPayload, RequirePermissions } from '../common/decorators';

@Controller('inventory')
@RequirePermissions('inventory:write')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stock')
  stockList(@Query() query: StockListQueryDto) {
    return this.inventoryService.stockList(query);
  }

  @Post('adjust')
  adjust(@Body() dto: AdjustStockDto, @CurrentUser() user: JwtPayload) {
    return this.inventoryService.adjust(dto, user?.sub);
  }

  @Get('movements')
  movements(@Query() query: MovementsQueryDto) {
    return this.inventoryService.movements(query);
  }

  @Get('alerts')
  alerts() {
    return this.inventoryService.alerts();
  }
}
