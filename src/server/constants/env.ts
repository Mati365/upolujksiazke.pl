import {AppEnv, GLOBAL_CONFIG} from '../../../config/env';

export {
  AppEnv,
};

export const ENV = {
  ...GLOBAL_CONFIG.shared,
  ...GLOBAL_CONFIG[process.env.APP_ENV || 'development'],
};

export const SERVER_ENV = ENV.server;
export const CLIENT_ENV = ENV.client;
export const SHARED_ENV = ENV.shared;

globalThis.APP_ENV_CONFIG = ENV;
