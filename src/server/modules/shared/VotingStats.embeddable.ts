import {Column} from 'typeorm';

export class VotingStatsEmbeddable {
  @Column('int', {default: 0})
  upvotes: number;

  @Column('int', {default: 0})
  downvotes: number;

  @Column('int', {default: 0})
  comments: number;

  constructor(partial: Partial<VotingStatsEmbeddable>) {
    Object.assign(this, partial);
  }
}
