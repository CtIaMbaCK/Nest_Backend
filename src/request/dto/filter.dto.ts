import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityStatus } from 'src/generated/prisma/enums';

export class FilterActivityDto {
  @ApiPropertyOptional({
    description: 'Tìm kiếm theo tên hoạt động (Title)',
    example: 'Dọn dẹp vệ sinh',
  })
  @IsOptional()
  @IsString()
  search?: string;

  //   loc
  @ApiPropertyOptional({
    enum: ActivityStatus,
    description: 'Lọc theo trạng thái hoạt động',
    example: ActivityStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @ApiPropertyOptional({
    description: 'Số trang hiện tại (Mặc định là 1)',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng kết quả mỗi trang (Mặc định là 10)',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
