import React, {useMemo} from 'react';

import {useI18n} from '@client/i18n';

import {BookFullInfoRecord} from '@api/types';
import {
  IconPropertiesList,
  IconPropertyInfo,
} from '@client/components/ui';

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

export const BookProperties = ({book}: BookPropertiesProps) => {
  const {
    primaryRelease, prizes,
    avgRating, totalRatings,
  } = book;

  const publishDate = book.originalPublishDate || primaryRelease.publishDate;

  console.info(book);

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
        value: primaryRelease.publisher?.name,
      },
      {
        name: t('prizes'),
        icon: TrophyIcon,
        value: prizes.length || null,
      },
      {
        name: t('recording_length'),
        icon: TimeIcon,
        value: primaryRelease.recordingLength && Math.ceil(primaryRelease.recordingLength / 60),
      },
      {
        name: t('original_publish_date'),
        icon: CalendarIcon,
        value: publishDate && new Date(publishDate).getFullYear(),
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
        value: 1111,
      },
    ],
    [book.id],
  );

  return (
    <IconPropertiesList items={items} />
  );
};

BookProperties.displayName = 'BookProperties';
