import {
  IsBoolean, IsDefined, IsNumber,
  IsOptional, IsString, ValidateNested,
} from 'class-validator';

import {UploadedFileDto} from './UploadedFile.dto';

export class CreateAttachmentDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsOptional()
  @IsString()
  readonly originalUrl: string;

  @IsDefined()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsBoolean()
  readonly nsfw: boolean;

  @IsOptional()
  @IsNumber()
  readonly ratio: number;

  @ValidateNested()
  readonly file: UploadedFileDto;

  constructor(partial: Partial<CreateAttachmentDto>) {
    Object.assign(this, partial);
  }
}
