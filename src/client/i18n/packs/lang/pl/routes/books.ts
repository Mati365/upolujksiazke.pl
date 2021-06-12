import {PL_SHARED_SEO_META} from '../shared';

export const PL_BOOKS_ROUTE_PACK = {
  all: {
    title: 'Wszystkie książki',
    seo: {
      ...PL_SHARED_SEO_META,
      title: '📖 Wszystkie książki | Porównaj ceny książek, oceny i recenzje  - upolujksiazke.pl',
    },
  },
  category: {
    title: 'Książki z kategorii %{}',
    seo: {
      ...PL_SHARED_SEO_META,
      title: '%{emoji} Książki z kategorii %{name} | Porównaj ceny książek, oceny i recenzje  - upolujksiazke.pl',
    },
  },
};
