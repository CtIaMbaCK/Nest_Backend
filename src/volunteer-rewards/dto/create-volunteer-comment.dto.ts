import { IsNotEmpty, IsString, IsInt, Min, Max, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVolunteerCommentDto {
  @ApiProperty({
    description: 'ID của tình nguyện viên nhận nhận xét',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Volunteer ID không được để trống' })
  @IsUUID('4', { message: 'Volunteer ID phải là UUID hợp lệ' })
  volunteerId: string;

  @ApiProperty({
    description: 'Nội dung nhận xét',
    example: 'Tình nguyện viên rất tận tâm và nhiệt huyết trong các hoạt động.',
  })
  @IsNotEmpty({ message: 'Nội dung nhận xét không được để trống' })
  @IsString({ message: 'Nội dung nhận xét phải là chuỗi' })
  comment: string;

  @ApiPropertyOptional({
    description: 'Đánh giá sao (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt({ message: 'Rating phải là số nguyên' })
  @Min(1, { message: 'Rating tối thiểu là 1' })
  @Max(5, { message: 'Rating tối đa là 5' })
  rating?: number;
}
