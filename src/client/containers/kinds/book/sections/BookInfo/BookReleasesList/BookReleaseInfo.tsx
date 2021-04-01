import React from 'react';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';

import {BookFullInfoReleaseRecord} from '@api/types';
import {Table} from '@client/components/ui';
import {PublisherLink} from '@client/routes/Links';

type BookReleaseInfoProps = {
  release: BookFullInfoReleaseRecord,
};

export const BookReleaseInfo = ({release}: BookReleaseInfoProps) => {
  const t = useI18n('shared.book');
  const attrs = [
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
        className='c-promo-tag-link'
      >
        {release.publisher.name}
      </PublisherLink>,
    ],
  ].filter(Boolean);

  return (
    <Table className='c-book-release-info'>
      <tbody>
        {attrs.map(
          ([key, value]) => (
            <tr key={key as string}>
              <th
                style={{
                  width: 90,
                }}
              >
                {key}
              </th>

              <td
                className='has-ellipsis'
                style={{
                  width: 120,
                }}
                {...R.is(String, value) && {
                  title: value as string,
                }}
              >
                <div>
                  {value}
                </div>
              </td>
            </tr>
          ),
        )}
      </tbody>
    </Table>
  );
};

BookReleaseInfo.displayName = 'BookReleaseInfo';
