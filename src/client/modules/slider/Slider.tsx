/* eslint-disable @typescript-eslint/no-use-before-define, no-use-before-define */
import React, {
  useRef, useState, forwardRef,
  ReactNode, CSSProperties, ComponentType,
} from 'react';

import {isNil} from 'ramda';
import c from 'classnames';

import {suppressEvent} from '@client/helpers/html';
import {Vector} from '@shared/helpers/types/Vector';
import {Axis, DimensionAxis, Size} from '@shared/types';

import {fastClamp} from '@shared/helpers';
import {safeRefHandler} from '@client/helpers/react/safeRefHandler';

import {
  DraggableInterceptor,
  usePrevious,
  useDraggable,
  useIsomorphicLayoutEffect,
} from '@client/hooks';

import {useSlideSizesRef} from './hooks/useSlideSizesRef';

import {
  sumNthSlidesSize,
  decodeSlideFromTranslate,
  ResponsiveSlideInfo,
} from './helpers';

const AXIS_CONFIG: {
  dimensionProp: DimensionAxis,
  translationProp: Axis,
  lockProp: Axis,
} = {
  dimensionProp: 'w',
  translationProp: 'x',
  lockProp: 'y',
};

export type NavComponentProps = {
  last: boolean,
  right: boolean,
  disabled: boolean,
  className?: string,
  onClick(e?: MouseEvent): void
};

export type SliderRef = Pick<
/* eslint-disable @typescript-eslint/indent */
  ReturnType<typeof useDraggable>, 'getContainerTranslate' | 'setContainerTranslate' | 'getTotalDrag'
/* eslint-enable @typescript-eslint/indent */
> & {
  containerNode: HTMLElement,
  isDragGlobalMutexLock(): boolean,
  lockGlobalMutexValue(): void,
  unlockGlobalMutexValue(): void,
  setDragInterceptor(interceptor: DraggableInterceptor): void,
  getDragInterceptor(): DraggableInterceptor,
  setRelativeActive(relativeOffset: number, triggerTransition?: boolean): void,
  setActive(newActive: number, triggerTransition?: boolean, silent?: boolean): void,
  onClickLeft(): void,
  onClickRight(): void,
};

export type SliderProps = {
  children?: ReactNode,
  containerChildren?: ReactNode,

  measureSpinnerComponent?: ComponentType,
  navComponent?: ComponentType<NavComponentProps>,
  renderNav?(props: NavComponentProps): ReactNode,

  preloadSlidesCount?: number,
  collapseNotPreloaded?: boolean,

  translateMargin?: number,
  active?: number,
  controlled?: boolean,
  controlledChangeTransition?: boolean,
  provideSlideStateProps?: boolean,
  showNav?: boolean,
  navProps?: any,
  responsive?: ResponsiveSlideInfo[],

  slideTime?: number,
  spacing?: number,
  lock?: boolean,
  slideWidth?: number,
  slideDragDelta?: number,

  style?: CSSProperties,
  classNames?: {
    slide?: string,
    nav?: string,
    navDisabled?: string,
    container?: string,
    draggableContainer?: string,
  },

  onDragStart?(): void,
  onDragEnd?(): void,
  onNavTrigger?(relativeTriggerInfo: {relative: 1 | -1}): boolean;
  onActiveChange?(slideInfo: {newActive: number, prevActive: number}): void;
  onSlideTransitionEnd?(slideInfo: {newActive: number, prevActive: number}): void;
  onSlideStart?(slideInfo: {active: number, triggerTransition: boolean}): void;
};

