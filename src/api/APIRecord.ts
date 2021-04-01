export abstract class APIRecord {
  id: number;
}

export abstract class APINamedRecord extends APIRecord {
  name: string;
  parameterizedName: string;
}

export class APIDatedRecord {
  createdAt: Date;
  updatedAt: Date;
}
