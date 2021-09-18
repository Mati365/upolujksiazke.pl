import {Injectable, Inject, CACHE_MANAGER} from '@nestjs/common';
import {EntityManager} from 'typeorm';
import {Request} from 'express';
import {Cache} from 'cache-manager';

import {
  JWT_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '@client/constants/cookies';

import {BookCategoryService} from '@server/modules/book/modules/category';
import {TagService} from '@server/modules/tag/Tag.service';
import {BookTagsStatsService} from '@server/modules/book/modules/stats/services/BookTagsStats.service';
import {BookTagsService} from '@server/modules/book/modules/tags/BookTags.service';
import {BookService} from '@server/modules/book/services/Book.service';
import {BookAuthorService} from '@server/modules/book/modules/author/BookAuthor.service';
import {BookReviewService} from '@server/modules/book/modules/review/BookReview.service';
import {TrackRecordViewsService} from '@server/modules/tracker/service/TrackRecordViews.service';
import {UserService} from '@server/modules/user/User.service';
import {EsCardBrochureSearchService} from '@server/modules/brochure/services/search/EsCardBrochureSearch.service';
import {BrandService} from '@server/modules/brand/Brand.service';
// eslint-disable-next-line max-len
import {BookSimilarityFilterService} from '@server/modules/recommendation/modules/BookRecommendation/BookSimilarityFilter.service';

import {DecodedJWT, JWTTokens} from '@api/jwt';
import {
  SafeInjectRequest,
  safeRequestScope,
} from '@server/modules/nop';

import {
  CardBookSearchService,
  EsCardBookSearchService,
} from '@server/modules/book/modules/search/service';

import {ServerAPIClient} from '../client/ServerAPIClient';

@Injectable(
  {
    scope: safeRequestScope(),
  },
)
export class APIClientService {
  public readonly client = new ServerAPIClient(this);

  public decodedJWT: DecodedJWT = null;
  public refreshJWTToken: string = null;

  constructor(
    @Inject(CACHE_MANAGER) public readonly cacheManager: Cache,
    @SafeInjectRequest() public readonly request: Request,
    public readonly entityManager: EntityManager,
    public readonly bookService: BookService,
    public readonly bookCategoryService: BookCategoryService,
    public readonly cardBookSearchService: CardBookSearchService,
    public readonly bookSimilarityFilterService: BookSimilarityFilterService,
    public readonly esCardBookSearchService: EsCardBookSearchService,
    public readonly esBrochureSearchService: EsCardBrochureSearchService,
    public readonly brandsService: BrandService,
    public readonly tagsService: TagService,
    public readonly bookTagsService: BookTagsService,
    public readonly bookTagsStatsService: BookTagsStatsService,
    public readonly bookAuthorService: BookAuthorService,
    public readonly bookReviewService: BookReviewService,
    public readonly trackerService: TrackRecordViewsService,
    public readonly userService: UserService,
  ) {
    this.decodedJWT = this.getDecryptedJWT();
    this.refreshJWTToken = this.getRefreshJWTToken();
  }

  private getRefreshJWTToken() {
    return this.request.cookies?.[REFRESH_TOKEN_COOKIE];
  }

  private getDecryptedJWT() {
    const token = this.request.cookies?.[JWT_TOKEN_COOKIE];

    return UserService.parseJWTToken(token);
  }

  public setJWTTokens(tokens: JWTTokens) {
    this.decodedJWT = UserService.parseJWTToken(tokens.token);
    this.refreshJWTToken = tokens.refreshToken;
  }
}
