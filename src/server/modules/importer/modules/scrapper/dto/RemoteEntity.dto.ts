import {
  IsDefined, IsNumber,
  IsOptional, IsString,
} from 'class-validator';

export class RemoteEntityDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @IsString()
  readonly remoteId: string;

  @IsDefined()
  @IsNumber()
  readonly websiteId: number;

  constructor(partial: Partial<RemoteEntityDto>) {
    Object.assign(this, partial);
  }
}
