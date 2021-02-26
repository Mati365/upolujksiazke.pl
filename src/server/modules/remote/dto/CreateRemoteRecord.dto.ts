import {Transform} from 'class-transformer';
import {
  IsDefined, IsNumber,
  IsOptional, IsString, IsUrl,
} from 'class-validator';

import {safeToString} from '@shared/helpers';

export class CreateRemoteRecordDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @Transform(({value}) => safeToString(value), {toClassOnly: true})
  @IsString()
  readonly remoteId: string;

  @IsDefined()
  @IsNumber()
  readonly websiteId: number;

  @IsOptional()
  @IsString()
  @IsUrl()
  readonly url: string;

  constructor(partial: Partial<CreateRemoteRecordDto>) {
    Object.assign(this, partial);
  }
}
