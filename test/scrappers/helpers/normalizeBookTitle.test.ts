import {normalizeBookTitle} from '@importer/kinds/scrappers/helpers/normalizeBookTitle';
import TITLES_DB from './cache/book-titles.json';

test('test book title normalization', () => {
  for (const [title, info] of Object.entries(TITLES_DB))
    expect(normalizeBookTitle(title)).toMatchObject(info);
});
