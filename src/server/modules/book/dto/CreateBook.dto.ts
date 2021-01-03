import {
  ArrayMaxSize, IsArray, IsDefined, IsNumber,
  IsOptional, MinLength, ValidateNested,
} from 'class-validator';

import {IsUniqueValue} from '@server/common/validators/IsUniqueValue';
import {IsTagCorrect} from '@server/modules/tag/validators/IsTagCorrect';

import {CreateBookAvailabilityDto} from '../modules/availability/dto/CreateBookAvailability.dto';
import {CreateBookReleaseDto} from '../modules/release/dto/CreateBookRelease.dto';

export class CreateBookDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @IsUniqueValue(
    {
      repository: 'BookEntity',
      message: 'Book with provided title already exists!',
    },
  )
  readonly title: string;

  @IsOptional()
  @ArrayMaxSize(25)
  @IsTagCorrect(
    {
      each: true,
    },
  )
  readonly tags: string[];

  @IsOptional()
  @MinLength(3)
  readonly description: string;

  @IsArray()
  @MinLength(1)
  readonly authors: string[];

  @IsDefined()
  @ValidateNested()
  readonly releases: CreateBookReleaseDto[];

  @IsDefined()
  @ValidateNested()
  readonly availability: CreateBookAvailabilityDto;

  constructor(partial: Partial<CreateBookDto>) {
    Object.assign(this, partial);
  }
}
