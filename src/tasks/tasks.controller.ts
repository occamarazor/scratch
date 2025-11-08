import type { Nullable } from '@common/types';
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
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import type { Task } from './tasks.types';

@Controller('/api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getTasks(@Query('ownerId') ownerId?: string): Promise<Task[]> {
    const taskOwner: Nullable<number> = ownerId ? Number(ownerId) : undefined;
    return await this.tasksService.getTasks(taskOwner);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTask(@Body() dto: CreateTaskDto): Promise<Task> {
    return await this.tasksService.createTask(dto);
  }

  @Patch()
  async updateTasks(@Body() body: { ids: number[]; patch: Partial<UpdateTaskDto> }) {
    const affectedTasks: number = await this.tasksService.updateTasks(body.ids, body.patch);
    return { affectedTasks };
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTasks(): Promise<void> {
    await this.tasksService.deleteTasks();
  }

  @Get(':id')
  async getTaskById(@Param('id', ParseIntPipe) id: number): Promise<Nullable<Task>> {
    const taskFound: Nullable<Task> = await this.tasksService.getTaskById(id);
    if (!taskFound) throw new NotFoundException(`Task with ID: ${id} not found`);
    return taskFound;
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateTaskById(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ): Promise<Nullable<Task>> {
    const taskUpdated: Nullable<Task> = await this.tasksService.updateTaskById(id, dto);
    if (!taskUpdated) throw new NotFoundException(`Task with ID: ${id} not found`);
    return taskUpdated;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTaskById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const deletionResult: boolean = await this.tasksService.deleteTaskById(id);
    if (!deletionResult) throw new NotFoundException(`Task with ID: ${id} not found`);
    return;
  }
}
