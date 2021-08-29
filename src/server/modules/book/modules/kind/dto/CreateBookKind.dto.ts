import {
  IsDefined, IsNotEmpty, IsNumber,
  IsOptional, IsString,
} from 'class-validator';

import {IsUniqueValue} from '@server/common/validators/IsUniqueValue';

export class CreateBookKindDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsUniqueValue(
    {
      repository: 'BookKindEntity',
      message: 'Book kind with provided name already exists!',
    },
  )
  readonly name: string;

  constructor(partial: Partial<CreateBookKindDto>) {
    Object.assign(this, partial);
  }
}
