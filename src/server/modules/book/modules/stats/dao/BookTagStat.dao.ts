export class BookTagStatDAO {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly parameterizedName: string,
    public readonly booksCount: number,
  ) {}
}
