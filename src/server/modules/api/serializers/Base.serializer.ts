import {Expose} from 'class-transformer';

export class BaseSerializer {
  @Expose() id: number;
}

export class BaseDatedSerialized extends BaseSerializer {
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}
