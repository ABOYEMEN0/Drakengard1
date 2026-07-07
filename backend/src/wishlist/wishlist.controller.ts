import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { IsString } from 'class-validator';
import { WishlistService } from './wishlist.service';
import { CurrentUser, JwtPayload } from '../common/decorators';

class ToggleWishlistDto {
  @IsString()
  productId!: string;
}

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.wishlistService.list(user.sub);
  }

  @Post()
  toggle(@CurrentUser() user: JwtPayload, @Body() dto: ToggleWishlistDto) {
    return this.wishlistService.toggle(user.sub, dto.productId);
  }

  @Delete(':productId')
  remove(@CurrentUser() user: JwtPayload, @Param('productId') productId: string) {
    return this.wishlistService.remove(user.sub, productId);
  }
}
