import React from 'react';

import {useI18n} from '@client/i18n';

import {BookFullInfoRecord} from '@api/types';
import {Section, Tabs} from '@client/components/ui';
import {BookPricesList} from './BookPricesList';

type BookAvailabilitySectionProps = {
  book: BookFullInfoRecord,
};

export const BookAvailabilitySection = ({book}: BookAvailabilitySectionProps) => {
  const t = useI18n('book.availability');

  return (
    <Section
      spaced={3}
      title={
        t('title')
      }
      subsection
      noContentSpacing
    >
      <Tabs
        align='right'
        initialTab='group-by-release'
        textOnly
      >
        <Tabs.Tab
          id='all'
          title={
            t('groups.all')
          }
        >
          {() => 'all'}
        </Tabs.Tab>

        <Tabs.Tab
          id='ebooks'
          title={
            t('groups.ebooks')
          }
        >
          {() => 'EBOOKS'}
        </Tabs.Tab>

        <Tabs.Tab
          id='paper'
          title={
            t('groups.paper')
          }
        >
          {() => 'KSIĄŻKI'}
        </Tabs.Tab>

        <Tabs.Tab
          id='audiobooks'
          title={
            t('groups.audiobooks')
          }
        >
          {() => 'audiobooks'}
        </Tabs.Tab>

        <Tabs.Tab
          id='group-by-release'
          title={
            t('groups.by_release')
          }
        >
          {() => <BookPricesList book={book} />}
        </Tabs.Tab>
      </Tabs>
    </Section>
  );
};

BookAvailabilitySection.displayName = 'BookAvailabilitySection';
