import {isSSR} from '@shared/helpers';
import {APIConfig} from '../modules/api/utils/APIClient';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Window {
    env: {
      apiConfig: APIConfig,
    },
  }
}

export const ENV = (
  isSSR()
    ? null
    : window.env
);
