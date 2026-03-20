import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { AuthUser, Nullable, RequestWithUser } from './types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Nullable<AuthUser> => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    return req.user;
  },
);
