import {CreateImageAttachmentDto} from '@server/modules/attachment/dto/CreateImageAttachment.dto';
import {
  IsDefined, IsNumber,
  IsOptional, ValidateNested,
} from 'class-validator';

export class CreateBrochurePageDto {
  @IsOptional()
  @IsNumber()
  readonly index: number;

  @IsDefined()
  @IsNumber()
  readonly brochureId: number;

  @ValidateNested()
  @IsOptional()
  readonly image: CreateImageAttachmentDto;

  constructor(partial: Partial<CreateBrochurePageDto>) {
    Object.assign(this, partial);
  }
}
