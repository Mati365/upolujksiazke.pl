import {
  IsDefined, IsNumber,
  IsOptional, IsString,
} from 'class-validator';

export class CreateBookAliasDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @IsString()
  readonly srcSlug: string;

  @IsDefined()
  @IsString()
  readonly destSlug: string;

  constructor(partial: Partial<CreateBookAliasDto>) {
    Object.assign(this, partial);
  }
}
