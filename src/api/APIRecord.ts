import {ID} from '@shared/types';

export abstract class APIRecord {
  id: ID;
  createdAt: Date;
  updatedAt: Date;
}

export class APINamedRecord extends APIRecord {
  name: string;
}
