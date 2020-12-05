import {Request} from 'express';
import {Reflector} from '@nestjs/core';
import {
  Injectable, CanActivate,
  ExecutionContext, UseGuards,
  SetMetadata, applyDecorators,
} from '@nestjs/common';

@Injectable()
export class AcceptsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const request: Request = context.switchToHttp().getRequest();

    return !!request.accepts(
      this.reflector.get<string[]>('accepts', context.getHandler()),
    );
  }
}

export const Accepts = (...types: string[]) => applyDecorators(
  SetMetadata('accepts', types),
  UseGuards(AcceptsGuard),
);
