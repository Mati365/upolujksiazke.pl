import {IsBoolean, IsEnum, IsNumber, IsOptional} from 'class-validator';
import {BookSchoolLevel} from '@shared/enums';

export class CreateSchoolBookDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsEnum(BookSchoolLevel)
  @IsOptional()
  readonly schoolLevel: BookSchoolLevel;

  @IsOptional()
  @IsBoolean()
  readonly obligatory: boolean;

  constructor(partial: Partial<CreateSchoolBookDto>) {
    Object.assign(this, partial);
  }
}
