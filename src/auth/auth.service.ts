import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBasicUserDto } from 'src/users/dto/create-user.dto';
import { helpComparePassword, helpHashPassword } from 'src/helpers/utils';
import { LoginDto } from 'src/users/dto/login-user.dto';

import 'dotenv/config';
import { env as ENV } from 'prisma/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateBasicUserDto) {
    const existedUSer = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: dto.email,
            phoneNumber: dto.phoneNumber,
          },
        ],
      },
    });

    if (existedUSer) {
      throw new Error('Người dùng đã tồn tại');
    }

    const passwordHash = await helpHashPassword(dto.password);

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        passwordHash: passwordHash,
        role: dto.role,
        status: 'PENDING',
      },
    });

    return this.signToken(newUser.id, newUser.phoneNumber, newUser.role);
  }

  //   Tao token
  private async signToken(userId: string, phoneNumber: string, role: string) {
    const payload = { sub: userId, phoneNumber, role };
    const token = await this.jwtService.signAsync(payload, {
      secret: ENV('SECRET_KEY'),
      expiresIn: '1d',
    });

    return { accessToken: token, role: role };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumbner },
    });

    if (!user) {
      throw new UnauthorizedException('Tài khoản chưa được đăng ký');
    }

    const isMatch = await helpComparePassword(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Sai mật khẩu');
    }

    const payload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    };
  }
}
