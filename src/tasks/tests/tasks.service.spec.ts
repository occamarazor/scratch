import type { Nullable } from '@common/types';
import { BadRequestException } from '@nestjs/common';
import type { CreateTaskDto } from '@tasks/dto/create-task.dto';
import type { TaskResponseDto } from '@tasks/dto/task-response.dto';
import type { UpdateTaskDto } from '@tasks/dto/update-task.dto';
import type { TaskEntity } from '@tasks/entities/task.entity';
import { TasksService } from '@tasks/tasks.service';
import type { Task } from '@tasks/tasks.types';
import {
  generateCreateTaskDto,
  generateTask,
  generateTaskEntity,
  generateUpdateTaskDto,
  resetFactories,
} from '@tasks/tests/tasks.factories';
import { createQueryBuilderMock, createRepoMock } from '@test/utils/tests.helpers';
import { QueryBuilderMock, RepoMock } from '@test/utils/tests.types';
import { Repository } from 'typeorm';

describe('TasksService', () => {
  let service: TasksService;
  let repoMock: RepoMock<TaskEntity>;

  beforeEach(() => {
    resetFactories();

    repoMock = createRepoMock();

    // Deliberate double cast: Partial mock -> Repository<T>
    service = new TasksService(repoMock as unknown as Repository<TaskEntity>);
  });

  afterEach(() => jest.resetAllMocks());

  it('domainToResponse: should convert dates into ISO strings', () => {
    const task: Task = generateTask({ id: 1 });
    const dto: TaskResponseDto = service.domainToResponse(task);
    expect(typeof dto.createdAt).toBe('string');
    expect(dto.createdAt).toBe(new Date(task.createdAt).toISOString());
  });

  it('getTasks: should map entities to domain', async () => {
    const ownerId: number = 5;
    const e1: TaskEntity = generateTaskEntity({ id: 1, title: 'Title 1', ownerId });
    const e2: TaskEntity = generateTaskEntity({ id: 2, title: 'Title 2', ownerId });

    (repoMock.find as jest.Mock).mockResolvedValue([e1, e2]);

    const result: Task[] = await service.getTasks(ownerId);

    expect(repoMock.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerId },
      }),
    );
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[0].title).toBe('Title 1');
    expect(result[1].ownerId).toBe(ownerId);
  });

  it('createTask: should create & save entity and return domain object', async () => {
    const ownerId: number = 11;
    const dueAt: string = '2025-11-20T12:00:00.000Z';
    const dto: CreateTaskDto = generateCreateTaskDto({ dueAt });
    const entity: TaskEntity = generateTaskEntity({
      dueAt: new Date(dueAt),
      ownerId,
    });

    (repoMock.create as jest.Mock).mockReturnValue(entity);
    (repoMock.save as jest.Mock).mockResolvedValue(entity);

    const result: Task = await service.createTask(dto, ownerId);

    expect(repoMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: dto.title,
        description: dto.description,
        dueAt: expect.any(Date) as Date,
        ownerId,
      }),
    );
    expect(result.id).toBe(entity.id);
    expect(result.dueAt).toBeInstanceOf(Date);
    expect(result.ownerId).toBe(ownerId);
  });

  it('updateTasks: should run bulk update and return affected count', async () => {
    const ids: number[] = [1, 2, 3];
    const patch: Partial<UpdateTaskDto> = { priority: 2 };
    const qb: QueryBuilderMock = createQueryBuilderMock();

    qb.execute.mockResolvedValue({ affected: ids.length });

    // Override factory default for this test
    (repoMock.createQueryBuilder as jest.Mock).mockReturnValue(qb);

    const affected: number = await service.updateTasks(ids, patch);

    expect(repoMock.createQueryBuilder).toHaveBeenCalled();
    expect(affected).toBe(ids.length);
  });

  it('updateTasks: should be a no-op and return 0 with empty ids', async () => {
    const ids: number[] = [];
    const patch: Partial<UpdateTaskDto> = { priority: 2 };

    const affected: number = await service.updateTasks(ids, patch);
    expect(affected).toBe(0);
    expect(repoMock.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('updateTasks: should throw BadRequestException for invalid patch', async () => {
    const ids: number[] = [1, 2];
    const badPatch = { status: 'INVALID_STATUS' } as unknown as Partial<UpdateTaskDto>;

    await expect(service.updateTasks(ids, badPatch)).rejects.toThrow(BadRequestException);
  });

  it('deleteTasks: should clear repository', async () => {
    (repoMock.clear as jest.Mock).mockResolvedValue(undefined);
    await service.deleteTasks();
    expect(repoMock.clear).toHaveBeenCalled();
  });

  it('deleteTasks: should propagate DB errors when .clear rejects', async () => {
    const dbErr = new Error('DB clear failed');
    (repoMock.clear as jest.Mock).mockRejectedValueOnce(dbErr);

    await expect(service.deleteTasks()).rejects.toThrow(dbErr);
    expect(repoMock.clear).toHaveBeenCalled();
  });

  it('getTaskById: should return domain object when task found', async () => {
    const taskId = 10;
    const entity: TaskEntity = generateTaskEntity({ id: taskId });

    (repoMock.findOne as jest.Mock).mockResolvedValue(entity);

    const found: Nullable<Task> = await service.getTaskById(taskId);
    expect(found?.id).toBe(taskId);
  });

  it('getTaskById: should return undefined when task not found', async () => {
    (repoMock.findOne as jest.Mock).mockResolvedValue(undefined);
    const notFound: Nullable<Task> = await service.getTaskById(999);
    expect(notFound).toBeUndefined();
  });

  it('updateTaskById: should merge, save and return updated domain object', async () => {
    const found: TaskEntity = generateTaskEntity({
      id: 55,
      title: 'Old title',
      priority: 1,
    });

    const dto: UpdateTaskDto = generateUpdateTaskDto({
      title: 'New title',
      priority: 3,
      dueAt: '2025-12-01T10:00:00.000Z',
    });

    const patched: TaskEntity = generateTaskEntity({
      id: found.id,
      title: dto.title,
      priority: dto.priority,
      dueAt: new Date(dto.dueAt as string),
    });

    (repoMock.findOne as jest.Mock).mockResolvedValue(found);

    (repoMock.merge as jest.Mock).mockImplementation(
      (target: TaskEntity, patch: Partial<TaskEntity>) => ({ ...target, ...patch }),
    );

    (repoMock.save as jest.Mock).mockResolvedValue(patched);

    const result: Nullable<Task> = await service.updateTaskById(found.id, dto);

    expect(repoMock.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: found.id } }),
    );

    expect(repoMock.merge).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        title: dto.title,
        priority: dto.priority,
        dueAt: new Date(dto.dueAt as string),
      }),
    );

    expect(repoMock.save).toHaveBeenCalledWith(expect.objectContaining({ id: found.id }));
    expect(result).toBeDefined();
    expect(result?.id).toBe(found.id);
    expect(result?.title).toBe(dto.title);
    expect(result?.priority).toBe(dto.priority);
    expect(result?.dueAt).toBeInstanceOf(Date);
  });

  it('updateTaskById: should return undefined when task not found', async () => {
    const dto: UpdateTaskDto = generateUpdateTaskDto({ title: 'New title' });

    (repoMock.findOne as jest.Mock).mockResolvedValueOnce(undefined);

    const result: Nullable<Task> = await service.updateTaskById(687, dto);
    expect(result).toBeUndefined();
  });

  it('deleteTaskById: should return true when deletion affected 1 row', async () => {
    (repoMock.delete as jest.Mock).mockResolvedValue({ affected: 1 });
    const taskeDeleted = await service.deleteTaskById(77);
    expect(repoMock.delete).toHaveBeenCalledWith(77);
    expect(taskeDeleted).toBe(true);
  });

  it('deleteTaskById: should return false when none affected', async () => {
    (repoMock.delete as jest.Mock).mockResolvedValue({ affected: 0 });
    const taskeDeleted = await service.deleteTaskById(9999);
    expect(repoMock.delete).toHaveBeenCalledWith(9999);
    expect(taskeDeleted).toBe(false);
  });
});
