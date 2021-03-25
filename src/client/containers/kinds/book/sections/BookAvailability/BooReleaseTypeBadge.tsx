import React from 'react';

import {useI18n} from '@client/i18n';

import {Badge} from '@client/components/ui';
import {BookTypesIconsMap} from '@client/containers/kinds/book/cards/BookCard/BookTypesRow';
import {BookType} from '@shared/enums';

type BookReleaseTypeBadgeProps = {
  type: BookType,
};

export const BookReleaseTypeBadge = ({type}: BookReleaseTypeBadgeProps) => {
  const t = useI18n('book.availability');
  const releaseTypeName = t(`shared.book.types.${type ?? 'default'}`);
  const Icon = BookTypesIconsMap[type] ?? BookTypesIconsMap.default;

  return (
    <Badge>
      <Icon title={releaseTypeName} />
      {releaseTypeName}
    </Badge>
  );
};

BookReleaseTypeBadge.displayName = 'BookReleaseTypeBadge';
