import {createContext, useContext} from 'react';
import {AjaxAPIClient} from '../AjaxAPIClient';

export const AjaxAPIContext = createContext<AjaxAPIClient>(null);

export function useAjaxAPIClient() {
  return useContext(AjaxAPIContext);
}
