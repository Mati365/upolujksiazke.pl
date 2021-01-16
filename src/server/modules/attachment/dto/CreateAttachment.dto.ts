import {IsNumber, IsOptional, IsString, ValidateNested} from 'class-validator';
import {UploadedFileDto} from './UploadedFile.dto';

export class CreateAttachmentDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsOptional()
  @IsString()
  readonly originalUrl: string;

  @IsOptional()
  @IsString()
  readonly name: string;

  @ValidateNested()
  readonly file: UploadedFileDto;

  constructor(partial: Partial<CreateAttachmentDto>) {
    Object.assign(this, partial);
  }
}
