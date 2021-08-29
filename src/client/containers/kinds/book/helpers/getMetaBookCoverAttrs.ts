import {BookFullInfoReleaseRecord} from '@api/types';

export function getMetaBookCoverAttrs(release: BookFullInfoReleaseRecord) {
  const cover = release?.cover?.preview;
  if (!cover)
    return null;

  return {
    url: cover.file,
    size: {
      w: 420,
      h: Math.floor(420 * cover.ratio),
    },
  };
}
