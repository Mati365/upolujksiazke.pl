import {
  BookBindingKind,
  BookProtection,
  BookType,
} from '@shared/enums';

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
      keywords: 'Słowa kluczowe',
      categories: 'Kategorie',
      group_by: 'Grupuj wg.:',
      action: 'Akcja',
      more: 'Więcej',
      less: 'Mniej',
    },
    book: {
      isbn: 'ISBN',
      volume: 'Tom',
      price: 'Cena',
      type: 'Typ',
      release: 'Nazwa wydania',
      check: 'Sprawdź',
      total_ratings: 'Ocen',
      available_types: 'Formaty',
      types: {
        [BookType.AUDIOBOOK]: 'audiobook',
        [BookType.EBOOK]: 'e-book',
        [BookType.PAPER]: 'papier',
        default: 'brak danych',
      },
      protection: {
        [BookProtection.WATERMARK]: 'znak wodny',
      },
      binding: {
        [BookBindingKind.HARDCOVER]: 'twarda okładka',
        [BookBindingKind.NOTEBOOK]: 'miękka okładka',
        [BookBindingKind.PAPERBACK]: 'papierowa okładka',
        [BookBindingKind.SPIRAL]: 'spiralna okładka',
      },
      props: {
        total_pages: 'Strony',
        type: 'Rodzaj',
        lang: 'Język',
        format: 'Format',
        binding: 'Oprawa',
        edition: 'Edycja',
        weight: 'Waga (g)',
        prizes: 'Nagrody',
        rating: 'Ocena',
        ratings: 'Głosy',
        publisher: 'Wydawca',
        protection: 'Ochrona',
        original_publish_date: 'Rok wydania',
        availability: 'Sklepy',
        translator: 'Tłumacz',
        recording_length: 'Nagranie (min)',
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
    book_description: 'Opis książki',
    volumes: 'Tomy książki',
    releases: 'Wydania książki',
    price_box: {
      header: 'Ceny książki:',
      highest_price: 'Najwyższa cena:',
      lowest_price: 'Najniższa cena:',
      buy_cta: 'Kup książkę',
    },
    availability: {
      title: 'Porównaj ceny wydań w księgarniach',
      store: 'Księgarnia',
      prev_price: 'Poprzednia cena',
      price: 'Cena',
      buy: 'Idź do sklepu',

      groups: {
        all: 'Wszystkie',
        [BookType.AUDIOBOOK]: 'Audiobooki',
        [BookType.EBOOK]: 'E-Booki',
        [BookType.PAPER]: 'Papierowe',
        by_release: 'Wydania',
      },
    },
    reviews: {
      title: 'Recenzje książki',
    },
  },
  sections: {
    recent_books: {
      title: 'Ostatnio dodane książki',
    },
  },
};
