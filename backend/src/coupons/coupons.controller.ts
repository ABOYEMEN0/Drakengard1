import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupons.dto';
import { Public, RequirePermissions } from '../common/decorators';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('validate')
  @Public()
  validate(@Body() dto: ValidateCouponDto) {
    return this.couponsService.validate(dto);
  }

  @Get()
  @RequirePermissions('products:write')
  list() {
    return this.couponsService.list();
  }

  @Post()
  @RequirePermissions('products:write')
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('products:write')
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('products:write')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
