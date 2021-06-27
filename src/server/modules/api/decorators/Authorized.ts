import {WrapMethod} from '@shared/helpers/decorators/WrapMethod';
import {ServerAPIClientChild} from '../client/ServerAPIClientChild';
import {ForbiddenException} from '../exceptions';

export const Authorized = WrapMethod((fn) => async function wrapped(this: ServerAPIClientChild, ...args: any[]) {
  const {services: {decodedJWT}} = this;
  if (!decodedJWT)
    throw new ForbiddenException;

  return fn(...args);
});
