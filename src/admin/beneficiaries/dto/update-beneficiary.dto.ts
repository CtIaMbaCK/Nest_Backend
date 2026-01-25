import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserStatus } from 'src/generated/prisma/client';

export class UpdateBeneficiaryDto {
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
