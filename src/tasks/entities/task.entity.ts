import type { Nullable } from '@common/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { TaskStatus } from '../tasks.types';

@Entity('tasks')
@Index(['ownerId', 'status', 'priority'])
export class TaskEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: Nullable<string>;

  @Column({ type: 'varchar', length: 20, default: 'TODO' })
  status!: TaskStatus;

  @Column({ type: 'int', default: 0 })
  priority!: number;

  @Column({ type: 'timestamptz', nullable: true })
  dueAt?: Nullable<Date>;

  @Column({ type: 'int', nullable: true })
  ownerId?: Nullable<number>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
