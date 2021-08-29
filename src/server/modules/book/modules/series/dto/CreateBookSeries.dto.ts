import {
  IsBoolean,
  IsDefined, IsNotEmpty, IsNumber,
  IsOptional, IsString,
} from 'class-validator';

export class CreateBookSeriesDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsBoolean()
  readonly hierarchic: boolean;

  constructor(partial: Partial<CreateBookSeriesDto>) {
    Object.assign(this, partial);
  }
}
