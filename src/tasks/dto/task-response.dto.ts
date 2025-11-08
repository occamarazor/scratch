import type { Nullable } from '@common/types';

import type { Task, TaskStatus } from '../tasks.types';
// TODO: currently not used
export class TaskResponseDto implements Task {
  id!: number;
  title!: string;
  description?: Nullable<string>;
  status!: TaskStatus;
  priority!: number;
  dueAt?: Nullable<Date>;
  ownerId?: Nullable<number>;
  createdAt!: Date;
  updatedAt!: Date;
}
