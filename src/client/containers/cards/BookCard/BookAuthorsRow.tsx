import React from 'react';

import {BookAuthorRecord} from '@api/types';
import {AuthorLink} from '@client/routes/Links';
import {
  CleanList,
  CleanListProps,
  ContainerLinkProps,
} from '@client/components/ui';

type BookAuthorsRowProps = CleanListProps & {
  className?: string,
  linkProps?: Partial<ContainerLinkProps<any, {}>>,
  authors: BookAuthorRecord[],
};

export const BookAuthorsRow = (
  {
    className, authors,
    linkProps, ...props
  }: BookAuthorsRowProps,
) => (
  <CleanList
    className={className}
    spaced={2}
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
