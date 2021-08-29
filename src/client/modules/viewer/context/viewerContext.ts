import {StateContext, createContextPack} from '@client/modules/context';
import {
  ViewerState,
  ViewerActions,
  createViewerSelectors,
} from './utils';

/* eslint-disable @typescript-eslint/indent */
export type ViewerStateContextType = StateContext<
  ViewerState,
  typeof ViewerActions,
  ReturnType<typeof createViewerSelectors>
>;
/* eslint-enable @typescript-eslint/indent */

const {
  Consumer,
  Context,
  Provider,
  useStateContext,
  useReactContext,
} = createContextPack<ViewerState, typeof ViewerActions, ReturnType<typeof createViewerSelectors>>(
  {
    selectors: createViewerSelectors,
    actions: ViewerActions,
  },
);

export const ViewerContext = Context;

export const ViewerStateProvider = Provider;

export const ViewerStateConsumer = Consumer;

export const useViewerContext = useStateContext;

export const useViewerReactContext = useReactContext;
