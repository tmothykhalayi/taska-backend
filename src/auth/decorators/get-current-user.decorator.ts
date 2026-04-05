import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract the current user from the JWT payload
 * Usage: @GetCurrentUser() user: { sub: number; email: string }
 */
export const GetCurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    //console.log('Request user object:', request.user);

    if (data) {
      return request.user[data];
    }

    // Map the JWT payload to the expected user structure
    if (request.user) {
      return {
        id: request.user.sub,
        role: request.user.role,
        email: request.user.email,
      };
    }

    return request.user; // Return entire user object
  },
);
