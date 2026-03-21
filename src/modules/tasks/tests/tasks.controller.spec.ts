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
    const user: UserContext = { userId: 'user-123', tenantId: 'tenant-abc' };
    const t1: Task = generateTask({ title: 'A', status: TaskStatus.TODO });
    const t2: Task = generateTask({ title: 'B', status: TaskStatus.DONE });

    (serviceMock.getTasks as jest.Mock).mockResolvedValue([t1, t2]);

    const result: TaskResponseDto[] = await controller.getTasks(user);

    expect(serviceMock.getTasks).toHaveBeenCalledWith(user.userId);
    expect(serviceMock.domainToResponse).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('A');
    expect(result[1].status).toBe(TaskStatus.DONE);
  });

  it('getTasks: should forward ownerId to service when provided', async () => {
    const user: UserContext = { userId: 'user-123', tenantId: 'tenant-abc' };
    const found: Task = generateTask({ title: 'OwnerTask', ownerId: user.userId });

    (serviceMock.getTasks as jest.Mock).mockResolvedValue([found]);

    const result: TaskResponseDto[] = await controller.getTasks(user);
    expect(serviceMock.getTasks).toHaveBeenCalledWith(user.userId);
    expect(result).toHaveLength(1);
    expect(result[0].ownerId).toBe(user.userId);
  });

  it('createTask: should forward current user id to service when provided', async () => {
    const user: UserContext = { userId: 'user-321', tenantId: 'tenant-xyz' };
    const dto: CreateTaskDto = generateCreateTaskDto();
    const created: Task = generateTask({ title: dto.title, ownerId: user.userId });

    (serviceMock.createTask as jest.Mock).mockResolvedValue(created);

    const result: TaskResponseDto = await controller.createTask(dto, user);
    expect(serviceMock.createTask).toHaveBeenCalledWith(dto, user.userId);
    expect(result.ownerId).toBe(user.userId);
  });

  it('updateTasks: should return affected count on success', async () => {
    const user: UserContext = { userId: 'user-567', tenantId: 'tenant-qwe' };
    const ids: number[] = [1, 2];
    const affectedTasks: number = ids.length;
    const patch: UpdateTaskDto = { priority: 3 };

    (serviceMock.updateTasks as jest.Mock).mockResolvedValue(affectedTasks);

    const result: TasksUpdateResponse = await controller.updateTasks({ ids, patch }, user);
    expect(serviceMock.updateTasks).toHaveBeenCalledWith(ids, patch, user.userId);
    expect(result.affectedTasks).toBe(affectedTasks);
  });

  it('updateTasks: should return 0 when ids array is empty', async () => {
    const user: UserContext = { userId: 'user-567', tenantId: 'tenant-qwe' };
    const ids: number[] = [];
    const patch: UpdateTaskDto = { priority: 1 };

    (serviceMock.updateTasks as jest.Mock).mockResolvedValue(0);

    const result: TasksUpdateResponse = await controller.updateTasks({ ids, patch }, user);
    expect(serviceMock.updateTasks).toHaveBeenCalledWith(ids, patch, user.userId);
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
    const user: UserContext = { userId: 'user-893', tenantId: 'tenant-rtf' };
    const taskId: number = 32;
    const found: Task = generateTask({ id: taskId, ownerId: user.userId });

    (serviceMock.getTaskById as jest.Mock).mockResolvedValue(found);

    const result: TaskResponseDto = await controller.getTaskById(taskId, user);

    expect(serviceMock.getTaskById).toHaveBeenCalledWith(taskId, user.userId);
    expect(result.id).toBe(taskId);
    expect(result.ownerId).toBe(user.userId);
  });

  it('getTaskById: should throw NotFoundException when failed', async () => {
    const user: UserContext = { userId: 'user-893', tenantId: 'tenant-rtf' };
    (serviceMock.getTaskById as jest.Mock).mockResolvedValue(undefined);
    await expect(controller.getTaskById(999, user)).rejects.toThrow(NotFoundException);
  });

  it('updateTaskById: should return response DTO on success', async () => {
    const user: UserContext = { userId: 'user-244', tenantId: 'tenant-kdl' };
    const taskId: number = 12;
    const dto: UpdateTaskDto = generateUpdateTaskDto({ title: 'updated', priority: 2 });
    const updated: Task = generateTask({
      id: taskId,
      title: dto.title,
      priority: dto.priority,
      ownerId: user.userId,
    });

    (serviceMock.updateTaskById as jest.Mock).mockResolvedValue(updated);

    const result: TaskResponseDto = await controller.updateTaskById(taskId, dto, user);

    expect(serviceMock.updateTaskById).toHaveBeenCalledWith(taskId, dto, user.userId);
    expect(serviceMock.domainToResponse).toHaveBeenCalledWith(updated);
    expect(result.id).toBe(taskId);
    expect(result.title).toBe(dto.title);
    expect(result.priority).toBe(dto.priority);
    expect(result.ownerId).toBe(user.userId);
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
    expect(serviceMock.deleteTaskById).toHaveBeenCalledWith(taskId, user.userId);
  });

  it('deleteTaskById: should throw NotFoundException when failed', async () => {
    const user: UserContext = { userId: 'user-954', tenantId: 'tenant-evs' };
    const taskId: number = 999;

    (serviceMock.deleteTaskById as jest.Mock).mockResolvedValue(false);
    await expect(controller.deleteTaskById(taskId, user)).rejects.toThrow(NotFoundException);
  });
});
