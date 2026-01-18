import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsInt,
  Min,
  IsEmail,
  MinLength,
} from 'class-validator';
import {
  Skill,
  District,
  VulnerabilityType,
  GuardianRelation,
} from 'src/generated/prisma/enums';

/**
 * DTO cho tạo tài khoản Tình nguyện viên bởi TCXH
 */
export class CreateAccountVolunteerDto {
  @ApiProperty({ description: 'Email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Mật khẩu' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Số điện thoại' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'Họ và tên' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ description: 'URL ảnh đại diện' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'URL ảnh CCCD mặt trước' })
  @IsOptional()
  @IsString()
  cccdFrontFile?: string;

  @ApiPropertyOptional({ description: 'URL ảnh CCCD mặt sau' })
  @IsOptional()
  @IsString()
  cccdBackFile?: string;

  @ApiPropertyOptional({
    description: 'Các kỹ năng',
    enum: Skill,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Skill, { each: true })
  skills?: Skill[];

  @ApiPropertyOptional({ description: 'Số năm kinh nghiệm' })
  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYears?: number;

  @ApiPropertyOptional({ description: 'Tiểu sử' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Các quận ưu tiên',
    enum: District,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(District, { each: true })
  preferredDistricts?: District[];
}

/**
 * DTO cho tạo tài khoản NCGĐ bởi TCXH
 */
export class CreateAccountBeneficiaryDto {
  @ApiProperty({ description: 'Email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Mật khẩu' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Số điện thoại' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'Họ và tên' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ description: 'URL ảnh đại diện' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'URL ảnh CCCD mặt trước' })
  @IsOptional()
  @IsString()
  cccdFrontFile?: string;

  @ApiPropertyOptional({ description: 'URL ảnh CCCD mặt sau' })
  @IsOptional()
  @IsString()
  cccdBackFile?: string;

  @ApiProperty({
    description: 'Loại đối tượng dễ bị tổn thương',
    enum: VulnerabilityType,
  })
  @IsEnum(VulnerabilityType)
  vulnerabilityType: VulnerabilityType;

  @ApiPropertyOptional({ description: 'Mô tả tình huống' })
  @IsOptional()
  @IsString()
  situationDescription?: string;

  @ApiPropertyOptional({ description: 'Tình trạng sức khỏe' })
  @IsOptional()
  @IsString()
  healthCondition?: string;

  @ApiPropertyOptional({ description: 'Tên người bảo hộ' })
  @IsOptional()
  @IsString()
  guardianName?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại người bảo hộ' })
  @IsOptional()
  @IsString()
  guardianPhone?: string;

  @ApiPropertyOptional({
    description: 'Mối quan hệ với người bảo hộ',
    enum: GuardianRelation,
  })
  @IsOptional()
  @IsEnum(GuardianRelation)
  guardianRelation?: GuardianRelation;
}
