import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateEmergencyDto {
  @ApiProperty({
    description: 'Trạng thái xử lý',
    enum: ['NEW', 'COMPLETED'],
    example: 'COMPLETED',
  })
  @IsEnum(['NEW', 'COMPLETED'])
  status: 'NEW' | 'COMPLETED';

  @ApiProperty({
    description: 'Ghi chú của Admin khi xử lý (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
