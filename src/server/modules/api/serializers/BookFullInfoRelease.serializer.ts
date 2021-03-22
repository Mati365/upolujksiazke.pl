import {Expose, Type} from 'class-transformer';

import {
  BookBindingKind,
  BookProtection,
  BookType,
  Language,
} from '@shared/enums';

import {BookFullInfoReleaseRecord} from '@api/types/BookFullInfoRelease.record';
import {BookCardReleaseSerializer} from './BookCardRelease.serializer';
import {BookPublisherSerializer} from './BookPublisher.serializer';
import {BookAvailabilitySerializer} from './BookAvailability.serializer';
import {WebsiteSerializer} from './Website.serializer';

export class BookFullInfoReleaseSerializer extends BookCardReleaseSerializer implements BookFullInfoReleaseRecord {
  @Expose() title: string;
  @Expose() binding: BookBindingKind;
  @Expose() type: BookType;
  @Expose() protection: BookProtection;
  @Expose() lang: Language;
  @Expose() place: string;
  @Expose() format: string;
  @Expose() publishDate: string;
  @Expose() totalPages: number;
  @Expose() description: string;
  @Expose() edition: string;
  @Expose() translator: string[];
  @Expose() defaultPrice: number;
  @Expose() isbn: string;
  @Expose() weight: number;
  @Expose() recordingLength: number;
  @Expose() parameterizedSlug: string;

  @Expose()
  @Type(() => BookPublisherSerializer)
  publisher: BookPublisherSerializer;

  @Expose()
  @Type(() => BookAvailabilitySerializer)
  availability: BookAvailabilitySerializer[];

  @Expose()
  @Type(() => WebsiteSerializer)
  website: WebsiteSerializer;
}
