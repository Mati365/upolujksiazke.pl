import {
  ArrayMaxSize, IsArray, IsDefined, IsNumber,
  IsOptional, IsString, MinLength,
} from 'class-validator';

import {IsUniqueValue} from '@server/common/validators/IsUniqueValue';
import {IsTagCorrect} from '@server/modules/tag/validators/IsTagCorrect';

export class CreateBookDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @IsString()
  readonly isbn: string;

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

  constructor(partial: Partial<CreateBookDto>) {
    Object.assign(this, partial);
  }
}
