import React, {forwardRef} from 'react';
import c from 'classnames';

import {
  ViewerSlider,
  ViewerSliderProps,
} from './ViewerSlider';

export type ViewerContentProps = ViewerSliderProps & {
  className?: string,
};

export const ViewerContent = forwardRef<HTMLDivElement, ViewerContentProps>(
  ({
    size,
    className,
  }, ref) => (
    <div
      ref={ref}
      className={c(
        'c-viewer-frame',
        className,
      )}
    >
      {size && (
        <ViewerSlider size={size} />
      )}
    </div>
  ),
);

ViewerContent.displayName = 'ViewerContent';
