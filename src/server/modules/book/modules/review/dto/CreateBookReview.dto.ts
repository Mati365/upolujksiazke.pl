import {Type} from 'class-transformer';
import {
  IsDate, IsDefined, IsNumber,
  IsOptional, IsString, ValidateNested,
} from 'class-validator';

import {VotingStatsEmbeddable} from '@server/modules/shared/VotingStats.embeddable';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateRemoteRecordDto} from '@server/modules/remote/dto/CreateRemoteRecord.dto';
import {CreateBookReviewerDto} from '../../reviewer/dto/CreateBookReviewer.dto';

export class CreateBookReviewDto {
  @IsDefined()
  @Type(() => CreateBookReviewerDto)
  @ValidateNested()
  readonly reviewer: CreateBookReviewerDto;

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

  @Type(() => CreateRemoteRecordDto)
  @IsDefined()
  @ValidateNested()
  readonly remote: CreateRemoteRecordDto;

  constructor(partial: Partial<CreateBookReviewDto>) {
    Object.assign(this, partial);
  }
}
