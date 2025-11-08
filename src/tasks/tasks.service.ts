import type { Nullable } from '@common/types';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';
import type { Task } from './tasks.types';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly tasksRepository: Repository<TaskEntity>,
  ) {}

  private taskToDomain(e: TaskEntity): Task {
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

  async getTasks(ownerId?: number): Promise<Task[]> {
    const where = ownerId ? { ownerId } : {};
    const taskEntities: TaskEntity[] = await this.tasksRepository.find({
      where,
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
    return taskEntities.map((e) => this.taskToDomain(e));
  }

  async createTask(dto: CreateTaskDto, ownerId?: number): Promise<Task> {
    const taskEntityCreated: TaskEntity = this.tasksRepository.create({
      ...dto,
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      ownerId: ownerId ?? undefined,
    });
    const taskEntitySaved: TaskEntity = await this.tasksRepository.save(taskEntityCreated);
    return this.taskToDomain(taskEntitySaved);
  }

  async updateTasks(ids: number[], patch: Partial<UpdateTaskDto>): Promise<number> {
    // Convert dueAt if present in patch
    const updatePayload: Partial<TaskEntity> = { ...(patch as Partial<TaskEntity>) };
    if (patch.dueAt !== undefined) {
      updatePayload.dueAt = patch.dueAt ? new Date(patch.dueAt as unknown as string) : undefined;
    }

    const res = await this.tasksRepository
      .createQueryBuilder()
      .update(TaskEntity)
      .set(updatePayload)
      .where('id IN (:...ids)', { ids })
      .execute();

    return res.affected ?? 0;
  }

  async deleteTasks(): Promise<void> {
    await this.tasksRepository.clear();
  }

  async getTaskById(id: number): Promise<Nullable<Task>> {
    const taskEntityFound: Nullable<TaskEntity> =
      (await this.tasksRepository.findOne({ where: { id } })) ?? undefined;
    return taskEntityFound ? this.taskToDomain(taskEntityFound) : undefined;
  }

  async updateTaskById(id: number, dto: UpdateTaskDto): Promise<Nullable<Task>> {
    const taskEntityUpdated: Nullable<TaskEntity> =
      (await this.tasksRepository.findOne({ where: { id } })) ?? undefined;

    if (!taskEntityUpdated) return undefined;

    const { dueAt: dueAtStr, ...rest } = dto;

    // Normalize into Nullable<Date>
    const dueAt: Nullable<Date> =
      dueAtStr !== undefined && dueAtStr !== '' ? new Date(dueAtStr) : undefined;

    // Build patch WITHOUT carrying the raw string dueAt
    const patch: Partial<TaskEntity> = {
      ...(rest as Partial<TaskEntity>),
      dueAt,
    };

    this.tasksRepository.merge(taskEntityUpdated, patch);
    const taskEntitySaved: TaskEntity = await this.tasksRepository.save(taskEntityUpdated);
    return this.taskToDomain(taskEntitySaved);
  }

  async deleteTaskById(id: number): Promise<boolean> {
    const deletionResult: DeleteResult = await this.tasksRepository.delete(id);
    return (deletionResult.affected ?? 0) === 1;
  }
}
