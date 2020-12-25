import {Person} from '@shared/types';
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

export type BookReviewScrapperInfo = WebsiteScrapperItemInfo & {
  url: string,
  date: Date,
  score: number,
  stats?: {
    votes?: number,
    comments?: number,
  },
  author: Person & {
    avatar: string,
  },
  content: string,
  summaryContent?: string,
  book: BookScrapperInfo,
};

export type BookReviewProcessResult = ScrapperResult<BookReviewScrapperInfo[], ScrapperBasicPagination>;

export abstract class BookReviewAsyncScrapper extends AsyncScrapper<BookReviewScrapperInfo[]> {}

export abstract class BookReviewHTMLScrapper extends HTMLScrapper<BookReviewScrapperInfo[]> {}

export type WebsiteBookReviewScrapper = (BookReviewAsyncScrapper | BookReviewHTMLScrapper) & WebsiteInfoScrapper;
