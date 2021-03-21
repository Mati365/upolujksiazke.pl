import {BookType} from '@shared/enums';

export const PL_LANG_PACK = {
  home: {
    meta: {
      title: 'Upoluj książkę - sprawdź recenzje, opinie i porównaj ceny książek w większości księgarni w Polsce',
    },
  },
  shared: {
    book: {
      volume: 'Tom',
      price: 'Cena',
      compare: 'Porównaj',
      total_ratings: 'Ocen',
      available_types: 'Formaty:',
      types: {
        [BookType.AUDIOBOOK]: 'audiobook',
        [BookType.EBOOK]: 'e-book',
        [BookType.PAPER]: 'papier',
      },
    },
    price: {
      pln: 'zł',
    },
    ribbons: {
      top: 'HIT',
    },
    buttons: {
      more: 'pokaż więcej',
      less: 'pokaż mniej',
    },
    breadcrumbs: {
      home: 'Strona główna',
      books: 'Książki',
    },
  },
  book: {
    created_by: 'Autor',
    no_description: 'Brak opisu :(',
    price_box: {
      header: 'Ceny książki:',
      highest_price: 'Najwyższa cena:',
      lowest_price: 'Najniższa cena:',
      buy_cta: 'Kup książkę',
    },
  },
  sections: {
    recent_books: {
      title: 'Ostatnio dodane książki',
    },
  },
};
