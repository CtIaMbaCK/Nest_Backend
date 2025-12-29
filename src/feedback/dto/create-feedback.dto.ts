import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({
    description: 'Id hoạt động',
    example: 'uuid-activity',
  })
  @IsUUID()
  activityId: string;

  @ApiProperty({
    description: 'Id tnv',
    example: 'uuid-volunteer',
  })
  @IsUUID()
  targetId: string;

  @ApiProperty({ description: 'Số sao (User chọn)', example: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'comment', required: false })
  @IsOptional()
  @IsString()
  comment: string;
}

export class CreateAppreciationDto {
  @ApiProperty({ description: 'Id hoạt động', example: 'uuid-activity' })
  @IsUUID()
  @IsNotEmpty()
  activityId: string;

  @ApiProperty({
    description: 'Id tnv',
    example: 'uuid-volunteer',
  })
  @IsUUID()
  @IsNotEmpty()
  targetId: string;
}
