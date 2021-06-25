import {SHARED_ENV} from '@server/constants/env';
import {
  BookBindingKind,
  BookProtection,
  BookSchoolLevel,
  BookType,
  SortMode,
  ViewMode,
} from '@shared/enums';

import {PL_HOME_ROUTE_PACK} from './routes/home';
import {PL_BOOKS_ROUTE_PACK} from './routes/books';
import {PL_AUTHORS_PACK} from './routes/authors';
import {PL_AUTHOR_PACK} from './routes/author';
import {PL_TOP_BOOKS_PACK} from './routes/topBooks';
import {PL_TAG_PACK} from './routes/tag';
import {PL_BOOK_ROUTE_PACK} from './routes/book';
import {PL_NEWS_ROUTE_PACK} from './routes/news';
import {PL_REVIEWS_ROUTE_PACK} from './routes/reviews';

const PL_BOOK_BINDING_PACK: Record<BookBindingKind, string> = {
  [BookBindingKind.HARDCOVER]: 'twarda okładka',
  [BookBindingKind.NOTEBOOK]: 'miękka okładka',
  [BookBindingKind.PAPERBACK]: 'papierowa okładka',
  [BookBindingKind.SPIRAL]: 'spiralna okładka',
};

const PL_BOOK_TYPE_PACK: Record<BookType, string> = {
  [BookType.AUDIOBOOK]: 'audiobook',
  [BookType.EBOOK]: 'e-book',
  [BookType.PAPER]: 'papier',
};

const PL_BOOK_PROTECTION_PACK: Record<BookProtection, string> = {
  [BookProtection.WATERMARK]: 'znak wodny',
};

const PL_BOOK_SCHOOL_LEVEL_PACK: Record<BookSchoolLevel, string> = {
  [BookSchoolLevel.I_III]: '1 - 3 klasa',
  [BookSchoolLevel.IV_VI]: '4 - 6 klasa',
  [BookSchoolLevel.VII_VIII]: '7 - 8 klasa',
  [BookSchoolLevel.HIGH_SCHOOL]: 'Liceum (podstawa)',
  [BookSchoolLevel.HIGH_SCHOOL_EXPANDED]: 'Liceum (rozszerzenie)',
};

const PL_SORT_MODES_PACK: Record<SortMode, string> = {
  [SortMode.ACCURACY]: 'Trafność',
  [SortMode.ALPHABETIC]: 'Alfabetycznie',
  [SortMode.POPULARITY]: 'Popularność',
  [SortMode.RANKING]: 'Ranking',
  [SortMode.RECENTLY_ADDED]: 'Ostatnio dodane',
};

const PL_VIEW_MODES: Record<ViewMode, string> = {
  [ViewMode.LIST]: 'Widok listy',
  [ViewMode.GRID]: 'Widok tabeli',
};

const ROUTES_PACK = {
  home: PL_HOME_ROUTE_PACK,
  books: PL_BOOKS_ROUTE_PACK,
  book: PL_BOOK_ROUTE_PACK,
  authors: PL_AUTHORS_PACK,
  author: PL_AUTHOR_PACK,
  top_books: PL_TOP_BOOKS_PACK,
  tag: PL_TAG_PACK,
  news: PL_NEWS_ROUTE_PACK,
  reviews: PL_REVIEWS_ROUTE_PACK,
};

