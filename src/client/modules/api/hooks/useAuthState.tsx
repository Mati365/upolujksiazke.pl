import {useState, useEffect} from 'react';
import constate from 'constate';

import {ID} from '@shared/types';
import {useForceRerender} from '@client/hooks/useForceRerender';

import {useLangContext} from '@client/i18n/ProvideI18n';
import {APICookieTokenAccessor} from '../utils/APICookieTokenAccessor';
import {
  APIClient,
  APIConfig,
} from '../utils/APIClient';

import {DecodedJWT} from '../utils/APITokenAccessor';

type AuthState = {
  client: APIClient,
};

export type AuthContextData = {
  client: APIClient,
  authState: AuthState,
  id: ID,
  userInfo: DecodedJWT,

  isAuthorized(): boolean,
  isExpired(): boolean,
  setAuthState(authState: AuthState): void,
};

const useAuthState = ({apiConfig}: {apiConfig: APIConfig}): AuthContextData => {
  const context: AuthContextData = {} as any;
  const forceRerender = useForceRerender();
  const langContext = useLangContext();
  const [authState, setAuthState] = useState<AuthState>(
    () => ({
      client: new APIClient(
        {
          tokenAccessor: apiConfig?.tokenAccessor ?? new APICookieTokenAccessor(
            {
              listeners: {
                onTokensUpdated: forceRerender,
              },
            },
          ),
          ...apiConfig,
        },
      ),
    }),
  );

  const {client} = authState;
  const tokenAccessor = client.config.tokenAccessor as APICookieTokenAccessor;

  useEffect(
    () => {
      client.config.headers = {
        ...client.config.headers,
        'Accept-Language': langContext.lang,
      };
    },
    [langContext.lang],
  );

  Object.assign(
    context,
    {
      get id() {
        return tokenAccessor.decoded?.id;
      },
      get userInfo() {
        return tokenAccessor.decoded;
      },

      client,
      authState,
      setAuthState,

      isAuthorized: () => tokenAccessor.isAuthorized(),
      isExpired: () => tokenAccessor.isExpired(),
    } as AuthContextData,
  );

  return context;
};

export const [AuthProvider, useAuthContext] = constate(useAuthState);
