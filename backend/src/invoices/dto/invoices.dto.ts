import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/utils/pagination';

export class ListInvoicesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}

export class UpdateInvoiceStatusDto {
  @IsEnum(PaymentStatus)
  status!: PaymentStatus;
}
