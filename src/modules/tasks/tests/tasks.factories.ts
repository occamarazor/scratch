import type { CreateTaskDto } from '@tasks/dto/create-task.dto';
import type { UpdateTaskDto } from '@tasks/dto/update-task.dto';
import { TaskEntity } from '@tasks/entities/task.entity';
import type { Task } from '@tasks/tasks.types';
import { TaskStatus } from '@tasks/tasks.types';

let idCounter = 1000;
export const resetFactories = () => {
  idCounter = 1000;
};

export const generateCreateTaskDto = (overrides?: Partial<CreateTaskDto>): CreateTaskDto => ({
  title: `Generated Create DTO: ${idCounter}`,
  description: 'Generated Create DTO Description',
  status: TaskStatus.TODO,
  priority: 0,
  dueAt: undefined,
  ...overrides,
});

export const generateUpdateTaskDto = (overrides?: UpdateTaskDto): UpdateTaskDto => ({
  title: undefined,
  description: undefined,
  status: undefined,
  priority: undefined,
  dueAt: undefined,
  ...overrides,
});

// Return a *real* TaskEntity instance so class-transformer / TypeORM assumptions hold
export const generateTaskEntity = (overrides?: Partial<TaskEntity>): TaskEntity => {
  const now = new Date();

  const base: Partial<TaskEntity> = {
    id: idCounter++,
    title: `Generated Task Entity ${Math.floor(Math.random() * 10000)}`,
    description: 'Generated Task Entity Description',
    status: TaskStatus.TODO,
    priority: 0,
    ownerId: 'user-1',
    dueAt: undefined,
    createdAt: now,
    updatedAt: now,
  };

  const obj = Object.assign(new TaskEntity(), { ...base, ...overrides });
  return obj;
};

export const generateTask = (overrides?: Partial<Task>): Task => {
  const now = new Date();

  return {
    id: idCounter++,
    title: `Generated Task ${Math.floor(Math.random() * 10000)}`,
    description: 'Generated Task Description',
    status: TaskStatus.TODO,
    priority: 0,
    tenantId: 'tenant-1',
    ownerId: 'user-1',
    dueAt: undefined,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

export const generateTasksDomainToResponse = (): jest.Mock =>
  jest.fn((task: Task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    tenantId: task.tenantId,
    ownerId: task.ownerId,
    dueAt: task.dueAt ? task.dueAt.toISOString() : undefined,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }));

export interface CreateTaskRawUseCaseMock {
  execute: jest.Mock;
}
