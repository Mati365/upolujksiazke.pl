import {
  IsDefined, IsNumber, ValidateNested,
  IsOptional, IsString,
} from 'class-validator';

import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';

export class CreateBrandDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @IsNumber()
  readonly websiteId: number;

  @IsDefined()
  @IsString()
  readonly name: string;

  @IsDefined()
  @IsString()
  readonly parameterizedName: string;

  @IsOptional()
  @IsString()
  readonly description: string;

  @IsOptional()
  @ValidateNested()
  readonly logo: CreateImageAttachmentDto;

  constructor(partial: Partial<CreateBrandDto>) {
    Object.assign(this, partial);
  }
}