export const PL_LANG_PACK = {
  routes: ROUTES_PACK,
  search: {
    placeholder: 'Wyszukaj książkę, autora lub ISBN i wciśnij enter...',
    title: 'Wyszukaj',
  },
  shared: {
    months: [
      'Styczeń',
      'Luty',
      'Marzec',
      'Kwiecień',
      'Maj',
      'Czerwiec',
      'Lipiec',
      'Sierpień',
      'Wrzesień',
      'Październik',
      'Listopad',
      'Grudzień',
    ],
    fetch_state: {
      loading: 'Wczytywanie...',
      errors: 'Błąd :(',
    },
    view_modes: PL_VIEW_MODES,
    titles: {
      of: 'z',
      no_data: 'Brak danych',
      rating: 'Ocena',
      keywords: 'Słowa kluczowe',
      categories: 'Kategorie',
      subcategories: 'Podkategorie',
      group_by: 'Grupuj wg.:',
      action: 'Akcja',
      more: 'Więcej',
      close: 'Zamknij',
      less: 'Mniej',
      open: 'Otwórz',
      delete: 'Usuń',
      yes: 'Tak',
      no: 'Nie',
      click_to_choose: 'Kliknij by wybrać',
      empty_results: 'Nic nie znaleziono!',
    },
    reactions: {
      like: 'Lubię to',
      dislike: 'Nie lubię tego',
    },
    placeholders: {
      search: 'Szukaj...',
      filter: 'Filtruj...',
    },
    buttons: {
      more: 'Pokaż więcej',
      less: 'Pokaż mniej',
      show_spoiler: 'Pokaż spoiler',
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
        ...PL_BOOK_TYPE_PACK,
        default: 'brak danych',
      },
      classLevel: PL_BOOK_SCHOOL_LEVEL_PACK,
      protection: PL_BOOK_PROTECTION_PACK,
      binding: PL_BOOK_BINDING_PACK,
      review: {
        about_book: 'Opinia o książce %{}',
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
        era: 'Epoka',
        genre: 'Gatunek',
        school_level: 'Program lektur',
        obligatory: 'Obowiązkowa',
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
      school: 'Lektura',
    },
    breadcrumbs: {
      home: 'Strona główna',
      books: 'Książki',
      authors: 'Autorzy',
      top_books: 'Ranking książek',
      reviews: 'Recenzje',
      news: 'Newsy',
    },
    filters: {
      header: 'Filtry',
      clear: 'Wyczyść filtry',
      per_page: 'Na stronie:',
      sort_by: 'Sortuj wg.:',
      modes: PL_SORT_MODES_PACK,
    },
  },
  author: {
    other_books: 'Inne książki %{}',
  },
  book: {
    created_by: 'Autor',
    no_description: 'Brak opisu :(',
    book_description: 'Opis książki',
    volumes: 'Seria książek',
    releases: 'Wydania książki',
    about_school_book: 'O lekturze',
    primary_category: 'Kategoria główna',
    filters: {
      phrase: {
        single: 'Fraza',
        placeholder: 'Szukaj książki...',
      },
      categories: {
        single: 'Podkategoria',
        header: 'Podkategorie',
        total: '%{} kategorii',
      },
      price: {
        single: 'Cena',
        header: 'Ceny [PLN]',
      },
      authors: {
        single: 'Autor',
        header: 'Autorzy',
        total: '%{} autorów',
      },
      types: {
        single: 'Typ',
        header: 'Typy',
        total: '%{} typów',
      },
      era: {
        single: 'Epoka',
        header: 'Epoki',
        total: '%{} epok',
      },
      genre: {
        single: 'Gatunek',
        header: 'Gatunki',
        total: '%{} gatunków',
      },
      school_levels: {
        single: 'Poziom nauczania',
        header: 'Poziomy nauczania',
      },
      prizes: {
        single: 'Nagroda',
        header: 'Nagrody',
        total: '%{} nagród',
      },
      publishers: {
        single: 'Wydawca',
        header: 'Wydawcy',
        total: '%{} wydawców',
      },
    },
    price_box: {
      header: 'Ceny książki:',
      highest_price: 'Najwyższa cena:',
      lowest_price: 'Najniższa cena:',
      buy_cta: 'Otwórz sklep',
    },
    availability: {
      title: 'Porównaj ceny wydań w księgarniach',
      store: 'Księgarnia',
      prev_price: 'Poprzednia cena',
      price: 'Cena',
      go_to_shop: 'Idź do sklepu',
      choose_type: 'Format książki',
      groups: {
        all: 'Wszystkie',
        [BookType.AUDIOBOOK]: 'Audiobooki',
        [BookType.EBOOK]: 'E-Booki',
        [BookType.PAPER]: 'Papierowe',
        by_release: 'Wydania',
      },
    },
    reviews: {
      title: 'Opinie o książce',
      total: '%{} recenzji',
      show_more_reviews: 'Pokaż więcej recenzji (%{})',
    },
    summaries: {
      title: 'Streszczenia książki',
    },
    posts: {
      title: 'Artykuły o książce',
    },
  },
  review: {
    read_more_at: 'Czytaj więcej na',
  },
  sections: {
    root_categories: {
      title: 'Kategorie książek',
    },
    recent_books: {
      title: 'Nowości',
    },
    recently_commented_books: {
      title: 'Ostatnio skomentowane',
    },
  },
  footer: {
    shortcuts: 'Na skróty',
    categories: 'Popularne kategorie',
    about: 'O serwisie',
  },
  links: {
    home: 'Strona główna',
    news: 'Aktualności',
    books: 'Wszystkie książki',
    authors: 'Autorzy',
    reviews: 'Recenzje',
    tags: 'Tagi',
    top: 'TOP książki',
  },
  bottom_menu: {
    home: 'Start',
    news: 'Newsy',
    top: 'TOP',
    books: 'Książki',
    search: 'Szukaj',
  },
  about: {
    // eslint-disable-next-line max-len
    description: `${SHARED_ENV.website.name} to darmowa porównywarka cen książek, e-booków i audiobooków. Znajdziesz na niej również dopasowane do książek streszczenia i opinie.`,
    copyright: 'Copyright by upolujksiazke.pl %{}. Wszystkie prawa zastrzeżone.',
  },
};
