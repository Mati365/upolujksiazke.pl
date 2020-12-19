import {Person} from '@shared/types';
import {AsyncScrapper, HTMLScrapper, WebsiteInfoScrapper} from '../shared';

export type BookReviewScrapperInfo = {
  parserSource: string,
  url: string,
  id: number,
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
  book: {
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
  },
};

export abstract class BookReviewAsyncScrapper extends AsyncScrapper<BookReviewScrapperInfo[]> {}

export abstract class BookReviewHTMLScrapper extends HTMLScrapper<BookReviewScrapperInfo[]> {}

export type WebsiteBookReviewScrapper = (BookReviewAsyncScrapper | BookReviewHTMLScrapper) & WebsiteInfoScrapper;
