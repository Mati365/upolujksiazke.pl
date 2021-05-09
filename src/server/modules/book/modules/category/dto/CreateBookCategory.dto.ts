import {
  IsDefined, IsNotEmpty, IsNumber,
  IsOptional, IsString, IsBoolean,
} from 'class-validator';

import {IsUniqueValue} from '@server/common/validators/IsUniqueValue';

export class CreateBookCategoryDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsOptional()
  @IsBoolean()
  readonly root: boolean;

  @IsOptional()
  @IsNumber()
  readonly parentCategoryId: number;

  @IsOptional()
  @IsString()
  @IsUniqueValue(
    {
      repository: 'BookCategoryEntity',
      message: 'Book category with provided name already exists!',
    },
  )
  readonly parameterizedName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString({each: true})
  readonly nameAliases: string[];

  constructor(partial: Partial<CreateBookCategoryDto>) {
    Object.assign(this, partial);
  }
}
