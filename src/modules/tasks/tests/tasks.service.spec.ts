import type { Nullable } from '@common/types';
import { UserContext } from '@common/types';
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
import { generateQueryBuilderMock, generateRepoMock } from '@test/utils/factories';
import { QueryBuilderMock, RepoMock } from '@test/utils/types';
import { Repository } from 'typeorm';

describe('TasksService', () => {
  let service: TasksService;
  let repoMock: RepoMock<TaskEntity>;

  beforeEach(() => {
    resetFactories();

    repoMock = generateRepoMock();

    // Deliberate double cast for tests: concrete TaskEntity Repository expected
    service = new TasksService(repoMock as unknown as Repository<TaskEntity>);
  });

  afterEach(() => jest.resetAllMocks());

  it('domainToResponse: should convert domain into response object', () => {
    const task: Task = generateTask({ id: 1 });
    const dto: TaskResponseDto = service.domainToResponse(task);

    expect(typeof dto.createdAt).toBe('string');
    expect(dto.createdAt).toBe(new Date(task.createdAt).toISOString());
  });

  it('getTasks: should return a list of domain objects on success', async () => {
    const user: UserContext = { userId: 'user-123', tenantId: 'tenant-abc' };
    const e1: TaskEntity = generateTaskEntity({ id: 1, title: 'Title 1', ownerId: user.userId });
    const e2: TaskEntity = generateTaskEntity({ id: 2, title: 'Title 2', ownerId: user.userId });

    (repoMock.find as jest.Mock).mockResolvedValue([e1, e2]);

    const result: Task[] = await service.getTasks(user.userId);

    expect(repoMock.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerId: user.userId },
      }),
    );
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[0].title).toBe('Title 1');
    expect(result[1].ownerId).toBe(user.userId);
  });

  it('createTask: should create & save entity & return domain object on success', async () => {
    const user: UserContext = { userId: 'user-321', tenantId: 'tenant-xyz' };
    const dueAt: string = '2025-11-20T12:00:00.000Z';
    const dto: CreateTaskDto = generateCreateTaskDto({ dueAt });
    const created: TaskEntity = generateTaskEntity({
      dueAt: new Date(dueAt),
      ownerId: user.userId,
    });

    (repoMock.create as jest.Mock).mockReturnValue(created);
    (repoMock.save as jest.Mock).mockResolvedValue(created);

    const result: Task = await service.createTask(dto, user.userId);

    expect(repoMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: dto.title,
        description: dto.description,
        dueAt: new Date(dto.dueAt as string),
        ownerId: user.userId,
      }),
    );
    expect(result.id).toBe(created.id);
    expect(result.dueAt).toBeInstanceOf(Date);
    expect(result.ownerId).toBe(user.userId);
  });

  it('updateTasks: should run bulk update & return affected count on success', async () => {
    const user: UserContext = { userId: 'user-546', tenantId: 'tenant-idj' };
    const ids: number[] = [1, 2, 3];
    const patch: UpdateTaskDto = { priority: 2 };
    const qb: QueryBuilderMock = generateQueryBuilderMock();

    qb.execute.mockResolvedValue({ affected: ids.length });

    // Override factory default for this test
    (repoMock.createQueryBuilder as jest.Mock).mockReturnValue(qb);

    const affected: number = await service.updateTasks(ids, patch, user.userId);

    expect(repoMock.createQueryBuilder).toHaveBeenCalled();
    expect(affected).toBe(ids.length);
  });

  it('updateTasks: should be a no-op & return 0 with empty ids', async () => {
    const user: UserContext = { userId: 'user-546', tenantId: 'tenant-ewr' };
    const ids: number[] = [];
    const patch: UpdateTaskDto = { priority: 2 };

    const affected: number = await service.updateTasks(ids, patch, user.userId);
    expect(affected).toBe(0);
    expect(repoMock.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('updateTasks: should throw BadRequestException for invalid patch', async () => {
    const user: UserContext = { userId: 'user-546', tenantId: 'tenant-ewr' };
    const ids: number[] = [1, 2];
    const badPatch = { status: 'INVALID_STATUS' } as unknown as UpdateTaskDto;

    await expect(service.updateTasks(ids, badPatch, user.userId)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('deleteTasks: should clear repository on success', async () => {
    const user: UserContext = { userId: 'user-938', tenantId: 'tenant-spl' };

    (repoMock.delete as jest.Mock).mockResolvedValue(undefined);

    await service.deleteTasks(user.userId);
    expect(repoMock.delete).toHaveBeenCalledWith({ ownerId: user.userId });
  });

  it('deleteTasks: should propagate DB errors when failed', async () => {
    const user: UserContext = { userId: 'user-938', tenantId: 'tenant-spl' };
    const dbErr = new Error('DB clear failed');
    (repoMock.delete as jest.Mock).mockRejectedValue(dbErr);

    await expect(service.deleteTasks(user.userId)).rejects.toThrow(dbErr);
    expect(repoMock.delete).toHaveBeenCalledWith({ ownerId: user.userId });
  });

  it('getTaskById: should return domain object on success', async () => {
    const user: UserContext = { userId: 'user-023', tenantId: 'tenant-kdo' };
    const taskId: number = 10;
    const found: TaskEntity = generateTaskEntity({ id: taskId, ownerId: user.userId });

    (repoMock.findOne as jest.Mock).mockResolvedValue(found);

    const result: Nullable<Task> = await service.getTaskById(taskId, user.userId);
    expect(result?.id).toBe(taskId);
    expect(result?.ownerId).toBe(user.userId);
  });

  it('getTaskById: should return undefined when not found', async () => {
    const user: UserContext = { userId: 'user-023', tenantId: 'tenant-kdo' };
    const taskId: number = 10;

    (repoMock.findOne as jest.Mock).mockResolvedValue(undefined);

    const result: Nullable<Task> = await service.getTaskById(taskId, user.userId);
    expect(result).toBeUndefined();
  });

  it('updateTaskById: should merge, save and return updated domain object', async () => {
    const user: UserContext = { userId: 'user-745', tenantId: 'tenant-slo' };

    const found: TaskEntity = generateTaskEntity({
      id: 55,
      title: 'Old title',
      priority: 1,
      ownerId: user.userId,
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
      ownerId: user.userId,
      dueAt: new Date(dto.dueAt as string),
    });

    (repoMock.findOne as jest.Mock).mockResolvedValue(found);

    (repoMock.merge as jest.Mock).mockImplementation(
      (target: TaskEntity, patch: Partial<TaskEntity>) => ({ ...target, ...patch }),
    );

    (repoMock.save as jest.Mock).mockResolvedValue(patched);

    const result: Nullable<Task> = await service.updateTaskById(found.id, dto, user.userId);

    expect(repoMock.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: found.id, ownerId: user.userId } }),
    );

    expect(repoMock.merge).toHaveBeenCalledWith(
      found,
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
    expect(result?.ownerId).toBe(user.userId);
    expect(result?.dueAt).toBeInstanceOf(Date);
    expect(result?.dueAt).toStrictEqual(new Date(dto.dueAt as string));
  });

  it('updateTaskById: should return undefined when not found', async () => {
    const user: UserContext = { userId: 'user-745', tenantId: 'tenant-slo' };
    const taskId: number = 687;
    const dto: UpdateTaskDto = generateUpdateTaskDto({ title: 'New title' });

    (repoMock.findOne as jest.Mock).mockResolvedValue(undefined);

    const result: Nullable<Task> = await service.updateTaskById(taskId, dto, user.userId);
    expect(result).toBeUndefined();
  });

  it('deleteTaskById: should return true on success', async () => {
    const user: UserContext = { userId: 'user-938', tenantId: 'tenant-ued' };
    const taskId: number = 77;

    (repoMock.delete as jest.Mock).mockResolvedValue({ affected: 1 });

    const result: boolean = await service.deleteTaskById(taskId, user.userId);

    expect(repoMock.delete).toHaveBeenCalledWith({ id: taskId, ownerId: user.userId });
    expect(result).toBe(true);
  });

  it('deleteTaskById: should return false when not found', async () => {
    const user: UserContext = { userId: 'user-938', tenantId: 'tenant-ued' };
    const taskId: number = 99;

    (repoMock.delete as jest.Mock).mockResolvedValue({ affected: 0 });

    const result: boolean = await service.deleteTaskById(taskId, user.userId);

    expect(repoMock.delete).toHaveBeenCalledWith({ id: taskId, ownerId: user.userId });
    expect(result).toBe(false);
  });
});
