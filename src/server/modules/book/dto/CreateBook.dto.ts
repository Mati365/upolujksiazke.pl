import * as R from 'ramda';
import {Type} from 'class-transformer';
import {
  ArrayMaxSize, IsArray, IsDefined, IsEnum, IsNumber,
  IsOptional, IsString, ValidateNested,
} from 'class-validator';

import {parameterize} from '@shared/helpers/parameterize';

import {Language} from '@shared/enums';
import {IsTagCorrect} from '@server/modules/tag/validators/IsTagCorrect';

import {CreateBookReleaseDto} from '../modules/release/dto/CreateBookRelease.dto';
import {CreateBookAuthorDto} from '../modules/author/dto/CreateBookAuthor.dto';
import {CreateBookCategoryDto} from '../modules/category/dto/CreateBookCategory.dto';
import {CreateBookVolumeDto, DEFAULT_BOOK_VOLUME_NAME} from '../modules/volume/dto/CreateBookVolume.dto';
import {CreateBookSeriesDto} from '../modules/series/dto/CreateBookSeries.dto';
import {CreateBookPrizeDto} from '../modules/prize/dto/CreateBookPrize.dto';
import {CreateBookKindDto} from '../modules/kind/dto/CreateBookKind.dto';
import {CreateSchoolBookDto} from './CreateSchoolBook.dto';
import {CreateBookEraDto} from '../modules/era/dto/CreateBookEra.dto';
import {CreateBookGenreDto} from '../modules/genre/dto/CreateBookGenre.dto';

import {BookType} from '../modules/release/BookRelease.entity';
import {reorderAuthorName} from '../modules/author/BookAuthor.entity';

export class CreateBookDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsString()
  readonly defaultTitle: string;

  @IsOptional()
  @IsString()
  readonly parameterizedSlug: string;

  @IsOptional()
  @IsString()
  readonly description: string;

  @IsOptional()
  @IsString()
  readonly taggedDescription: string;

  @IsEnum(Language)
  @IsOptional()
  readonly originalLang: Language;

  @IsOptional()
  @IsString()
  readonly originalTitle: string;

  @IsOptional()
  @IsString()
  readonly originalPublishYear: number;

  @IsOptional()
  @IsArray()
  readonly scrappersIds: number[];

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
  @Type(() => CreateBookVolumeDto)
  readonly volume: CreateBookVolumeDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => CreateSchoolBookDto)
  readonly schoolBook: CreateSchoolBookDto;

  @IsOptional()
  @IsNumber()
  readonly volumeId: number;

  @IsOptional()
  @IsNumber()
  readonly primaryReleaseId: number;

  @IsDefined()
  @ValidateNested()
  @Type(() => CreateBookKindDto)
  readonly kind: CreateBookKindDto;

  @IsOptional()
  @IsNumber()
  readonly kindId: number;

  @IsDefined()
  @ValidateNested()
  @Type(() => CreateBookSeriesDto)
  readonly series: CreateBookSeriesDto[];

  @IsDefined()
  @ValidateNested()
  @Type(() => CreateBookPrizeDto)
  readonly prizes: CreateBookPrizeDto[];

  @IsArray()
  @ValidateNested()
  @Type(() => CreateBookAuthorDto)
  readonly authors: CreateBookAuthorDto[];

  @IsOptional()
  @IsNumber()
  readonly primaryCategoryId: number;

  @IsArray()
  @ValidateNested()
  @Type(() => CreateBookCategoryDto)
  readonly categories: CreateBookCategoryDto[];

  @IsArray()
  @ValidateNested()
  @Type(() => CreateBookEraDto)
  readonly era: CreateBookEraDto[];

  @IsArray()
  @ValidateNested()
  @Type(() => CreateBookGenreDto)
  readonly genre: CreateBookGenreDto[];

  @IsOptional()
  @IsNumber()
  readonly avgRating: number;

  @IsOptional()
  @IsNumber()
  readonly totalRatings: number;

  @IsOptional()
  @IsNumber()
  readonly lowestPrice: number;

  @IsOptional()
  @IsNumber()
  readonly highestPrice: number;

  @IsOptional()
  @IsEnum(BookType, {each: true})
  readonly allTypes: BookType[];

  constructor(partial: Partial<CreateBookDto>) {
    Object.assign(this, partial);
  }

  get title() {
    return this.releases[0].title;
  }

  get isbn() {
    return this.releases[0].isbn;
  }

  /**
   * Generate unique book slug
   *
   * @param {string} [overrideAuthor]
   * @param {string} [overrideTitle]
   * @returns
   * @memberof CreateBookDto
   */
  genSlug(overrideAuthor?: string, overrideTitle?: string) {
    const {defaultTitle, title, authors, volume} = this;
    const str = [
      overrideTitle ?? defaultTitle ?? title,
      // do not reorder by name - primary author should be always first!
      reorderAuthorName(
        overrideAuthor || R.sortBy(R.prop('name'), authors || [])[0]?.name || 'anonym',
      ),
      volume
        ? volume.name
        : DEFAULT_BOOK_VOLUME_NAME,
    ];

    return parameterize(str.join('-'));
  }

  /**
   * Generate all possible book slug with random author order
   *
   * @param {string} [overrideTitle]
   * @returns
   * @memberof CreateBookDto
   */
  genSlugPermutations(overrideTitle?: string) {
    return [
      this.genSlug(null, overrideTitle),
      ...R.map(
        (author) => this.genSlug(author.name, overrideTitle),
        this.authors || [],
      ),
    ];
  }

  /**
   * Maps releases and returns new dto
   *
   * @param {(release: CreateBookReleaseDto) => CreateBookReleaseDto} fn
   * @returns {CreateBookDto}
   * @memberof CreateBookDto
   */
  mapReleases(fn: (release: CreateBookReleaseDto) => CreateBookReleaseDto): CreateBookDto {
    return new CreateBookDto(
      {
        ...this,
        releases: this.releases.map(fn),
      },
    );
  }
}
