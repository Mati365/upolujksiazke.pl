import React from 'react';
import {BookSummaryRecord} from '@api/types';
import {RemoteArticleCard} from '../../article';

type BookSummaryCardProps = {
  item: BookSummaryRecord,
};

export const BookSummaryCard = ({item}: BookSummaryCardProps) => (
  <RemoteArticleCard
    item={item.article}
    sublinks={item.headers}
  />
);

BookSummaryCard.displayName = 'BookSummaryCard';
