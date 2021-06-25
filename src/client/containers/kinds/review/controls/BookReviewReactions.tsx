import React from 'react';

import {useI18n} from '@client/i18n';

import {VoteStatsRecord} from '@api/types';
import {CleanList, TextButton} from '@client/components/ui';
import {DislikeIcon, LikeIcon} from '@client/components/svg';

type BookReviewReactionsProps = {
  stats: VoteStatsRecord,
};

export const BookReviewReactions = ({stats}: BookReviewReactionsProps) => {
  const t = useI18n('shared.reactions');

  return (
    <CleanList
      className='c-review-reactions'
      spaced={4}
      separated
      inline
    >
      <li>
        <TextButton>
          <LikeIcon />
          {`${stats.upvotes || ''} ${t('like')}`.trim()}
        </TextButton>
      </li>

      <li>
        <TextButton>
          <DislikeIcon />
          {`${stats.downvotes || ''} ${t('dislike')}`.trim()}
        </TextButton>
      </li>
    </CleanList>
  );
};

BookReviewReactions.displayName = 'BookReviewReactions';
