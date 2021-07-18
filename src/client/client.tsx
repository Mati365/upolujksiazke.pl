/// <reference types="../shared/globals" />

import React from 'react';
import ReactDOM from 'react-dom';
import 'instant.page';

import '@assets/scss/index.scss';

import {ENV} from './constants/env';

import {initGtag} from './modules/trackers/analytics';
import {PageRoot} from './routes/Root';

if (ENV.client.analytics?.key)
  initGtag(ENV.client.analytics.key);

ReactDOM.hydrate(
  <PageRoot />,
  document.getElementById('app-hydrate-root'),
);
