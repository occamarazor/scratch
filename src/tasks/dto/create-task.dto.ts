import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { TASK_STATUS_VALUES } from '../tasks.constants';
import type { TaskStatus } from '../tasks.types';

const taskStatusOptions: TaskStatus[] = Object.values(TASK_STATUS_VALUES);

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(taskStatusOptions)
  @IsOptional()
  status?: TaskStatus;

  @IsInt()
  @Min(0)
  @IsOptional()
  priority?: number;

  @IsDateString()
  @IsOptional()
  dueAt?: string; // ISO date string, null omitted
}
