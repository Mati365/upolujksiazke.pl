import React, {ReactNode, useState} from 'react';
import c from 'classnames';

import noImagePlaceholderUrl from '@assets/img/no-image-placeholder.png';

import {capitalize} from '@shared/helpers';
import {useI18n} from '@client/i18n';

import {RemoteArticleRecord} from '@api/types';
import {CleanList, Picture, TextButton, UndecoratedLink} from '@client/components/ui';
import {TitledFavicon} from '@client/components/ui/TitledFavicon';

type RemoteArticleCardProps = {
  className?: string,
  children?: ReactNode,
  item: RemoteArticleRecord,
  maxVisibleSublinksCount?: number,
  showCover?: boolean,
  sublinks?: {
    title: string,
    url: string,
  }[],
};

export const RemoteArticleCard = (
  {
    className,
    children,
    sublinks,
    item,
    showCover = true,
    maxVisibleSublinksCount = 3,
  }: RemoteArticleCardProps,
) => {
  const {url, title, description, cover, website} = item;
  const [expandedLinks, setExpandedLinks] = useState(false);
  const t = useI18n();
  const coverUrl = cover?.preview?.file;

  return (
    <article
      className={c(
        'c-article-card',
        className,
      )}
    >
      {showCover && (
        <UndecoratedLink
          href={url}
          rel='noopener nofollow noreferrer'
          target='_blank'
          className={c(
            'c-article-card__cover',
            !coverUrl && 'is-placeholder',
          )}
        >
          <Picture
            loading='lazy'
            alt={title}
            src={
              coverUrl || noImagePlaceholderUrl
            }
          />
        </UndecoratedLink>
      )}

      <div className='c-article-card__content'>
        <UndecoratedLink
          href={url}
          rel='noopener nofollow noreferrer'
          target='_blank'
          className='c-article-card__anchor is-undecorated-link'
        >
          <span className='c-article-card__header has-double-link-chevron'>
            {title}
          </span>

          {(children || description) && (
            <div className='c-article-card__description'>
              {description}
              {children}
            </div>
          )}
        </UndecoratedLink>

        {sublinks?.length > 0 && (
          <CleanList
            className='c-article-card__sublinks'
            spaced={2}
            inline={false}
            block
            separated
          >
            {sublinks.map(
              (sublink, index) => (
                <li
                  key={sublink.title}
                  className={c(
                    !expandedLinks && index >= maxVisibleSublinksCount && 'is-hidden',
                  )}
                >
                  <UndecoratedLink
                    href={sublink.url}
                    title={sublink.title}
                    additionalClassName='has-double-link-chevron'
                    rel='noopener nofollow noreferrer'
                    target='_blank'
                  >
                    <h4>
                      {capitalize(sublink.title)}
                    </h4>
                  </UndecoratedLink>
                </li>
              ),
            )}
            {sublinks.length > maxVisibleSublinksCount && (
              <li>
                <TextButton
                  role='button'
                  type='primary'
                  onClick={
                    () => setExpandedLinks(!expandedLinks)
                  }
                >
                  {t(`shared.buttons.${expandedLinks ? 'less' : 'more'}`)}
                </TextButton>
              </li>
            )}
          </CleanList>
        )}

        <div className='c-article-card__footer'>
          <TitledFavicon
            className='is-text-small'
            bold={false}
            src={website.logo?.smallThumb?.file}
            title={website.hostname}
            target='_blank'
            rel='noopener noreferrer'
          />
        </div>
      </div>
    </article>
  );
};

RemoteArticleCard.displayName = 'RemoteArticleCard';
