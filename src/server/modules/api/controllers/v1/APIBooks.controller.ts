import {Controller, Get, Param, Query, Res} from '@nestjs/common';
import {Response} from 'express';

import {Accepts} from '@server/common/decorators/Accepts.decorator';
import {APIClientService} from '../../services/APIClient.service';
import {
  BooksQueryFiltersDto,
  BooksRankingQueryFiltersDto,
  BooksAggQueryFiltersDto,
} from './dto';

@Controller('books')
export class APIBooksController {
  constructor(
    private readonly apiClientService: APIClientService,
  ) {}

  /* eslint-disable @typescript-eslint/indent */
  @Accepts('application/json')
  @Get('/top-ranking')
  async topRankingBooks(
    @Res() res: Response,
    @Query() filters: BooksRankingQueryFiltersDto,
  ) {
    const {client: {repo}} = this.apiClientService;

    res.json(
      await repo.books.findTopRankingBooks(filters),
    );
  }
  /* eslint-enable @typescript-eslint/indent */

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
  async filterBooks(
    @Res() res: Response,
    @Query() filters: BooksQueryFiltersDto,
  ) {
    const {client: {repo}} = this.apiClientService;

    res.json(
      await repo.books.findAggregatedBooks(filters),
    );
  }
  /* eslint-enable @typescript-eslint/indent */

  /* eslint-disable @typescript-eslint/indent */
  /**
   * Returns paginated aggregation for filters group
   *
   * @param {Response} res
   * @param {number} page
   * @param {number} limit
   * @memberof APIBooksController
   */
  @Accepts('application/json')
  @Get('/filters/aggs/:name')
  async filterAggs(
    @Res() res: Response,
    @Param('name') name: string,
    @Query() {limit, offset, aggPhrase, ...filters}: BooksAggQueryFiltersDto,
  ) {
    const {client: {repo}} = this.apiClientService;
    const result = await repo.books.findBooksAggsItems(
      {
        filters,
        agg: {
          name,
          phrase: aggPhrase,
          pagination: {
            limit,
            offset,
          },
        },
      },
    );

    res.json(result);
  }
  /* eslint-enable @typescript-eslint/indent */
}
