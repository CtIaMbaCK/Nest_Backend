import { IsNotEmpty, IsString, IsUUID, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IssueAdminCertificateDto {
  @ApiProperty({
    description: 'ID tình nguyện viên nhận chứng nhận',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Volunteer ID không được để trống' })
  @IsUUID('4', { message: 'Volunteer ID phải là UUID hợp lệ' })
  volunteerId: string;

  @ApiPropertyOptional({
    description: 'Dữ liệu bổ sung cho chứng nhận (JSON)',
    example: { achievementText: 'Đã hoàn thành xuất sắc 12 hoạt động tình nguyện' },
  })
  @IsOptional()
  @IsObject({ message: 'Additional data phải là object' })
  additionalData?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Ghi chú (optional)',
    example: 'Trao thưởng cuối năm 2026',
  })
  @IsOptional()
  @IsString({ message: 'Notes phải là chuỗi' })
  notes?: string;
}
