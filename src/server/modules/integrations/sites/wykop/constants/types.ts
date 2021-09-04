import {BookCardRecord} from '@api/types';

export interface WykopOptionalMatchReview {
  id: number;
  remoteId: string;
  url: string;
  rating: number;
  createdAt: Date;
  defaultTitle: string;
  author: string;
  upvotes: number;
  reviewer: string;
  matchedBook?: BookCardRecord,
}

export interface CommentedBookStats {
  avgRatings: number;
  totalReviews: number;
  totalReviewerReviews: number;
}
