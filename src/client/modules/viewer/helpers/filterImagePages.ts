import {filter, isNil} from 'ramda';
import {BrochurePageKind, BrochurePageRecord} from '@api/types';

export function isImagePage(page: BrochurePageRecord) {
  return !!page && (isNil(page.kind) || page.kind === BrochurePageKind.IMAGE);
}

export function filterImagePages(pages: BrochurePageRecord[]): BrochurePageRecord[] {
  return filter(isImagePage, pages);
}
