import {Transform} from 'class-transformer';
import {
  IsEnum, IsNumber,
  IsOptional, IsString,
} from 'class-validator';

import {APIPaginationDto} from '@server/modules/api/dto/APIPagination.dto';
import {
  TransformBoolean,
  TransformSeparatedArray,
} from '@server/common/transformers';

import {BooksFilters} from '@api/repo';
import {BookSchoolLevel, BookType, SortMode} from '@shared/enums';

export class BooksQueryFiltersDto extends APIPaginationDto implements Required<BooksFilters> {
  @IsOptional()
  @TransformBoolean()
  readonly selectDescription: boolean;

  @IsOptional()
  @Transform(({value}) => parseInt(value, 10))
  @IsEnum(BookSchoolLevel)
  readonly sort: SortMode;

  @IsOptional()
  @IsString()
  readonly phrase: string;

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
  readonly parentCategoriesIds: number[];

  @IsOptional()
  @TransformSeparatedArray()
  @IsNumber({}, {each: true})
  readonly categoriesIds: number[];

  @IsOptional()
  @TransformSeparatedArray()
  @IsNumber({}, {each: true})
  readonly tagsIds: number[];

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
