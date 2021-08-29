import {APIRecord} from '../APIRecord';
import {BrandRecord} from './Brand.record';
import {BrochurePageRecord} from './BrochurePage.record';
import {TagRecord} from './Tag.record';
import {DurationRecord} from './Duration.record';

export interface BrochureRecord extends APIRecord {
  title: string;
  parameterizedName: string;
  url: string;
  nsfw: boolean;
  valid: DurationRecord;
  brand: BrandRecord;
  tags: TagRecord[];
  totalPages: number;
  pages: BrochurePageRecord[];
}
