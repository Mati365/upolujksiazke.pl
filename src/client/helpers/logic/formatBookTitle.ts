import {BookCardRecord} from '@api/types/BookCard.record';
import {LangTranslateFn} from '@client/i18n/utils/createLangPack';

export function formatBookTitle(
  {
    t,
    book: {
      defaultTitle,
      volume,
    },
  }: {
    t: LangTranslateFn,
    book: BookCardRecord,
  },
) {
  if (!volume || volume.name === '1')
    return defaultTitle;

  return `${defaultTitle} - ${t('shared.book.volume')} ${volume.name}`;
}
