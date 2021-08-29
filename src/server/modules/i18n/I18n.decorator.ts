import {createParamDecorator, ExecutionContext} from '@nestjs/common';

export const I18n = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    return (req as any).i18n;
  },
);
