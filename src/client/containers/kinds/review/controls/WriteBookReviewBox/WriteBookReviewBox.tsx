import React from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';
import {linkInputs, LinkProps} from '@client/decorators/linkInput';

import {
  CreateBookReviewExternalRef,
  CreateBookReviewInput,
  prevalidateBookReview,
} from '@api/types/input/CreateBookReview.input';

import {
  Input, Button, InputLabel,
  TextButton, CleanList,
} from '@client/components/ui';

import {SendIcon, TimesIcon} from '@client/components/svg';
import {RatingsRow} from '@client/containers/controls';

type WriteBookReviewBoxProps = LinkProps<CreateBookReviewInput> & {
  nested?: boolean,
};

export const WriteBookReviewBox = linkInputs<CreateBookReviewInput>(
  {
    initialData: {
      rating: null,
      description: '',
      externalRefs: [],
    },
  },
)(({nested, l}: WriteBookReviewBoxProps) => {
  const t = useI18n('book.review_box');
  const {value, input, setValue} = l;

  const onAppendExternalRef = () => {
    setValue(
      {
        externalRefs: [
          ...value.externalRefs,
          {
            __id: Date.now(),
          },
        ],
      },
      {
        merge: true,
      },
    );
  };

  const onRemoveExternalRef = (ref: CreateBookReviewExternalRef) => {
    setValue(
      {
        externalRefs: R.without([ref], value.externalRefs),
      },
      {
        merge: true,
      },
    );
  };

  return (
    <div
      className={c(
        'c-write-book-review',
        nested && 'is-nested',
      )}
    >
      <div className='c-write-book-review__toolbar'>
        <InputLabel label={`${t('placeholder.nick')}:`}>
          <Input
            className='c-write-book-review__nick'
            placeholder={
              t('placeholder.nick')
            }
          />
        </InputLabel>

        <InputLabel
          label={`${t('placeholder.rating')}:`}
          controlClassName='c-flex-row'
        >
          <RatingsRow
            value={value.rating}
            totalStars={10}
            size='big'
            hoverable
            onClickStar={
              (rating) => setValue(
                {
                  rating,
                },
                {
                  merge: true,
                },
              )
            }
          />

          <TextButton
            className='ml-1'
            aria-label={
              t('shared.titles.clear')
            }
            disabled={
              !value.rating
            }
            onClick={
              () => setValue(
                {
                  rating: null,
                },
                {
                  merge: true,
                },
              )
            }
          >
            <TimesIcon />
          </TextButton>
        </InputLabel>
      </div>

      <Input
        className='c-write-book-review__description'
        placeholder={
          t('placeholder.description')
        }
        tag='textarea'
        rows={4}
        {...input('description')}
      />

      {!nested && value.externalRefs?.length > 0 && (
        <div className='c-write-book-review__nested-list'>
          <div className='is-text-semibold mb-3'>
            {`${t('shared.titles.quotes')}:`}
          </div>

          <CleanList
            inline={false}
            spaced={5}
          >
            {value.externalRefs.map((ref) => (
              <li key={ref.__id}>
                <TextButton
                  className='mb-1 is-text-semibold'
                  type='primary'
                  size='small'
                  onClick={
                    () => onRemoveExternalRef(ref)
                  }
                >
                  {t('shared.titles.delete')}
                </TextButton>

                <WriteBookReviewBox nested />
              </li>
            ))}
          </CleanList>
        </div>
      )}

      {!nested && (
        <div className='c-write-book-review__footer'>
          <TextButton
            type='muted'
            size='small'
            onClick={onAppendExternalRef}
          >
            {`+ ${t('add_quote')}`}
          </TextButton>

          <Button
            className='c-write-book-review__send is-text-bold'
            type='primary'
            disabled={
              !prevalidateBookReview(value)
            }
            iconSuffix
          >
            {t('send')}
            <SendIcon />
          </Button>
        </div>
      )}
    </div>
  );
});

WriteBookReviewBox.displayName = 'WriteBookReviewBox';
