import React from 'react';
import c from 'classnames';

import {BookAuthorRecord} from '@api/types';
import {CleanList} from '@client/components/ui';
import {
  AuthorLink,
  AuthorsLink,
} from '@client/routes/Links';

type LettersAuthorsGridProps = {
  className?: string,
  letter: string,
  letters: string[],
  authors: BookAuthorRecord[],
};

export const LettersAuthorsSection = (
  {
    className,
    letter,
    letters,
    authors,
  }: LettersAuthorsGridProps,
) => (
  <section
    className={c(
      'c-authors-letters-section',
      className,
    )}
  >
    <CleanList
      className='c-authors-letters-section__letters'
      spaced={4}
      separated
      block
    >
      {letters.map(
        (item) => (
          <li
            key={item}
            className={c(
              item === letter && 'is-active',
            )}
          >
            <AuthorsLink item={item}>
              {item}
            </AuthorsLink>
          </li>
        ),
      )}
    </CleanList>

    <CleanList
      className='c-authors-letters-section__content'
      inline={false}
    >
      {authors.map(
        (item) => (
          <li key={item.id}>
            <AuthorLink
              item={item}
              withChevron
            >
              {item.name}
            </AuthorLink>
          </li>
        ),
      )}
    </CleanList>
  </section>
);

LettersAuthorsSection.displayName = 'LettersAuthorsSection';
