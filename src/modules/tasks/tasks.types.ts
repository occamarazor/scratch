import { Nullable } from '@common/types';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export interface Task {
  id: number;
  title: string;
  description?: Nullable<string>;
  status: TaskStatus;
  priority: number;
  tenantId: string;
  ownerId: string;
  dueAt?: Nullable<Date>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TasksUpdateResponse {
  affectedTasks: number;
}
