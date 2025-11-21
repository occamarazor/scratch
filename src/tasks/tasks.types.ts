import { Nullable } from '@common/types';

export enum TaskStatus {
  TODO,
  IN_PROGRESS,
  DONE,
}

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
