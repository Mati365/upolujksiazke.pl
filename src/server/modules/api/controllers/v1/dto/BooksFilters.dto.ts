import {
  IsBoolean, IsEnum,
  IsNumber, IsOptional,
} from 'class-validator';

import {APIPaginationDto} from '@server/modules/api/dto/APIPagination.dto';
import {TransformSeparatedArray} from '@server/common/transformers/TransformSeparatedArray.transform';
import {BookType} from '@shared/enums';
import {BooksFilters} from '@api/repo';

export class BooksFiltersDto extends APIPaginationDto implements Required<BooksFilters> {
  @IsOptional()
  @IsEnum(BookType, {each: true})
  types: BookType[];

  @IsOptional()
  @TransformSeparatedArray()
  @IsNumber({}, {each: true})
  excludeIds: number[];

  @IsOptional()
  @TransformSeparatedArray()
  @IsNumber({}, {each: true})
  categoriesIds: number[];

  @IsOptional()
  @TransformSeparatedArray()
  @IsNumber({}, {each: true})
  authorsIds: number[];

  @IsOptional()
  @TransformSeparatedArray()
  @IsNumber({}, {each: true})
  prizesIds: number[];

  @IsOptional()
  @TransformSeparatedArray()
  @IsNumber({}, {each: true})
  genresIds: number[];

  @IsOptional()
  @TransformSeparatedArray()
  @IsNumber({}, {each: true})
  erasIds: number[];

  @IsOptional()
  @TransformSeparatedArray()
  @IsNumber({}, {each: true})
  publishersIds: number[];

  @IsOptional()
  @IsBoolean()
  schoolBook: boolean;
}
