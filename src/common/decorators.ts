import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { AuthUser, Nullable } from './types';

export type RequestWithUser = Request & { user?: AuthUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Nullable<AuthUser> => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    return req.user;
  },
);
