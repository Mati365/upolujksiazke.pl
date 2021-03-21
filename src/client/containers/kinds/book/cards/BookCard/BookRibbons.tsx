import React from 'react';
import {CleanList} from '@client/components/ui/CleanList';
import {
  BookRibbon,
  BookRibbonProps,
  RIBBON_COLORS,
} from './BookRibbon';

export type BookRibbonDescription = {
  color?: BookRibbonProps['color'],
  title: string,
};

type BookRibonsProps = {
  items: BookRibbonDescription[],
};

export const BookRibons = ({items}: BookRibonsProps) => {
  if (!items?.length)
    return null;

  const filteredItems = items.filter(Boolean);
  if (!filteredItems.length)
    return null;

  return (
    <CleanList
      className='c-book-ribbons'
      spaced={1}
    >
      {filteredItems.map((ribbon, index) => (
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
};

BookRibons.displayName = 'BookRibons';
