import React, {ReactNode} from 'react';
import {StaticRouterProps} from 'react-router';

import {AuthProvider} from '@client/modules/api/hooks/useAuthState';
import {IsomorphicRouter} from '@client/components';
import {UA, UAContextProvider} from '@client/modules/ua/UAProvider';

import {ProvideI18n} from '../i18n/ProvideI18n';
import {LangHydrate, Lang} from '../i18n/utils/createLangPack';
import {APIConfig} from '../modules/api/utils/APIClient';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Window {
    ua: UA,
    i18n: LangHydrate,
    ssrTime: number,
  }
}

export type PageProvidersProps = {
  ua: UA,
  routerConfig?: StaticRouterProps,
  hydrateLang: LangHydrate,
  apiConfig: APIConfig,
  children: ReactNode,
};

export const PageProviders = (
  {
    ua, hydrateLang, children,
    apiConfig, routerConfig,
  }: PageProvidersProps,
) => (
  <UAContextProvider value={ua}>
    <ProvideI18n
      translations={hydrateLang.packs}
      lang={hydrateLang.lang as Lang}
    >
      <AuthProvider apiConfig={apiConfig}>
        <IsomorphicRouter {...routerConfig}>
          {children}
        </IsomorphicRouter>
      </AuthProvider>
    </ProvideI18n>
  </UAContextProvider>
);

PageProviders.displayName = 'PageProviders';
