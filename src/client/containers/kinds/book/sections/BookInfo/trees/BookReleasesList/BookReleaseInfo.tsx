import React from 'react';
import * as R from 'ramda';

import {buildURL} from '@shared/helpers';
import {useI18n} from '@client/i18n';

import {BookFullInfoReleaseRecord} from '@api/types';
import {KeyValueTable, KeyValueTableProps} from '@client/components/ui';
import {PublisherLink} from '@client/routes/Links';
import {BookCtaButton} from '@client/containers/kinds/book/controls/BookCtaButton';

import {sortReleasesAvailability} from '../../../../helpers';

type BookReleaseInfoProps = {
  release: BookFullInfoReleaseRecord,
};

export const BookReleaseInfo = ({release}: BookReleaseInfoProps) => {
  const t = useI18n('shared.book');
  const attrs: KeyValueTableProps['items'] = [
    !R.isNil(release.totalPages) && [
      t('props.total_pages'),
      release.totalPages,
    ],

    !R.isNil(release.type) && [
      t('props.type'),
      t(`types.${release.type}`),
    ],

    !R.isNil(release.binding) && [
      t('props.binding'),
      t(`binding.${release.binding}`),
    ],

    release.format && [
      t('props.format'),
      release.format,
    ],

    release.lang && [
      t('props.lang'),
      release.lang,
    ],

    release.publishDate && [
      t('props.original_publish_date'),
      release.publishDate,
    ],

    release.recordingLength && [
      t('props.recording_length'),
      release.recordingLength,
    ],

    release.weight && [
      t('props.weight'),
      release.weight,
    ],

    release.edition && [
      t('props.edition'),
      release.edition,
    ],

    !R.isNil(release.protection) && [
      t('props.protection'),
      t(`protection.${release.protection}`),
    ],

    release.translator && [
      t('props.translator'),
      release.translator.join(', '),
    ],

    release.publisher && [
      t('props.publisher'),
      <PublisherLink
        item={release.publisher}
        className='is-primary-chevron-link'
      >
        {release.publisher.name}
      </PublisherLink>,
    ],
  ];

  const onOpen = () => {
    const [{availability}] = sortReleasesAvailability([release]);

    window.open(
      buildURL(
        availability[0].url,
        {
          utm_source: document.location.hostname,
          utm_medium: 'site',
          utm_campaign: 'primary button',
        },
      ),
      '_blank',
    );
  };

  return (
    <div className='c-book-release-info'>
      <KeyValueTable
        className='c-book-release-info__table'
        items={attrs}
      />

      {release.availability?.length > 0 && (
        <BookCtaButton
          className='mx-auto mt-2 mb-3'
          title={
            t('book.availability.go_to_shop')
          }
          size='small'
          outlined
          onClick={onOpen}
        />
      )}
    </div>
  );
};

BookReleaseInfo.displayName = 'BookReleaseInfo';
