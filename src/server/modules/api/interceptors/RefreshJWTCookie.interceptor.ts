import {Observable} from 'rxjs';
import {Response} from 'express';
import {
  Injectable, NestInterceptor,
  ExecutionContext, CallHandler,
  Inject, forwardRef, UseInterceptors,
} from '@nestjs/common';

import {
  JWT_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '@client/constants/cookies';

import {APIClientService} from '../services/APIClient.service';

@Injectable()
export class RefreshJWTCookieInterceptor implements NestInterceptor {
  constructor(
    @Inject(forwardRef(() => APIClientService))
    private readonly apiClientService: APIClientService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const {apiClientService} = this;
    const {refreshJWTToken, decodedJWT} = apiClientService;

    const response: Response = context.switchToHttp().getResponse();
    if (!decodedJWT && refreshJWTToken) {
      const tokens = await apiClientService.userService.refreshTokenAndSign(refreshJWTToken);

      if (tokens) {
        apiClientService.setJWTTokens(tokens);
        response.cookie(
          JWT_TOKEN_COOKIE,
          tokens.token,
          {
            expires: new Date('2330'),
          },
        );

        response.cookie(
          REFRESH_TOKEN_COOKIE,
          tokens.refreshToken,
          {
            expires: new Date('2330'),
          },
        );
      }
    }

    return next.handle();
  }
}

export const UseRefreshJWTInterceptor = UseInterceptors(RefreshJWTCookieInterceptor);
