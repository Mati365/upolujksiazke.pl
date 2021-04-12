import {Type} from 'class-transformer';
import {IsOptional, IsString, ValidateNested} from 'class-validator';

import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateRemoteRecordDto} from '@server/modules/remote/dto/CreateRemoteRecord.dto';

export class CreateRemoteArticleDto extends CreateRemoteRecordDto {
  @IsString()
  @IsOptional()
  readonly title: string;

  @IsString()
  @IsOptional()
  readonly description: string;

  @ValidateNested()
  @Type(() => CreateImageAttachmentDto)
  readonly cover: CreateImageAttachmentDto;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<CreateRemoteArticleDto>) {
    super(partial);
  }
}
