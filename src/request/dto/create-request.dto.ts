import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  RequestCategory,
  District,
  RecurrenceType,
} from 'src/generated/prisma/enums';

export class CreateRequestDto {
  @ApiProperty({ example: 'Giúp đỡ', description: 'Tiêu đề của yêu cầu' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'MEDICAL', description: 'Chọn loại yêu cầu giúp đỡ' })
  @IsEnum(RequestCategory)
  activityType: RequestCategory;

  @ApiPropertyOptional({
    example: 'Cần người mua thuốc cho người nhà theo đơn bác sĩ',
    description: 'Mô tả chi tiết',
  })
  @IsOptional()
  description?: string;

  //   dia diem
  @ApiProperty({
    example: 'TAN_BINH',
    description: 'Quận/Huyện',
  })
  @IsEnum(District)
  @IsNotEmpty()
  district: District;
  //  mo ta chi tiet dia chi
  @ApiProperty({
    example: '53/15 Nguyễn Hồng Đào, Phường 14',
    description: 'Địa chỉ chi tiết',
  })
  @IsNotEmpty()
  addressDetail: string;

  @ApiProperty({
    example: '2025-01-10',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    example: '2025-01-11',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    example: '2025-01-10T08:30:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    example: '2025-01-10T17:30:00Z',
  })
  @IsDateString()
  @IsOptional()
  endTime: string;

  @ApiPropertyOptional({
    example: 'WEEKLY',
    enum: RecurrenceType,
    default: 'NONE',
  })
  @IsEnum(RecurrenceType)
  @IsOptional()
  recurrence?: RecurrenceType;

  @ApiPropertyOptional({
    example: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbj_SXUeWP4_QMm_Q0B0lmBfze8BiAQhCTmg&s,..',
    ],
    description: 'Danh sách URL ảnh',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  activityImages?: string[];
}
