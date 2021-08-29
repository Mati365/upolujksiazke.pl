import React, {useState, ReactNode} from 'react';
import c from 'classnames';

import {ChevronDownIcon} from '../svg/Icons';
import {TextButton} from './TextButton';

type ExpandableTitledContainerProps = {
  cssHide?: boolean,
  className?: string,
  tag?: any,
  initialToggled?: boolean,
  header: ReactNode,
  children(): ReactNode,
};

export const ExpandableTitledContainer = (
  {
    tag: Tag = 'div',
    initialToggled,
    cssHide,
    className,
    header,
    children,
  }: ExpandableTitledContainerProps,
) => {
  const [toggled, setToggled] = useState(initialToggled);

  return (
    <Tag
      className={c(
        'c-expandable',
        toggled && 'is-toggled',
        className,
      )}
    >
      <TextButton
        className='c-expandable__header'
        role='button'
        onClick={
          () => setToggled(!toggled)
        }
      >
        {header}
        <ChevronDownIcon className='c-expandable__chevron' />
      </TextButton>

      {(cssHide || toggled) && (
        <div
          className={c(
            'c-expandable__content',
            cssHide && !toggled && 'is-hidden',
          )}
        >
          {children()}
        </div>
      )}
    </Tag>
  );
};

ExpandableTitledContainer.displayName = 'ExpandableTitledContainer';
