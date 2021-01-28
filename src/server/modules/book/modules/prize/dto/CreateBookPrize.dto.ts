import {
  IsDefined, IsNotEmpty, IsNumber,
  IsOptional, IsString, IsUrl,
} from 'class-validator';

import {IsUniqueValue} from '@server/common/validators/IsUniqueValue';

export class CreateBookPrizeDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsUniqueValue(
    {
      repository: 'BookPrizeEntity',
      message: 'Book prize with provided name already exists!',
    },
  )
  readonly name: string;

  @IsOptional()
  @IsUrl()
  readonly wikiUrl: string;

  constructor(partial: Partial<CreateBookPrizeDto>) {
    Object.assign(this, partial);
  }
}
