import {IsOptional, IsString} from 'class-validator';
import {IsTagCorrect} from '../validators/IsTagCorrect';

export class CreateTagDto {
  @IsTagCorrect()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly parameterizedName: string;

  constructor(partial: Partial<CreateTagDto>) {
    Object.assign(this, partial);
  }
}
