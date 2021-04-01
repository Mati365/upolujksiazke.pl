import {BookCardRecord} from '@api/types/BookCard.record';
import {LangTranslateFn} from '@client/i18n/utils/createLangPack';
import {
  BookFullInfoReleaseRecord,
  BookVolumeRecord,
} from '@api/types';

export function formatBookVolume(
  {
    t,
    volume,
  }: {
    t: LangTranslateFn,
    volume: BookVolumeRecord,
  },
) {
  return `${t('shared.book.volume')} ${volume.name}`;
}

export function formatBookTitle(
  {
    t,
    withDefaultVolumeName,
    volumeFirst,
    book: {
      defaultTitle,
      volume,
    },
  }: {
    t: LangTranslateFn,
    book: Pick<BookCardRecord, 'defaultTitle'|'volume'>,
    volumeFirst?: boolean,
    withDefaultVolumeName?: boolean,
  },
) {
  if (!volume || (!withDefaultVolumeName && volume.name === '1'))
    return defaultTitle;

  const parts: string[] = [defaultTitle];
  const volumeTitle = formatBookVolume(
    {
      t,
      volume,
    },
  );

  if (volumeFirst)
    parts.unshift(volumeTitle);
  else
    parts.push(volumeTitle);

  return parts.join(' - ');
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
