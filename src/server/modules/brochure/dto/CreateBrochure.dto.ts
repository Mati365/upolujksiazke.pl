import {Type} from 'class-transformer';
import {
  IsDefined, IsNumber, IsString,
  IsOptional, ArrayMaxSize, IsDate,
  ValidateNested,
} from 'class-validator';

import {IsTagCorrect} from '@server/modules/tag/validators/IsTagCorrect';
import {CreateRemoteRecordDto} from '@server/modules/remote/dto/CreateRemoteRecord.dto';
import {CreateBrochurePageDto} from '../modules/brochure-page/dto/BrochurePage.dto';

export class CreateBrochureDto extends CreateRemoteRecordDto {
  @IsDefined()
  @IsString()
  readonly title: string;

  @IsDefined()
  @IsString()
  readonly parameterizedName: string;

  @IsOptional()
  @IsDate()
  readonly validFrom: Date;

  @IsOptional()
  @IsDate()
  readonly validTo: Date;

  @IsDefined()
  @IsNumber()
  readonly brandId: number;

  @IsOptional()
  @ArrayMaxSize(25)
  @IsTagCorrect(
    {
      each: true,
    },
  )
  readonly tags: string[];

  @IsOptional()
  @IsNumber()
  readonly totalPages: number;

  @IsDefined()
  @ValidateNested()
  @Type(() => CreateBrochurePageDto)
  readonly pages: CreateBrochurePageDto[];

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<CreateBrochureDto>) {
    super(partial);
  }
}
