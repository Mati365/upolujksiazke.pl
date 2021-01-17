import {
  IsBoolean, IsEnum,
  IsNumber, IsOptional,
} from 'class-validator';

import {ImageVersion} from '../entity/ImageAttachment.entity';
import {CreateAttachmentDto} from './CreateAttachment.dto';

export class CreateImageAttachmentDto extends CreateAttachmentDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsEnum(ImageVersion)
  readonly version: ImageVersion;

  @IsOptional()
  @IsBoolean()
  readonly nsfw: boolean;

  @IsOptional()
  @IsNumber()
  readonly ratio: number;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<CreateImageAttachmentDto>) {
    super(partial);
  }
}
