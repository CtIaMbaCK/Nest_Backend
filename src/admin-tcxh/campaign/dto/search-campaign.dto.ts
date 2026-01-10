import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchCampaignDto {
  @ApiPropertyOptional({
    example: 'tặng quà tết',
    description: 'Từ khóa tìm kiếm trong tiêu đề và mô tả campaign',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
