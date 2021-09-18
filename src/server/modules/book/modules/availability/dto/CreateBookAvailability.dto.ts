import {IsNumber, IsOptional, IsBoolean} from 'class-validator';
import {CreateRemoteRecordDto} from '@server/modules/remote/dto/CreateRemoteRecord.dto';

export class CreateBookAvailabilityDto extends CreateRemoteRecordDto {
  @IsOptional()
  @IsNumber()
  readonly releaseId: number;

  @IsOptional()
  @IsNumber()
  readonly prevPrice: number;

  @IsOptional()
  @IsNumber()
  readonly price: number;

  @IsOptional()
  @IsNumber()
  readonly avgRating: number;

  @IsOptional()
  @IsNumber()
  readonly totalRatings: number;

  @IsOptional()
  @IsBoolean()
  readonly inStock: boolean;

  @IsOptional()
  @IsBoolean()
  readonly inAbonament: boolean;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<CreateBookAvailabilityDto>) {
    super(partial);
  }
}
