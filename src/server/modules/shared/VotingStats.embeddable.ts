import {IsNumber, IsOptional} from 'class-validator';
import {Column} from 'typeorm';

export class VotingStatsEmbeddable {
  @IsOptional()
  @IsNumber()
  @Column('int', {default: 0})
  upvotes: number;

  @IsOptional()
  @IsNumber()
  @Column('int', {default: 0})
  downvotes: number;

  @IsOptional()
  @IsNumber()
  @Column('int', {default: 0})
  comments: number;

  constructor(partial: Partial<VotingStatsEmbeddable>) {
    Object.assign(this, partial);
  }
}
