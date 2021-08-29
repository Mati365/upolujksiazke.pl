import {UsersRepo} from '@api/repo';
import {JWTTokens} from '@api/jwt';

import {AjaxAPIClientChild} from '../AjaxAPIClientChild';

export class UsersAjaxRepo extends AjaxAPIClientChild implements UsersRepo {
  /**
   * Registers anonymous user
   *
   * @return {Promise<JWTTokens>}
   * @memberof UsersAjaxRepo
   */
  async registerAnonymous(): Promise<JWTTokens> {
    return this.ajax.post(
      {
        path: '/users/register/anonymous',
        ignoreLocks: true,
      },
    );
  }
}
