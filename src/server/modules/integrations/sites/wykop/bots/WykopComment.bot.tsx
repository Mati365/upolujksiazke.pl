import React, {Fragment} from 'react';
import {SchedulerRegistry} from '@nestjs/schedule';
import {Injectable, Logger} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {EntityManager, Equal, Not} from 'typeorm';
import * as R from 'ramda';

import {genBookLink, prefixLinkWithHost} from '@client/routes/Links';
import {pickBookAbonamentList} from '@client/containers/kinds/book/helpers';

import {
  concatUrls,
  extractHostname,
  formatDate,
  isDevMode,
  objPropsToPromise,
  uniqFlatHashByProp,
} from '@shared/helpers';

// eslint-disable-next-line max-len
import {BookSimilarityFilterService} from '@server/modules/recommendation/modules/BookRecommendation/BookSimilarityFilter.service';
import {BookReviewService} from '@server/modules/book/modules/review/BookReview.service';
import {BookReleaseService} from '@server/modules/book/modules/release/BookRelease.service';
import {BookReviewEntity} from '@server/modules/book/modules/review';
import {BookReviewImportedEvent} from '@server/modules/importer/kinds/db-loaders/events';
import {BookEntity} from '@server/modules/book/entity/Book.entity';
import {BookReviewerEntity} from '@server/modules/book/modules/reviewer/BookReviewer.entity';

import {
  SUMMARY_CRONTAB_NAME,
  ENV,
  WYKOP_ENV,
} from '../constants';

import {CommentedBookStats} from '../constants/types';
import {
  BotMessageFooter,
  LatestCommentBookReviews,
  OptionalMatchedReviewBook,
  SimilarCommentBooks,
} from '../components';

import {
  renderJSXToMessage,
  formatRatingStars,
} from '../helpers';

@Injectable()
export class WykopCommentBot {
  private readonly logger = new Logger(WykopCommentBot.name);

  static readonly MAGIC_COMMENT_HEADER = 'Informacje nt. książki z tagu';

  constructor(
    private readonly entityManager: EntityManager,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly bookReviewService: BookReviewService,
    private readonly bookRecommendationService: BookSimilarityFilterService,
    private readonly bookReleaseService: BookReleaseService,
  ) {}

