import * as R from 'ramda';
import {ReactNode} from 'react';

export type RenderFunction = (...args: any[]) => ReactNode;

export const renderFunctionalChildren = (children: ReactNode | RenderFunction, ...args: any[]): ReactNode => (
  R.is(Function, children)
    ? (<RenderFunction> children)(...args)
    : (children || null)
);
