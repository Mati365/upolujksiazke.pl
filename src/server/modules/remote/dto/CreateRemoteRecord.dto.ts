import {
  IsDefined, IsNumber,
  IsOptional, IsString, IsUrl,
} from 'class-validator';

export class CreateRemoteRecordDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
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
