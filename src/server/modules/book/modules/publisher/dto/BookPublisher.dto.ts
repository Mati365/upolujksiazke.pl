import {
  IsDefined, IsEmail, IsNumber,
  IsOptional, IsString, ValidateNested,
} from 'class-validator';

import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';

export class CreateBookPublisherDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly parameterizedName: string;

  @IsOptional()
  @IsString()
  readonly websiteURL: string;

  @IsOptional()
  @IsString()
  readonly description: string;

  @IsOptional()
  @IsString()
  readonly address: string;

  @IsOptional()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @ValidateNested()
  readonly logo: CreateImageAttachmentDto;

  constructor(partial: Partial<CreateBookPublisherDto>) {
    Object.assign(this, partial);
  }
}
