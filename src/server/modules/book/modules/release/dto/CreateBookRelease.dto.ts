import {Type} from 'class-transformer';
import {
  IsEnum, IsNumber, IsDefined,
  IsOptional, IsString,
  MinLength, ValidateNested,
} from 'class-validator';

import {Language} from '@server/constants/language';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateBookPublisherDto} from '../../publisher/dto/BookPublisher.dto';
import {BookBindingKind, BookType} from '../BookRelease.entity';

/**
 * @todo
 *  Maybe add enum for Audiobooks?
 *
 * @export
 * @class CreateBookReleaseDto
 */
export class CreateBookReleaseDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsOptional()
  @IsString()
  readonly title: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  readonly description: string;

  @IsOptional()
  @IsString()
  readonly publishDate: string;

  @IsOptional()
  @IsString()
  readonly place: string;

  @IsDefined()
  @IsString()
  readonly isbn: string;

  @IsString()
  readonly totalPages: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateBookPublisherDto)
  readonly publisher: CreateBookPublisherDto;

  @IsOptional()
  @IsNumber()
  readonly publisherId: number;

  @IsOptional()
  @IsString()
  readonly format: string;

  @IsOptional()
  @IsEnum(BookType)
  readonly type: BookType;

  @IsOptional()
  @IsEnum(BookBindingKind)
  readonly binding: BookBindingKind;

  @IsOptional()
  @IsString()
  readonly edition: string;

  @ValidateNested()
  @IsOptional()
  readonly cover: CreateImageAttachmentDto;

  @IsEnum(Language)
  @IsOptional()
  readonly lang: Language;

  @IsOptional()
  @IsNumber()
  readonly bookId: number;

  @IsOptional()
  @IsString({each: true})
  readonly translator: string[];

  @IsOptional()
  @IsNumber()
  readonly defaultPrice: number;

  @IsOptional()
  @IsNumber()
  readonly weight: number;

  constructor(partial: Partial<CreateBookReleaseDto>) {
    Object.assign(this, partial);
  }
}
