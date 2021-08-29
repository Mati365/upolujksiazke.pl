import React from 'react';

import {useI18n} from '@client/i18n';
import {Button} from '@client/components/ui';

type SectionMoreProps = {
  tag: any,
  item?: any,
};

export const SectionMore = ({tag, item}: SectionMoreProps) => {
  const t = useI18n();

  return (
    <div className='c-flex-center mt-6'>
      <Button
        className='is-text-semibold is-text-small has-double-link-chevron'
        type='primary'
        tag={tag}
        item={item}
        outlined
      >
        {t('shared.buttons.more')}
      </Button>
    </div>
  );
};

SectionMore.displayName = 'SectionMore';
