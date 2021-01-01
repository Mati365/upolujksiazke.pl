import {
  IsDefined, IsNotEmpty,
  IsOptional, IsNumber,
  IsString, ValidateNested, IsEnum,
} from 'class-validator';

import {Gender} from '@shared/types';
import {RemoteEntityDto} from '@server/modules/importer/modules/scrapper/dto/RemoteEntity.dto';

export class BookReviewerDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @ValidateNested()
  readonly remote: RemoteEntityDto;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsEnum(Gender)
  readonly gender: Gender;

  constructor(partial: Partial<BookReviewerDto>) {
    Object.assign(this, partial);
  }
}
