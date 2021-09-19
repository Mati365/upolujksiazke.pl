import {APIRecord} from '../APIRecord';
import {WebsiteRecord} from './Website.record';

export interface BookAvailabilityRecord extends APIRecord {
  prevPrice: number;
  price: number;
  avgRating: number;
  totalRatings: number;
  inStock: boolean;
  inAbonament: boolean;
  url: string;
  website: WebsiteRecord;
}
