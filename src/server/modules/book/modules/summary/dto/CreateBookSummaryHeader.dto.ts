import {IsDefined, IsNumber, IsString} from 'class-validator';
import {CreateRemoteRecordDto} from '@server/modules/remote/dto/CreateRemoteRecord.dto';

export class CreateBookSummaryHeaderDto extends CreateRemoteRecordDto {
  @IsDefined()
  @IsString()
  readonly title: string;

  @IsDefined()
  @IsString()
  readonly url: string;

  @IsDefined()
  @IsNumber()
  readonly summaryId: number;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<CreateBookSummaryHeaderDto>) {
    super(partial);
  }
}
