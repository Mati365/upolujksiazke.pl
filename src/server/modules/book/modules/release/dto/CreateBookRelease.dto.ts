import {Type} from 'class-transformer';
import {
  IsDate, IsEnum, IsNumber,
  IsOptional, IsString,
  ValidateNested,
} from 'class-validator';

import {CreateBookPublisherDto} from '../../publisher/dto/BookPublisher.dto';
import {BookBindingKind} from '../BookRelease.entity';

export class CreateBookReleaseDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsOptional()
  @IsDate()
  readonly publishDate: Date;

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
  readonly format: string; // todo: maybe add enum for Audiobooks?

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
