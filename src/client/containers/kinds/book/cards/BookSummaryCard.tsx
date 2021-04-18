import React from 'react';
import {BookSummaryRecord} from '@api/types';
import {RemoteArticleCard} from '../../article';

type BookSummaryCardProps = {
  item: BookSummaryRecord,
  showCover?: boolean,
};

export const BookSummaryCard = ({item, showCover}: BookSummaryCardProps) => (
  <RemoteArticleCard
    item={item.article}
    sublinks={item.headers}
    showCover={showCover}
  />
);

BookSummaryCard.displayName = 'BookSummaryCard';
