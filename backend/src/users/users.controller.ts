import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  AdminUpdateUserDto,
  ChangePasswordDto,
  ListUsersQueryDto,
  UpdateProfileDto,
} from './dto/users.dto';
import { CurrentUser, JwtPayload, RequirePermissions } from '../common/decorators';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ── customer profile (must precede :id routes) ──
  @Patch('me/profile')
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Patch('me/password')
  changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.sub, dto);
  }

  // ── admin ──
  @Get()
  @RequirePermissions('customers:read')
  list(@Query() query: ListUsersQueryDto) {
    return this.usersService.list(query);
  }

  @Get(':id')
  @RequirePermissions('customers:read')
  get(@Param('id') id: string) {
    return this.usersService.get(id);
  }

  @Patch(':id')
  @RequirePermissions('customers:write')
  update(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    return this.usersService.adminUpdate(id, dto);
  }
}
