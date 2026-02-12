import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class JoinOrganizationDto {
  @ApiProperty({
    example: 'uuid-của-tổ-chức',
    description: 'ID của tổ chức xã hội muốn gia nhập',
  })
  @IsNotEmpty()
  @IsUUID()
  organizationId: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { District } from 'src/generated/prisma/enums';

export class GetBeneficiariesDto {
  @ApiPropertyOptional({
    description: 'Tìm kiếm theo tên, email hoặc số điện thoại',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    description: 'Lọc theo trạng thái tham gia tổ chức',
  })
  @IsOptional()
  @IsEnum(['PENDING', 'APPROVED', 'REJECTED'])
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}

export class GetVolunteersDto extends GetBeneficiariesDto {
  @ApiPropertyOptional({
    enum: District,
    isArray: true,
    description: 'Lọc theo danh sách các quận/huyện',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(District, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') return [value];
    return value as District[];
  })
  districts?: District[];
}
