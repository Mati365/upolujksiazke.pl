import {IsEnum, IsNumber, IsOptional} from 'class-validator';
import {Transform} from 'class-transformer';

import {APIPaginationDto} from '@server/modules/api/dto/APIPagination.dto';
import {TransformSeparatedArray} from '@server/common/transformers/TransformSeparatedArray.transform';
import {BookSchoolLevel, BookType} from '@shared/enums';
import {BooksFilters} from '@api/repo';

export class BooksFiltersDto extends APIPaginationDto implements Required<BooksFilters> {
  @IsOptional()
  @TransformSeparatedArray()
  @IsEnum(BookType, {each: true})
  readonly types: BookType[];

  @IsOptional()
  @TransformSeparatedArray()
  @IsNumber({}, {each: true})
  readonly excludeIds: number[];

  @IsOptional()
  @TransformSeparatedArray()
  @IsNumber({}, {each: true})
  readonly categoriesIds: number[];

  @IsOptional()
  @TransformSeparatedArray()
  @IsNumber({}, {each: true})
  readonly authorsIds: number[];

  @IsOptional()
  @TransformSeparatedArray()
  @IsNumber({}, {each: true})
  readonly prizesIds: number[];

  @IsOptional()
  @TransformSeparatedArray()
  @IsNumber({}, {each: true})
  readonly genresIds: number[];

  @IsOptional()
  @TransformSeparatedArray()
  @IsNumber({}, {each: true})
  readonly erasIds: number[];

  @IsOptional()
  @TransformSeparatedArray()
  @IsNumber({}, {each: true})
  readonly publishersIds: number[];

  @IsOptional()
  @TransformSeparatedArray()
  @IsEnum(BookSchoolLevel, {each: true})
  readonly schoolLevels: BookSchoolLevel[];

  @IsOptional()
  @Transform(({value}) => parseInt(value, 10))
  @IsNumber()
  readonly lowestPrice: number;

  @IsOptional()
  @Transform(({value}) => parseInt(value, 10))
  @IsNumber()
  readonly highestPrice: number;
}
