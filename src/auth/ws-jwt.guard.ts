import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();

      // Lấy token từ handshake
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new WsException('Token không hợp lệ');
      }

      // Verify token
      const payload = this.jwtService.verify(token, {
        secret: process.env.SECRET_KEY,
      });

      // Attach user info vào client
      client.data.userId = payload.sub;
      client.data.role = payload.role;
      client.data.phoneNumber = payload.phoneNumber;

      return true;
    } catch (error) {
      throw new WsException('Xác thực thất bại');
    }
  }
}
