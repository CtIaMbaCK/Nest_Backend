import { createParamDecorator, ExecutionContext } from '@nestjs/common';
interface RequestWithUser {
  user: {
    userId: string;
    [key: string]: any;
  };
}

export const userDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
