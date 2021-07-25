import React, {memo} from 'react';

import {formatDate} from '@shared/helpers/format';
import {
  pickAllBookTypedReleases,
  pickFirstBookRelease,
} from '@client/containers/kinds/book/helpers';

import {
  prefixLinkWithHost,
  genAuthorLink,
  genBookLink,
} from '@client/routes/Links';

import {BookType} from '@shared/enums';
import {BookFullInfoRecord} from '@api/types';
import {JsonLD} from '@client/components/JsonLD';

const JSON_BOOK_TYPE_MAPPING: Record<BookType, string> = {
  [BookType.AUDIOBOOK]: 'AudiobookFormat',
  [BookType.EBOOK]: 'EBook',
  [BookType.PAPER]: 'Paperback',
};

type BookJsonLDProps = {
  book: BookFullInfoRecord,
};

export const BookJsonLD = memo(({book}: BookJsonLDProps) => {
  if (!book?.primaryRelease)
    return null;

  const {
    primaryRelease, reviews, avgRating,
    authors, totalRatings, lowestPrice,
    highestPrice, totalTextReviews,
  } = book;

  const {isbn} = primaryRelease;
  const cover = primaryRelease.cover?.preview?.file;
  const availability = pickAllBookTypedReleases(book);
  const firstRelease = pickFirstBookRelease(book);
  const url = prefixLinkWithHost(genBookLink(book));
  const aggregateRating = {
    '@type': 'AggregateRating',
    bestRating: 10,
    ratingCount: totalRatings,
    ratingValue: avgRating?.toFixed(2),
  };

  const productJSON = {
    '@type': 'Product',
    url,
    aggregateRating,
    name: book.defaultTitle,
    ...cover && {
      image: cover,
    },
    description: book.nonHTMLDescription,
    sku: isbn,
    gtin8: isbn,
    productID: `isbn:${isbn}`,
    ...firstRelease?.publishDate && {
      releaseDate: formatDate(firstRelease.publishDate),
    },
    ...primaryRelease.publisher && {
      brand: {
        '@type': 'Brand',
        name: primaryRelease.publisher.name,
      },
    },
    ...reviews && {
      review: reviews
        .map((review) => review.reviewer && ({
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: review.reviewer?.name,
          },
          datePublished: formatDate(review.publishDate),
          ...review.rating && {
            reviewRating: {
              '@type': 'Rating',
              ratingValue: review.rating,
              bestRating: 10,
            },
          },
        }))
        .filter(Boolean),
    },
    offers: {
      '@type': 'AggregateOffer',
      ...highestPrice > 0 && {
        highPrice: highestPrice,
      },
      ...lowestPrice && {
        lowPrice: lowestPrice,
      },
      priceCurrency: 'zł',
      offerCount: availability.length,
      offers: (
        availability
          .map((item) => item.url && ({
            '@type': 'Offer',
            url: item.url,
            availability: 'http://schema.org/InStock',
            itemCondition: 'NewCondition',
            priceCurrency: 'zł',
            price: item.price,
          }))
          .filter(Boolean)
      ),
    },
  };

  const bookJSON = {
    '@type': 'Book',
    isbn,
    url,
    aggregateRating,
    commentCount: totalTextReviews,
    bookFormat: JSON_BOOK_TYPE_MAPPING[primaryRelease.type],
    inLanguage: {
      '@type': 'Language',
      name: 'Polish',
      alternateName: 'pl',
    },
    name: book.defaultTitle,
    ...cover && {
      image: cover,
    },
    ...primaryRelease.totalPages && {
      numberOfPages: primaryRelease.totalPages,
    },
    ...firstRelease?.publishDate && {
      copyrightYear: firstRelease.publishDate,
    },
    ...primaryRelease.publisher && {
      publisher: primaryRelease.publisher.name,
      brand: primaryRelease.publisher.name,
    },
    author: authors.map((author) => ({
      '@type': 'Person',
      name: author.name,
      url: genAuthorLink(author),
    })),
  };

  return (
    <>
      <JsonLD json={productJSON} />
      <JsonLD json={bookJSON} />
    </>
  );
});

BookJsonLD.displayName = 'BookJsonLD';
