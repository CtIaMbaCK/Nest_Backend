import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsPhoneNumber,
  IsEnum,
  IsDateString,
  IsOptional,
  ValidateIf,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';
// import { Role, VulnerabilityType, GuardianRelation } from '@prisma/client'; // Import trực tiếp từ Prisma

import {
  Role,
  VulnerabilityType,
  GuardianRelation,
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

  @ApiProperty({
    example: 'StrongP@ss123',
    description: 'Mật khẩu (ít nhất 6 ký tự)',
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ và tên đầy đủ' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '0912345678', description: 'Số điện thoại' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsPhoneNumber('VN', {
    message: 'Số điện thoại không đúng định dạng Việt Nam',
  })
  phoneNumber: string;

  @ApiProperty({
    example: '2000-01-01T00:00:00.000Z',
    description: 'Ngày sinh (ISO 8601)',
  })
  @IsNotEmpty({ message: 'Ngày sinh không được để trống' })
  @IsDateString({}, { message: 'Ngày sinh phải là định dạng ngày tháng (ISO)' })
  dateOfBirth: string;
}

export class CreateVolunteerProfileDto {
  @ApiPropertyOptional({
    example: ['EDUCATION', 'MEDICAL'],
    description: 'Kỹ năng chuyên môn (Danh sách Enum string)',
  })
  @IsArray({ message: 'Kỹ năng phải là một danh sách' })
  @IsOptional()
  skills?: string[];

  @ApiPropertyOptional({
    example: 'Tôi muốn đóng góp...',
    description: 'Giới thiệu bản thân',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  // Có thể thêm các trường khác như kinh nghiệm, quận huyện ưu tiên...
}
//
export class CreateUserDto {
  // thong tin chung
  @ApiProperty({
    example: 'nguyenvan@example.com',
    description: 'Email đăng nhập',
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({
    example: 'StrongP@ss123',
    description: 'Mật khẩu (ít nhất 6 ký tự)',
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ và tên đầy đủ' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '0912345678', description: 'Số điện thoại Việt Nam' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsPhoneNumber('VN', {
    message: 'Số điện thoại không đúng định dạng Việt Nam',
  })
  phoneNumber: string;

  @ApiProperty({
    enum: Role,
    example: Role.VOLUNTEER,
    description: 'Vai trò: VOLUNTEER hoặc BENEFICIARY',
  })
  @IsNotEmpty({ message: 'Vui lòng chọn vai trò (Role)' })
  @IsEnum(Role, { message: 'Vai trò không hợp lệ' })
  role: Role;

  @ApiProperty({
    example: '2000-01-01T00:00:00.000Z',
    description: 'Ngày sinh (ISO 8601)',
  })
  @IsNotEmpty({ message: 'Ngày sinh không được để trống' })
  @IsDateString({}, { message: 'Ngày sinh phải là định dạng ngày tháng (ISO)' })
  dateOfBirth: string;

  //  thong tin tinh nguyen vien va chi valid khi la role tinh nguyen vien

  @ApiPropertyOptional({
    example: ['EDUCATION', 'MEDICAL'],
    description: 'Kỹ năng chuyên môn',
  })
  @ValidateIf((o: { role?: Role }) => o.role === Role.VOLUNTEER)
  @IsArray({ message: 'Kỹ năng phải là một danh sách' })
  @IsOptional()
  skills?: string[];

  @ApiPropertyOptional({
    example: 'Tôi muốn đóng góp...',
    description: 'Giới thiệu bản thân',
  })
  @ValidateIf((o: { role?: Role }) => o.role === Role.VOLUNTEER)
  @IsString()
  @IsOptional()
  bio?: string;

  //  thong tin nguoi can giup đỡ va chi valid khi la role ng cần giúp đỡ
  @ValidateIf((o: { role?: Role }) => o.role === Role.BENEFICIARY)
  @ApiPropertyOptional({
    enum: VulnerabilityType,
    description: 'Loại hình khó khăn',
  })
  @ValidateIf((o: { role?: Role }) => o.role === Role.BENEFICIARY)
  @IsNotEmpty({ message: 'Phải chọn loại hình khó khăn' })
  @IsEnum(VulnerabilityType)
  vulnerabilityType?: VulnerabilityType;

  @ApiPropertyOptional({ description: 'Mô tả hoàn cảnh' })
  @ValidateIf((o: { role?: Role }) => o.role === Role.BENEFICIARY)
  @IsString()
  @IsOptional()
  situationDescription?: string;

  // --- Người bảo hộ ---
  @ApiPropertyOptional({ description: 'Tên người bảo hộ' })
  @ValidateIf((o: { role?: Role }) => o.role === Role.BENEFICIARY)
  @IsString()
  @IsOptional()
  guardianName?: string;

  @ApiPropertyOptional({ description: 'SĐT người bảo hộ' })
  @ValidateIf((o: { role?: Role }) => o.role === Role.BENEFICIARY)
  @IsPhoneNumber('VN', { message: 'SĐT người bảo hộ không hợp lệ' })
  @IsOptional()
  guardianPhone?: string; // Đã đổi tên cho khớp logic DB

  @ApiPropertyOptional({
    enum: GuardianRelation,
    description: 'Quan hệ với người bảo hộ',
  })
  @ValidateIf((o: { role?: Role }) => o.role === Role.BENEFICIARY)
  @IsEnum(GuardianRelation)
  @IsOptional()
  guardianRelation?: GuardianRelation;
}
