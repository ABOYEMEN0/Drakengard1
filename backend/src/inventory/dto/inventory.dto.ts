import { IsIn, IsInt, IsOptional, IsString, NotEquals } from 'class-validator';
import { PaginationQueryDto } from '../../common/utils/pagination';

export class StockListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['low', 'out'])
  filter?: 'low' | 'out';

  @IsOptional()
  @IsString()
  search?: string;
}

export class AdjustStockDto {
  @IsString()
  productId!: string;

  @IsInt()
  @NotEquals(0)
  change!: number;

  @IsIn(['RESTOCK', 'ADJUSTMENT'])
  reason!: 'RESTOCK' | 'ADJUSTMENT';

  @IsOptional()
  @IsString()
  note?: string;
}

export class MovementsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  productId?: string;
}
