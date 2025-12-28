import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../interface/jwt-payload.interface';

export const GetUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: JwtPayload }>();

    const user = request.user;
    console.log('Decoded user from JWT:', user);

    if (!user) return null;

    if (data) {
      return user[data];
    }

    return user;
  },
);
