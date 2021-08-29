import {Injectable, Logger} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {EntityManager, Equal, Not} from 'typeorm';
import React from 'react';
import ReactDOM from 'react-dom/server';
import TurndownService from 'turndown';
import * as R from 'ramda';

import {ENV} from '@client/constants/env';

import {genAllBookReviewsLink, genBookLink, prefixLinkWithHost} from '@client/routes/Links';
import {
  extractHostname,
  formatDate,
  isDevMode,
  objPropsToPromise,
} from '@shared/helpers';

import {BookReviewEntity} from '@server/modules/book/modules/review';
import {BookReviewImportedEvent} from '@server/modules/importer/kinds/db-loaders/events';
import {BookEntity} from '@server/modules/book/entity/Book.entity';
import {BookReviewerEntity} from '@server/modules/book/modules/reviewer/BookReviewer.entity';

@Injectable()
export class WykopCommentBot {
  private readonly logger = new Logger(WykopCommentBot.name);

  static readonly ENV = ENV.server.parsers.wykop;

  static readonly MAGIC_COMMENT_HEADER = 'Informacje nt. książki z tagu';

  constructor(
    private readonly entityManager: EntityManager,
  ) {}

  get api() {
    return WykopCommentBot.ENV.api;
  }

  /**
   * Watch if imported imported new review if so try to comment
   *
   * @param {BookReviewImportedEvent} {dto, review}
   * @memberof WykopCommentBot
   */
  @OnEvent('loader.review.imported')
  async handleImportedEvent(
    {
      dto,
      review,
    }: BookReviewImportedEvent,
  ) {
    if (!WykopCommentBot.isValidReview(review))
      return;

    const {api, logger} = this;
    try {
      const entry = await api.call(
        {
          path: `Entries/Entry/${review.remoteId}/`,
        },
      );
      if (!entry || WykopCommentBot.isCommentDisabled(entry))
        return;

      const reviewer = await BookReviewerEntity.findOne(review.reviewerId);
      if (!reviewer || reviewer.hidden)
        return;

      const message = await this.generateBookStatsMessage(
        {
          ...review,
          reviewer: dto.reviewer,
        } as any,
      );

      if (!message)
        return;

      if (isDevMode())
        logger.warn(`HTML message for wykop.pl: ${message}`);
      else {
        await api.call(
          {
            method: 'POST',
            path: `Entries/CommentAdd/${review.remoteId}/`,
            body: {
              body: message,
            },
          },
        );
      }
    } catch (e) {
      logger.error(e);
    }
  }

