import {Type} from 'class-transformer';
import {
  IsDate, IsDefined, IsNumber,
  IsOptional, IsString, ValidateNested,
} from 'class-validator';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {VotingStatsEmbeddable} from '@server/modules/shared/VotingStats.embeddable';
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

  @IsDefined()
  @IsNumber()
  readonly rating: number;

  @IsOptional()
  @IsDate()
  readonly publishDate: Date;

  @IsDefined()
  @IsString()
  readonly description: string;

  @Type(() => VotingStatsEmbeddable)
  @IsOptional()
  @ValidateNested()
  readonly stats: VotingStatsEmbeddable;

  @Type(() => CreateBookDto)
  @IsDefined()
  @ValidateNested()
  readonly book: CreateBookDto;

  @IsDefined()
  @IsNumber()
  readonly bookId: number;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<CreateBookReviewDto>) {
    super(partial);
  }
}
