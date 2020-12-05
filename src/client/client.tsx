/// <reference types="../shared/globals" />

import React from 'react';
import ReactDOM from 'react-dom';

import '@assets/scss/index.scss';

import {wrapHydratedAsyncTree} from './hooks/useSSRPromiseAttach/wrapHydratedAsyncTree';

import {ENV} from './constants/env';
import {PageRoot} from './containers/PageRoot';

const {i18n, ua} = window;

ReactDOM.hydrate(
  wrapHydratedAsyncTree(
    <PageRoot
      ua={ua}
      hydrateLang={i18n}
      apiConfig={ENV.apiConfig}
    />,
  ),
  document.getElementById('app-hydrate-root'),
);
