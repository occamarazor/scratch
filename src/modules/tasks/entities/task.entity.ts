import type { Nullable } from '@common/types';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TaskStatus } from '../tasks.types';

@Entity('tasks')
@Index(['tenantId', 'ownerId', 'status', 'priority'])
@Check(`"priority" >= 0 AND "priority" <= 4`) // 0–4 range enforced
export class TaskEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 }) // strict length
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: Nullable<string>;

  @Column({
    type: 'varchar',
    length: 11, // strict length
    default: TaskStatus.TODO,
    enum: Object.values(TaskStatus),
  })
  status!: TaskStatus;

  @Column({ type: 'int', default: 0 })
  priority!: number;

  @Column({ type: 'varchar', length: 36 })
  tenantId!: string;

  @Column({ type: 'varchar', length: 36 })
  ownerId!: string;

  @Column({ type: 'timestamptz', nullable: true })
  dueAt?: Nullable<Date>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // TODO: replace logging hooks with domain events or service-level logging
  @AfterInsert()
  logCreate() {
    console.log('Task created: ', this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('Task updated: ', this.id);
  }

  @AfterRemove()
  logDelete() {
    console.log('Task deleted: ', this.id);
  }
}
