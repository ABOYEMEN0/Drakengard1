import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  ListOrdersQueryDto,
  UpdateOrderNoteDto,
  UpdateOrderStatusDto,
} from './dto/orders.dto';
import { CurrentUser, JwtPayload, Public, RequirePermissions } from '../common/decorators';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user?: JwtPayload) {
    return this.ordersService.create(dto, user);
  }

  @Get()
  @RequirePermissions('orders:read')
  list(@Query() query: ListOrdersQueryDto) {
    return this.ordersService.list(query);
  }

  @Get('mine')
  mine(@CurrentUser() user: JwtPayload, @Query() query: ListOrdersQueryDto) {
    return this.ordersService.mine(user, query);
  }

  @Get('track/:number')
  @Public()
  track(@Param('number') orderNumber: string) {
    return this.ordersService.track(orderNumber);
  }

  @Get(':number')
  @RequirePermissions('orders:read')
  getByNumber(@Param('number') orderNumber: string) {
    return this.ordersService.getByNumber(orderNumber);
  }

  @Patch(':number/status')
  @RequirePermissions('orders:write')
  updateStatus(
    @Param('number') orderNumber: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.updateStatus(orderNumber, dto, user?.sub);
  }

  @Patch(':number/note')
  @RequirePermissions('orders:write')
  updateNote(@Param('number') orderNumber: string, @Body() dto: UpdateOrderNoteDto) {
    return this.ordersService.updateNote(orderNumber, dto.internalNote);
  }
}
