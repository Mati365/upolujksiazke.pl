import {UsersRepo} from '@api/repo';
import {JWTTokens} from '@api/jwt';

import {UserService} from '@server/modules/user/User.service';
import {ServerAPIClientChild} from '../ServerAPIClientChild';

export class UsersServerRepo extends ServerAPIClientChild implements UsersRepo {
  /**
   * Create anonymous user
   *
   * @return {Promise<JWTTokens>}
   * @memberof UsersServerRepo
   */
  async registerAnonymous(): Promise<JWTTokens> {
    const {userService} = this.services;

    return UserService.signJWTKeys(
      await userService.registerAnonymous(),
    );
  }

  /**
   * Refresh user token
   *
   * @return {Promise<JWTTokens>}
   * @memberof UsersServerRepo
   */
  async refreshToken(refreshToken: string): Promise<JWTTokens> {
    const {userService} = this.services;

    return userService.refreshTokenAndSign(refreshToken);
  }
}
