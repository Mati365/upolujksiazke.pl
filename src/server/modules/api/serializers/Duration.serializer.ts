import {Expose} from 'class-transformer';

export class DurationSerializer {
  @Expose() from: Date;
  @Expose() to: Date;
}
