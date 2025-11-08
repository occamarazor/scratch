import type { Nullable } from '@common/types';

import type { Task, TaskStatus } from '../tasks.types';

/**
 * Response DTO for Tasks.
 *
 * Currently mirrors the domain Task shape, but kept as a DTO so you can:
 * - hide internal fields later
 * - change formats (e.g. date strings) for clients
 * - add @Expose/@Transform when needed
 */
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
