import {Type} from 'class-transformer';
import {
  ArrayMaxSize, IsArray, IsDefined, IsNumber,
  IsOptional, IsString, ValidateNested,
} from 'class-validator';

import {IsTagCorrect} from '@server/modules/tag/validators/IsTagCorrect';

import {CreateBookAvailabilityDto} from '../modules/availability/dto/CreateBookAvailability.dto';
import {CreateBookReleaseDto} from '../modules/release/dto/CreateBookRelease.dto';
import {CreateBookAuthorDto} from '../modules/author/dto/CreateBookAuthor.dto';
import {CreateBookCategoryDto} from '../modules/category/dto/CreateBookCategory.dto';

export class CreateBookDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsString()
  readonly defaultTitle: string;

  @IsOptional()
  @IsString()
  readonly originalTitle: string;

  @IsOptional()
  @IsString()
  readonly originalPublishDate: string;

  @IsOptional()
  @ArrayMaxSize(25)
  @IsTagCorrect(
    {
      each: true,
    },
  )
  readonly tags: string[];

  @IsDefined()
  @ValidateNested()
  @Type(() => CreateBookReleaseDto)
  readonly releases: CreateBookReleaseDto[];

  @IsDefined()
  @ValidateNested()
  @Type(() => CreateBookAvailabilityDto)
  readonly availability: CreateBookAvailabilityDto;

  @IsArray()
  @ValidateNested()
  @Type(() => CreateBookAuthorDto)
  readonly authors: CreateBookAuthorDto[];

  @IsArray()
  @ValidateNested()
  @Type(() => CreateBookCategoryDto)
  readonly categories: CreateBookCategoryDto[];

  constructor(partial: Partial<CreateBookDto>) {
    Object.assign(this, partial);
  }

  get title() {
    return this.releases[0].title;
  }

  get isbn() {
    return this.releases[0].isbn;
  }
}
