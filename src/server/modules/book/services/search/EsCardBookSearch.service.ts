import {forwardRef, Inject, Injectable} from '@nestjs/common';

import {BookFullInfoRecord} from '@api/types';
import {EsBookIndex} from '../indexes/EsBook.index';

@Injectable()
export class EsCardBookSearchService {
  constructor(
    @Inject(forwardRef(() => EsBookIndex))
    private readonly bookEsIndex: EsBookIndex,
  ) {}

  async findFullCard({id}: {id: number}): Promise<BookFullInfoRecord> {
    return <any> this.bookEsIndex.getByID(id);
  }
}
