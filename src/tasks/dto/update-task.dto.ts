import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, ValidateIf } from 'class-validator';

import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ValidateIf((_, value) => value !== undefined)
  @IsDateString()
  dueAt?: string; // ISO date string, null rejected
}
