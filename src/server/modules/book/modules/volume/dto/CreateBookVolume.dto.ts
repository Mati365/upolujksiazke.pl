import {
  IsDefined, IsNotEmpty, IsNumber,
  IsOptional, IsString,
} from 'class-validator';

export class CreateBookVolumeDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @IsNumber()
  readonly releaseId: number;

  @IsDefined()
  @IsNumber()
  readonly bookId: number;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly name: string;
}