export type BookScrapperInfo = {
  title: string,
  isbn: string,
  authors: string[],
  category: string,
  description?: string,
  cover?: {
    nsfw: boolean,
    ratio?: number,
    source: string,
    image: string,
  },
};
