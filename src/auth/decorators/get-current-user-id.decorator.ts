import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentUserId = createParamDecorator(
  (data: undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    //console.log('GetCurrentUserId - Request user object:', request.user);
    return request.user?.sub;
  },
);
