import { createParamDecorator } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';

const Headers = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return data ? req.headers[data] : req.headers;
});

export default Headers;
