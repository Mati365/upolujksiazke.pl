import {
  IsDefined, IsNotEmpty, IsNumber,
  IsOptional, IsString,
} from 'class-validator';

export class CreateBookAuthorDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @IsString()
  readonly parameterizedName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly description: string;

  constructor(partial: Partial<CreateBookAuthorDto>) {
    Object.assign(this, partial);
  }
}
