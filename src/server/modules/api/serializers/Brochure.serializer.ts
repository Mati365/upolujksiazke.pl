import {Expose, Type} from 'class-transformer';

import {BrochureRecord} from '@api/types/Brochure.record';
import {BaseDatedSerialized} from './Base.serializer';
import {TagSerializer} from './Tag.serializer';
import {BrandSerializer} from './Brand.serializer';
import {BrochurePageSerializer} from './BrochurePage.serializer';
import {DurationSerializer} from './Duration.serializer';

export class BrochureSerializer extends BaseDatedSerialized implements BrochureRecord {
  @Expose() title: string;
  @Expose() parameterizedName: string;
  @Expose() nsfw: boolean;
  @Expose() totalPages: number;
  @Expose() url: string;

  @Expose()
  @Type(() => DurationSerializer)
  valid: DurationSerializer;

  @Expose()
  @Type(() => BrandSerializer)
  brand: BrandSerializer;

  @Expose()
  @Type(() => TagSerializer)
  tags: TagSerializer[];

  @Expose()
  @Type(() => BrochurePageSerializer)
  pages: BrochurePageSerializer[];
}
