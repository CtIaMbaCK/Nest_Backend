import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserStatus } from 'src/generated/prisma/client';

export class UpdateOrganizationDto {
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  organizationName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  representativeName?: string;
}
