import {
  IsDefined, IsNotEmpty, IsNumber,
  IsOptional, IsString,
} from 'class-validator';

export const DEFAULT_BOOK_VOLUME_NAME = '1';

export class CreateBookVolumeDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @IsNumber()
  readonly bookId: number;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  constructor(partial: Partial<CreateBookVolumeDto>) {
    Object.assign(this, partial);
  }
}
