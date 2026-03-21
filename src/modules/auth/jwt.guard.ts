import type { UserContext } from '@common/types';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// TODO: move helper function
const isUserContext = (user: unknown): user is UserContext => {
  if (typeof user !== 'object' || user === undefined) return false;

  const u = user as Record<string, unknown>;

  return typeof u.userId === 'string' && typeof u.tenantId === 'string';
};

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = UserContext>(err: unknown, user: unknown): TUser {
    if (err || !isUserContext(user)) {
      throw err instanceof Error ? err : new UnauthorizedException();
    }

    return user as TUser;
  }
}
