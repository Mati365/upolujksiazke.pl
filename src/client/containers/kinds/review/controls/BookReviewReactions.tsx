import React, {useState} from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';
import {useAjaxAPIClient} from '@client/modules/api/client/hooks/useAjaxAPIClient';
import {
  useLocalStorageState,
  usePromiseCallback,
} from '@client/hooks';

import {UserReactionType} from '@shared/enums';
import {VoteStatsRecord} from '@api/types';
import {CleanList, TextButton} from '@client/components/ui';
import {DislikeIcon, LikeIcon} from '@client/components/svg';

type BookReviewReactionsProps = {
  reviewId: number,
  stats: VoteStatsRecord,
  showTitles?: boolean,
};

export const BookReviewReactions = (
  {
    reviewId,
    stats,
    showTitles = true,
  }: BookReviewReactionsProps,
) => {
  const t = useI18n('shared.reactions');
  const {repo} = useAjaxAPIClient();

  const [overrideState, setOverrideStats] = useState(stats);
  const [voteState, setVoteState] = useLocalStorageState<Record<string, UserReactionType>>(
    {
      initialState: {},
      expire: 3600 * 24 * 365, // one year
      name: 'voteState',
    },
  );

  const currentReviewValue = (voteState || {})[reviewId];

  const [onReact, {loading}] = usePromiseCallback(
    async (reaction: UserReactionType) => {
      setVoteState(
        {
          ...voteState,
          [reviewId]: reaction,
        },
      );

      try {
        const result = await repo.booksReviews.react(
          {
            id: reviewId,
            reaction,
          },
        );

        setOverrideStats(result.stats);
      } catch (e) {
        setVoteState(
          R.omit([reviewId.toString()], voteState),
        );
      }
    },
    {
      rethrow: false,
    },
  );

  const titles = {
    likes: `${overrideState.upvotes || ''} ${showTitles ? t('like') : ''}`.trim(),
    dislikes: `${overrideState.downvotes || ''} ${showTitles ? t('dislike') : ''}`.trim(),
  };

  return (
    <CleanList
      className={c(
        'c-review-reactions',
        loading && 'is-loading',
      )}
      spaced={4}
      separated
      inline
    >
      <li>
        <TextButton
          aria-label={
            t('like')
          }
          className={c(
            currentReviewValue === UserReactionType.LIKE && 'is-active',
          )}
          onClick={
            () => onReact(UserReactionType.LIKE)
          }
        >
          <LikeIcon />
          {titles.likes && (
            <span className='c-review-reactions__label'>
              {titles.likes}
            </span>
          )}
        </TextButton>
      </li>

      <li>
        <TextButton
          aria-label={
            t('dislike')
          }
          className={c(
            currentReviewValue === UserReactionType.DISLIKE && 'is-active',
          )}
          onClick={
            () => onReact(UserReactionType.DISLIKE)
          }
        >
          <DislikeIcon />
          {titles.dislikes && (
            <span className='c-review-reactions__label'>
              {titles.dislikes}
            </span>
          )}
        </TextButton>
      </li>
    </CleanList>
  );
};

BookReviewReactions.displayName = 'BookReviewReactions';
