import { CurrentUser } from '@common/decorators';
import { ParseNullableIntPipe } from '@common/pipes';
import type { AuthUser, Nullable } from '@common/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { CreateTaskDto } from './dto/create-task.dto';
import type { TaskResponseDto } from './dto/task-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import type { Task, TasksUpdateResponse } from './tasks.types';

@Controller('/api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getTasks(
    @Query('ownerId', ParseNullableIntPipe) ownerId?: number,
  ): Promise<TaskResponseDto[]> {
    // TODO: fix validation, query tries to parse ownerId as number showing NaN instead of initial input
    // console.log('ownerId: ', ownerId);
    const tasksList: Task[] = await this.tasksService.getTasks(ownerId);
    return tasksList.map((t) => this.tasksService.domainToResponse(t));
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTask(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user?: AuthUser,
  ): Promise<TaskResponseDto> {
    const taskCreated: Task = await this.tasksService.createTask(dto, user?.id);
    return this.tasksService.domainToResponse(taskCreated);
  }

  @Patch()
  async updateTasks(
    @Body() body: { ids: number[]; patch: Partial<UpdateTaskDto> },
  ): Promise<TasksUpdateResponse> {
    const affectedTasks: number = await this.tasksService.updateTasks(body.ids, body.patch);
    return { affectedTasks };
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTasks(): Promise<void> {
    await this.tasksService.deleteTasks();
  }

  @Get(':id')
  async getTaskById(@Param('id', ParseIntPipe) id: number): Promise<TaskResponseDto> {
    const taskFound: Nullable<Task> = await this.tasksService.getTaskById(id);
    if (!taskFound) throw new NotFoundException(`Task with ID: ${id} not found`);
    return this.tasksService.domainToResponse(taskFound);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateTaskById(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    const taskUpdated: Nullable<Task> = await this.tasksService.updateTaskById(id, dto);
    if (!taskUpdated) throw new NotFoundException(`Task with ID: ${id} not found`);
    return this.tasksService.domainToResponse(taskUpdated);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTaskById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const deletionResult: boolean = await this.tasksService.deleteTaskById(id);
    if (!deletionResult) throw new NotFoundException(`Task with ID: ${id} not found`);
    return;
  }
}
