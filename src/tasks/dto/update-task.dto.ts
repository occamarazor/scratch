import { PartialType } from '@nestjs/mapped-types';
import { ValidateIf } from 'class-validator';

import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ValidateIf((_, value) => value !== undefined)
  dueAt?: string; // ISO date string, null rejected
}
