import {Type} from 'class-transformer';
import {
  IsDefined, IsNotEmpty,
  IsOptional, IsNumber,
  IsString, IsBoolean,
  ValidateNested,
} from 'class-validator';

import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateRemoteRecordDto} from '@server/modules/remote/dto/CreateRemoteRecord.dto';

export class CreateRemoteWebsiteDto extends CreateRemoteRecordDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly url: string;

  @IsOptional()
  @IsBoolean()
  readonly withSubdomains: boolean;

  @IsString()
  @IsOptional()
  readonly title: string;

  @IsString()
  @IsOptional()
  readonly description: string;

  @ValidateNested()
  @Type(() => CreateImageAttachmentDto)
  readonly logo: CreateImageAttachmentDto;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<CreateRemoteWebsiteDto>) {
    super(partial);
  }
}
