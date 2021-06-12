import React from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n';

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

export const ViewModeSwitch = ({className, ...props}: ViewModeSwitchProps) => {
  const t = useI18n();

  return (
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
          title: t(`shared.view_modes.${ViewMode.GRID}`),
        },
        {
          id: ViewMode.LIST,
          name: <ListIcon className='c-view-mode-switch__list' />,
          title: t(`shared.view_modes.${ViewMode.LIST}`),
        },
      ]}
    />
  );
};

ViewModeSwitch.displayName = 'ViewModeSwitch';
