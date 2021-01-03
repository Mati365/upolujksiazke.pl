import {Type} from 'class-transformer';
import {
  IsDate, IsNumber,
  IsOptional, IsString,
  ValidateNested,
} from 'class-validator';

import {CreateBookPublisherDto} from '../../publisher/dto/BookPublisher.dto';

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

  constructor(partial: Partial<CreateBookReleaseDto>) {
    Object.assign(this, partial);
  }
}
