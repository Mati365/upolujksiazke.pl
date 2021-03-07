import {ID} from '@shared/types';

export abstract class APIRecord {
  id: ID;
}

export class APIDatedRecord {
  createdAt: Date;
  updatedAt: Date;
}
