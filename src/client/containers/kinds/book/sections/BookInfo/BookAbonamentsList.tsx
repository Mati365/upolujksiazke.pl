import React from 'react';

import {buildURL} from '@shared/helpers';

import {BookAvailabilityRecord} from '@api/types';
import {CleanList} from '@client/components/ui';
import {TitledFavicon} from '@client/components/ui/TitledFavicon';

type BookAbonamentsListProps = {
  availability: BookAvailabilityRecord[],
  className?: string,
};

export const BookAbonamentsList = ({availability, className}: BookAbonamentsListProps) => (
  <CleanList
    className={className}
    spaced={3}
    separated
  >
    {availability.map((item) => {
      const {website, url} = item;
      const {smallThumb} = website.logo;

      const onOpen = () => {
        window.open(
          buildURL(
            url,
            {
              utm_source: document.location.hostname,
              utm_medium: 'site',
              utm_campaign: 'abonament row',
            },
          ),
          '_blank',
        );
      };

      return (
        <li key={item.id}>
          <TitledFavicon
            className='is-text-tiny is-cursor-pointer is-undecorated-link has-hover-underline'
            title={item.website.hostname}
            src={smallThumb?.file}
            onClick={onOpen}
          />
        </li>
      );
    })}
  </CleanList>
);

BookAbonamentsList.displayName = 'BookAbonamentsList';
