import {
  IsDate, IsDefined, IsNumber,
  IsOptional, IsString,
} from 'class-validator';

export class CreateBookReleaseDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsOptional()
  @IsDate()
  readonly publishDate: Date;

  @IsOptional()
  @IsString()
  readonly place: string;

  @IsString()
  readonly isbn: string;

  @IsString()
  readonly totalPages: number;

  @IsDefined()
  @IsNumber()
  readonly publisherId: number;

  @IsOptional()
  @IsString()
  readonly format: string; // todo: maybe add enum for Audiobooks?

  constructor(partial: Partial<CreateBookReleaseDto>) {
    Object.assign(this, partial);
  }
}
