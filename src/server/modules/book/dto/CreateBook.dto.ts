import {
  ArrayMaxSize, IsArray, IsDefined, IsNumber,
  IsOptional, IsString, MinLength, ValidateNested,
} from 'class-validator';

import {IsUniqueValue} from '@server/common/validators/IsUniqueValue';
import {IsTagCorrect} from '@server/modules/tag/validators/IsTagCorrect';
import {RemoteRecordDto} from '@server/modules/remote/dto/RemoteRecord.dto';

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

  @IsDefined()
  @ValidateNested()
  readonly remote: RemoteRecordDto;

  constructor(partial: Partial<CreateBookDto>) {
    Object.assign(this, partial);
  }
}
