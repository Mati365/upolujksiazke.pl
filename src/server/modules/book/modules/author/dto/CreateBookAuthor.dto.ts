import {
  IsDefined, IsNotEmpty, IsNumber,
  IsOptional, IsString,
} from 'class-validator';

import {IsUniqueValue} from '@server/common/validators/IsUniqueValue';

export class CreateBookAuthorDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsUniqueValue(
    {
      repository: 'BookAuthorEntity',
      message: 'Book author with provided name already exists!',
    },
  )
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly description: string;

  constructor(partial: Partial<CreateBookAuthorDto>) {
    Object.assign(this, partial);
  }
}
