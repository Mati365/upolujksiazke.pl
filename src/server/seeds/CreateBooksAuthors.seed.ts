/* eslint-disable import/no-default-export */
import {Factory, Seeder} from 'typeorm-seeding';
import {Connection} from 'typeorm';

import {parameterize} from '@shared/helpers/parameterize';
import {upsert} from '@server/common/helpers/db';

import {BookAuthorEntity} from '@server/modules/book/modules/author';

export default class CreateBooksAuthors implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const names = [
      {
        name: 'J.K. Rowling',
        nameAliases: [
          'Rowling Joanne K',
          'J.K.Rowling',
          'JK Rowling',
          'Joanne Rowling',
          'Rowling Joanne',
        ],
      },
    ];

    await upsert(
      {
        connection,
        Entity: BookAuthorEntity,
        primaryKey: 'parameterizedName',
        data: names.map(
          ({name, nameAliases}) => new BookAuthorEntity(
            {
              name,
              nameAliases,
              parameterizedName: parameterize(name),
            },
          ),
        ),
      },
    );
  }
}
