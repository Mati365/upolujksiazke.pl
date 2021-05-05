import {Transform} from 'class-transformer';
import {IsNumber, IsOptional, Max} from 'class-validator';

export class APIPaginationDto {
  @IsOptional()
  @Transform(({value}) => Number.parseInt(value, 10))
  @IsNumber()
  offset: number = 0;

  @IsOptional()
  @Transform(({value}) => Number.parseInt(value, 10))
  @IsNumber()
  @Max(70)
  limit: number = 10;
}
