import {Type} from 'class-transformer';
import {
  IsDefined, IsEnum, IsNumber,
  IsOptional, ValidateNested,
} from 'class-validator';

import {BookSummaryKind} from '@shared/enums/bookSummaries';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateRemoteArticleDto} from '@server/modules/remote/dto/CreateRemoteArticle.dto';
import {CreateBookSummaryHeaderDto} from './CreateBookSummaryHeader.dto';

export class CreateBookSummaryDto {
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @IsDefined()
  @IsNumber()
  readonly bookId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => CreateBookDto)
  readonly book: CreateBookDto;

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
    Object.assign(this, partial);
  }

  get url() {
    return this.article?.url;
  }
}
