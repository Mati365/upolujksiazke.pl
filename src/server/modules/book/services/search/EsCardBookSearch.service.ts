import {forwardRef, Inject, Injectable} from '@nestjs/common';
import {EsBookIndex} from '../indexes/EsBook.index';

@Injectable()
export class EsCardBookSearchService {
  constructor(
    @Inject(forwardRef(() => EsBookIndex))
    private readonly bookEsIndex: EsBookIndex,
  ) {}
}