  /**
   * Return recent comments
   *
   * @private
   * @param {BookReviewEntity} {bookId}
   * @memberof WykopCommentBot
   */
  private async generateBookStatsMessage(
    {
      id,
      bookId,
      websiteId,
      reviewerId,
      reviewer,
    }: BookReviewEntity,
  ) {
    const {entityManager} = this;
    const {reviews, book} = await objPropsToPromise(
      {
        reviews: BookReviewEntity.find(
          {
            take: 5,
            order: {
              publishDate: 'DESC',
            },
            select: ['id', 'url', 'rating', 'publishDate'],
            relations: ['reviewer'],
            where: {
              id: Not(Equal(id)),
              bookId,
              websiteId,
            },
          },
        ),
        book: BookEntity.findOne(
          bookId,
          {
            select: ['id', 'parameterizedSlug', 'originalTitle'],
            relations: ['primaryRelease', 'kind', 'primaryCategory'],
          },
        ),
      },
    );

    const [stats]: {
      avgRatings: number,
      totalReviews: number,
      totalReviewerReviews: number,
    }[] = await entityManager.query(
      /* sql */ `
        select
          avg(br."rating")::float as "avgRatings",
          count(case when "rating" is null then null else 1 end)::int as "totalReviews",
          count(case when "rating" is null or "reviewerId" != $2 then null else 1 end)::int as "totalReviewerReviews"
        from book_review br
        where br."bookId" = $1 and br."includeInStats" = true
      `,
      [bookId, reviewerId],
    );

    const html = ReactDOM.renderToStaticMarkup(
      <>
        {`${WykopCommentBot.MAGIC_COMMENT_HEADER} #bookmeter:`}

        <br />
        <br />

        <strong>Średnia ocena z Wykopu:</strong>
        {' '}
        {WykopCommentBot.formatRatingStars(stats.avgRatings)}
        {` (${stats.totalReviews} recenzji)`}

        {book.primaryCategory && (
          <>
            <br />
            <strong>Kategoria książki:</strong>
            {' '}
            {book.primaryCategory.name}
          </>
        )}

        {book.kind && (
          <>
            <br />
            <strong>Gatunek książki:</strong>
            {' '}
            {book.kind.name}
          </>
        )}

        <br />
        <br />
        {R.isEmpty(reviews)
          ? (
            <strong>Jesteś pierwszym recenzentem tej książki tutaj :)</strong>
          )
          : (
            <>
              <strong>Ostatnie recenzje tej książki:</strong>
              <>
                {reviews.map(
                  (review, index) => (
                    <React.Fragment key={review.id}>
                      <br />
                      {`${index + 1}. `}
                      <strong>
                        {formatDate(review.publishDate)}
                      </strong>
                      {' - Użytkownik '}
                      <strong>
                        {review.reviewer.name}
                      </strong>
                      {' ocenił na: '}
                      {WykopCommentBot.formatRatingStars(review.rating)}
                      {' - '}
                      <a
                        href={review.url}
                        target='_blank'
                        rel='noreferrer'
                      >
                        Link do recenzji
                      </a>
                    </React.Fragment>
                  ),
                )}
                {reviews.length < stats.totalReviews && (
                  <>
                    <br />
                    {`... zobacz resztę fragmentów recenzji (${stats.totalReviews - reviews.length}) na: `}
                    <a
                      href={
                        prefixLinkWithHost(genAllBookReviewsLink(book))
                      }
                      target='_blank'
                      rel='noreferrer'
                    >
                      upolujksiazke.pl
                    </a>
                  </>
                )}
              </>
            </>
          )}

        <br />
        <br />
        {`@${reviewer.name}: fragment Twojej recenzji został umieszczony na stronie open-source `}
        <a
          href={
            prefixLinkWithHost(genBookLink(book))
          }
          target='_blank'
          rel='noreferrer'
        >
          upolujksiazke.pl
        </a>
        {' jeśli nie chcesz by cytaty z Twoich recenzji widniały na tej stronie to odpisz na ten komentarz lub na PW.'}

        <br />
        <br />
        Wygenerowane przez bota książkowego :) Jeśli masz sugestie / pomysły / uwagi /
        chcesz wspomóc prace nad nim pisz na PW. Github:
        {' '}
        <a href={ENV.shared.repo.url}>
          Kod źródłowy witryny
        </a>
      </>,
    );

    return (
      new TurndownService()
        .turndown(html)
        .toString()
        .replace(/([ ]*\n)/g, '\n')
    );
  }

  /**
   * Format rating to string of stars
   *
   * @static
   * @param {number} total
   * @return {string}
   * @memberof WykopCommentBot
   */
  static formatRatingStars(total: number): string {
    return (
      R
        .times(
          (i) => (
            i >= total
              ? '☆'
              : '★'
          ),
          10,
        ).join('')
    );
  }

  /**
   * Check if bot already commented entry
   *
   * @static
   * @param {*} entry
   * @return {boolean}
   * @memberof WykopCommentBot
   */
  static isCommentDisabled({data: entry}: any): boolean {
    if (!entry.can_comment)
      return true;

    const comments = R.pluck('body', (entry.comments || []) as {body: string}[]);

    return R.any(
      R.includes(WykopCommentBot.MAGIC_COMMENT_HEADER),
      comments,
    );
  }

  /**
   * Check if review is from wykop.pl
   *
   * @static
   * @param {BookReviewEntity} review
   * @return {boolean}
   * @memberof WykopCommentBot
   */
  static isValidReview(review: BookReviewEntity): boolean {
    const hostnameConfig = {
      dropSubdomain: true,
      allowWWW: false,
    };

    return (
      extractHostname(WykopCommentBot.ENV.homepageURL, hostnameConfig)
        === extractHostname(review.url, hostnameConfig)
    );
  }
}
