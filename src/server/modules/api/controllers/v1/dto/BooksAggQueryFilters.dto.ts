import {IsOptional, IsString} from 'class-validator';
import {BooksQueryFiltersDto} from './BooksQueryFilters.dto';

export class BooksAggQueryFiltersDto extends BooksQueryFiltersDto {
  @IsOptional()
  @IsString()
  readonly aggPhrase: string;
}
