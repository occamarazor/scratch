import type { Nullable } from '@common/types';

import { TaskStatus } from '../tasks.types';
import { Task } from '../tasks.types';

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
