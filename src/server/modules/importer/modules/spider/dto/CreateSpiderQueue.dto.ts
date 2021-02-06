import {
  IsBoolean, IsDefined,
  IsNumber, IsString,
} from 'class-validator';

export class CreateSpiderQueueDto {
  @IsDefined()
  @IsNumber()
  readonly websiteId: number;

  @IsDefined()
  @IsString()
  readonly path: string;

  @IsDefined()
  @IsBoolean()
  readonly processed: boolean;

  constructor(partial: Partial<CreateSpiderQueueDto>) {
    Object.assign(this, partial);
  }
}
