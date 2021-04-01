import {BookCardRecord} from '@api/types/BookCard.record';
import {BookFullInfoReleaseRecord} from '@api/types';
import {LangTranslateFn} from '@client/i18n/utils/createLangPack';

export function formatBookTitle(
  {
    t,
    withDefaultVolumeName,
    book: {
      defaultTitle,
      volume,
    },
  }: {
    t: LangTranslateFn,
    book: Pick<BookCardRecord, 'defaultTitle'|'volume'>,
    withDefaultVolumeName?: boolean,
  },
) {
  if (!volume || (!withDefaultVolumeName && volume.name === '1'))
    return defaultTitle;

  return `${defaultTitle} - ${t('shared.book.volume')} ${volume.name}`;
}

export function formatReleaseTitle(
  {
    t,
    book,
    release,
  }: {
    t: LangTranslateFn,
    book: BookCardRecord,
    release: BookFullInfoReleaseRecord,
  },
) {
  const {isbn, format, binding} = release;

  const suffix = [];
  const title = formatBookTitle(
    {
      t,
      book,
    },
  );

  if (isbn)
    suffix.push(`${t('shared.book.isbn')} ${isbn}`);

  if (format)
    suffix.push(`${t('shared.book.format')} ${format}`);

  if (binding)
    suffix.push(`${t('shared.book.binding')} ${binding}`);

  return (
    suffix
      ? `${title} - ${suffix.join(', ')}`
      : title
  );
}
