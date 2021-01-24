import {Type} from 'class-transformer';
import {
  IsEnum, IsNumber,
  IsOptional, IsString,
  MinLength, ValidateNested,
} from 'class-validator';

import {Language} from '@server/constants/language';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateRemoteRecordDto} from '@server/modules/remote/dto/CreateRemoteRecord.dto';
import {CreateBookPublisherDto} from '../../publisher/dto/BookPublisher.dto';
import {CreateBookVolumeDto} from '../../volume/dto/CreateBookVolume.dto';
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

  @IsOptional()
  @IsString()
  readonly isbn: string;

  @IsString()
  readonly totalPages: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateBookVolumeDto)
  readonly volume: CreateBookVolumeDto;

  @IsOptional()
  @IsNumber()
  readonly volumeId: number;

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
  @ValidateNested()
  @Type(() => CreateRemoteRecordDto)
  readonly remoteDescription: CreateRemoteRecordDto;

  @IsOptional()
  @IsNumber()
  readonly remoteDescriptionId: number;

  @IsOptional()
  @IsNumber()
  readonly bookId: number;

  @IsOptional()
  @IsString()
  readonly translator: string;

  @IsOptional()
  @IsNumber()
  readonly defaultPrice: number;

  constructor(partial: Partial<CreateBookReleaseDto>) {
    Object.assign(this, partial);
  }
}
