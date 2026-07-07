import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ReviewsService } from './reviews.service';
import {
  AdminListReviewsQueryDto,
  ApproveReviewDto,
  CreateReviewDto,
  ListReviewsQueryDto,
} from './dto/reviews.dto';
import { CurrentUser, JwtPayload, Public, RequirePermissions } from '../common/decorators';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  create(@Body() dto: CreateReviewDto, @CurrentUser() user?: JwtPayload) {
    return this.reviewsService.create(dto, user?.sub);
  }

  @Get()
  @Public()
  listPublic(@Query() query: ListReviewsQueryDto) {
    return this.reviewsService.listPublic(query);
  }

  @Get('admin')
  @RequirePermissions('products:write')
  listAdmin(@Query() query: AdminListReviewsQueryDto) {
    return this.reviewsService.listAdmin(query);
  }

  @Patch(':id/approve')
  @RequirePermissions('products:write')
  approve(@Param('id') id: string, @Body() dto: ApproveReviewDto) {
    return this.reviewsService.setApproval(id, dto.isApproved ?? true);
  }

  @Delete(':id')
  @RequirePermissions('products:write')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}
