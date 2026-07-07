import { Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IsBoolean, IsOptional } from 'class-validator';
import { NotificationsService } from './notifications.service';
import { CurrentUser, JwtPayload, RequirePermissions } from '../common/decorators';
import { PaginationQueryDto } from '../common/utils/pagination';

class NotificationsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsBoolean()
  unread?: boolean;
}

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'];

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  mine(@CurrentUser() user: JwtPayload, @Query() query: NotificationsQueryDto) {
    return this.notificationsService.mine(user.sub, query.unread, query);
  }

  @Get('feed')
  @RequirePermissions('orders:read')
  feed(@Query() query: NotificationsQueryDto) {
    return this.notificationsService.adminFeed(query.unread, query);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.notificationsService.markRead(id, user.sub, ADMIN_ROLES.includes(user.role));
  }

  @Post('mark-all-read')
  markAllRead(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.markAllRead(user.sub, ADMIN_ROLES.includes(user.role));
  }
}
