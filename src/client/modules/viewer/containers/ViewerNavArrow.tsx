import React, {memo} from 'react';
import c from 'classnames';
import {last} from 'ramda';

import {TextButton} from '@client/components/ui';
import {NavComponentProps} from '@client/modules/slider';
import {
  ChevronRightIcon,
  ChevronsRightIcon,
} from '@client/components/svg';

import {getFirstNonNullPage} from '../helpers';
import {useViewerContext} from '../context/viewerContext';

type ViewerSingleNavArrowProps = NavComponentProps & {
  redirectToLast?: boolean,
  notTriggerAction?: boolean,
};

export const ViewerSingleNavArrow = (
  {
    right, disabled, redirectToLast,
    last: lastSlide,
    notTriggerAction, onClick,
  }: ViewerSingleNavArrowProps,
) => {
  const contextResult = useViewerContext(
    ({state, selectors, actions}) => {
      const slides = selectors.getSlides();
      const currentPageIndex = getFirstNonNullPage(slides[state.active])?.index;
      const lastImagePage = getFirstNonNullPage(
        last(selectors.getThumbnails()),
      );

      let changeToFirst: VoidFunction = null;
      if (currentPageIndex > 0)
        changeToFirst = () => actions.changeSlideByPageIndex(0);

      let changeToLast: VoidFunction = null;
      if (currentPageIndex !== lastImagePage?.index) {
        changeToLast = () => {
          actions.changeSlideByPageIndex(lastImagePage.index);
        };
      }

      return {
        changeToFirst,
        changeToLast,
      };
    },
  );

  const {
    changeToLast,
    changeToFirst,
  } = contextResult;

  if (redirectToLast && ((!changeToFirst && !right) || (right && !changeToLast)))
    disabled = true;

  const className = c(
    'c-viewer-slider__nav',
    `c-viewer-slider__nav--${right ? 'right' : 'left'}`,
    redirectToLast && 'c-viewer-slider__nav--bottom',
    disabled && 'c-viewer-slider__nav--disabled',
  );

  const handleSuppressedClick: React.MouseEventHandler = () => {
    if (!notTriggerAction && redirectToLast) {
      if (right)
        changeToLast();
      else
        changeToFirst();
    } else
      onClick();
  };

  const icon = (
    redirectToLast
      ? <ChevronsRightIcon />
      : <ChevronRightIcon />
  );

  return (
    <TextButton
      className={className}
      onClick={(
        right && lastSlide
          ? null
          : handleSuppressedClick
      )}
    >
      {icon}
    </TextButton>
  );
};

ViewerSingleNavArrow.displayName = 'ViewerSingleNavArrow';

export const ViewerDoubledNavArrow = memo((navProps: ViewerSingleNavArrowProps) => (
  <>
    <ViewerSingleNavArrow {...navProps} />
    <ViewerSingleNavArrow
      {...navProps}
      redirectToLast
    />
  </>
));
