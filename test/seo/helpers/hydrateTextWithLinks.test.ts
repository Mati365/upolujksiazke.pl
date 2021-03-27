/* eslint-disable max-len */
import {hydrateTextWithLinks} from '@server/modules/book/modules/seo';

test('hydrate text with links', () => {
  expect(hydrateTextWithLinks(
    {
      text: 'grzegrzółka Kota ala ma kota i psa i coś tam jeszcze mniej interesującego BLa blA bla test',
      items: [
        {
          id: 1,
          name: 'kotaa',
        },
        {
          id: 2,
          name: 'kota i psa',
        },
        {
          id: 3,
          name: 'bla',
        },
        {
          id: 4,
          name: 'bla bla',
        },
      ],
      linkGeneratorFn: ({id}) => ({
        href: `https://interia.pl/${id}`,
      }),
    },
  )).toBe('grzegrzółka <a href="https://interia.pl/1">Kota</a> ala ma <a href="https://interia.pl/2">kota i psa</a> i coś tam jeszcze mniej interesującego <a href="https://interia.pl/4">BLa blA</a> <a href="https://interia.pl/3">bla</a> test');

  expect(hydrateTextWithLinks(
    {
      text: '<a href="https://interia.pl">hrabonszcz</a> <div>hrabonszcz</div> hrabonszcz dupa dupa',
      items: [
        {
          id: 3,
          name: 'dupa',
        },
        {
          id: 2,
          name: 'hrabonszcz dupa',
        },
      ],
      linkGeneratorFn: ({id}) => ({
        href: `https://interia.pl/${id}`,
      }),
    },
  )).toBe('<a href="https://interia.pl">hrabonszcz</a> <div>hrabonszcz</div> <a href="https://interia.pl/2">hrabonszcz dupa</a> <a href="https://interia.pl/3">dupa</a>');

  expect(hydrateTextWithLinks(
    {
      text: 'dupa. test "iksde"',
      items: [
        {
          id: 3,
          name: 'dupa',
        },
        {
          id: 2,
          name: 'iksde',
        },
      ],
      linkGeneratorFn: ({id}) => ({
        href: `https://interia.pl/${id}`,
      }),
    },
  )).toBe('<a href="https://interia.pl/3">dupa</a>. test "<a href="https://interia.pl/2">iksde</a>"');

  expect(hydrateTextWithLinks(
    {
      text: '<a href="dupa">dupa</a> test abc',
      items: [
        {
          id: 3,
          name: 'dupa',
        },
        {
          id: 2,
          name: 'abc',
        },
        {
          id: 3,
          name: 'test',
        },
      ],
      linkGeneratorFn: ({id}) => ({
        href: `https://interia.pl/${id}`,
      }),
    },
  )).toBe('<a href="dupa">dupa</a> <a href="https://interia.pl/3">test</a> <a href="https://interia.pl/2">abc</a>');

  expect(hydrateTextWithLinks(
    {
      text: 'literatury science-fiction.Kim jest Pirx? science-fiction',
      items: [
        {
          id: 3,
          name: 'science fiction',
        },
      ],
      linkGeneratorFn: ({id}) => ({
        href: `https://interia.pl/${id}`,
      }),
    },
  )).toBe('literatury <a href="https://interia.pl/3">science fiction</a>.Kim jest Pirx? <a href="https://interia.pl/3">science fiction</a>');
});
