import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

import type { Nullable, RequestWithUser, UserContext } from './types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Nullable<UserContext> => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user as UserContext | undefined;

    if (!user) {
      throw new UnauthorizedException('User context missing');
    }

    return user;
  },
);
