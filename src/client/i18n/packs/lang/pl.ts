import {SHARED_ENV} from '@server/constants/env';
import {
  BookBindingKind,
  BookProtection,
  BookSchoolLevel,
  BookType,
  SortMode,
} from '@shared/enums';

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
};

export const PL_LANG_PACK = {
  home: {
    meta: {
      title: 'Upoluj książkę - sprawdź recenzje, opinie i porównaj ceny książek w większości księgarni w Polsce',
    },
  },
  search: {
    placeholder: 'Wyszukaj książkę, autora lub ISBN i wciśnij enter...',
  },
  shared: {
    fetch_state: {
      loading: 'Wczytywanie...',
      errors: 'Błąd :(',
    },
    titles: {
      of: 'z',
      no_data: 'Brak danych',
      rating: 'Ocena',
      keywords: 'Słowa kluczowe',
      categories: 'Kategorie',
      group_by: 'Grupuj wg.:',
      action: 'Akcja',
      more: 'Więcej',
      less: 'Mniej',
      open: 'Otwórz',
      delete: 'Usuń',
      yes: 'Tak',
      no: 'Nie',
      click_to_choose: 'Kliknij by wybrać',
    },
    buttons: {
      more: 'pokaż więcej',
      less: 'pokaż mniej',
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
    filters: {
      phrase: {
        single: 'Fraza',
        placeholder: 'Szukaj książki...',
      },
      categories: {
        single: 'Kategoria',
        header: 'Kategorie',
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
      title: 'Recenzje książki',
    },
    summaries: {
      title: 'Streszczenia książki',
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
    books: 'Wszystkie książki',
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
