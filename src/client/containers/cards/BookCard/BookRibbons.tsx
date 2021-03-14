import React from 'react';
import {CleanList} from '@client/components/ui/CleanList';
import {
  BookRibbon,
  BookRibbonProps,
  RIBBON_COLORS,
} from './BookRibbon';

type BookRibonsProps = {
  items: {
    color?: BookRibbonProps['color'],
    title: string,
  }[],
};

export const BookRibons = ({items}: BookRibonsProps) => (
  <CleanList
    className='c-book-ribbons'
    spaced={1}
  >
    {items.map((ribbon, index) => (
      <BookRibbon
        key={ribbon.title}
        color={
          ribbon.color || RIBBON_COLORS[index % RIBBON_COLORS.length]
        }
        component='li'
      >
        {ribbon.title}
      </BookRibbon>
    ))}
  </CleanList>
);

BookRibons.displayName = 'BookRibons';
