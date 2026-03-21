import type { UserContext } from '@common/types';
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

  it('getTasks: should return a list of response DTOs on success (no ownerId)', async () => {
    const t1: Task = generateTask({ title: 'A', status: TaskStatus.TODO });
    const t2: Task = generateTask({ title: 'B', status: TaskStatus.DONE });

    (serviceMock.getTasks as jest.Mock).mockResolvedValue([t1, t2]);

    const result: TaskResponseDto[] = await controller.getTasks(undefined);
    expect(serviceMock.getTasks).toHaveBeenCalledWith(undefined);
    expect(serviceMock.domainToResponse).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('A');
    expect(result[1].status).toBe(TaskStatus.DONE);
  });

  it('getTasks: should forward ownerId to service when provided', async () => {
    const ownerId: string = 'owner-123';
    const found: Task = generateTask({ title: 'OwnerTask', ownerId });
    (serviceMock.getTasks as jest.Mock).mockResolvedValue([found]);

    const result: TaskResponseDto[] = await controller.getTasks(ownerId);
    expect(serviceMock.getTasks).toHaveBeenCalledWith(ownerId);
    expect(result).toHaveLength(1);
    expect(result[0].ownerId).toBe(ownerId);
  });

  it('createTask: should return response DTO on success (no current user)', async () => {
    const dto: CreateTaskDto = generateCreateTaskDto();
    const created: Task = generateTask({ title: dto.title });

    (serviceMock.createTask as jest.Mock).mockResolvedValue(created);

    const result: TaskResponseDto = await controller.createTask(dto);
    expect(serviceMock.createTask).toHaveBeenCalledWith(dto, undefined);
    expect(serviceMock.domainToResponse).toHaveBeenCalledWith(created);
    expect(result.title).toBe(dto.title);
  });

  it('createTask: should forward current user id to service when provided', async () => {
    const userId: number = 123;
    const dto: CreateTaskDto = generateCreateTaskDto();
    const created: Task = generateTask({ title: dto.title, ownerId: userId });
    // Simulate invocation with CurrentUser present by calling the controller method directly
    const userMock: UserContext = { userId };

    (serviceMock.createTask as jest.Mock).mockResolvedValue(created);

    const result: TaskResponseDto = await controller.createTask(dto, userMock);
    expect(serviceMock.createTask).toHaveBeenCalledWith(dto, userId);
    expect(result.ownerId).toBe(userId);
  });

  it('updateTasks: should return affected count on success', async () => {
    const ids: number[] = [1, 2];
    const affectedTasks: number = ids.length;
    const patch: UpdateTaskDto = { priority: 3 };
    (serviceMock.updateTasks as jest.Mock).mockResolvedValue(affectedTasks);

    const result: TasksUpdateResponse = await controller.updateTasks({ ids, patch });
    expect(serviceMock.updateTasks).toHaveBeenCalledWith(ids, patch);
    expect(result.affectedTasks).toBe(affectedTasks);
  });

  it('updateTasks: should return 0 when ids array is empty', async () => {
    const ids: number[] = [];
    const patch: UpdateTaskDto = { priority: 1 };

    (serviceMock.updateTasks as jest.Mock).mockResolvedValue(0);
    const result: TasksUpdateResponse = await controller.updateTasks({ ids, patch });
    expect(serviceMock.updateTasks).toHaveBeenCalledWith(ids, patch);
    expect(result.affectedTasks).toBe(0);
  });

  it('deleteTasks: should return void tasks', async () => {
    (serviceMock.deleteTasks as jest.Mock).mockResolvedValue(undefined);
    await expect(controller.deleteTasks()).resolves.toBeUndefined();
    expect(serviceMock.deleteTasks).toHaveBeenCalled();
  });

  it('deleteTasks: should bubble up DB error from service when failed', async () => {
    const dbErr = new Error('DB clear failed');
    (serviceMock.deleteTasks as jest.Mock).mockRejectedValue(dbErr);
    await expect(controller.deleteTasks()).rejects.toThrow(dbErr);
    expect(serviceMock.deleteTasks).toHaveBeenCalled();
  });

  it('getTaskById: should return response DTO on success', async () => {
    const taskId: number = 32;
    const found: Task = generateTask({ id: taskId });
    (serviceMock.getTaskById as jest.Mock).mockResolvedValue(found);

    const result: TaskResponseDto = await controller.getTaskById(taskId);
    expect(serviceMock.getTaskById).toHaveBeenCalledWith(taskId);
    expect(result.id).toBe(taskId);
  });

  it('getTaskById: should throw NotFoundException when failed', async () => {
    (serviceMock.getTaskById as jest.Mock).mockResolvedValue(undefined);
    await expect(controller.getTaskById(999)).rejects.toThrow(NotFoundException);
  });

  it('updateTaskById: should return response DTO on success', async () => {
    const taskId: number = 12;
    const dto: UpdateTaskDto = generateUpdateTaskDto({ title: 'updated', priority: 2 });
    const updated: Task = generateTask({ id: taskId, title: dto.title, priority: dto.priority });

    (serviceMock.updateTaskById as jest.Mock).mockResolvedValue(updated);

    const result: TaskResponseDto = await controller.updateTaskById(taskId, dto);
    expect(serviceMock.updateTaskById).toHaveBeenCalledWith(taskId, dto);
    expect(serviceMock.domainToResponse).toHaveBeenCalledWith(updated);
    expect(result.id).toBe(taskId);
    expect(result.title).toBe(dto.title);
    expect(result.priority).toBe(dto.priority);
  });

  it('updateTaskById: should throw NotFoundException when failed', async () => {
    (serviceMock.updateTaskById as jest.Mock).mockResolvedValue(undefined);
    await expect(controller.updateTaskById(999, generateUpdateTaskDto())).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deleteTaskById: should return void on success', async () => {
    const taskId: number = 42;
    (serviceMock.deleteTaskById as jest.Mock).mockResolvedValue(true);
    await expect(controller.deleteTaskById(taskId)).resolves.toBeUndefined();
    expect(serviceMock.deleteTaskById).toHaveBeenCalledWith(taskId);
  });

  it('deleteTaskById: should throw NotFoundException when failed', async () => {
    (serviceMock.deleteTaskById as jest.Mock).mockResolvedValue(false);
    await expect(controller.deleteTaskById(999)).rejects.toThrow(NotFoundException);
  });
});
