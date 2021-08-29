import {IsDefined, IsNumber} from 'class-validator';
import {Transform} from 'class-transformer';
import {APIBasicPaginationFilters} from '@server/modules/api/dto';

export class BooksReviewsQueryFilters extends APIBasicPaginationFilters {
  @IsDefined()
  @Transform(({value}) => Number.parseInt(value, 10))
  @IsNumber()
  readonly bookId: number;
}
