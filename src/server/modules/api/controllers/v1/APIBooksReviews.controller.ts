import {Response} from 'express';
import {
  Controller, Get, Query,
  Post, Body, Res, Param,
} from '@nestjs/common';

import {Accepts} from '@server/common/decorators/Accepts.decorator';
import {UserReactionDto} from '@server/modules/reactions/dto/UserReaction.dto';
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

  /* eslint-disable @typescript-eslint/indent */
  @Post('/:id/react')
  async react(
    @Res() res: Response,
    @Body() data: UserReactionDto,
    @Param('id') id: string,
  ) {
    const {client: {repo}} = this.apiClientService;

    res.json(
      await repo.booksReviews.react(
        {
          ...data,
          id: +id,
        },
      ),
    );
  }
  /* eslint-enable @typescript-eslint/indent */
}
