import {ListItem} from '@shared/types';

export type BookScrapperInfo = {
  title: string,
  isbn: string,
  authors: string[],
  categories: string[],
  tags: string[],
  description?: string,
  cover?: {
    nsfw: boolean,
    ratio?: number,
    source: string,
    image: string,
  },
  attributes?: {
    totalPages: number,
    publisher?: ListItem,
  },
};
