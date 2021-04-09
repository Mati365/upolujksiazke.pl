import React, {ReactNode} from 'react';
import * as R from 'ramda';

import {Table} from './Table';

export type KeyValueTableProps = {
  className?: string,
  items: [
    key: string,
    value: ReactNode | string,
  ][],
};

export const KeyValueTable = ({items, className}: KeyValueTableProps) => (
  <Table className={className}>
    <tbody>
      {items.filter(Boolean).map(
        ([key, value]) => (
          <tr key={key as string}>
            <th>
              {key}
            </th>

            <td
              className='has-ellipsis'
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

KeyValueTable.displayName = 'KeyValueTable';
