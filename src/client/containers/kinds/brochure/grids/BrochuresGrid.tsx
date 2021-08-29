import React from 'react';
import c from 'classnames';

import {Grid, GridProps} from '@client/components/ui';
import {BrochureCardRecord} from '@api/types';

import {BrochureCard} from '../cards/BrochureCard';

type BrochuresGridProps = GridProps & {
  items: BrochureCardRecord[],
};

export const BrochuresGrid = ({items, className, ...props}: BrochuresGridProps) => (
  <Grid
    {...props}
    className={c(
      'c-brochures-grid',
      className,
    )}
  >
    {items.map(
      (item) => (
        <BrochureCard
          key={item.id}
          item={item}
        />
      ),
    )}
  </Grid>
);

BrochuresGrid.displayName = 'BrochuresGrid';
