import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
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
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      if (value.trim() === '') return [];

      if (value.trim().startsWith('[')) {
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      }

      return value
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0) as Skill[];
    }
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  })
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
  @IsOptional()
  @IsArray({ message: 'Quận huyện phải là một danh sách' })
  @IsEnum(District, { each: true, message: 'Quận huyện không hợp lệ' })
  @Transform(({ value }): District[] => {
    if (typeof value === 'string') {
      if (value.trim() === '') return [];

      if (value.trim().startsWith('[')) {
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      }

      return value
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0) as District[];
    }
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  })
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

export class UpdateVolunteerProfileDto extends PartialType(
  CreateVolunteerProfileDto,
) {}

export class UpdateBficiaryProfileDto extends PartialType(
  CreateBficiaryProfileDto,
) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // Đảm bảo mọi phần tử trong mảng đều là string
  @Transform(({ value }: TransformFnParams) => {
    if (value === null || value === undefined) return undefined;

    if (typeof value === 'string') {
      if (value.trim() === '') return [];
      return [value];
    }
    if (Array.isArray(value)) return value;

    return [];
  })
  keepingProofFiles?: string[];
}

// DTO cho update organization profile
export class UpdateOrganizationProfileDto {
  @ApiPropertyOptional({ description: 'Tên tổ chức' })
  @IsString()
  @IsOptional()
  organizationName?: string;

  @ApiPropertyOptional({ description: 'Tên người đại diện' })
  @IsString()
  @IsOptional()
  representativeName?: string;

  @ApiPropertyOptional({ description: 'Mô tả tổ chức' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Website' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ enum: District, description: 'Quận/Huyện' })
  @IsEnum(District)
  @IsOptional()
  district?: District;

  @ApiPropertyOptional({ description: 'Địa chỉ chi tiết' })
  @IsString()
  @IsOptional()
  addressDetail?: string;

  @ApiPropertyOptional({ description: 'URL ảnh đại diện' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'URL giấy phép kinh doanh' })
  @IsString()
  @IsOptional()
  businessLicense?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Danh sách URLs tài liệu xác minh cũ muốn giữ lại',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }: TransformFnParams) => {
    if (value === null || value === undefined) return undefined;

    if (typeof value === 'string') {
      if (value.trim() === '') return [];
      return [value];
    }
    if (Array.isArray(value)) return value;

    return [];
  })
  keepingVerificationDocs?: string[];
}
