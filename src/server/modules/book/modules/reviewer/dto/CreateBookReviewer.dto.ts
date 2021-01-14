import {Type} from 'class-transformer';
import {
  IsDefined, IsNotEmpty,
  IsOptional, IsNumber,
  IsString, ValidateNested, IsEnum,
} from 'class-validator';

import {Gender} from '@shared/types';
import {CreateRemoteRecordDto} from '@server/modules/remote/dto/CreateRemoteRecord.dto';
import {CreateAttachmentDto} from '@server/modules/attachment/dto';

export class CreateBookReviewerDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @ValidateNested()
  readonly remote: CreateRemoteRecordDto;

  @IsDefined()
  @IsNumber()
  readonly websiteId: number;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsEnum(Gender)
  readonly gender: Gender;

  @ValidateNested()
  @Type(() => CreateAttachmentDto)
  @ValidateNested()
  readonly avatar: CreateAttachmentDto;

  constructor(partial: Partial<CreateBookReviewerDto>) {
    Object.assign(this, partial);
  }
}
