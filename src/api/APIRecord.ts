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

export type APICountedRecord<T> = {
  record: T,
  count: number,
};

export type CreateCountedAggType<Type> = Partial<{
  +readonly [Key in keyof Type]: APICountedRecord<Type[Key]>[];
}>;
