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

export class APICountedRecord<T> {
  constructor(
    public readonly record: T,
    public readonly count: number = 0,
  ) {}
}

export type CreateCountedAggType<Type> = Partial<{
  +readonly [Key in keyof Type]: APICountedRecord<Type[Key]>;
}>;
