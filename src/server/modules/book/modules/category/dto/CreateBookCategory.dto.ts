import {
  IsDefined, IsNotEmpty, IsNumber,
  IsOptional, IsString,
} from 'class-validator';

import {IsUniqueValue} from '@server/common/validators/IsUniqueValue';

export class CreateBookCategoryDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsUniqueValue(
    {
      repository: 'BookCategoryEntity',
      message: 'Book category with provided name already exists!',
    },
  )
  readonly name: string;

  constructor(partial: Partial<CreateBookCategoryDto>) {
    Object.assign(this, partial);
  }
}
