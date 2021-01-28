import {
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
  @IsNumber()
  readonly publisherId: number;
}
