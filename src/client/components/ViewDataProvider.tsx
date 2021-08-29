import React, {ReactNode, useContext, useMemo} from 'react';

import {CLIENT_HYDRATE_DATA} from '@client/constants/env';
import {isSSR} from '@shared/helpers';

type ViewDataProviderProps = {
  initialData: any,
  children?(viewData: any): ReactNode,
};

export const ViewDataContext = React.createContext<any>({});

export const ViewDataProvider = ({children, initialData}: ViewDataProviderProps) => {
  const data = useMemo(
    () => (
      isSSR()
        ? initialData
        : CLIENT_HYDRATE_DATA
    ),
    [],
  );

  return (
    <ViewDataContext.Provider value={data}>
      {children(data)}
    </ViewDataContext.Provider>
  );
};

export const useViewData = <T extends {}>() => useContext(ViewDataContext) as T;
