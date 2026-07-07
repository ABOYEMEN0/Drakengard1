import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ContactService } from './contact.service';
import { CreateContactMessageDto, ListContactQueryDto, SetHandledDto } from './dto/contact.dto';
import { Public, RequirePermissions } from '../common/decorators';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  create(@Body() dto: CreateContactMessageDto) {
    return this.contactService.create(dto);
  }

  @Get()
  @RequirePermissions('customers:read')
  list(@Query() query: ListContactQueryDto) {
    return this.contactService.list(query);
  }

  @Patch(':id/handled')
  @RequirePermissions('customers:write')
  setHandled(@Param('id') id: string, @Body() dto: SetHandledDto) {
    return this.contactService.setHandled(id, dto.handled);
  }
}
