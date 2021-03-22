import {ID} from '@shared/types';

export abstract class APIRecord {
  id: ID;
}

export abstract class APINamedRecord extends APIRecord {
  name: string;
  parameterizedName: string;
}

export class APIDatedRecord {
  createdAt: Date;
  updatedAt: Date;
}
