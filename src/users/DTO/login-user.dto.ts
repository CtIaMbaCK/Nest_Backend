import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '0385279610', description: 'Số điện thoại' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phoneNumbner: string;

  @ApiProperty({ example: '123456', description: 'Mật khẩu' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;
}
