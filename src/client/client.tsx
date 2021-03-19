/// <reference types="../shared/globals" />

import React from 'react';
import ReactDOM from 'react-dom';

import '@assets/scss/index.scss';
import {PageRoot} from './routes/Root';

ReactDOM.hydrate(
  <PageRoot />,
  document.getElementById('app-hydrate-root'),
);
