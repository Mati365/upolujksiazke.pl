import {Type} from 'class-transformer';
import {
  IsDefined, IsEnum, IsNumber,
  IsOptional, ValidateNested,
} from 'class-validator';

import {BookSummaryKind} from '@shared/enums/bookSummaries';

import {CreateRemoteArticleDto} from '@server/modules/remote/dto/CreateRemoteArticle.dto';
import {CreateRemoteRecordDto} from '@server/modules/remote/dto/CreateRemoteRecord.dto';
import {CreateBookSummaryHeaderDto} from './CreateBookSummaryHeader.dto';

export class CreateBookSummaryDto extends CreateRemoteRecordDto {
  @IsDefined()
  @IsNumber()
  readonly bookId: number;

  @IsDefined()
  @ValidateNested()
  @Type(() => CreateBookSummaryHeaderDto)
  readonly headers: CreateBookSummaryHeaderDto[];

  @IsOptional()
  @IsEnum(BookSummaryKind)
  readonly kind: BookSummaryKind;

  @IsDefined()
  @ValidateNested()
  @Type(() => CreateRemoteArticleDto)
  readonly article: CreateRemoteArticleDto;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<CreateBookSummaryDto>) {
    super(partial);
  }
}
