import {BookAuthorsRepo, BooksAuthorsFilters} from '@api/repo';
import {MeasureCallDuration} from '@server/common/helpers/decorators';

import {ServerAPIClientChild} from '../ServerAPIClientChild';
import {RedisMemoize} from '../../helpers';

export class BooksAuthorsServerRepo extends ServerAPIClientChild implements BookAuthorsRepo {
  /**
   * Find all authors first name letters
   *
   * @returns {Promise<string[]>}
   * @memberof BooksAuthorsServerRepo
   */
  @MeasureCallDuration('findAuthorsFirstNamesLetters')
  @RedisMemoize(
    {
      keyFn: () => ({
        key: 'authors-first-letters',
      }),
    },
  )
  async findAuthorsFirstNamesLetters(): Promise<string[]> {
    const {bookAuthorService} = this.services;

    return bookAuthorService.findAuthorsFirstNamesLetters();
  }

  /**
   *
   *
   * @param {BooksAuthorsFilters} filters
   * @memberof BooksAuthorsServerRepo
   */
  @MeasureCallDuration('findAllAuthors')
  @RedisMemoize(
    {
      keyFn: (filters) => ({
        key: `all-authors-${JSON.stringify(filters)}`,
      }),
    },
  )
  findAll(filters: BooksAuthorsFilters) {
    const {bookAuthorService} = this.services;

    return bookAuthorService.findFilteredAuthors(filters);
  }

  /**
   * Single author fetch
   *
   * @param {number} id
   * @returns
   * @memberof BooksAuthorsServerRepo
   */
  @MeasureCallDuration('findAuthor')
  @RedisMemoize(
    {
      keyFn: (id) => ({
        key: `author-${id}`,
      }),
    },
  )
  findOne(id: number) {
    const {bookAuthorService} = this.services;

    return bookAuthorService.findOne(id);
  }
}
