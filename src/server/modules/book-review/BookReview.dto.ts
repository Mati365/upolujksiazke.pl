import {IsDefined, Length, MinLength} from 'class-validator';

export class BookReviewDto {
  @Length(4, 200)
  readonly title: string;

  @IsDefined()
  @MinLength(3)
  readonly description: string;

  constructor(partial: Partial<BookReviewDto>) {
    Object.assign(this, partial);
  }
}
