import {
  IsDefined, IsNumber,
  IsOptional, IsString,
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

  constructor(partial: Partial<CreateRemoteRecordDto>) {
    Object.assign(this, partial);
  }
}
