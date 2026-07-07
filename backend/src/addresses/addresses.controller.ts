import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/addresses.dto';
import { CurrentUser, JwtPayload } from '../common/decorators';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.addressesService.list(user.sub);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(user.sub, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.addressesService.update(user.sub, id, dto);
  }

  @Patch(':id/default')
  setDefault(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.addressesService.setDefault(user.sub, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.addressesService.remove(user.sub, id);
  }
}