export const Slider = forwardRef<SliderRef, SliderProps>((
  {
    children,
    slideTime = 200,
    translateMargin = 0,
    spacing,
    responsive,
    lock,
    slideWidth,
    style,
    controlled,
    controlledChangeTransition,
    slideDragDelta = 50,
    preloadSlidesCount = 2,
    collapseNotPreloaded = true,
    classNames = {},
    containerChildren,
    provideSlideStateProps = false,
    active: controlledActive,
    showNav = false,
    navProps,
    navComponent: Nav,
    renderNav,
    measureSpinnerComponent: MeasureSpinnerComponent,
    onDragStart,
    onDragEnd,
    onNavTrigger,
    onActiveChange,
    onSlideTransitionEnd,
    onSlideStart,
  },
  ref,
) => {
  const draggableContainerRef = useRef<HTMLElement>();
  const {
    truncatedContainerSize,
    slideSizes,
    summarySlidesSize,
    nonNullChildren,
  } = useSlideSizesRef(
    {
      responsive,
      slideWidth,
      children,
      containerRef: draggableContainerRef,
    },
  );

  const [state, setState] = useState(
    {
      active: controlledActive || 0,
      transition: null,
    },
  );

  const prevControlledActive = usePrevious(controlledActive);
  let controlledChanged = false;
  if (controlled && prevControlledActive !== controlledActive) {
    state.active = controlledActive;
    controlledChanged = true;
  }

  const stateRef = useRef<typeof state>();
  stateRef.current = state;

  /**
   * Stops transition
   */
  function clearTransition(): void {
    if (!isNil(state.transition))
      clearTimeout(state.transition);

    state.transition = null;
    if (draggableContainerRef.current)
      draggableContainerRef.current.style.transition = null;
  }

  const dragClamp = Vector.from(
    {
      [AXIS_CONFIG.translationProp]: [
        -summarySlidesSize[AXIS_CONFIG.dimensionProp]
          + (truncatedContainerSize?.[AXIS_CONFIG.dimensionProp] ?? 0),
        0,
      ],
      [AXIS_CONFIG.lockProp]: null,
    },
  );

  const {
    setInterceptor,
    getInterceptor,

    isDragGlobalMutexLock,
    lockGlobalMutexValue,
    unlockGlobalMutexValue,

    setContainerTranslate,
    getContainerTranslate,
    getTotalDrag,
    props: draggableProps,
  } = useDraggable(
    {
      clamp: dragClamp,
      lock,

      // rerenders with dragging anyway
      onDragStart: () => {
        clearTransition();
        onDragStart?.(); // eslint-disable-line no-unused-expressions
      },

      onDragEnd({direction, axisDistance}, totalDrag) {
        if (!axisDistance || axisDistance[AXIS_CONFIG.translationProp] < slideDragDelta)
          setActive(state.active, true);
        else {
          setActiveFromTranslate(
            -totalDrag[AXIS_CONFIG.translationProp],
            true,
            direction[AXIS_CONFIG.translationProp] < 0,
          );
        }

        onDragEnd?.(); // eslint-disable-line no-unused-expressions
      },
    },
  );

  /**
   * Gets current slide translate in pixels
   *
   * @param {number} slide
   * @returns {number}
   */
  function getSlideTranslate(slide: number): number {
    return fastClamp(
      dragClamp.x[0],
      dragClamp.x[1],
      -sumNthSlidesSize(
        AXIS_CONFIG.dimensionProp,
        slideSizes,
        slide,
      ) + translateMargin,
    );
  }

  /**
   * Set translate base on provided slide
   *
   * @param {number} activeSlide
   */
  function setTranslateBySlide(activeSlide: number): void {
    if (!slideSizes)
      return;

    setContainerTranslate(
      getSlideTranslate(activeSlide),
      AXIS_CONFIG.translationProp,
    );
  }

  /**
   * Sets active slide index and changes translation
   *
   * @see
   *  Active is NULL during transition!
   *  It must be null in controlled mode after transition!
   *
   * @param {Number} newActive
   * @param {Boolean} triggerTransition
   * @param {Boolean} silent
   */
  function setActive(newActive: number, triggerTransition?: boolean, silent?: boolean): void {
    // check if user dragged more than 0 px, if no - abort
    const newTranslate = getSlideTranslate(newActive);
    const prevActive = state.active;

    if (!silent
        && state.active === newActive
        && getContainerTranslate()[AXIS_CONFIG.translationProp] === newTranslate)
      return;

    // transition triggering is optional for silent mode
    let newTransition = null;
    if (draggableContainerRef.current && triggerTransition && !silent) {
      clearTransition();

      draggableContainerRef.current.style.transition = `transform ${slideTime}ms ease-in-out`;
      newTransition = setTimeout(
        () => {
          // setting active and transition to null in controlled mode
          // allow to ALWAYS change active page from controlledActive
          draggableContainerRef.current.style.transition = null;

          // DO NOT REORDER!
          // onSlideTransitionEnd() must be called always before setState(transition: null)
          // otherwise it will glitch controlled set slide index effect
          if (newActive !== prevActive) {
            // eslint-disable-next-line no-unused-expressions
            onSlideTransitionEnd?.(
              {
                newActive,
                prevActive,
              },
            );
          }

          const stateObj = stateRef.current;
          const newState = {
            ...stateObj,
            transition: null,
          };

          if (!controlled)
            setState(newState);
          else {
            Object.assign(stateObj, newState);
            setState({...newState});
          }
        },

        // append some milliseconds for smooth controlled transition
        slideTime + 100,
      );
    }

    // update with silent should not trigger transition
    function updateContainerStyle() {
      setContainerTranslate(newTranslate, AXIS_CONFIG.translationProp);
    }

    if (newTransition !== null)
      setTimeout(updateContainerStyle, 60);
    else
      updateContainerStyle();

    // force lock listen to state changes,
    // do not fetch value from controlledActive
    // even if onSlideStart triggers state update
    // see: acitve: null during transition!!!
    Object.assign(
      state,
      {
        transition: newTransition,
        active: newActive,
      },
    );

    if (!silent) {
      // eslint-disable-next-line no-unused-expressions
      onSlideStart?.(
        {
          active: newActive,
          triggerTransition,
        },
      );

      if (!controlled && triggerTransition) {
        setState(
          {
            ...state,
          },
        );
      }
    }

    // eslint-disable-next-line no-unused-expressions
    onActiveChange?.(
      {
        newActive,
        prevActive,
      },
    );
  }

  /**
   * Decodes slide index from translate
   *
   * @param {number} translate
   * @param {boolean} [triggerTransition]
   * @param {boolean} [direction]
   */
  function setActiveFromTranslate(translate: number, triggerTransition?: boolean, direction?: boolean): void {
    const index = decodeSlideFromTranslate(
      AXIS_CONFIG.dimensionProp,
      slideSizes,
      translate,
    );

    const newActive = fastClamp(0, slideSizes.length - 1, index + +!direction);
    setActive(newActive, triggerTransition);
  }

  /**
   * Sets slide relative to current
   *
   * @param {number} relativeOffset
   * @param {boolean} [triggerTransition=true]
   */
  function setRelativeActive(relativeOffset: number, triggerTransition: boolean = true): void {
    setActive(
      fastClamp(0, slideSizes.length, state.active + relativeOffset),
      triggerTransition,
    );
  }

  useIsomorphicLayoutEffect(
    () => {
      if (!slideSizes)
        return;

      setTranslateBySlide(state.active);
    },
    [slideSizes],
  );

  useIsomorphicLayoutEffect(
    () => clearTransition,
    [],
  );

  const currentLastPage = state.active >= slideSizes?.length - 1;
  const navDisabledRef = useRef<{left: boolean, right: boolean}>();
  navDisabledRef.current = {
    left: !slideSizes || !state.active,
    right: !slideSizes || currentLastPage,
  };

  const relativeArrowsHandlers = {
    onClickLeft(e?: MouseEvent): void {
      if (!isNil(state.transition))
        return;

      if (!navDisabledRef.current.left && onNavTrigger?.({relative: -1}) !== false)
        setRelativeActive(-1);

      suppressEvent(e);
    },

    onClickRight(e?: MouseEvent): void {
      if (!isNil(state.transition))
        return;

      if (!navDisabledRef.current.right && onNavTrigger?.({relative: 1}) !== false)
        setRelativeActive(1);

      suppressEvent(e);
    },
  };

  // watch size - if changed, recalc translate
  const prevSlideWidth = usePrevious<number>(slideWidth);
  if (prevSlideWidth !== null && slideWidth !== prevSlideWidth)
    setTranslateBySlide(state.active);

  // controlled props watcher
  if (!state.transition && controlledChanged) {
    if (
      controlledChangeTransition
        && slideSizes
        && draggableContainerRef.current
        && Math.abs(prevControlledActive - controlledActive) === 1
    ) {
      setTimeout(
        () => {
          setActive(state.active, true, false);
        },
        0,
      );
    } else
      setTranslateBySlide(state.active);
  }

  const dimensionStyleAttr = AXIS_CONFIG.dimensionProp === 'w' ? 'width' : 'height';
  const currentActiveAxisDrag: number = -getTotalDrag()[AXIS_CONFIG.translationProp];
  let currentSlideAxisOffset: number = 0;

  const navComponentsProps: {
    left: NavComponentProps,
    right: NavComponentProps,
  } = {
    left: slideSizes && showNav && {
      last: currentLastPage,
      right: false,
      disabled: navDisabledRef.current.left,
      className: (
        navDisabledRef.current.left
          ? classNames.navDisabled
          : classNames.nav
      ),
      ...navProps,
      onClick: relativeArrowsHandlers.onClickLeft,
    },

    right: slideSizes && showNav && {
      last: currentLastPage,
      right: true,
      disabled: navDisabledRef.current.right,
      className: (
        navDisabledRef.current.right
          ? classNames.navDisabled
          : classNames.nav
      ),
      ...navProps,
      onClick: relativeArrowsHandlers.onClickRight,
    },
  };

  const shrinkable = (
    summarySlidesSize
      && truncatedContainerSize
      && summarySlidesSize[AXIS_CONFIG.dimensionProp] < truncatedContainerSize[AXIS_CONFIG.dimensionProp]
  );

  return (
    <div
      ref={(node) => {
        safeRefHandler(
          ref,
          {
            containerNode: node,
            setDragInterceptor: setInterceptor,
            getDragInterceptor: getInterceptor,

            setContainerTranslate,
            getContainerTranslate,
            getTotalDrag,

            setRelativeActive,
            setActive,
            isDragGlobalMutexLock,
            lockGlobalMutexValue,
            unlockGlobalMutexValue,
            ...relativeArrowsHandlers,
          },
        );
      }}
      className={c(
        'c-viewer-slider',
        slideSizes && 'c-viewer-slider--measured',
        shrinkable && 'c-viewer-slider--shrinkable',
        classNames.container,
      )}
      style={style}
      onDragStart={suppressEvent}
    >
      {navComponentsProps.left && (
        Nav
          ? <Nav {...navComponentsProps.left} />
          : renderNav(navComponentsProps.left)
      )}
      <div
        {...draggableProps}
        ref={(draggableRef) => {
          draggableProps.ref.current = draggableRef;
          draggableContainerRef.current = draggableRef;
        }}
        className={c(
          'c-viewer-slider__draggable-container',
          classNames.draggableContainer,
        )}
      >
        {React.Children.map(
          nonNullChildren,
          (
            child: React.DetailedReactHTMLElement<any, HTMLElement>,
            index: number,
          ) => {
            const slideSize: Size = (
              slideSizes
                && index < slideSizes.length
                && slideSizes[index]
            ) || null;

            // CSS
            const slideStyle: CSSProperties = {};
            const currentSlideActive = state.active === index;
            let preload = false;

            if (slideSize) {
              const size = slideSize[AXIS_CONFIG.dimensionProp];

              slideStyle[dimensionStyleAttr] = size;
              currentSlideAxisOffset += size;

              // it works only on single viewport slides for now
              if (currentSlideAxisOffset >= currentActiveAxisDrag - ((Math.max(0, preloadSlidesCount - 1)) * size)
                  && currentSlideAxisOffset <= currentActiveAxisDrag + (preloadSlidesCount + 1) * size)
                preload = true;
            }

            if (spacing)
              slideStyle.padding = `${spacing}px`;

            // Content
            const renderContent = !collapseNotPreloaded || preload;
            const content = renderContent && (
              provideSlideStateProps
                ? React.cloneElement(
                  child,
                  {
                    dimensions: slideSize,
                    visible: currentSlideActive || preload,
                    active: currentSlideActive && state.transition === null,
                    preload,
                  },
                )
                : child
            );

            return (
              <div
                key={child.key || index}
                className={c(
                  'c-viewer-slider__slide',
                  !renderContent && 'collapsed',
                  currentSlideActive
                    ? 'active'
                    : (preload && 'preload'),

                  classNames.slide,
                )}
                style={slideStyle}
              >
                {content}
              </div>
            );
          },
        )}
      </div>
      {containerChildren}
      {!slideSizes && MeasureSpinnerComponent && (
        <div className='cv-viewer-slider__spinner'>
          <MeasureSpinnerComponent />
        </div>
      )}
      {navComponentsProps.right && (
        Nav
          ? <Nav {...navComponentsProps.right} />
          : renderNav(navComponentsProps.right)
      )}
    </div>
  );
});

Slider.displayName = 'Slider';
