import {IsNumber, IsOptional} from 'class-validator';
import {CreateRemoteRecordDto} from '@server/modules/remote/dto/CreateRemoteRecord.dto';

export class CreateBookAvailabilityDto extends CreateRemoteRecordDto {
  @IsOptional()
  @IsNumber()
  readonly volumeId: number;

  @IsOptional()
  @IsNumber()
  readonly bookId: number;

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

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<CreateBookAvailabilityDto>) {
    super(partial);
  }
}
