import type { UserContext } from '@common/types';
import type { AppConfig } from '@config/config.types';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from './auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(cfg: ConfigService<AppConfig>) {
    const secret = cfg.get<string>('auth.jwtSecret' as keyof AppConfig);

    if (!secret) {
      throw new Error('JWT secret is not configured');
    }

    super({
      secretOrKey: secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  validate(payload: JwtPayload): UserContext {
    console.log('JWT PAYLOAD:', payload);
    return {
      userId: payload.sub,
      tenantId: payload.tenantId,
    };
  }
}
