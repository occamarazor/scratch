import { CurrentUser } from '@common/decorators';
import type { Nullable, UserContext } from '@common/types';
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
  async getTasks(@CurrentUser() user: UserContext): Promise<TaskResponseDto[]> {
    const tasksList: Task[] = await this.tasksService.getTasks(user.userId);
    return tasksList.map((t) => this.tasksService.domainToResponse(t));
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTask(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: UserContext,
  ): Promise<TaskResponseDto> {
    const taskCreated: Task = await this.tasksService.createTask(dto, user.userId);
    return this.tasksService.domainToResponse(taskCreated);
  }

  @Patch()
  async updateTasks(
    @Body() { ids, patch }: { ids: number[]; patch: Partial<UpdateTaskDto> },
    @CurrentUser() user: UserContext,
  ): Promise<TasksUpdateResponse> {
    const affectedTasks: number = await this.tasksService.updateTasks(ids, patch, user.userId);
    return { affectedTasks };
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTasks(@CurrentUser() user: UserContext): Promise<void> {
    await this.tasksService.deleteTasks(user.userId);
  }

  @Get(':id')
  async getTaskById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserContext,
  ): Promise<TaskResponseDto> {
    const taskFound: Nullable<Task> = await this.tasksService.getTaskById(id, user.userId);
    if (!taskFound) throw new NotFoundException(`Task with ID: ${id} not found`);
    return this.tasksService.domainToResponse(taskFound);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateTaskById(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: UserContext,
  ): Promise<TaskResponseDto> {
    const taskUpdated: Nullable<Task> = await this.tasksService.updateTaskById(
      id,
      dto,
      user.userId,
    );
    if (!taskUpdated) throw new NotFoundException(`Task with ID: ${id} not found`);
    return this.tasksService.domainToResponse(taskUpdated);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTaskById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserContext,
  ): Promise<void> {
    const deletionResult: boolean = await this.tasksService.deleteTaskById(id, user.userId);
    if (!deletionResult) throw new NotFoundException(`Task with ID: ${id} not found`);
    return;
  }
}
