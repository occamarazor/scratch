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
    const tenantId: string = 'tenant-abc';
    const ownerId: string = 'user-123';

    const task: Task = generateTask({ id: 1, tenantId, ownerId });
    const dto: TaskResponseDto = service.domainToResponse(task);

    expect(typeof dto.createdAt).toBe('string');
    expect(dto.createdAt).toBe(new Date(task.createdAt).toISOString());
    expect(task.tenantId).toBe(dto.tenantId);
    expect(task.ownerId).toBe(dto.ownerId);
  });

  it('getTasks: should return a list of domain objects on success', async () => {
    const tenantId: string = 'tenant-abc';
    const ownerId: string = 'user-123';
    const user: UserContext = { userId: ownerId, tenantId };

    const t1: TaskEntity = generateTaskEntity({ id: 1, title: 'Title 1', tenantId, ownerId });
    const t2: TaskEntity = generateTaskEntity({ id: 2, title: 'Title 2', tenantId, ownerId });

    (repoMock.find as jest.Mock).mockResolvedValue([t1, t2]);

    const result: Task[] = await service.getTasks(user);

    expect(repoMock.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId, ownerId },
      }),
    );
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[0].tenantId).toBe(tenantId);

    expect(result[1].title).toBe('Title 2');
    expect(result[1].ownerId).toBe(ownerId);
  });

  it('createTask: should create & save entity & return domain object on success', async () => {
    const tenantId: string = 'tenant-xyz';
    const ownerId: string = 'user-321';
    const user: UserContext = { userId: ownerId, tenantId };
    const dueAt: string = '2025-11-20T12:00:00.000Z';

    const dto: CreateTaskDto = generateCreateTaskDto({ dueAt });
    const created: TaskEntity = generateTaskEntity({
      tenantId,
      ownerId,
      dueAt: new Date(dueAt),
    });

    (repoMock.create as jest.Mock).mockReturnValue(created);
    (repoMock.save as jest.Mock).mockResolvedValue(created);

    const result: Task = await service.createTask(dto, user);

    expect(repoMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: dto.title,
        description: dto.description,
        tenantId,
        ownerId,
        dueAt: new Date(dto.dueAt as string),
      }),
    );
    expect(result.id).toBe(created.id);
    expect(result.dueAt).toBeInstanceOf(Date);
    expect(result.tenantId).toBe(tenantId);
    expect(result.ownerId).toBe(ownerId);
  });

  it('updateTasks: should run bulk update & return affected count on success', async () => {
    const user: UserContext = { userId: 'user-546', tenantId: 'tenant-idj' };
    const ids: number[] = [1, 2, 3];
    const patch: UpdateTaskDto = { priority: 2 };
    const qb: QueryBuilderMock = generateQueryBuilderMock();

    qb.execute.mockResolvedValue({ affected: ids.length });

    // Override factory default for this test
    (repoMock.createQueryBuilder as jest.Mock).mockReturnValue(qb);

    const affected: number = await service.updateTasks(ids, patch, user);

    expect(repoMock.createQueryBuilder).toHaveBeenCalled();
    expect(affected).toBe(ids.length);
  });

  it('updateTasks: should be a no-op & return 0 with empty ids', async () => {
    const user: UserContext = { userId: 'user-546', tenantId: 'tenant-ewr' };
    const ids: number[] = [];
    const patch: UpdateTaskDto = { priority: 2 };

    const affected: number = await service.updateTasks(ids, patch, user);
    expect(affected).toBe(0);
    expect(repoMock.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('updateTasks: should throw BadRequestException for invalid patch', async () => {
    const user: UserContext = { userId: 'user-546', tenantId: 'tenant-ewr' };
    const ids: number[] = [1, 2];
    const badPatch = { status: 'INVALID_STATUS' } as unknown as UpdateTaskDto;

    await expect(service.updateTasks(ids, badPatch, user)).rejects.toThrow(BadRequestException);
  });

  it('deleteTasks: should clear repository on success', async () => {
    const tenantId: string = 'tenant-spl';
    const ownerId: string = 'user-938';
    const user: UserContext = { userId: ownerId, tenantId };

    (repoMock.delete as jest.Mock).mockResolvedValue(undefined);

    await service.deleteTasks(user);
    expect(repoMock.delete).toHaveBeenCalledWith({ tenantId, ownerId });
  });

  it('deleteTasks: should propagate DB errors when failed', async () => {
    const tenantId: string = 'tenant-spl';
    const ownerId: string = 'user-938';
    const user: UserContext = { userId: ownerId, tenantId };

    const dbErr = new Error('DB clear failed');
    (repoMock.delete as jest.Mock).mockRejectedValue(dbErr);

    await expect(service.deleteTasks(user)).rejects.toThrow(dbErr);
    expect(repoMock.delete).toHaveBeenCalledWith({ tenantId, ownerId });
  });

  it('getTaskById: should return domain object on success', async () => {
    const tenantId: string = 'tenant-kdo';
    const ownerId: string = 'user-023';
    const user: UserContext = { userId: ownerId, tenantId };
    const taskId: number = 10;
    const found: TaskEntity = generateTaskEntity({ id: taskId, tenantId, ownerId });

    (repoMock.findOne as jest.Mock).mockResolvedValue(found);

    const result: Nullable<Task> = await service.getTaskById(taskId, user);
    expect(result?.id).toBe(taskId);
    expect(result?.ownerId).toBe(user.userId);
  });

  it('getTaskById: should return undefined when not found', async () => {
    const user: UserContext = { userId: 'user-023', tenantId: 'tenant-kdo' };
    const taskId: number = 10;

    (repoMock.findOne as jest.Mock).mockResolvedValue(undefined);

    const result: Nullable<Task> = await service.getTaskById(taskId, user);
    expect(result).toBeUndefined();
  });

  it('updateTaskById: should merge, save and return updated domain object', async () => {
    const tenantId: string = 'tenant-slo';
    const ownerId: string = 'user-745';
    const user: UserContext = { userId: ownerId, tenantId };

    const found: TaskEntity = generateTaskEntity({
      id: 55,
      title: 'Old title',
      priority: 1,
      tenantId,
      ownerId,
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
      tenantId,
      ownerId,
      dueAt: new Date(dto.dueAt as string),
    });

    (repoMock.findOne as jest.Mock).mockResolvedValue(found);

    (repoMock.merge as jest.Mock).mockImplementation(
      (target: TaskEntity, patch: Partial<TaskEntity>) => ({ ...target, ...patch }),
    );

    (repoMock.save as jest.Mock).mockResolvedValue(patched);

    const result: Nullable<Task> = await service.updateTaskById(found.id, dto, user);

    expect(repoMock.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: found.id, tenantId, ownerId } }),
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
    expect(result?.tenantId).toBe(tenantId);
    expect(result?.ownerId).toBe(ownerId);
    expect(result?.dueAt).toBeInstanceOf(Date);
    expect(result?.dueAt).toStrictEqual(new Date(dto.dueAt as string));
  });

  it('updateTaskById: should return undefined when not found', async () => {
    const user: UserContext = { userId: 'user-745', tenantId: 'tenant-slo' };
    const taskId: number = 687;
    const dto: UpdateTaskDto = generateUpdateTaskDto({ title: 'New title' });

    (repoMock.findOne as jest.Mock).mockResolvedValue(undefined);

    const result: Nullable<Task> = await service.updateTaskById(taskId, dto, user);
    expect(result).toBeUndefined();
  });

  it('deleteTaskById: should return true on success', async () => {
    const tenantId: string = 'tenant-ued';
    const ownerId: string = 'user-938';
    const user: UserContext = { userId: ownerId, tenantId };
    const taskId: number = 77;

    (repoMock.delete as jest.Mock).mockResolvedValue({ affected: 1 });

    const result: boolean = await service.deleteTaskById(taskId, user);

    expect(repoMock.delete).toHaveBeenCalledWith({ id: taskId, tenantId, ownerId });
    expect(result).toBe(true);
  });

  it('deleteTaskById: should return false when not found', async () => {
    const tenantId: string = 'tenant-ued';
    const ownerId: string = 'user-938';
    const user: UserContext = { userId: ownerId, tenantId };
    const taskId: number = 99;

    (repoMock.delete as jest.Mock).mockResolvedValue({ affected: 0 });

    const result: boolean = await service.deleteTaskById(taskId, user);

    expect(repoMock.delete).toHaveBeenCalledWith({ id: taskId, tenantId, ownerId });
    expect(result).toBe(false);
  });
});
