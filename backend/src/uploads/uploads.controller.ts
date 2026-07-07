import { Body, Controller, Post } from '@nestjs/common';
import { IsString, Matches } from 'class-validator';
import { UploadsService } from './uploads.service';
import { RequirePermissions } from '../common/decorators';

class PresignDto {
  @IsString()
  filename!: string;

  @IsString()
  @Matches(/^[\w.-]+\/[\w.+-]+$/)
  contentType!: string;
}

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presign')
  @RequirePermissions('products:write')
  presign(@Body() dto: PresignDto) {
    return this.uploadsService.presign(dto.filename, dto.contentType);
  }
}
