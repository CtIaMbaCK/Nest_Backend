import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { District } from 'src/generated/prisma/enums';

export class CreateCampaignDto {
  @ApiProperty({
    example: 'Chiến dịch tặng quà Tết cho người nghèo',
    description: 'Tiêu đề của campaign',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Mô tả chi tiết về chiến dịch...',
    description: 'Mô tả chi tiết về campaign',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'Mục tiêu trao 500 phần quà cho người nghèo',
    description: 'Mục tiêu của campaign',
  })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiProperty({
    enum: District,
    example: District.QUAN_1,
    description: 'Quận/huyện tổ chức campaign',
  })
  @IsNotEmpty()
  @IsEnum(District)
  district: District;

  @ApiProperty({
    example: '123 Đường ABC, Phường XYZ',
    description: 'Địa chỉ chi tiết',
  })
  @IsNotEmpty()
  @IsString()
  addressDetail: string;

  @ApiProperty({
    example: '2024-02-01',
    description: 'Ngày bắt đầu campaign (YYYY-MM-DD)',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({
    example: '2024-02-05',
    description: 'Ngày kết thúc campaign (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: 'https://cloudinary.com/cover.jpg',
    description: 'URL ảnh bìa',
  })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({
    example: [
      'https://cloudinary.com/img1.jpg',
      'https://cloudinary.com/img2.jpg',
    ],
    description: 'Danh sách URL các ảnh',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({
    example: 50,
    description: 'Số lượng tình nguyện viên mục tiêu',
    minimum: 0,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  targetVolunteers: number;

  @ApiProperty({
    example: 100,
    description: 'Số lượng tối đa tình nguyện viên có thể đăng ký',
    minimum: 0,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  maxVolunteers: number;
}
