import React from 'react';

import {useI18n} from '@client/i18n';

import {BookSummaryRecord} from '@api/types';
import {BookSummariesSection} from './BookSummariesSection';

type BookPostsSectionProps = {
  items: BookSummaryRecord[],
};

export const BookPostsSection = ({items}: BookPostsSectionProps) => {
  const t = useI18n('book.posts');

  return (
    <BookSummariesSection
      items={items}
      title={
        t('title')
      }
    />
  );
};

BookPostsSection.displayName = 'BookPostsSection';
