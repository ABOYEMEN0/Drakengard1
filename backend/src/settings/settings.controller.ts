import { Body, Controller, Get, Put } from '@nestjs/common';
import { ArrayMinSize, IsArray, IsDefined, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SettingsService } from './settings.service';
import { Public, RequirePermissions } from '../common/decorators';

class SettingEntryDto {
  @IsString()
  key!: string;

  @IsDefined()
  value!: unknown;
}

class BulkSettingsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SettingEntryDto)
  entries!: SettingEntryDto[];
}

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('public')
  @Public()
  getPublic() {
    return this.settingsService.getPublic();
  }

  @Get()
  @RequirePermissions('settings:write')
  getAll() {
    return this.settingsService.getAll();
  }

  @Put()
  @RequirePermissions('settings:write')
  bulkUpsert(@Body() dto: BulkSettingsDto) {
    return this.settingsService.bulkUpsert(dto.entries);
  }
}
