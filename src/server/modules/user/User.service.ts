import {Injectable} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as uuid from 'uuid';
import * as R from 'ramda';

import {SERVER_ENV} from '@server/constants/env';

import {DecodedJWT, JWTTokens} from '@api/jwt';
import {UserEntity} from './User.entity';

@Injectable()
export class UserService {
  /**
   * Generates random string from JWT refresh function
   *
   * @static
   * @return {string}
   * @memberof UserService
   */
  static generateRandomJWTRefresh(): string {
    return uuid.v4();
  }

  /**
   * Creates anonymous user with random refresh key
   *
   * @return {Promise<UserEntity>}
   * @memberof UserService
   */
  registerAnonymous(): Promise<UserEntity> {
    return UserEntity.save(
      new UserEntity(
        {
          refreshToken: UserService.generateRandomJWTRefresh(),
        },
      ),
    );
  }

  /**
   * Refreshes user token
   *
   * @param {string} refreshToken
   * @return {Promise<UserEntity>}
   * @memberof UserService
   */
  async refreshToken(refreshToken: string): Promise<UserEntity> {
    const user = await UserEntity.findOne(
      {
        refreshToken,
      },
    );

    if (R.isNil(user))
      return null;

    user.refreshToken = UserService.generateRandomJWTRefresh();
    await UserEntity.save(user);
    return user;
  }

  /**
   * Refreshes tokens and signs
   *
   * @param {string} refreshToken
   * @return {Promise<JWTTokens>}
   * @memberof UserService
   */
  async refreshTokenAndSign(refreshToken: string): Promise<JWTTokens> {
    return UserService.signJWTKeys(
      await this.refreshToken(refreshToken),
    );
  }

  /**
   * Gen content that is placed into JWT Token
   *
   * @static
   * @param {UserEntity} user
   * @return {DecodedJWT}
   * @memberof UserService
   */
  static genUserTokenData(user: UserEntity): DecodedJWT {
    return {
      id: user.id,
    };
  }

  /**
   * Verifies and parses
   *
   * @static
   * @param {string} token
   * @return {DecodedJWT}
   * @memberof UserService
   */
  static parseJWTToken(token: string): DecodedJWT {
    if (!token)
      return null;

    try {
      return <DecodedJWT> jwt.verify(token, SERVER_ENV.jwt.secret);
    } catch (e) {
      return null;
    }
  }

  /**
   * Generate token and returns refresh token for user
   *
   * @static
   * @param {UserEntity} entity
   * @return {JWTTokens}
   * @memberof UserService
   */
  static signJWTKeys(entity: UserEntity): JWTTokens {
    if (!entity)
      return null;

    const {jwt: jwtConst} = SERVER_ENV;
    return {
      refreshToken: entity.refreshToken,
      token: jwt.sign(
        UserService.genUserTokenData(entity),
        jwtConst.secret,
        {
          expiresIn: jwtConst.expireSeconds,
        },
      ),
    };
  }
}
