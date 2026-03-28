import type { Nullable, UserContext } from '@common/types';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { DeleteResult, QueryRunner, Repository, UpdateResult } from 'typeorm';

import type { CreateTaskDto } from './dto/create-task.dto';
import type { TaskResponseDto } from './dto/task-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';
import type { Task } from './tasks.types';

// TODO: make service thin & reusable
//  TODO: move entity & service to domain dir
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly tasksRepository: Repository<TaskEntity>,
  ) {}

  // Maps raw DB row to business logic model Task
  private dbRowToDomain(row: Task): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      status: row.status,
      priority: row.priority,
      tenantId: row.tenantId,
      ownerId: row.ownerId,
      dueAt: row.dueAt ? new Date(row.dueAt) : undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  // Maps persistence model TaskEntity to business logic model Task
  private entityToDomain(e: TaskEntity): Task {
    return {
      id: e.id,
      title: e.title,
      description: e.description ?? undefined,
      status: e.status,
      priority: e.priority,
      tenantId: e.tenantId,
      ownerId: e.ownerId,
      dueAt: e.dueAt ?? undefined,
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
      tenantId: task.tenantId,
      ownerId: task.ownerId,
      // Dates as ISO strings (safe for FE)
      dueAt: task.dueAt ? new Date(task.dueAt).toISOString() : undefined,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  async getTasks(user: UserContext): Promise<Task[]> {
    const { userId: ownerId, tenantId } = user;
    const taskEntities: TaskEntity[] = await this.tasksRepository.find({
      where: { ownerId, tenantId },
      order: { priority: 'DESC', createdAt: 'DESC' },
    });

    return taskEntities.map((e) => this.entityToDomain(e));
  }

  async createTask(dto: CreateTaskDto, user: UserContext): Promise<Task> {
    const { userId: ownerId, tenantId } = user;

    const taskEntityCreated: TaskEntity = this.tasksRepository.create({
      ...dto,
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      ownerId,
      tenantId,
    });
    const taskEntitySaved: TaskEntity = await this.tasksRepository.save(taskEntityCreated);

    return this.entityToDomain(taskEntitySaved);
  }

  async updateTasks(
    ids: number[],
    patch: Partial<UpdateTaskDto>,
    user: UserContext,
  ): Promise<number> {
    if (!Array.isArray(ids) || ids.length === 0) return 0;

    const { userId: ownerId, tenantId } = user;

    // Validate patch using UpdateTaskDto rules
    const dtoInstance: UpdateTaskDto = plainToInstance(UpdateTaskDto, patch);

    try {
      await validateOrReject(dtoInstance, {
        whitelist: true,
        forbidNonWhitelisted: true,
        validationError: { target: false },
      });
    } catch (errors) {
      const validationErrors: ValidationError[] = Array.isArray(errors)
        ? (errors as ValidationError[])
        : [errors as ValidationError];

      const messages: string = validationErrors
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
    const dueAt: Nullable<string> = patch.dueAt;

    if (dueAt !== undefined) {
      updatePayload.dueAt = dueAt ? new Date(dueAt) : undefined;
    }

    // Execute bulk update
    const res: UpdateResult = await this.tasksRepository
      .createQueryBuilder()
      .update(TaskEntity)
      .set(updatePayload)
      .where('id IN (:...ids) AND tenantId = :tenantId AND ownerId = :ownerId', {
        ids,
        tenantId,
        ownerId,
      })
      .execute();

    return res.affected ?? 0;
  }

  async deleteTasks(user: UserContext): Promise<void> {
    const { userId: ownerId, tenantId } = user;
    await this.tasksRepository.delete({ tenantId, ownerId });
  }

  async getTaskById(id: number, user: UserContext): Promise<Nullable<Task>> {
    const { userId: ownerId, tenantId } = user;
    const taskEntityFound: Nullable<TaskEntity> =
      (await this.tasksRepository.findOne({ where: { id, tenantId, ownerId } })) ?? undefined;

    return taskEntityFound ? this.entityToDomain(taskEntityFound) : undefined;
  }

  async updateTaskById(id: number, dto: UpdateTaskDto, user: UserContext): Promise<Nullable<Task>> {
    const { userId: ownerId, tenantId } = user;
    const taskEntityUpdated: Nullable<TaskEntity> =
      (await this.tasksRepository.findOne({ where: { id, tenantId, ownerId } })) ?? undefined;

    if (!taskEntityUpdated) return undefined;

    const { dueAt, ...rest }: UpdateTaskDto = dto;
    const patch: Partial<TaskEntity> = {
      ...(rest as Partial<TaskEntity>),
      dueAt: dueAt ? new Date(dueAt) : undefined,
    };

    this.tasksRepository.merge(taskEntityUpdated, patch);
    const taskEntitySaved: TaskEntity = await this.tasksRepository.save(taskEntityUpdated);
    return this.entityToDomain(taskEntitySaved);
  }

  async deleteTaskById(id: number, user: UserContext): Promise<boolean> {
    const { userId: ownerId, tenantId } = user;
    const deletionResult: DeleteResult = await this.tasksRepository.delete({
      id,
      tenantId,
      ownerId,
    });

    return (deletionResult.affected ?? 0) === 1;
  }

  // EXPERIMENTAL METHODS

  // Explicit Transaction (RAW SQL) with failure simulation
  async insertTaskRaw(qr: QueryRunner, dto: CreateTaskDto, user: UserContext): Promise<Task> {
    const taskRows = (await qr.query(
      `
      INSERT INTO tasks (title, description, status, priority, "tenantId", "ownerId", "dueAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
      `,
      [
        dto.title,
        dto.description ?? undefined,
        dto.status ?? 'TODO',
        dto.priority ?? 0,
        user.tenantId,
        user.userId,
        dto.dueAt ?? undefined,
      ],
    )) as Task[];

    return this.dbRowToDomain(taskRows[0]);
  }
}
