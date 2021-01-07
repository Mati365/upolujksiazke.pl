import {Type} from 'class-transformer';
import {
  IsEnum, IsNumber,
  IsOptional, IsString,
  ValidateNested,
} from 'class-validator';

import {Language} from '@server/constants/language';
import {CreateAttachmentDto} from '@server/modules/attachment/dto';
import {CreateBookPublisherDto} from '../../publisher/dto/BookPublisher.dto';
import {BookBindingKind} from '../BookRelease.entity';

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
  readonly publishDate: string;

  @IsOptional()
  @IsString()
  readonly title: string;

  @IsOptional()
  @IsString()
  readonly place: string;

  @IsString()
  readonly isbn: string;

  @IsString()
  readonly totalPages: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateBookPublisherDto)
  readonly publisher: CreateBookPublisherDto;

  @IsOptional()
  @IsString()
  readonly format: string;

  @IsOptional()
  @IsEnum(BookBindingKind)
  readonly binding: BookBindingKind;

  @IsOptional()
  @IsString()
  readonly edition: string;

  @ValidateNested()
  @IsOptional()
  readonly cover: CreateAttachmentDto;

  @IsEnum(Language)
  @IsOptional()
  readonly lang: Language;

  constructor(partial: Partial<CreateBookReleaseDto>) {
    Object.assign(this, partial);
  }
}
