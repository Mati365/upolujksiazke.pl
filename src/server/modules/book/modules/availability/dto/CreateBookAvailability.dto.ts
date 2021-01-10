import {IsDefined, IsNumber, IsOptional} from 'class-validator';

export class CreateBookAvailabilityDto {
  @IsDefined()
  @IsNumber()
  readonly remoteId: number;

  @IsOptional()
  @IsNumber()
  readonly prevPrice: number;

  @IsOptional()
  @IsNumber()
  readonly price: number;

  constructor(partial: Partial<CreateBookAvailabilityDto>) {
    Object.assign(this, partial);
  }
}
