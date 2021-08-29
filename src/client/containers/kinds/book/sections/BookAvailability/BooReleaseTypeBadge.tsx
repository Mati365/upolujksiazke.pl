import React from 'react';

import {useI18n} from '@client/i18n';

import {Badge} from '@client/components/ui';
import {BookTypesIconsMap} from '@client/containers/kinds/book/cards/BookCard/BookTypesRow';
import {BookType} from '@shared/enums';

type BookReleaseTypeBadgeProps = {
  className?: string,
  type: BookType,
  titled?: boolean,
};

export const BookReleaseTypeBadge = (
  {
    className,
    type,
    titled = true,
  }: BookReleaseTypeBadgeProps,
) => {
  const t = useI18n('book.availability');
  const releaseTypeName = titled && t(`shared.book.types.${type ?? 'default'}`);
  const Icon = BookTypesIconsMap[type] ?? BookTypesIconsMap.default;

  return (
    <Badge className={className}>
      <Icon title={releaseTypeName || undefined} />
      {releaseTypeName && (
        <span>
          {releaseTypeName}
        </span>
      )}
    </Badge>
  );
};

BookReleaseTypeBadge.displayName = 'BookReleaseTypeBadge';
