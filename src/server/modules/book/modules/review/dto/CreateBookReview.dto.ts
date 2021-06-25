import {Type, Transform} from 'class-transformer';
import {
  IsBoolean,
  IsDate, IsDefined, IsNumber,
  IsOptional, IsString, ValidateNested,
} from 'class-validator';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateRemoteRecordDto} from '@server/modules/remote/dto/CreateRemoteRecord.dto';
import {CreateBookReviewerDto} from '../../reviewer/dto/CreateBookReviewer.dto';

export class CreateBookReviewDto extends CreateRemoteRecordDto {
  @IsDefined()
  @Type(() => CreateBookReviewerDto)
  @ValidateNested()
  readonly reviewer: CreateBookReviewerDto;

  @IsOptional()
  @IsNumber()
  readonly reviewerId: number;

  @IsOptional()
  @IsNumber()
  readonly rating: number;

  @Transform(({value}) => new Date(value), {toClassOnly: true})
  @IsOptional()
  @IsDate()
  readonly publishDate: Date;

  @IsOptional()
  @IsString()
  readonly description: string;

  @Type(() => CreateBookDto)
  @IsOptional()
  @ValidateNested()
  readonly book: CreateBookDto;

  @IsDefined()
  @IsNumber()
  readonly bookId: number;

  @IsOptional()
  @IsNumber()
  readonly releaseId: number;

  @IsOptional()
  @IsBoolean()
  readonly includeInStats: boolean;

  @IsOptional()
  @IsBoolean()
  readonly hiddenContent: boolean;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<CreateBookReviewDto>) {
    super(partial);
  }

  getReleaseISBN() {
    return this.book?.releases?.[0]?.isbn;
  }
}
