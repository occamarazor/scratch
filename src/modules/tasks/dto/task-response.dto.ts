import { Nullable } from '@common/types';

import type { TaskStatus } from '../tasks.types';

/**
 * Response model for API clients
 * Dates are serialized as ISO strings for predictable JSON output
 */
export class TaskResponseDto {
  id!: number;
  title!: string;
  description?: Nullable<string>;
  status!: TaskStatus;
  priority!: number;
  ownerId!: string;
  dueAt?: Nullable<string>;
  createdAt!: string;
  updatedAt!: string;
}
