import {BookType} from '@shared/enums';

export const PL_LANG_PACK = {
  home: {
    meta: {
      title: 'Upoluj książkę - sprawdź recenzje, opinie i porównaj ceny książek w większości księgarni w Polsce',
    },
  },
  shared: {
    titles: {
      no_data: 'Brak danych',
      rating: 'Ocena',
      categories: 'Kategorie',
      group_by: 'Grupuj wg.:',
    },
    book: {
      volume: 'Tom',
      price: 'Cena',
      check: 'Sprawdź',
      total_ratings: 'Ocen',
      available_types: 'Formaty:',
      types: {
        [BookType.AUDIOBOOK]: 'audiobook',
        [BookType.EBOOK]: 'e-book',
        [BookType.PAPER]: 'papier',
        default: 'brak danych',
      },
      props: {
        total_pages: 'Strony',
        prizes: 'Nagrody',
        rating: 'Ocena',
        ratings: 'Głosy',
        publisher: 'Wydawca',
        original_publish_date: 'Wydano',
        availability: 'Sklepy',
        recording_length: 'Długość (min)',
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
    availability: {
      title: 'Porównaj ceny wydań w księgarniach',
      type: 'Typ',
      release: 'Nazwa wydania',
      isbn: 'ISBN',
      website: 'Księgarnia',
      prev_price: 'Poprzednia cena',
      price: 'Cena',
      action: 'Akcja',
      buy: 'Idź do sklepu',

      groups: {
        all: 'Wszystkie',
        [BookType.AUDIOBOOK]: 'Audiobooki',
        [BookType.EBOOK]: 'E-Booki',
        [BookType.PAPER]: 'Papierowe',
        by_release: 'Wydania',
      },
    },
  },
  sections: {
    recent_books: {
      title: 'Ostatnio dodane książki',
    },
  },
};
