import {isDevMode} from '@shared/helpers';

/**
 * Returns PM2 cluster index
 *
 * @export
 * @returns
 */
export function getClusterAppInstance() {
  return +process.env.NODE_APP_INSTANCE || 0;
}

/**
 * Helper used primarly for running cron jobs only
 * on root cluster app, it prevents running cron
 * on multiple apps instances at once
 *
 * @export
 * @returns
 */
export function isRootClusterAppInstance() {
  return isDevMode() || getClusterAppInstance() === 0;
}
