import {WrapMethod} from '@shared/helpers/decorators/WrapMethod';
import {AjaxAPIClientChild} from '../AjaxAPIClientChild';

const SILENT_REGISTER_LOCK_KEY = 'silent_register';

export function SilentRegisterIfAnonymous() {
  return WrapMethod((fn) => async function wrapped(this: AjaxAPIClientChild, ...args: any[]) {
    const {ajax, api} = this;
    const {tokenAccessor} = ajax.config;

    if (!tokenAccessor.isAuthorized()) {
      ajax.setLockIfNotPresent(
        SILENT_REGISTER_LOCK_KEY,
        async () => {
          const result = await api.repo.users.registerAnonymous();
          if (result)
            tokenAccessor.setTokens(result);
        },
      );
    }

    return fn(...args);
  });
}
