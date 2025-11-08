import { Nullable } from '@common/types';

import { TASK_STATUS_VALUES } from './tasks.constants';

export type TaskStatus = (typeof TASK_STATUS_VALUES)[keyof typeof TASK_STATUS_VALUES];

export interface Task {
  id: number;
  title: string;
  description?: Nullable<string>;
  status: TaskStatus;
  priority: number;
  dueAt?: Nullable<Date>;
  ownerId?: Nullable<number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TasksUpdateResponse {
  affectedTasks: number;
}
