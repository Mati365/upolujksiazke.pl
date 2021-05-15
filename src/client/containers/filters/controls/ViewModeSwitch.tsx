import React from 'react';
import c from 'classnames';

import {ViewMode} from '@shared/types';
import {
  SelectOptionTitlesRow,
  SelectOptionTitlesRowProps,
} from '@client/containers/controls';

import {
  GridIcon,
  ListIcon,
} from '@client/components/svg';

type ViewModeSwitchProps = Omit<SelectOptionTitlesRowProps, 'items'>;

export const ViewModeSwitch = ({className, ...props}: ViewModeSwitchProps) => (
  <SelectOptionTitlesRow
    separated={false}
    {...props}
    className={c(
      className,
      'c-view-mode-switch',
    )}
    items={[
      {
        id: ViewMode.GRID,
        name: <GridIcon className='c-view-mode-switch__grid' />,
      },
      {
        id: ViewMode.LIST,
        name: <ListIcon className='c-view-mode-switch__list' />,
      },
    ]}
  />
);

ViewModeSwitch.displayName = 'ViewModeSwitch';
