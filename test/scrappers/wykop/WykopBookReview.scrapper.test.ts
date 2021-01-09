import * as R from 'ramda';
import 'jest-expect-message';

import {WykopAPI} from '@scrapper/service/scrappers/wykop/api/WykopAPI';
import {WykopBookReviewScrapper} from '@scrapper/service/scrappers/wykop/book-review/WykopBookReview.scrapper';

import ENTRIES_DB from './cache/entries.json';

let api: WykopAPI = null;
let scrapper: WykopBookReviewScrapper;

beforeAll(
  () => {
    api = new WykopAPI(
      {
        cacheResolver({path}) {
          if (R.startsWith('Entries/Entry/', path)) {
            return {
              data: ENTRIES_DB[R.last(path.split('/'))].response,
            };
          }

          return null;
        },
      },
    );
  },
);

beforeEach(
  () => {
    scrapper = new WykopBookReviewScrapper(
      {
        api,
      },
    );
  },
);

test('test content parser matching', async () => {
  for await (const [, entry] of Object.entries(ENTRIES_DB)) {
    const {id: recordId} = entry.response.data;
    const result = await scrapper.fetchSingle(recordId.toString());
    const {dto} = result;

    expect(dto.description, `Description for entry ${recordId} mismatch!`).toEqual(entry.description);
    expect(dto.book.title).toEqual(entry.properties.title);
    expect(dto.rating, `Rating for entry ${recordId} mismatch!`).toEqual(entry.properties.score);

    expect(
      dto.book.tags.sort(),
      `Tags for entry ${recordId} mismatch!`,
    ).toEqual(entry.properties.tags.sort());

    expect(
      R.pluck('name', dto.book.authors).sort(),
      `Authors for entry ${recordId} mismatch!`,
    ).toEqual(entry.properties.authors.sort());
  }
});
