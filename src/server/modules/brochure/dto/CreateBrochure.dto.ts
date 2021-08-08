import {Type} from 'class-transformer';
import {
  IsDefined, IsNumber, IsString,
  IsOptional, ArrayMaxSize, IsDate,
  IsBoolean, ValidateNested,
} from 'class-validator';

import {IsTagCorrect} from '@server/modules/tag/validators/IsTagCorrect';
import {CreateRemoteRecordDto} from '@server/modules/remote/dto/CreateRemoteRecord.dto';
import {CreateBrandDto} from '@server/modules/brand/dto/CreateBrand.dto';
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

  @IsOptional()
  @IsBoolean()
  readonly nsfw: boolean;

  @IsOptional()
  @IsNumber()
  readonly brandId: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateBrandDto)
  readonly brand: CreateBrandDto;

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

  @IsOptional()
  @IsString()
  readonly pdfUrl: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateBrochurePageDto)
  readonly pages: CreateBrochurePageDto[];

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<CreateBrochureDto>) {
    super(partial);
  }
}
