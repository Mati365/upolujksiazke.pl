import {Controller, Get, Query, Res} from '@nestjs/common';
import {Response} from 'express';

import {Accepts} from '@server/common/decorators/Accepts.decorator';
import {APIClientService} from '../../services/APIClient.service';
import {BooksReviewsQueryFilters} from './dto';

@Controller('books/reviews')
export class APIBooksReviewsController {
  constructor(
    private readonly apiClientService: APIClientService,
  ) {}

  /* eslint-disable @typescript-eslint/indent */
  /**
   * Find all books that matches criteria
   *
   * @param {Response} res
   * @param {string} name
   * @param {BooksQueryFiltersDto} {limit, offset, ...filters}
   * @memberof APIBooksController
   */
  @Accepts('application/json')
  @Get()
  async filterReviews(
    @Res() res: Response,
    @Query() filters: BooksReviewsQueryFilters,
  ) {
    const {client: {repo}} = this.apiClientService;

    res.json(
      await repo.booksReviews.findAll(filters),
    );
  }
  /* eslint-enable @typescript-eslint/indent */
}
