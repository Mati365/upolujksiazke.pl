import React from 'react';
import * as R from 'ramda';

import {CountedListItem} from '@shared/types';
import {CheckboxList, CheckboxListProps} from '@client/components/ui/controls/CheckboxList';

export const CountedCheckboxList = (props: CheckboxListProps<CountedListItem>) => (
  <CheckboxList
    {...props}
    renderNameFn={({name, count}: CountedListItem) => (
      <>
        {name}
        {!R.isNil(count) && (
          <small className='c-filters-small-counter'>
            {`(${count})`}
          </small>
        )}
      </>
    )}
  />
);

CountedCheckboxList.displayName = 'CountedCheckboxList';
