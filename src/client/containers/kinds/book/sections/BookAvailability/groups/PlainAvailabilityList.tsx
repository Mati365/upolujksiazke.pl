import React from 'react';

import {
  BookWebsitesAvailabilityTable,
  TypedBookAvailabilityRecord,
} from '../BookWebsitesAvailabilityTable';

type PlainAvailabilityListProps = {
  availability: TypedBookAvailabilityRecord[],
  shrink?: boolean,
};

export const PlainAvailabilityList = ({availability, shrink}: PlainAvailabilityListProps) => (
  <BookWebsitesAvailabilityTable
    withType
    shrink={shrink}
    availability={availability}
    tableProps={{
      layout: 'auto',
    }}
  />
);

PlainAvailabilityList.displayName = 'PlainAvailabilityList';
