import * as R from 'ramda';
import {normalizeParsedText} from '@server/common/helpers/normalizeText';

export function extractTableRowsMap($: cheerio.Root, selector: string|cheerio.Element[]) {
  const rows = (
    $(selector)
      .toArray()
      .filter((row) => $(row).children().length === 2)
  );

  return R.fromPairs(
    rows.map(
      (row) => {
        const $row = $(row);

        return [
          normalizeParsedText($row.children().first().text()).match(/^([^:]+)/)?.[1]?.toLowerCase(),
          normalizeParsedText($row.children().eq(1).text()),
        ];
      },
    ),
  );
}
