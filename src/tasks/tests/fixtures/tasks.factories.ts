import type { CreateTaskDto } from '@tasks/dto/create-task.dto';
import type { UpdateTaskDto } from '@tasks/dto/update-task.dto';
import { TaskEntity } from '@tasks/entities/task.entity';
import { TaskStatus } from '@tasks/tasks.types';

// Simple incrementing counter for ids in tests
let nextId = 1000;
export const resetFactories = () => {
  nextId = 1000;
};

export const generateCreateTaskDto = (overrides?: Partial<CreateTaskDto>): CreateTaskDto => ({
  title: 'Test Task',
  description: 'Test description',
  status: TaskStatus.TODO,
  priority: 0,
  dueAt: undefined,
  ...overrides,
});

export const generateUpdateTaskDto = (overrides?: Partial<UpdateTaskDto>): UpdateTaskDto => ({
  title: undefined,
  description: undefined,
  status: undefined,
  priority: undefined,
  dueAt: undefined,
  ...overrides,
});

// Return a *real* TaskEntity instance so class-transformer / TypeORM assumptions hold
export const generateTaskEntity = (overrides?: Partial<TaskEntity>): TaskEntity => {
  const base: Partial<TaskEntity> = {
    id: nextId++,
    title: 'Task ' + Math.random().toString(36).slice(2, 8),
    description: 'desc',
    status: TaskStatus.TODO,
    priority: 0,
    dueAt: undefined,
    ownerId: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const obj = Object.assign(new TaskEntity(), { ...base, ...overrides });
  return obj;
};
