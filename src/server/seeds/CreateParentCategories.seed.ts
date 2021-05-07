/* eslint-disable import/no-default-export */
import {Factory, Seeder} from 'typeorm-seeding';
import {Connection} from 'typeorm';

import {parameterize} from '@shared/helpers/parameterize';
import {BookCategoryEntity} from '@server/modules/book/modules/category';

export default class CreateParentCategories implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const names = [
      'Literatura Piękna',
      'Biografie, wspomnienia',
      'Fantasy, science fiction, horror',
      'Kryminał, sensacja i thriller',
      'Literatura obyczajowa, erotyczna',
      'Reportaż, literatura faktu',
      'Komiksy',
      'Książki dla dzieci',
      'Książki dla młodzieży',
      'Książki naukowe i popularnonaukowe',
      'Informatyka, Internet',
      'Historia, archeologia',
      'Prawo, administracja',
      'Religioznawstwo, nauki teologiczne',
      'Kuchnia, potrawy',
      'Sport, forma fizyczna',
      'Poradniki i albumy',
      'Mapy, przewodniki, książki podróżnicze',
      'Podręczniki do szkół',
      'Książki do nauki języka obcego',
      'Książki obcojęzyczne',
      'Kalendarze, gadżety i akcesoria',
      'Czasopisma',
      'Literatura piękna, popularna i faktu',
      'Książki dla dzieci i młodzieży',
      'Książki do nauki języków obcych',
      'Książki o naukach przyrodniczych',
      'Nauki humanistyczne',
      'Nauki społeczne',
      'Książki o naukach ścisłych',
    ];

    await connection
      .createQueryBuilder()
      .insert()
      .into(BookCategoryEntity)
      .values(
        names.map(
          (name) => ({
            root: true,
            parameterizedName: parameterize(name),
            name,
          }),
        ),
      )
      .onConflict('DO NOTHING')
      .execute();
  }
}
