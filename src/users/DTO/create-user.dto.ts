import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsPhoneNumber,
  IsEnum,
  IsOptional,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';
// import { Role, VulnerabilityType, GuardianRelation } from '@prisma/client'; // Import trực tiếp từ Prisma

import {
  Role,
  VulnerabilityType,
  GuardianRelation,
  Skill,
  District,
} from 'src/generated/prisma/enums';

// tạo thongtin basic user
export class CreateBasicUserDto {
  @ApiProperty({
    example: 'nguyenvan@example.com',
    description: 'Email đăng nhập',
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Mật khẩu' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({ example: '0912345678', description: 'Số điện thoại' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsPhoneNumber('VN', { message: 'Số điện thoại không đúng định dạng VN' })
  phoneNumber: string;

  @ApiProperty({ description: 'Vai trò' })
  @IsNotEmpty({ message: 'Vui lòng chọn vai trò' })
  @IsEnum(Role, { message: 'Vai trò không hợp lệ' })
  role: Role;
}

// thong tin tinh nguyen vien
export class CreateVolunteerProfileDto {
  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ và tên hiển thị' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ description: 'Link ảnh đại diện' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Link ảnh mặt trước CCCD' })
  @IsString()
  @IsOptional()
  cccdFrontFile?: string;

  @ApiPropertyOptional({ description: 'Link ảnh mặt sau CCCD' })
  @IsString()
  @IsOptional()
  cccdBackFile?: string;

  @ApiPropertyOptional({
    enum: Skill,
    isArray: true,
    example: [Skill.LOGISTICS, Skill.TEACHING],
    description: 'Danh sách kỹ năng chuyên môn',
  })
  @IsArray({ message: 'Kỹ năng phải là một danh sách' })
  @IsEnum(Skill, { each: true, message: 'Kỹ năng không hợp lệ' })
  @IsOptional()
  skills?: Skill[];

  @ApiPropertyOptional({ example: 2, description: 'Số năm kinh nghiệm' })
  @IsInt({ message: 'Số năm kinh nghiệm phải là số nguyên' })
  @Min(0)
  @IsOptional()
  experienceYears?: number;

  @ApiPropertyOptional({ description: 'Giới thiệu bản thân' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({
    enum: District,
    isArray: true,
    description: 'Quận huyện ưu tiên',
  })
  @IsArray()
  @IsEnum(District, { each: true, message: 'Quận huyện không hợp lệ' })
  @IsOptional()
  preferredDistricts?: District[];
}

// thong tin nguoi can giup do
export class CreateBficiaryProfileDto {
  @ApiProperty({ example: 'Trần Thị B', description: 'Họ và tên hiển thị' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ description: 'Link ảnh đại diện' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Link ảnh mặt trước CCCD' })
  @IsString()
  @IsOptional()
  cccdFrontFile?: string;

  @ApiPropertyOptional({ description: 'Link ảnh mặt sau CCCD' })
  @IsString()
  @IsOptional()
  cccdBackFile?: string;

  @ApiProperty({ enum: VulnerabilityType, description: 'Loại hình khó khăn' })
  @IsNotEmpty({ message: 'Vui lòng chọn loại hình khó khăn' })
  @IsEnum(VulnerabilityType)
  vulnerabilityType: VulnerabilityType;

  @ApiPropertyOptional({ description: 'Mô tả hoàn cảnh' })
  @IsString()
  @IsOptional()
  situationDescription?: string;

  @ApiPropertyOptional({ description: 'Tình trạng sức khỏe' })
  @IsString()
  @IsOptional()
  healthCondition?: string;

  @ApiPropertyOptional({ description: 'Link ảnh minh chứng' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  proofFiles?: string[];

  @ApiPropertyOptional({ description: 'Tên người bảo hộ' })
  @IsString()
  @IsOptional()
  guardianName?: string;

  @ApiPropertyOptional({ description: 'SĐT người bảo hộ' })
  @IsPhoneNumber('VN', { message: 'SĐT không hợp lệ' })
  @IsOptional()
  guardianPhone?: string;

  @ApiPropertyOptional({
    enum: GuardianRelation,
    description: 'Quan hệ người bảo hộ',
  })
  @IsOptional()
  @IsEnum(GuardianRelation)
  @IsOptional()
  guardianRelation?: GuardianRelation;
}
