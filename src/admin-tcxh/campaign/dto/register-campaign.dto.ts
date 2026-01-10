import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RegisterCampaignDto {
  @ApiPropertyOptional({
    example: 'Tôi có kinh nghiệm làm tình nguyện 2 năm...',
    description: 'Ghi chú khi đăng ký tham gia campaign',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
