import React, {Fragment} from 'react';
import * as R from 'ramda';

import {ENV} from '@client/constants/env';

import {genBookCategoryLink, genBookLink, prefixLinkWithHost} from '@client/routes/Links';
import {BookReviewEntity} from '@server/modules/book/modules/review';
import {BookEntity} from '@server/modules/book';

import {formatRatingStars} from '../../helpers';

export type OptionalMatchedReviewBook = BookEntity & {
  latestReview?: BookReviewEntity,
};

export type SimilarCommentBooksProps = {
  book: BookEntity,
  books: OptionalMatchedReviewBook[],
};

export const SimilarCommentBooks = (
  {
    book: rootBook,
    books,
  }: SimilarCommentBooksProps,
) => {
  if (!books || R.isEmpty(books))
    return null;

  return (
    <>
      <strong>Podobne książki:</strong>
      {books.map(
        (book, index) => {
          const {latestReview} = book;

          return (
            <Fragment key={book.id}>
              <br />
              {`${index + 1}. `}

              <a
                href={
                  prefixLinkWithHost(genBookLink(book))
                }
                target='_blank'
                rel='noreferrer'
              >
                <strong>
                  {book.defaultTitle}
                  {!R.isEmpty(book.authors) && ` (${book.authors[0]?.name})`}
                </strong>
              </a>

              {latestReview && (
                <>
                  {' - najnowsza recenzja usera '}
                  <strong>
                    {latestReview.reviewer.name}
                  </strong>
                  {!R.isNil(latestReview.rating) && ` ${formatRatingStars(latestReview.rating, 5)}`}
                  {' - '}
                  <a
                    href={latestReview.url}
                    target='_blank'
                    rel='noreferrer'
                  >
                    <strong>
                      Wpis »
                    </strong>
                  </a>
                </>
              )}
            </Fragment>
          );
        },
      )}

      <br />
      {`... zobacz więcej książek z kategorii ${rootBook.primaryCategory.name} na: `}
      <a
        href={
          prefixLinkWithHost(genBookCategoryLink(rootBook.primaryCategory))
        }
        target='_blank'
        rel='noreferrer'
      >
        {ENV.shared.website.name}
      </a>
    </>
  );
};
