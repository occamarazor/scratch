import type { Nullable } from '@common/types';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';

import { CreateTaskDto } from './dto/create-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
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

  // TODO: validate bulk updates!
  async updateTasks(ids: number[], patch: Partial<UpdateTaskDto>): Promise<number> {
    const updatePayload: Partial<TaskEntity> = { ...(patch as Partial<TaskEntity>) };

    if (patch.dueAt !== undefined) {
      const v = patch.dueAt as unknown as Nullable<string>;
      updatePayload.dueAt = v && v !== '' ? new Date(v) : undefined;
    }

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
