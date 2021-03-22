import {
  BookBindingKind,
  BookProtection,
  BookType,
  Language,
} from '@shared/enums';

import {BookCardReleaseRecord} from './BookCardRelease.record';
import {BookPublisherRecord} from './BookPublisher.record';

export interface BookFullInfoReleaseRecord extends BookCardReleaseRecord {
  title: string;
  binding: BookBindingKind;
  type: BookType;
  protection: BookProtection;
  publisher: BookPublisherRecord,
  lang: Language;
  place: string;
  format: string;
  publishDate: string;
  totalPages: number;
  description: string;
  edition: string;
  translator: string[];
  defaultPrice: number;
  isbn: string;
  weight: number;
  recordingLength: number;
  parameterizedSlug: string;
}
