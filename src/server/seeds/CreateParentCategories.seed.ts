/* eslint-disable import/no-default-export */
import {Factory, Seeder} from 'typeorm-seeding';
import {Connection} from 'typeorm';

import {parameterize} from '@shared/helpers/parameterize';
import {upsert} from '@server/common/helpers/db';

import {BookCategoryEntity} from '@server/modules/book/modules/category';

export default class CreateParentCategories implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const names = [
      [
        'Inne',
        'pozostałe', 'niesklasyfikowane', 'b.d', 'niesklasyfikowane',
      ],
      [
        'Literatura, poeci, gatunki',
        'groteska', 'tragedia', 'epos', 'dramat', 'agoryzmy', 'satyra', 'fraszki', 'przysłowia',
        'proza', 'treny', 'nowele', 'opowiadania', 'beleterystyka', 'listy', 'eposy', 'poezja',
        'filozofia', 'dygresyjny', 'legenda', 'podania', 'sonet', 'sonety', 'poematy', 'literaturoznawstwo',
        'teatr', 'awangarda', 'wiersz', 'wiersze', 'realistyczna', 'sentencje', 'myśli', 'eseistyka',
        'limeryki', 'estetyka', 'poeci', 'sztuka', 'film', 'teksty filozoficzne', 'ebooki', 'audiobooki',
        'marginistyczna', 'farsy', 'poezja zagraniczna', 'satyry i parodie', 'eseistyka', 'dokument zbeleteryzowany',
        'zbeleteryzowany',
      ],
      [
        'Biografie, wspomnienia',
        'biografia', 'wspomnienia', 'autobiografia', 'biografie', 'biograficzna',
        'pamiętniki',
      ],
      [
        'Fantasy, science fiction, horror',
        'fantasy', 'science fiction', 'scifi', 'sci-fi', 'sci fi', 'horror', 'fantasy', 'sf',
        'fantastyczne', 'książki fantastyczne', 'groza', 'horror i groza', 'space opera',
        'utopia', 'steampunk', 'punk', 'postapokalipsa', 'apokalipsa', 'antyutopia', 'utopia',
        'fantastyka', 'saga',
      ],
      [
        'Kryminał, sensacja i thriller',
        'kryminał', 'sensacja', 'thriller', 'powieść kryminalna', 'akcja', 'więziennictwo',
        'przygoda', 'przygodowe', 'kryminalistyka', 'awantura',
      ],
      [
        'Literatura obyczajowa, erotyczna',
        'erotyka', 'obyczajowa', 'sex', 'seks', 'romans', 'miłość',
        'erotyczny', 'romans erotyczny', 'uczucia', 'związki', 'erotyczne',
        'eroty',
      ],
      [
        'Reportaż, literatura faktu, prasa',
        'reportaż', 'fakty', 'dzienniki', 'czasopismo', 'felieton', 'eseje', 'wywiad',
        'czasopismo', 'prasa', 'publikacje', 'publicystyka', 'reportażowa',
        'relacje podróżników',
      ],
      [
        'Komiksy',
        'manga', 'komiks',
      ],
      [
        'Szkoła, dzieci',
        'podręcznik', 'szkoła', 'oświata', 'dla dzieci', 'bajki', 'bajka', 'baśnie',
        'bajki i baśnie', 'klasy i-iii', 'lektury szkolne', 'lektura', 'dla młodzieży',
        'streszczenia', 'klasa', 'gimnazjum', 'liceum', 'studia', 'podstawówka',
        'nauczanie', 'dydaktyka', 'edukacja', 'edukacyjne', 'zbiory bajek', 'opracowania',
        'nastolatków', 'materiały pomocnicze', 'materiały dodatkowe', 'dla dzieci i młodzieży',
        'książki dla dzieci', 'ebooki dla młodzieży', 'dla młodzieży', 'wiek',
        'rodzina i dziecko', 'rodzina', 'pedagogika', 'pedagog', 'organizacje wychowawcze',
      ],
      [
        'Książki naukowe i popularnonaukowe',
        'nauka', 'biologia', 'popularnonaukowe', 'paranaukowe', 'paranormal', 'zmysły',
        'matematyka', 'fizyka', 'wszechświat', 'kosmos', 'astronomia',
      ],
      [
        'Informatyka, Internet',
        'programowanie', 'komputer', 'internet', 'informatyka', 'komputery', 'systemy operacyjne',
        'machine learning', 'laptop', 'przetwarzanie', 'big data', 'informatyczne', 'bezpieczeństwo',
        'technologia', 'aplikacje', 'sieci komputerowe',
      ],
      [
        'Historia, archeologia, polityka',
        'historia', 'archeologia', 'książki historyczne', 'wojna światowa', 'legendy', 'mity',
        'rzeczpospolita', 'milicja', 'wojskowość', 'polityczna', 'starożytność', 'nowożytność',
        'średniowiecze', 'partie polityczne', 'wojskowość', 'dyktator', 'królowie', 'władcy',
        'wojna', 'wojenna', 'powstania', 'technika wojskowa', 'wojny', 'polityczna', 'muzycy',
        'policja', 'dyplomacja', 'broń', 'traktaty', 'dowódcy', 'wojsko', 'militaria', 'lotnictwo',
        'zespoły muzyczne', 'polska', 'sąd', 'sądownictwo', 'pisarze', 'prawo', 'administracja',
        'kroniki', 'politologia', 'aktorzy', 'antropologia', 'państwo', 'bitwy', 'służby specjalne',
        'historia świata', 'terroryzm', 'xvi-xix',
      ],
      [
        'Hobby',
        'hobby', 'zainteresowania', 'broń', 'motoryzacja', 'samochody', 'malarze',
        'astronomia', 'gry', 'wspinaczka', 'kolej', 'transport', 'rozrywka', 'szczęście',
        'mechanika', 'ciekawostki', 'zagadki', 'wynalazki', 'sztuki walki', 'moroyzacja',
        'humor', 'styl życia', 'kariera', 'inżynieria', 'sprzęt', 'kino', 'scena', 'małżeństwo',
        'rekreacja', 'komedie', 'karty', 'puzzle', 'planszowe', 'architektura', 'projektowanie',
        'fotografia', 'fotografia cyfrowa', 'ryby', 'planszówki', 'szkolenia', 'domowe porady',
        'porady', 'tematyczne', 'zapowiedzi',
      ],
      [
        'Finanse',
        'finanse', 'pieniądze', 'bank', 'bankowość', 'giełda', 'logistyka', 'zarządzanie', 'finanse publiczne',
        'przedsiębiorstwo', 'handel', 'usługi', 'marketing', 'office', 'ekonomia', 'ekonomii', 'firma', 'inwestycje',
        'gospodarka', 'przedsiebiorczosc', 'reklama', 'zarzadzanie-logistyka', 'media', 'księgowość',
        'rynek pracy', 'przedsiębiorczość', 'biznes', 'przywództwo w biznesie', 'biznes i ekonomia',
        'handel i gospodarka',
      ],
      [
        'Religioznawstwo, nauki teologiczne',
        'religia', 'teologia', 'bóg', 'wiara', 'wierzenia', 'bóstwa', 'kazania', 'papież',
        'kościół', 'watykan', 'zabobon', 'katacheza', 'zakon', 'psalmy', 'hymny',
        'chrześcijaństwo', 'islam', 'judaizm', 'katolicyzm', 'katolik', 'święty', 'żywoty świętych',
        'duchowość', 'kazania', 'religijne', 'książki religijne',
      ],
      [
        'Kuchnia, potrawy',
        'przepisy', 'odżywianie', 'jedzenie', 'potrawy', 'dieta', 'diety', 'pożywienie',
        'kuchnia',
      ],
      [
        'Sport, forma fizyczna, zdrowie',
        'sport', 'trening', 'dieta', 'ćwiczenia', 'zdrowie', 'medycyna', 'ciąża', 'wychowywanie', 'rozwój',
        'uzależnienia', 'koszykówka', 'piłka nożna', 'siatkówka', 'kręgle', 'macierzyństwo',
        'lekarze', 'zmysły', 'sportowcy', 'emocje', 'organizacje wychowawcze',
      ],
      [
        'Poradniki i albumy',
        'poradnik',
      ],
      [
        'Mapy, przewodniki, książki podróżnicze',
        'mapy', 'przewodnik', 'podróżnicze', 'geografia', 'geograficznych', 'góry',
        'ameryka', 'azja', 'europa', 'afryka', 'australia', 'świat', 'podróże', 'zwiedzanie',
        'turystyka', 'geograficzne', 'krainy', 'parki', 'emigracja',
      ],
      [
        'Język',
        'język obcy', 'język niemiecki', 'język angielski', 'języki obce', 'rosyjski', 'niemiecki', 'angielski',
        'nauka języków', 'słownik', 'encyklopedie', 'słowniki', 'encyklopedia', 'leksykon', 'leksykony', 'obcojęzyczne',
        'językoznawstwo',
      ],
      [
        'Literatura piękna, popularna i faktu',
        'literatura faktu', 'popularna', 'literatura piękna',
      ],
      [
        'Książki o naukach przyrodniczych',
        'przyroda', 'przyrodnicze', 'natura', 'zwierzęta', 'rośliny', 'rolnictwo', 'rezerwaty',
      ],
      [
        'Nauki humanistyczne',
        'słownik', 'filozofia', 'humanistyka', 'kobieta', 'kulturoznawstwo',
        'kobiety', 'mężczyźni', 'słowniki', 'kultura', 'emocje',
      ],
      [
        'Nauki społeczne',
        'psychologia', 'socjologia', 'kulturoznawstwo', 'społecznych', 'badania społeczne', 'socjologiczne',
        'ezoteryka', 'parapsychologia', 'interpersonalne', 'komunikacja', 'międzyludzka', 'rozmowy', 'dialog',
        'psychologiczne', 'osobowość', 'motywacja', 'społeczeństwo', 'stres i agresja',
      ],
    ];

    await upsert(
      {
        connection,
        Entity: BookCategoryEntity,
        primaryKey: 'parameterizedName',
        data: names.map(
          ([name, ...nameAliases]) => new BookCategoryEntity({
            root: true,
            parameterizedName: parameterize(name),
            name,
            nameAliases,
          }),
        ),
      },
    );
  }
}