  get api() {
    return WYKOP_ENV.api;
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
      review,
    }: BookReviewImportedEvent,
  ) {
    if (!WykopCommentBot.isValidReview(review)
        || WykopCommentBot.isExpiredReview(review))
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
      if (!reviewer)
        return;

      const message = await this.generateBookStatsMessage(
        {
          ...review,
          reviewer,
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
   * Returns next date when bot post summary
   *
   * @private
   * @return {Date}
   * @memberof WykopCommentBot
   */
  private getNextCronDate(): Date {
    return (
      this
        .schedulerRegistry
        .getCronJob(SUMMARY_CRONTAB_NAME)
        .nextDate()
        .toDate()
    );
  }

  /**
   * Return recent comments
   *
   * @private
   * @param {BookReviewEntity} review
   * @memberof WykopCommentBot
   */
  private async generateBookStatsMessage(review: BookReviewEntity) {
    const {reviewer} = review;
    const {
      reviews,
      book,
      similarBooks,
      releases,
      stats,
    } = await this.fetchCommentStats(review);

    const abonaments = pickBookAbonamentList(releases as any);
    const html = (
      <>
        {`${WykopCommentBot.MAGIC_COMMENT_HEADER} #bookmeter:`}

        <br />
        <br />

        <strong>Średnia ocena z Wykopu:</strong>
        {' '}
        {formatRatingStars(stats.avgRatings) ?? '?'}
        {` (${stats.totalReviews} recenzji)`}

        <br />
        <strong>Następne podsumowanie tagu:</strong>
        {' '}
        {formatDate(this.getNextCronDate(), true, true)}
        {' '}
        <a
          href={
            concatUrls(WYKOP_ENV.homepageURL, `tag/${WYKOP_ENV.bots.summary.tag}`)
          }
          target='_blank'
          rel='noreferrer'
        >
          <strong>
            tag z historią podsumowań »
          </strong>
        </a>

        {abonaments?.length > 0 && (
          <>
            <br />
            <strong>W abonamentach:</strong>
            {' '}
            {abonaments.map(
              (availability) => (
                <Fragment key={availability.id}>
                  <a href={availability.url}>
                    <strong>
                      {availability.website.hostname}
                    </strong>
                  </a>
                  {' '}
                </Fragment>
              ),
            )}
          </>
        )}

        {book.primaryCategory && (
          <>
            <br />
            <strong>Kategoria książki:</strong>
            {' '}
            {book.primaryCategory.name}
          </>
        )}

        {book.primaryRelease?.totalPages && (
          <>
            <br />
            <strong>Liczba stron książki:</strong>
            {' '}
            {book.primaryRelease.totalPages}
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
        <LatestCommentBookReviews
          reviews={reviews}
          stats={stats}
          book={book}
        />

        {similarBooks && !R.isEmpty(similarBooks) && (
          <>
            <br />
            <br />
            <SimilarCommentBooks
              books={similarBooks}
              book={book}
            />
          </>
        )}

        {!reviewer.hidden && (
          <>
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
              {ENV.shared.website.name}
            </a>
            {' jeśli nie chcesz by cytaty z Twoich recenzji widniały na tej stronie to'}
            {' odpisz na ten komentarz lub na PW.'}
          </>
        )}

        <BotMessageFooter />
      </>
    );

    return renderJSXToMessage(html);
  }

  /* eslint-disable max-len */
  /**
   * Resolves stats used to generate comment
   *
   * @private
   * @param {BookReviewEntity} review
   * @memberof WykopCommentBot
   */
  private async fetchCommentStats(
    {
      id,
      bookId,
      websiteId,
      reviewer,
    }: BookReviewEntity,
  ) {
    const {
      entityManager,
      bookRecommendationService,
      bookReviewService,
      bookReleaseService,
    } = this;

    const fetchSimilarBooks = async () => {
      const similarBooks = await bookRecommendationService.findBookAlternativesCards(
        {
          limit: 4,
          bookId,
        },
      ) as OptionalMatchedReviewBook[];

      const reviewsIds = R.pluck('id', (await entityManager.query(
        /* sql */ `
          select
            (
              select review."id"
              from
                book_review review
              left join book_reviewer reviewer on review."reviewerId" = reviewer."id"
              where review."bookId" = books."bookId" and review."websiteId" = $2
              order by review."createdAt" desc
              limit 1
            ) as "id"
          from (
            select unnest(string_to_array($1, ',')::int[]) as "bookId"
          ) as books
        `,
        [
          R.pluck('id', similarBooks).join(','),
          websiteId,
        ],
      )) as any[]);

      if (R.isEmpty(reviewsIds))
        return [];

      const reviewsMap = uniqFlatHashByProp(
        'bookId',
        (await bookReviewService.findBookReviews(
          {
            pagination: false,
            ids: reviewsIds,
          },
        )).items,
      );

      return similarBooks.map((book) => {
        book.latestReview = reviewsMap[book.id];
        return book;
      });
    };

    return objPropsToPromise(
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

        releases: bookReleaseService.findBookReleases(
          {
            bookId,
          },
        ),

        book: BookEntity.findOne(
          bookId,
          {
            select: ['id', 'parameterizedSlug', 'originalTitle'],
            relations: ['primaryRelease', 'kind', 'primaryCategory'],
          },
        ),

        stats: (
          entityManager
            .query(
              /* sql */ `
                select
                  avg(br."rating")::float as "avgRatings",
                  count(case when "rating" is null then null else 1 end)::int as "totalReviews",
                  count(case when "rating" is null or "reviewerId" != $2 then null else 1 end)::int as "totalReviewerReviews"
                from book_review br
                where br."bookId" = $1 and br."includeInStats" = true
              `,
              [bookId, reviewer.id],
            )
            .then(R.nth(0)) as Promise<CommentedBookStats>
        ),

        similarBooks: fetchSimilarBooks(),
      },
    );
  }
  /* eslint-enable max-len */

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

    if (isDevMode())
      return false;

    const comments = (
      R
        .pluck('body', (entry.comments || []) as {body: string}[])
        .filter(Boolean)
    );

    return R.any(
      R.includes(WykopCommentBot.MAGIC_COMMENT_HEADER),
      comments,
    );
  }

  /**
   * Check if review is old
   *
   * @static
   * @param {BookReviewEntity} review
   * @param {number} [maxHours=5]
   * @return {boolean}
   * @memberof WykopCommentBot
   */
  static isExpiredReview(review: BookReviewEntity, maxHours: number = 32): boolean {
    if (isDevMode())
      return false;

    if (!review?.publishDate)
      return true;

    const diff = new Date().getTime() - new Date(review.publishDate).getTime();
    return Math.abs(diff) / 3600000 > maxHours;
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
      extractHostname(WYKOP_ENV.homepageURL, hostnameConfig)
        === extractHostname(review.url, hostnameConfig)
    );
  }
}
