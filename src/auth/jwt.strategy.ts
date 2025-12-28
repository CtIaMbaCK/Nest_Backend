import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './interface/jwt-payload.interface';

import 'dotenv/config';
import { env as ENV } from 'prisma/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: ENV('SECRET_KEY'),
    });
  }

  validate(payload: JwtPayload) {
    // console.log( payload);
    return {
      sub: payload.sub,
      phoneNum: payload.phoneNum,
      role: payload.role,
    };
  }
}
