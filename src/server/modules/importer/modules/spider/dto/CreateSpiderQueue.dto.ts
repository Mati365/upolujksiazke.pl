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

  @IsDefined()
  @IsNumber()
  readonly priority: number;

  constructor(partial: Partial<CreateSpiderQueueDto>) {
    Object.assign(this, partial);
  }
}
