/* eslint-disable max-len */
import {wrapHTMLSpoilers} from '@shared/helpers/html/parsers/html';

test('hydrate text with spoilers', () => {
  expect(
    wrapHTMLSpoilers(
      {
        text: 'ala ma kota <spoiler>zjebanego kota<spoiler>nested</spoiler></spoiler>',
        buttonTitle: 'pokaż spoiler',
      },
    ),
  ).toBe('ala ma kota <spoiler><button class="c-spoiler__btn">pokaż spoiler</button><span class="c-spoiler__content">zjebanego kota<spoiler><button class="c-spoiler__btn">pokaż spoiler</button><span class="c-spoiler__content">nested</span></spoiler></span></spoiler>');
});
