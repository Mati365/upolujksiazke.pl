import React, {ReactNode} from 'react';
import * as R from 'ramda';

import {CountedListItem} from '@shared/types';
import {CheckboxList, CheckboxListProps} from '@client/components/ui/controls/CheckboxList';

export const SmallFiltersCounter = ({count}: {count: ReactNode}) => (
  <small className='c-filters-small-counter'>
    (
    <span>
      {count}
    </span>
    )
  </small>
);

export const CountedCheckboxList = (props: CheckboxListProps<CountedListItem>) => (
  <CheckboxList
    {...props}
    renderNameFn={({name, count}: CountedListItem) => (
      <>
        {name}
        {!R.isNil(count) && (
          <SmallFiltersCounter count={count} />
        )}
      </>
    )}
  />
);

CountedCheckboxList.displayName = 'CountedCheckboxList';
