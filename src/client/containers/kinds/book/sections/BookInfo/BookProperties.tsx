import React, {memo, useMemo} from 'react';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';
import {pickFirstBookRelease} from '@client/containers/kinds/book/helpers';

import {BookFullInfoRecord} from '@api/types';
import {
  IconPropertiesList,
  IconPropertyInfo,
} from '@client/components/ui';

import {PublisherLink} from '@client/routes/Links';
import {StarIcon} from '@client/components/svg';
import {
  BookOpenIcon,
  TimeIcon,
  TrophyIcon,
  BuildingsIcon,
  BookReaderIcon,
  StoreIcon,
  CalendarIcon,
} from '@client/components/svg/Icons';

type BookPropertiesProps = {
  book: BookFullInfoRecord,
};

export const BookProperties = memo(({book}: BookPropertiesProps) => {
  const {
    primaryRelease, prizes,
    avgRating, totalRatings,
  } = book;

  const firstRelease = useMemo(
    () => pickFirstBookRelease(book),
    [book.id],
  );

  const publisher = firstRelease?.publisher || primaryRelease.publisher;

  const t = useI18n('shared.book.props');
  const items = useMemo<IconPropertyInfo[]>(
    () => [
      {
        name: t('total_pages'),
        icon: BookOpenIcon,
        value: primaryRelease.totalPages,
      },
      {
        name: t('publisher'),
        icon: BuildingsIcon,
        autoWidth: true,
        value: publisher && (
          <PublisherLink
            item={publisher}
            className='is-undecorated-link'
            withChevron
          >
            {publisher.name}
          </PublisherLink>
        ),
      },
      {
        name: t('prizes'),
        icon: TrophyIcon,
        value: prizes?.length || null,
      },
      {
        name: t('recording_length'),
        icon: TimeIcon,
        value: primaryRelease.recordingLength && Math.ceil(primaryRelease.recordingLength / 60),
      },
      {
        name: t('original_publish_date'),
        icon: CalendarIcon,
        value: book.originalPublishYear?.toString(),
        autoWidth: true,
      },
      {
        name: t('rating'),
        icon: StarIcon,
        value: avgRating?.toFixed(2),
      },
      {
        name: t('ratings'),
        icon: BookReaderIcon,
        value: totalRatings,
      },
      {
        name: t('availability'),
        icon: StoreIcon,
        value: R.reduce(
          (acc, item) => acc + (item.availability?.length || 0),
          0,
          book.releases,
        ),
      },
    ],
    [book.id],
  );

  return (
    <IconPropertiesList items={items} />
  );
});

BookProperties.displayName = 'BookProperties';
