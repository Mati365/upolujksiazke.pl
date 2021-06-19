import React, {useState, ReactNode} from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n';

import {ChevronDownIcon} from '../svg/Icons';
import {TextButton} from './TextButton';

type ExpandableFooterContainerProps = {
  initialToggled?: boolean,
  children(toggled: boolean): ReactNode,
  showFooter?: boolean,
};

export const ExpandableFooterContainer = (
  {
    children,
    initialToggled,
    showFooter = true,
  }: ExpandableFooterContainerProps,
) => {
  const t = useI18n();
  const [toggled, setToggled] = useState(initialToggled);

  return (
    <>
      {children(toggled)}
      {showFooter && (
        <div className='c-footer-expandable'>
          <TextButton
            role='button'
            onClick={
              () => setToggled(!toggled)
            }
          >
            {t(`shared.buttons.${toggled ? 'less' : 'more'}`)}
            <ChevronDownIcon
              className={c(
                'c-footer-expandable__chevron',
                toggled && 'is-toggled',
              )}
            />
          </TextButton>
        </div>
      )}
    </>
  );
};

ExpandableFooterContainer.displayName = 'ExpanExpandableFooterContainerdableTitledContainer';
