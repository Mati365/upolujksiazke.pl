import Cookies from 'js-cookie';

import {
  JWT_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '@client/constants/cookies';

import {isSSR} from '@shared/helpers/isSSR';
import {
  JWTTokens,
  JwtTokenAccessor,
  JwtTokenAccessorListeners,
} from './JwtTokenAccessor';

/**
 * Accessors allow to detect revoke token
 */
export class JwtCookiesTokenAccessor extends JwtTokenAccessor {
  private tokenCookie: string;
  private refreshTokenCookie: string;

  constructor(
    {
      tokenCookie = JWT_TOKEN_COOKIE,
      refreshTokenCookie = REFRESH_TOKEN_COOKIE,
      listeners,
    }: {
      tokenCookie?: string,
      refreshTokenCookie?: string,
      listeners?: JwtTokenAccessorListeners,
    } = {},
  ) {
    super(null, null, listeners);

    this.tokenCookie = tokenCookie;
    this.refreshTokenCookie = refreshTokenCookie;

    if (!isSSR())
      this.loadCookies();
  }

  setTokens(
    {
      writeCookie = true,
      ...tokens
    }: JWTTokens & {
      silent?: boolean,
      writeCookie?: boolean,
    },
  ): this {
    super.setTokens(tokens);

    if (writeCookie) {
      const {decoded, tokenCookie, refreshTokenCookie} = this;
      const {token, refreshToken} = tokens;

      if (decoded) {
        Cookies.set(tokenCookie, token, {expires: new Date('2200')});
        Cookies.set(refreshTokenCookie, refreshToken, {expires: new Date('2200')});
      } else {
        Cookies.remove(tokenCookie);
        Cookies.remove(refreshTokenCookie);
      }
    }

    return this;
  }

  shouldRefreshToken(): boolean {
    if (!super.shouldRefreshToken())
      return false;

    this.loadCookies(true);
    return super.shouldRefreshToken();
  }

  private loadCookies(silent?: boolean): void {
    const {tokenCookie, refreshTokenCookie} = this;

    this.setTokens(
      {
        token: Cookies.get(tokenCookie),
        refreshToken: Cookies.get(refreshTokenCookie),
        writeCookie: false,
        silent,
      },
    );
  }
}
