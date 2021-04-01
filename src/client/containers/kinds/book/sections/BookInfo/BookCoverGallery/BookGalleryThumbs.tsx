/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, {useState} from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n';

import {DotsHorizontalRoundedIcon} from '@client/components/svg/Icons';
import {
  Picture,
  CleanList,
  TextButton,
} from '@client/components/ui';

export type BookGalleryThumb = {
  src: string,
  expandSrc?: string,
  alt?: string,
  title?: string,
};

type BookGalleryThumbsProps = {
  active?: string,
  showPerPage?: number,
  minRemainCount?: number,
  items: BookGalleryThumb[],
  onClick?(item: BookGalleryThumb): void,
};

export const BookGalleryThumbs = (
  {
    active,
    items,
    showPerPage = 3,
    minRemainCount = 1,
    onClick,
  }: BookGalleryThumbsProps,
) => {
  const t = useI18n();
  const [{offset, show}, setExpand] = useState(
    {
      offset: 0,
      show: showPerPage,
    },
  );

  const remain = items.length - offset - show;
  const onMore = () => {
    setExpand(
      {
        offset: Math.min(offset + showPerPage, items.length - show),
        show: showPerPage,
      },
    );
  };

  const onLess = () => {
    setExpand(
      {
        offset: Math.max(offset - showPerPage, 0),
        show: showPerPage,
      },
    );
  };

  return (
    <CleanList
      className='c-book-gallery__thumbs'
      justify='center'
    >
      {offset > 0 && (
        <li className='c-book-gallery__less'>
          <TextButton
            type='primary'
            direction='vertical'
            onClick={onLess}
          >
            {`${t('shared.titles.less')} (${offset - 1})`}
            <DotsHorizontalRoundedIcon />
          </TextButton>
        </li>
      )}
      {items.map(
        (item, index) => {
          const {src, expandSrc, alt, title} = item;
          if (!src)
            return null;

          return (
            <li
              key={src}
              className={c(
                'c-book-gallery__thumb',
                active === expandSrc && 'is-active',
                (index < offset || index >= offset + show)
                  && (!offset || index < items.length - minRemainCount - show)
                  && 'is-hidden',
              )}
              onClick={
                () => onClick?.(item)
              }
            >
              <Picture
                className='c-book-gallery__thumb-image'
                src={src}
                alt={alt}
                title={title}
              />
            </li>
          );
        },
      )}

      {remain > minRemainCount && (
        <li className='c-book-gallery__more'>
          <TextButton
            type='primary'
            direction='vertical'
            onClick={onMore}
          >
            <DotsHorizontalRoundedIcon />
            {`${t('shared.titles.more')} (${remain})`}
          </TextButton>
        </li>
      )}
    </CleanList>
  );
};

BookGalleryThumbs.displayName = 'BookGalleryThumbs';
