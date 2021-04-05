import {SHARED_ENV} from '@server/constants/env';
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
      open: 'Otwórz',
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
  author: {
    other_books: 'Inne książki autora',
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
      go_to_shop: 'Idź do sklepu',

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
  review: {
    read_more_at: 'Czytaj więcej na',
  },
  sections: {
    recent_books: {
      title: 'Ostatnio dodane książki',
    },
  },
  footer: {
    shortcuts: 'Na skróty',
    categories: 'Popularne kategorie',
    about: 'O serwisie',
  },
  links: {
    home: 'Strona główna',
    categories: 'Kategorie',
    authors: 'Autorzy',
    series: 'Serie',
    tags: 'Tagi',
    top: 'TOP książki',
  },
  about: {
    // eslint-disable-next-line max-len
    description: `${SHARED_ENV.website.name} to darmowa porównywarka cen książek, e-booków i audiobooków. Znajdziesz na niej również dopasowane do książek streszczenia i opinie.`,
    copyright: 'Copyright by upolujksiazke.pl %{}. Wszystkie prawa zastrzeżone.',
  },
};
