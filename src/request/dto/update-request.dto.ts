import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRequestDto } from './create-request.dto';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ActivityStatus } from 'src/generated/prisma/enums';

export class UpdateRequestDto extends PartialType(CreateRequestDto) {}

export class UpdateStatusDto {
  @ApiProperty({
    description: 'Danh sách link ảnh minh chứng',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  proofImages?: string[];

  @ApiProperty({ description: 'Ghi chú kết quả', required: false })
  @IsOptional()
  @IsString()
  completionNotes?: string;
}
