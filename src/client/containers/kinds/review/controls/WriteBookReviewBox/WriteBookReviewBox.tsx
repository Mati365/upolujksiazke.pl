import React from 'react';
import c from 'classnames';

import {linkInputs, LinkProps} from '@client/decorators/linkInput';
import {useI18n} from '@client/i18n';

import {
  CreateBookReviewInput,
  prevalidateBookReview,
} from '@api/types/input/CreateBookReview.input';

import {
  Input, AsyncButton,
  InputLabel, TextButton, CheckboxGroup,
} from '@client/components/ui';

import {SendIcon, TimesIcon} from '@client/components/svg';
import {RatingsRow} from '@client/containers/controls';

type WriteBookReviewBoxProps = LinkProps<CreateBookReviewInput> & {
  nested?: boolean,
  onSubmit?(data: CreateBookReviewInput): void,
};

export const WriteBookReviewBox = linkInputs<CreateBookReviewInput>(
  {
    initialData: {},
  },
)(({nested, l, onSubmit}: WriteBookReviewBoxProps) => {
  const t = useI18n('book.review_box');
  const {value, input, setValue} = l;

  return (
    <div
      className={c(
        'c-write-book-review',
        nested && 'is-nested',
      )}
    >
      <div className='c-write-book-review__toolbar'>
        <InputLabel label={`${t('placeholder.your_nick')}:`}>
          <Input
            className='c-write-book-review__nick'
            placeholder={
              t('placeholder.your_nick')
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

      {value.quote && (
        <InputLabel
          label={`${t('placeholder.url')}:`}
          spaced='medium'
          expanded
        >
          <Input
            placeholder={
              t('placeholder.url')
            }
            required
          />
        </InputLabel>
      )}

      <div className='c-write-book-review__footer'>
        <CheckboxGroup {...input('quote')}>
          {t('mark_as_quote')}
        </CheckboxGroup>

        <AsyncButton
          className='c-write-book-review__send is-text-bold'
          type='primary'
          disabled={
            !prevalidateBookReview(value)
          }
          iconSuffix
          onClick={
            () => onSubmit?.(value)
          }
        >
          {t('send')}
          <SendIcon />
        </AsyncButton>
      </div>
    </div>
  );
});

WriteBookReviewBox.displayName = 'WriteBookReviewBox';
