import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/utils/pagination';

export class CreateContactMessageDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsString()
  @MaxLength(5000)
  body!: string;
}

export class ListContactQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsBoolean()
  handled?: boolean;
}

export class SetHandledDto {
  @IsBoolean()
  handled!: boolean;
}
