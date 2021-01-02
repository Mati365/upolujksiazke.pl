import {
  IsDefined, IsNumber,
  IsOptional, IsString,
} from 'class-validator';

export class RemoteRecordDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @IsString()
  readonly remoteId: string;

  @IsDefined()
  @IsNumber()
  readonly websiteId: number;

  constructor(partial: Partial<RemoteRecordDto>) {
    Object.assign(this, partial);
  }
}
