import {isSSR} from '@shared/helpers';
import {StaticRouter} from 'react-router';
import {BrowserRouter} from 'react-router-dom';

export const IsomorphicRouter: any = (
  isSSR()
    ? StaticRouter
    : BrowserRouter
);
