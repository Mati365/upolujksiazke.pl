import {Person, RemoteID} from '@shared/types';
import {ScrapperMetadataKind} from '../../entity';
import {
  ScrapperBasicPagination,
  ScrapperResult,
  WebsiteScrapperItemInfo,
} from '../shared';

export type BookScrapperInfo = {
  title: string,
  isbn: string,
  authors: string[],
  category: string,
  description?: string,
  cover?: {
    nsfw: boolean,
    ratio?: number,
    source: string,
    image: string,
  },
};

export type BookReviewAuthor = Person & {
  id?: RemoteID,
  avatar: string,
};

export type BookReviewScrapperInfo = WebsiteScrapperItemInfo & {
  kind: ScrapperMetadataKind.BOOK_REVIEW,
  url: string,
  date: Date,
  score: number,
  stats?: {
    votes?: number,
    comments?: number,
  },
  content: string,
  summaryContent?: string,
  author: BookReviewAuthor,
  book: BookScrapperInfo,
};

export type BookReviewProcessResult = ScrapperResult<BookReviewScrapperInfo[], ScrapperBasicPagination>;
