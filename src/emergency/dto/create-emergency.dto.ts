import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateEmergencyDto {
  @ApiProperty({
    description: 'Ghi chú từ người cần giúp đỡ (optional)',
    required: false,
    example: 'Cần hỗ trợ khẩn cấp',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
