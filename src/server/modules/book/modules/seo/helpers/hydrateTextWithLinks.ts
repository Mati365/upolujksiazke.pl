import * as R from 'ramda';

import stringSimilarity from 'string-similarity';

import {filterAndMap} from '@shared/helpers';
import {
  createHTMLTag,
  extractTextWords,
  getHTMLInnerText,
  isWordCharacter,
} from '@shared/helpers/html';

export type LinkHydrateAttrs<T = any> = {
  text: string,
  tags: Array<T & {name: string}>,
  linkGeneratorFn(item: T): {
    href: string,
    rel?: string,
    class?: string,
    target?: string,
  },
};

export type LinkHydrateOutput<T> = {
  nonHTMLText: string,
  text: string,
  tags: LinkHydrateAttrs<T>['tags'],
};

export type TextSimilarKeywordInfo<T> = {
  words: string[],
  item: T & {name: string},
};

/**
 * Picks similar list of sentences that are present in description
 *
 * @see
 *  It is very slow! Do not run it in request handler!
 *
 * @export
 * @template T
 * @param {LinkHydrateAttrs<T>['items']} items
 * @param {string} text
 * @returns {Record<string, TextSimilarKeywordInfo<T>[]>}
 */
export function pickTextSimilarKeywords<T>(
  items: LinkHydrateAttrs<T>['tags'],
  text: string,
): Record<string, TextSimilarKeywordInfo<T>[]> {
  const words = extractTextWords(
    text.toLowerCase(),
  );

  const similarKeywords: [string, TextSimilarKeywordInfo<T>][] = filterAndMap(
    (item) => {
      const parts = extractTextWords(item.name.toLowerCase());

      for (let startWordIndex = 0; startWordIndex < words.length; ++startWordIndex) {
        let matchedParts: string[] = null;

        for (
          let offset = 0;
          offset < parts.length && startWordIndex + offset < words.length;
          ++offset
        ) {
          const part = parts[offset];
          const matchedWord = words[startWordIndex + offset];

          const rating = stringSimilarity.compareTwoStrings(part, matchedWord);
          if (rating < 0.7) {
            matchedParts = null;
            break;
          } else
            (matchedParts ||= []).push(matchedWord);
        }

        if (matchedParts) {
          return [
            words[startWordIndex],
            {
              words: matchedParts,
              item,
            },
          ];
        }
      }

      return null;
    },
    items,
  );

  return similarKeywords.reduce(
    (acc, item) => {
      (acc[item[0]] ||= []).push(item[1]);
      return acc;
    },
    {},
  );
}

/**
 * Injects anchors into description
 *
 * @warn
 *  Handle spaces!
 *
 * @export
 * @template T
 * @param {LinkHydrateAttrs<T>} attrs
 * @returns {LinkHydrateOutput<T>}
 */
export function hydrateTextWithLinks<T>(
  {
    text,
    tags,
    linkGeneratorFn,
  }: LinkHydrateAttrs<T>,
): LinkHydrateOutput<T> {
  if (!tags.length || !text) {
    return {
      text,
      nonHTMLText: null,
      tags: [],
    };
  }

  // prevent for matching shortest sentences inside longest sentences
  tags = tags.sort(
    (a, b) => b.name.length - a.name.length,
  );

  const nonHTMLText = getHTMLInnerText(text);
  const similarWords = pickTextSimilarKeywords(tags, nonHTMLText);

  if (R.isEmpty(similarWords)) {
    return {
      text,
      nonHTMLText,
      tags: [],
    };
  }

  const nesting: string[] = [];
  let wordAcc = '', output = '';

  const eatWords = (startIndex: number, count: number) => {
    const words: string[] = [];
    let i = startIndex, acc = '';

    for (; i < text.length && words.length < count; ++i) {
      const c = text[i];
      const wordCharacter = isWordCharacter(c);

      if (wordCharacter)
        acc += c;

      if (acc && (!wordCharacter || i + 1 >= text.length)) {
        words.push(acc);
        acc = '';
      }
    }

    return {
      words,
      totalCharacters: i - startIndex,
    };
  };

  const flushWordAcc = (i: number) => {
    if (!wordAcc)
      return 0;

    let anchor = false;
    for (let j = 0; j < nesting.length; ++j) {
      if (nesting[j] === 'a') {
        anchor = true;
        break;
      }
    }

    let parsedWord = wordAcc;
    let ignoredNextCharacters = 0;

    if (!anchor) {
      const matchedSentences = similarWords[wordAcc.toLowerCase()];

      if (matchedSentences) {
        const longestSentence = matchedSentences.reduce(
          (acc, {words}) => Math.max(acc, words.length),
          0,
        );

        const longestSentenceWords = eatWords(i, longestSentence).words;
        const longestLowerSentenceWords = longestSentenceWords.map((w) => w.toLowerCase());

        const sentence = matchedSentences.find(({words}) => {
          for (let k = 1; k < words.length; ++k) {
            if (words[k] !== longestLowerSentenceWords[k - 1])
              return false;
          }

          return true;
        });

        if (sentence) {
          const newTag = createHTMLTag(
            'a',
            linkGeneratorFn(sentence.item),
            [
              wordAcc,
              ...longestSentenceWords.slice(0, sentence.words.length - 1),
            ].join(' '),
          );

          ignoredNextCharacters = sentence.words.join(' ').length - wordAcc.length - 1;
          parsedWord = newTag;
        }
      }
    }

    output += parsedWord;
    wordAcc = '';
    return ignoredNextCharacters;
  };

  for (let i = 0; i < text.length; ++i) {
    const c = text[i];
    const wordCharacter = isWordCharacter(c);
    if (wordCharacter)
      wordAcc += c;
    else {
      if (wordAcc)
        i += flushWordAcc(i);

      if (text[i] === c)
        output += c;

      // eat tags
      if (c === '<') {
        const pop = text[i + 1] === '/';
        if (pop)
          nesting.pop();

        let tagContent = '';
        for (; i < text.length && text[i + 1] !== '>'; ++i, tagContent += text[i]);

        output += tagContent;

        const selfClosing = tagContent[tagContent.length - 1] === '/';
        if (!pop && !selfClosing)
          nesting.push(tagContent.split(' ')[0]);
      }
    }
  }

  flushWordAcc(text.length);

  return {
    nonHTMLText,
    text: output,
    tags: R.unnest(R.map(R.pluck('item'), R.values(similarWords))),
  };
}
