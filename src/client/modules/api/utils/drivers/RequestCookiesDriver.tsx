import {Request, Response} from 'express';
import type {CookiesDriver, CookieSetAttrs} from './CookiesDriver';

export class RequestCookiesDriver implements CookiesDriver {
  constructor(
    public readonly req: Request,
    public readonly res: Response,
  ) {}

  get(name: string): any {
    return this.req.cookies[name];
  }

  set(name: string, value: string, attrs: CookieSetAttrs): void {
    this.res.cookie(
      name,
      value,
      {
        maxAge: Date.now() - (+attrs.expires),
      },
    );
  }

  remove(name: string): void {
    this.res.clearCookie(name);
  }
}
