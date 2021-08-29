import {BookSummaryKind} from '@shared/enums';
import {BookSummaryHeaderRecord} from './BookSummaryHeader.record';
import {RemoteArticleRecord} from './RemoteArticle.record';
import {APIRecord} from '../APIRecord';

export interface BookSummaryRecord extends APIRecord {
  kind: BookSummaryKind;
  article: RemoteArticleRecord;
  headers: BookSummaryHeaderRecord[];
}
