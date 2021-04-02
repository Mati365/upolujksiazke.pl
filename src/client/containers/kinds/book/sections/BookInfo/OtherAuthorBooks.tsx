import React from 'react';

import {useI18n} from '@client/i18n';
import {SidebarSection} from '@client/components/ui';

export const OtherAuthorBooks = () => {
  const t = useI18n();

  return (
    <SidebarSection
      className='c-book-info-section__releases'
      title={
        `${t('author.other_books')}:`
      }
    >
      ABC
    </SidebarSection>
  );
};

OtherAuthorBooks.displayName = 'OtherAuthorBooks';
