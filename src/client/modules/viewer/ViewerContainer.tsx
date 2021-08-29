import React, {useMemo} from 'react';

import {useElementSizeRef} from '@client/hooks';
import {createInitialViewerState, ViewerStateInitializer} from './context/utils';
import {getViewerFrameSizingMode, getViewerSlidesCountFromMode} from './helpers';

import {ViewerStateProvider} from './context/viewerContext';
import {
  ViewerContent,
  ViewerContentProps,
} from './containers/ViewerContent';

export type ViewerProps = Omit<ViewerContentProps, 'size'> & {
  initialState: ViewerStateInitializer,
};

export const Viewer = ({initialState, ...props}: ViewerProps) => {
  const {
    ref: contentRef,
    size: parentSize,
  } = useElementSizeRef<HTMLDivElement>(
    [],
  );

  const sizingMode = useMemo(
    () => getViewerFrameSizingMode(parentSize),
    [parentSize],
  );

  const computedState = useMemo(
    () => sizingMode && createInitialViewerState(
      {
        ...initialState,
        visiblePagesPerSlide: getViewerSlidesCountFromMode(sizingMode),
        sizingMode,
      },
    ),
    [sizingMode],
  );

  return (
    <ViewerStateProvider initialState={computedState}>
      <ViewerContent
        ref={contentRef}
        size={parentSize}
        {...props}
      />
    </ViewerStateProvider>
  );
};

Viewer.displayName = 'Viewer';
