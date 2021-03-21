import React from 'react';
import c from 'classnames';

import {BookAuthorRecord} from '@api/types';
import {AuthorLink} from '@client/routes/Links';
import {
  CleanList,
  CleanListProps,
  ContainerLinkProps,
} from '@client/components/ui';

type BookAuthorsRowProps = CleanListProps & {
  className?: string,
  separated?: boolean,
  linkProps?: Partial<ContainerLinkProps<any, {}>>,
  authors: BookAuthorRecord[],
};

export const BookAuthorsRow = (
  {
    className, authors, separated,
    linkProps, ...props
  }: BookAuthorsRowProps,
) => (
  <CleanList
    className={c(
      className,
      'c-book-authors-row',
      separated && 'is-separated',
    )}
    spaced={(
      separated
        ? 3
        : 2
    )}
    inline
    wrap
    {...props}
  >
    {authors.map(
      (author) => (
        <li key={author.id}>
          <AuthorLink
            item={author}
            {...linkProps}
          >
            {author.name}
          </AuthorLink>
        </li>
      ),
    )}
  </CleanList>
);

BookAuthorsRow.displayName = 'BookAuthorsRow';
