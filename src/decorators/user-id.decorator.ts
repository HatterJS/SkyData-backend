import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { ObjectId } from 'mongodb';

export const UserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): ObjectId | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id ? new ObjectId(request.user.id) : null;
  },
);
