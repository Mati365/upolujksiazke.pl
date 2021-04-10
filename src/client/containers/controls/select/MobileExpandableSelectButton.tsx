import React, {ReactNode} from 'react';
import c from 'classnames';

import {useToggleableModal} from '@client/hooks';
import {useI18n} from '@client/i18n';
import {useUA} from '@client/modules/ua';

import {linkInputs, LinkProps} from '@client/decorators/linkInput';

import {IconListItem, ListItem} from '@shared/types';
import {MobileOptionsList} from '@client/components/ui/mobile';
import {ChevronDownIcon} from '@client/components/svg';

type MobileExpandableSelectButtonProps = LinkProps<ListItem> & {
  title?: string,
  items: IconListItem[],
  className?: string,
  renderSelectedValueFn?(value: IconListItem): ReactNode,
};

export const MobileExpandableSelectButton = linkInputs<ListItem>()((
  {
    title,
    items,
    className,
    value,
    l,
    renderSelectedValueFn,
  }: MobileExpandableSelectButtonProps,
) => {
  const ua = useUA();
  const t = useI18n();
  const modal = useToggleableModal(
    {
      header: title,
      renderFn: () => (
        <MobileOptionsList
          items={items}
          selected={value?.id}
          onSelect={
            (id, item) => {
              l.setValue(item);
              modal.close();
            }
          }
        />
      ),
    },
  );

  return (
    <button
      type='button'
      className={c(
        'c-select-btn',
        ua.mobile && 'is-small',
        modal.toggled && 'is-toggled',
        className,
      )}
      onClick={modal.toggle}
    >
      {(
        value && renderSelectedValueFn
          ? renderSelectedValueFn(value)
          : (title || t('shared.titles.click_to_choose'))
      )}
      <ChevronDownIcon className='c-select-btn__chevron' />
    </button>
  );
});

MobileExpandableSelectButton.displayName = 'MobileExpandableSelectButton';
