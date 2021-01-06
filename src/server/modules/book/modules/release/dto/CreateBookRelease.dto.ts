import {Type} from 'class-transformer';
import {
  IsEnum, IsNumber,
  IsOptional, IsString,
  ValidateNested,
} from 'class-validator';

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

  constructor(partial: Partial<CreateBookReleaseDto>) {
    Object.assign(this, partial);
  }
}
