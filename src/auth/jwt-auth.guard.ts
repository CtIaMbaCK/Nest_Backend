import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtGuardInfo } from './interface/jwt-payload.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: any, info: any) {
    const jwtInfo = info as JwtGuardInfo;
    if (err || !user) {
      if (jwtInfo && jwtInfo.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Token đã hết hạn, vui lòng đăng nhập lại',
        );
      }
      throw (
        err ||
        new UnauthorizedException('Token không hợp lệ hoặc không tồn tại')
      );
    }

    return user as TUser;
  }
}
