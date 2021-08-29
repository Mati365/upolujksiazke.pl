import {isSSR} from '@shared/helpers';
import type {AppEnv} from '../../../config/env';

export const CLIENT_HYDRATE_DATA: any = (
  isSSR()
    ? null
    : JSON.parse(document.getElementById('app-hydrate-data').innerHTML)
);

export const ENV: AppEnv = (
  isSSR()
    ? globalThis.APP_ENV_CONFIG
    : CLIENT_HYDRATE_DATA.env
);
