import {Expose, Type} from 'class-transformer';

import {BookSummaryRecord} from '@api/types';
import {BookSummaryKind} from '@shared/enums';
import {BaseSerializer} from './Base.serializer';
import {BookSummaryHeaderSerializer} from './BookSummaryHeader.serializer';
import {RemoteArticleSerializer} from './RemoteArticle.serializer';

export class BookSummarySerializer extends BaseSerializer implements BookSummaryRecord {
  @Expose() kind: BookSummaryKind;

  @Expose()
  @Type(() => RemoteArticleSerializer)
  article: RemoteArticleSerializer;

  @Expose()
  @Type(() => BookSummaryHeaderSerializer)
  headers: BookSummaryHeaderSerializer[];
}
