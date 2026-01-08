// export class CreateOrganizationDto {}
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsArray,
} from 'class-validator';
import { District } from 'src/generated/prisma/enums';

export class CreateOrganizationDto {
  @ApiProperty({
    example: 'Tổ chức Thiện nguyện xanh',
    description: 'Tên tổ chức',
  })
  @IsNotEmpty({ message: 'Tên tổ chức không được để trống' })
  @IsString()
  organizationName: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Tên người đại diện' })
  @IsNotEmpty({ message: 'Tên người đại diện không được để trống' })
  @IsString()
  representativeName: string;

  @ApiPropertyOptional({ description: 'Mô tả về tổ chức' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://tochuc.org',
    description: 'Website tổ chức',
  })
  @IsUrl({}, { message: 'Website không đúng định dạng URL' })
  @IsOptional()
  website?: string;

  @ApiProperty({ enum: District, description: 'Quận/Huyện' })
  @IsNotEmpty({ message: 'Vui lòng chọn Quận/Huyện' })
  @IsEnum(District)
  district: District;

  @ApiProperty({
    example: 'Số 123, đường ABC, phường XYZ',
    description: 'Địa chỉ chi tiết',
  })
  @IsNotEmpty({ message: 'Địa chỉ chi tiết không được để trống' })
  @IsString()
  addressDetail: string;

  // Các trường dưới đây thường do Service tự điền sau khi upload file Cloudinary
  // Nhưng vẫn khai báo IsOptional để Swagger nhận diện nếu cần truyền URL trực tiếp

  @ApiPropertyOptional({ description: 'Link ảnh đại diện tổ chức' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Link ảnh giấy phép kinh doanh/hoạt động',
  })
  @IsString()
  @IsOptional()
  businessLicenseFile?: string;

  @ApiPropertyOptional({
    description: 'Danh sách link ảnh tài liệu xác minh',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  verificationDocs?: string[];
}
