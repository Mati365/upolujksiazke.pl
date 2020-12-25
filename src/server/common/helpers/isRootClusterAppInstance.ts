import {isDevMode} from '@shared/helpers';

/**
 * Helper used primarly for running cron jobs only
 * on root cluster app, it prevents running cron
 * on multiple apps instances at once
 *
 * @export
 * @returns
 */
export function isRootClusterAppInstance() {
  return isDevMode() || +process.env.NODE_APP_INSTANCE === 0;
}
