import {APIRecord} from '../APIRecord';
import {VoteStatsRecord} from './VoteStatsRecord.record';
import {BookReviewerRecord} from './BookReviewer.record';
import {WebsiteRecord} from './Website.record';

export interface BookReviewRecord extends APIRecord {
  url: string;
  publishDate: Date;
  description: string;
  rating: number;
  stats: VoteStatsRecord;
  reviewer: BookReviewerRecord;
  website: WebsiteRecord;
}
