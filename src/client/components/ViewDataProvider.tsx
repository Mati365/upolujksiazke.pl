import React, {ReactNode, useContext} from 'react';
import {isSSR} from '@shared/helpers';

declare global {
  interface Window {
    viewData: object,
  }
}

type ViewDataProviderProps = {
  initialData: object,
  children?: ReactNode,
};

export const ViewDataContext = React.createContext<object>({});

export const ViewDataProvider = ({children, initialData}: ViewDataProviderProps) => (
  <ViewDataContext.Provider
    value={(
      isSSR()
        ? initialData
        : window?.viewData
    )}
  >
    {children}
  </ViewDataContext.Provider>
);

export const useViewData = <T extends {}>() => useContext(ViewDataContext) as T;
