import {ListItem} from '@shared/types';

export type BookAvailabiltiyScrapperInfo = {
  price: number,
};

export type BookAuthorScrapperInfo = {
  name: string,
  description?: string,
};

export type BookScrapperInfo = {
  title: string,
  availability: BookAvailabiltiyScrapperInfo[],
  authors: BookAuthorScrapperInfo[],
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
