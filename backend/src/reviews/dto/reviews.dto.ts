import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/utils/pagination';

export class CreateReviewDto {
  @IsString()
  productId!: string;

  @IsString()
  authorName!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  body!: string;
}

export class ListReviewsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  productId?: string;
}

export class AdminListReviewsQueryDto extends ListReviewsQueryDto {
  @IsOptional()
  @IsBoolean()
  approved?: boolean;
}

export class ApproveReviewDto {
  @IsOptional()
  @IsBoolean()
  isApproved?: boolean = true;
}
