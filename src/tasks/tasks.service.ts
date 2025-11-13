import type { Nullable } from '@common/types';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { DeleteResult, Repository } from 'typeorm';

import type { CreateTaskDto } from './dto/create-task.dto';
import type { TaskResponseDto } from './dto/task-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';
import type { Task } from './tasks.types';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly tasksRepository: Repository<TaskEntity>,
  ) {}

  // Maps persistence model TaskEntity to business logic model Task
  private entityToDomain(e: TaskEntity): Task {
    return {
      id: e.id,
      title: e.title,
      description: e.description ?? undefined,
      status: e.status,
      priority: e.priority,
      dueAt: e.dueAt ?? undefined,
      ownerId: e.ownerId ?? undefined,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }

  // Maps business logic model Task to API model TaskResponseDto
  domainToResponse(task: Task): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      ownerId: task.ownerId,
      // Dates as ISO strings (safe for FE)
      dueAt: task.dueAt ? new Date(task.dueAt).toISOString() : undefined,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  async getTasks(ownerId?: number): Promise<Task[]> {
    const where = ownerId !== undefined ? { ownerId } : {};
    const taskEntities: TaskEntity[] = await this.tasksRepository.find({
      where,
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
    return taskEntities.map((e) => this.entityToDomain(e));
  }

  async createTask(dto: CreateTaskDto, ownerId?: number): Promise<Task> {
    const taskEntityCreated: TaskEntity = this.tasksRepository.create({
      ...dto,
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      ownerId: ownerId ?? undefined,
    });
    const taskEntitySaved: TaskEntity = await this.tasksRepository.save(taskEntityCreated);
    return this.entityToDomain(taskEntitySaved);
  }

  async updateTasks(ids: number[], patch: Partial<UpdateTaskDto>): Promise<number> {
    // Validate patch using UpdateTaskDto rules
    const dtoInstance = plainToInstance(UpdateTaskDto, patch);

    try {
      await validateOrReject(dtoInstance, {
        whitelist: true,
        forbidNonWhitelisted: true,
        validationError: { target: false },
      });
    } catch (errors) {
      const validationErrors = Array.isArray(errors)
        ? (errors as ValidationError[])
        : [errors as ValidationError];

      const messages = validationErrors
        .map((e) => {
          if (e.constraints) {
            return Object.values(e.constraints).join(', ');
          }

          if (e.children && e.children.length > 0) {
            return e.children
              .map((child) =>
                child.constraints
                  ? Object.values(child.constraints).join(', ')
                  : JSON.stringify(child),
              )
              .join(', ');
          }

          return JSON.stringify(e);
        })
        .join('; ');

      throw new BadRequestException(`Invalid patch payload: ${messages}`);
    }

    // Build update payload (convert dueAt to Date if present)
    const updatePayload: Partial<TaskEntity> = { ...(patch as Partial<TaskEntity>) };

    if (patch.dueAt !== undefined) {
      const value = patch.dueAt as Nullable<string>;
      updatePayload.dueAt = value ? new Date(value) : undefined;
    }

    // Execute bulk update
    const res = await this.tasksRepository
      .createQueryBuilder()
      .update(TaskEntity)
      .set(updatePayload)
      .where('id IN (:...ids)', { ids })
      .execute();

    return res.affected ?? 0;
  }

  // TODO: CAUTION! Guard, deletes all tasks
  async deleteTasks(): Promise<void> {
    await this.tasksRepository.clear();
  }

  async getTaskById(id: number): Promise<Nullable<Task>> {
    const taskEntityFound: Nullable<TaskEntity> =
      (await this.tasksRepository.findOne({ where: { id } })) ?? undefined;
    return taskEntityFound ? this.entityToDomain(taskEntityFound) : undefined;
  }

  async updateTaskById(id: number, dto: UpdateTaskDto): Promise<Nullable<Task>> {
    const taskEntityUpdated: Nullable<TaskEntity> =
      (await this.tasksRepository.findOne({ where: { id } })) ?? undefined;

    if (!taskEntityUpdated) return undefined;

    const { dueAt, ...rest } = dto;
    const patch: Partial<TaskEntity> = {
      ...(rest as Partial<TaskEntity>),
      ...(dueAt !== undefined ? { dueAt: new Date(dueAt) } : {}),
    };

    this.tasksRepository.merge(taskEntityUpdated, patch);
    const taskEntitySaved: TaskEntity = await this.tasksRepository.save(taskEntityUpdated);
    return this.entityToDomain(taskEntitySaved);
  }

  async deleteTaskById(id: number): Promise<boolean> {
    const deletionResult: DeleteResult = await this.tasksRepository.delete(id);
    return (deletionResult.affected ?? 0) === 1;
  }
}
