import {
  IsDefined, IsNotEmpty,
  IsOptional, IsString,
} from 'class-validator';

export class CreateBookEraDto {
  @IsOptional()
  @IsString()
  readonly parameterizedName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  constructor(partial: Partial<CreateBookEraDto>) {
    Object.assign(this, partial);
  }
}
