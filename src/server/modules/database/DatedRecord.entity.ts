import {
  BaseEntity,
  BeforeInsert, BeforeUpdate,
  CreateDateColumn, PrimaryGeneratedColumn,
} from 'typeorm';

export abstract class DatedRecordEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn(
    {
      type: 'timestamp',
    },
  )
  createdAt: Date;

  @CreateDateColumn(
    {
      type: 'timestamp',
    },
  )
  updatedAt?: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdAt = new Date;
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedAt = new Date;
  }
}
