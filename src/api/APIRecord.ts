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

export type APIBucketTotalStats = {
  bucket: number, // all items
  parent: number,
};

export type APICountedBucket<T> = {
  items: APICountedRecord<T>[],
  total: APIBucketTotalStats,
};

export type CreateCountedAggType<Type> = Partial<{
  +readonly [Key in keyof Type]: APICountedBucket<Type[Key]>;
}>;
