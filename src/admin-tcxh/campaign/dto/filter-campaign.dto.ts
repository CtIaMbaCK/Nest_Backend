import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CampaignStatus, District } from 'src/generated/prisma/enums';

export class FilterCampaignDto {
  @ApiPropertyOptional({
    description: 'Tìm kiếm theo tiêu đề hoặc mô tả',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: CampaignStatus,
    isArray: true,
    description: 'Lọc theo trạng thái campaign',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(CampaignStatus, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') return [value];
    return value as CampaignStatus[];
  })
  status?: CampaignStatus[];

  @ApiPropertyOptional({
    enum: District,
    isArray: true,
    description: 'Lọc theo quận/huyện',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(District, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') return [value];
    return value as District[];
  })
  districts?: District[];

  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Lọc campaign được tạo từ ngày này (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: 'Lọc campaign được tạo đến ngày này (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @ApiPropertyOptional({
    example: '2024-02-01',
    description: 'Lọc campaign bắt đầu từ ngày này (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startFrom?: string;

  @ApiPropertyOptional({
    example: '2024-02-28',
    description: 'Lọc campaign bắt đầu đến ngày này (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startTo?: string;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}
