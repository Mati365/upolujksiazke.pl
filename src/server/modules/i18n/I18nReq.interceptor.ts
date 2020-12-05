import {Injectable, NestInterceptor, ExecutionContext, CallHandler} from '@nestjs/common';
import {Observable} from 'rxjs';

import {LANG_SETTING_COOKIE} from '@client/constants/cookies';
import {I18nPackService} from './I18nPack.service';

export class I18nContext {
  constructor(
    public readonly lang: string,
    public readonly service: I18nPackService,
  ) {}
}

@Injectable()
export class I18nReqInterceptor implements NestInterceptor {
  constructor(
    private readonly packsService: I18nPackService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const {packsService} = this;
    const req = context.switchToHttp().getRequest();

    const currentLang = (
      req.cookies[LANG_SETTING_COOKIE]
        || req.acceptsLanguages(packsService.getAvailableLanguages())
        || 'pl'
    );

    (req as any).i18n = new I18nContext(currentLang, packsService);
    return next.handle();
  }
}
