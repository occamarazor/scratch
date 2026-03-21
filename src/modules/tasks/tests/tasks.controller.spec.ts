import { UserContext } from '@common/types';
import { NotFoundException } from '@nestjs/common';
import type { CreateTaskDto } from '@tasks/dto/create-task.dto';
import type { TaskResponseDto } from '@tasks/dto/task-response.dto';
import type { UpdateTaskDto } from '@tasks/dto/update-task.dto';
import { TasksController } from '@tasks/tasks.controller';
import type { TasksService } from '@tasks/tasks.service';
import type { Task, TasksUpdateResponse } from '@tasks/tasks.types';
import { TaskStatus } from '@tasks/tasks.types';
import {
  generateCreateTaskDto,
  generateTask,
  generateTasksDomainToResponse,
  generateUpdateTaskDto,
  resetFactories,
} from '@tasks/tests/tasks.factories';
import { generateServiceMock } from '@test/utils/factories';
import type { ServiceMock } from '@test/utils/types';

describe('TasksController', () => {
  let controller: TasksController;
  let serviceMock: ServiceMock<TasksService>;

  beforeEach(() => {
    resetFactories();

    // Create service mock with methods used by controller & inject domainToResponse factory
    serviceMock = generateServiceMock<TasksService>(
      [
        'getTasks',
        'createTask',
        'updateTasks',
        'deleteTasks',
        'getTaskById',
        'updateTaskById',
        'deleteTaskById',
      ],
      generateTasksDomainToResponse,
    );

    // Deliberate double cast for tests: concrete TasksService expected
    controller = new TasksController(serviceMock as unknown as TasksService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('getTasks: should return a list of response DTOs on success', async () => {
    const tenantId: string = 'tenant-abc';
    const ownerId: string = 'user-123';
    const user: UserContext = { userId: ownerId, tenantId };

    const t1: Task = generateTask({
      title: 'A',
      status: TaskStatus.TODO,
      tenantId,
      ownerId,
    });

    const t2: Task = generateTask({
      title: 'B',
      status: TaskStatus.DONE,
      tenantId,
      ownerId,
    });

    (serviceMock.getTasks as jest.Mock).mockResolvedValue([t1, t2]);

    const result: TaskResponseDto[] = await controller.getTasks(user);

    expect(serviceMock.getTasks).toHaveBeenCalledWith(user);
    expect(serviceMock.domainToResponse).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('A');
    expect(result[0].tenantId).toBe(tenantId);
    expect(result[1].status).toBe(TaskStatus.DONE);
    expect(result[1].ownerId).toBe(ownerId);
  });

  it('getTasks: should forward ownerId to service when provided', async () => {
    const tenantId: string = 'tenant-abc';
    const ownerId: string = 'user-123';
    const user: UserContext = { userId: ownerId, tenantId };
    const found: Task = generateTask({ title: 'OwnerTask', tenantId, ownerId });

    (serviceMock.getTasks as jest.Mock).mockResolvedValue([found]);

    const result: TaskResponseDto[] = await controller.getTasks(user);
    expect(serviceMock.getTasks).toHaveBeenCalledWith(user);
    expect(result).toHaveLength(1);
    expect(result[0].tenantId).toBe(tenantId);
    expect(result[0].ownerId).toBe(ownerId);
  });

  it('createTask: should forward current user id to service when provided', async () => {
    const tenantId: string = 'tenant-xyz';
    const ownerId: string = 'user-321';
    const user: UserContext = { userId: ownerId, tenantId };

    const dto: CreateTaskDto = generateCreateTaskDto();
    const created: Task = generateTask({ title: dto.title, tenantId, ownerId });

    (serviceMock.createTask as jest.Mock).mockResolvedValue(created);

    const result: TaskResponseDto = await controller.createTask(dto, user);
    expect(serviceMock.createTask).toHaveBeenCalledWith(dto, user);
    expect(result.ownerId).toBe(ownerId);
  });

  it('updateTasks: should return affected count on success', async () => {
    const user: UserContext = { userId: 'user-567', tenantId: 'tenant-qwe' };
    const ids: number[] = [1, 2];
    const affectedTasks: number = ids.length;
    const patch: UpdateTaskDto = { priority: 3 };

    (serviceMock.updateTasks as jest.Mock).mockResolvedValue(affectedTasks);

    const result: TasksUpdateResponse = await controller.updateTasks({ ids, patch }, user);
    expect(serviceMock.updateTasks).toHaveBeenCalledWith(ids, patch, user);
    expect(result.affectedTasks).toBe(affectedTasks);
  });

  it('updateTasks: should return 0 when ids array is empty', async () => {
    const user: UserContext = { userId: 'user-567', tenantId: 'tenant-qwe' };
    const ids: number[] = [];
    const patch: UpdateTaskDto = { priority: 1 };

    (serviceMock.updateTasks as jest.Mock).mockResolvedValue(0);

    const result: TasksUpdateResponse = await controller.updateTasks({ ids, patch }, user);
    expect(serviceMock.updateTasks).toHaveBeenCalledWith(ids, patch, user);
    expect(result.affectedTasks).toBe(0);
  });

  it('deleteTasks: should return void tasks', async () => {
    const user: UserContext = { userId: 'user-243', tenantId: 'tenant-asd' };

    (serviceMock.deleteTasks as jest.Mock).mockResolvedValue(undefined);

    await expect(controller.deleteTasks(user)).resolves.toBeUndefined();
    expect(serviceMock.deleteTasks).toHaveBeenCalled();
  });

  it('deleteTasks: should bubble up DB error from service when failed', async () => {
    const user: UserContext = { userId: 'user-243', tenantId: 'tenant-asd' };
    const dbErr = new Error('DB clear failed');

    (serviceMock.deleteTasks as jest.Mock).mockRejectedValue(dbErr);

    await expect(controller.deleteTasks(user)).rejects.toThrow(dbErr);
    expect(serviceMock.deleteTasks).toHaveBeenCalled();
  });

  it('getTaskById: should return response DTO on success', async () => {
    const tenantId: string = 'tenant-rtf';
    const ownerId: string = 'user-893';
    const user: UserContext = { userId: ownerId, tenantId };
    const taskId: number = 32;

    const found: Task = generateTask({ id: taskId, tenantId, ownerId });

    (serviceMock.getTaskById as jest.Mock).mockResolvedValue(found);

    const result: TaskResponseDto = await controller.getTaskById(taskId, user);

    expect(serviceMock.getTaskById).toHaveBeenCalledWith(taskId, user);
    expect(result.id).toBe(taskId);
    expect(result.tenantId).toBe(tenantId);
    expect(result.ownerId).toBe(ownerId);
  });

  it('getTaskById: should throw NotFoundException when failed', async () => {
    const user: UserContext = { userId: 'user-893', tenantId: 'tenant-rtf' };
    const taskId: number = 999;

    (serviceMock.getTaskById as jest.Mock).mockResolvedValue(undefined);
    await expect(controller.getTaskById(taskId, user)).rejects.toThrow(NotFoundException);
  });

  it('updateTaskById: should return response DTO on success', async () => {
    const tenantId: string = 'tenant-kdl';
    const ownerId: string = 'user-244';
    const user: UserContext = { userId: ownerId, tenantId };
    const taskId: number = 12;

    const dto: UpdateTaskDto = generateUpdateTaskDto({ title: 'updated', priority: 2 });
    const updated: Task = generateTask({
      id: taskId,
      title: dto.title,
      priority: dto.priority,
      tenantId,
      ownerId,
    });

    (serviceMock.updateTaskById as jest.Mock).mockResolvedValue(updated);

    const result: TaskResponseDto = await controller.updateTaskById(taskId, dto, user);

    expect(serviceMock.updateTaskById).toHaveBeenCalledWith(taskId, dto, user);
    expect(serviceMock.domainToResponse).toHaveBeenCalledWith(updated);
    expect(result.id).toBe(taskId);
    expect(result.title).toBe(dto.title);
    expect(result.priority).toBe(dto.priority);
    expect(result.tenantId).toBe(tenantId);
    expect(result.ownerId).toBe(ownerId);
  });

  it('updateTaskById: should throw NotFoundException when failed', async () => {
    const user: UserContext = { userId: 'user-244', tenantId: 'tenant-kdl' };
    const taskId: number = 999;
    const dto: UpdateTaskDto = generateUpdateTaskDto();

    (serviceMock.updateTaskById as jest.Mock).mockResolvedValue(undefined);
    await expect(controller.updateTaskById(taskId, dto, user)).rejects.toThrow(NotFoundException);
  });

  it('deleteTaskById: should return void on success', async () => {
    const user: UserContext = { userId: 'user-954', tenantId: 'tenant-evs' };
    const taskId: number = 42;

    (serviceMock.deleteTaskById as jest.Mock).mockResolvedValue(true);

    await expect(controller.deleteTaskById(taskId, user)).resolves.toBeUndefined();
    expect(serviceMock.deleteTaskById).toHaveBeenCalledWith(taskId, user);
  });

  it('deleteTaskById: should throw NotFoundException when failed', async () => {
    const user: UserContext = { userId: 'user-954', tenantId: 'tenant-evs' };
    const taskId: number = 999;

    (serviceMock.deleteTaskById as jest.Mock).mockResolvedValue(false);
    await expect(controller.deleteTaskById(taskId, user)).rejects.toThrow(NotFoundException);
  });
});
