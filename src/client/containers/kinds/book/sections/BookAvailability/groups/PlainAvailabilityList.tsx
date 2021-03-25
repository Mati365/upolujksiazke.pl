import React from 'react';

import {
  BookWebsitesAvailabilityTable,
  TypedBookAvailabilityRecord,
} from '../BookWebsitesAvailabilityTable';

type PlainAvailabilityListProps = {
  availability: TypedBookAvailabilityRecord[],
};

export const PlainAvailabilityList = ({availability}: PlainAvailabilityListProps) => (
  <BookWebsitesAvailabilityTable
    withType
    availability={availability}
    tableProps={{
      layout: 'auto',
    }}
  />
);

PlainAvailabilityList.displayName = 'PlainAvailabilityList';
