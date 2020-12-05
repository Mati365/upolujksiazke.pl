import {createContext, useContext} from 'react';

export type UA = {
  mobile: boolean,
  tablet: boolean,
  desktop: boolean,
};

export const UAContext = createContext<UA>(null);

export const UAContextProvider = UAContext.Provider;

export const useUA = () => useContext(UAContext);
