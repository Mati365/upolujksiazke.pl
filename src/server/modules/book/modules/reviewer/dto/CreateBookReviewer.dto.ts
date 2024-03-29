import {Type} from 'class-transformer';
import {
  IsDefined, IsNotEmpty,
  IsOptional, IsNumber,
  IsString, ValidateNested, IsEnum,
} from 'class-validator';

import {Gender} from '@shared/types';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateRemoteRecordDto} from '@server/modules/remote/dto/CreateRemoteRecord.dto';

export class CreateBookReviewerDto extends CreateRemoteRecordDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsEnum(Gender)
  readonly gender: Gender;

  @ValidateNested()
  @Type(() => CreateImageAttachmentDto)
  readonly avatar: CreateImageAttachmentDto;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<CreateBookReviewerDto>) {
    super(partial);
  }
}
