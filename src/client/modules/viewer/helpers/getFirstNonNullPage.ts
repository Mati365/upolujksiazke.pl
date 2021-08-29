import {BrochurePageRecord} from '@api/types';

export function getFirstNonNullPage(pages: BrochurePageRecord[]): BrochurePageRecord {
  return pages[0] ?? pages[1];
}
