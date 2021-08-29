import {
  IsDefined, IsNotEmpty,
  IsOptional, IsString,
} from 'class-validator';

export class CreateBookGenreDto {
  @IsOptional()
  @IsString()
  readonly parameterizedName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  constructor(partial: Partial<CreateBookGenreDto>) {
    Object.assign(this, partial);
  }
}
