import {JWTTokens} from '@api/jwt';

export interface UsersRepo {
  registerAnonymous(): Promise<JWTTokens>;
  refreshToken?(refreshToken: string): Promise<JWTTokens>;
}
