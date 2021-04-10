import React, {useMemo} from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';

import {BookFullInfoRecord, BookFullInfoReleaseRecord} from '@api/types';
import {
  Tree,
  ExpandableTitledContainer,
} from '@client/components/ui';

import {BookReleaseTypeBadge} from '../../../BookAvailability/BooReleaseTypeBadge';
import {BookReleaseInfo} from './BookReleaseInfo';

type BookReleasesListProps = {
  book: BookFullInfoRecord,
  size?: string,
  className?: string,
};

export const BookReleasesList = ({book, size, className}: BookReleasesListProps) => {
  const t = useI18n();
  const {releases, primaryRelease} = book;
  const sortedReleases = useMemo(
    () => [
      R.find<BookFullInfoReleaseRecord>(
        R.propEq('id', primaryRelease.id),
        releases || [],
      ),
      ...R.sortBy(
        (item) => item.availability?.length || 0,
        R.reject<BookFullInfoReleaseRecord>(
          R.propEq('id', primaryRelease.id),
          releases || [],
        ),
      ),
    ],
    [releases],
  );

  if (R.isEmpty(releases))
    return null;

  return (
    <Tree
      size={size}
      className={c(
        'c-releases-tree',
        className,
      )}
    >
      {sortedReleases.map(
        (release, index) => (
          <li
            key={release.id}
            className='c-releases-tree__item'
          >
            <ExpandableTitledContainer
              cssHide
              initialToggled={!index}
              tag='span'
              header={(
                <>
                  <BookReleaseTypeBadge
                    type={release.type}
                    className='mr-1'
                    titled={false}
                  />
                  {t('shared.book.isbn')}
                  <span className='ml-1'>
                    {release.isbn}
                  </span>
                </>
              )}
            >
              {() => (
                <BookReleaseInfo release={release} />
              )}
            </ExpandableTitledContainer>
          </li>
        ),
      )}
    </Tree>
  );
};

BookReleasesList.displayName = 'BookReleasesList';
