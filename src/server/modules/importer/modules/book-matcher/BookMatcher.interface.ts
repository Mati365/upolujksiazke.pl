import {CanBePromise} from '@shared/types';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {BookScrapperInfo} from '../scrapper/service/scrappers/Book.scrapper';

export type BookMatcherResult = {
  cached?: boolean,
  result: CreateBookDto,
};

export interface BookMatcher {
  matchBook(scrapperInfo: BookScrapperInfo): CanBePromise<BookMatcherResult>,
}
