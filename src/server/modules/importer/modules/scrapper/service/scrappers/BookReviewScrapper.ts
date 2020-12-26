import {Person, RemoteID} from '@shared/types';
import {ScrapperMetadataKind} from '../../entity';
import {
  AsyncScrapper, HTMLScrapper,
  ScrapperBasicPagination, ScrapperResult,
  WebsiteInfoScrapper,
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

export abstract class BookReviewAsyncScrapper extends AsyncScrapper<BookReviewScrapperInfo[]> {}

export abstract class BookReviewHTMLScrapper extends HTMLScrapper<BookReviewScrapperInfo[]> {}

export type WebsiteBookReviewScrapper = (BookReviewAsyncScrapper | BookReviewHTMLScrapper) & WebsiteInfoScrapper;
