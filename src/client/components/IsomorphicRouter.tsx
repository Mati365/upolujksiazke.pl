import {StaticRouter} from 'react-router';
import {BrowserRouter} from 'react-router-dom';
import {isSSR} from '@shared/helpers';

export const IsomorphicRouter: any = (
  isSSR()
    ? StaticRouter
    : BrowserRouter
);
