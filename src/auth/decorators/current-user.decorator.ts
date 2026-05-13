import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserProfile } from '../../types';

interface RequestWithUser {
  user?: UserProfile;
}

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (data) return user?.[data as keyof UserProfile];
    return user;
  },
);
