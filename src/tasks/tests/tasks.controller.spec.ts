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
  let mockService: ServiceMock<TasksService>;

  beforeEach(() => {
    resetFactories();

    mockService = generateServiceMock<TasksService>(
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
    controller = new TasksController(mockService as unknown as TasksService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('getTasks: returns list converted via domainToResponse', async () => {
    const t1: Task = generateTask({ title: 'A', status: TaskStatus.TODO });
    const t2: Task = generateTask({ title: 'B', status: TaskStatus.DONE });

    (mockService.getTasks as jest.Mock).mockResolvedValue([t1, t2]);

    const result: TaskResponseDto[] = await controller.getTasks(undefined);
    expect(mockService.getTasks).toHaveBeenCalledWith(undefined);
    expect(mockService.domainToResponse).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('A');
  });

  it('createTask: delegates to service and returns response DTO', async () => {
    const dto: CreateTaskDto = generateCreateTaskDto();
    const created: Task = generateTask({ title: dto.title });

    (mockService.createTask as jest.Mock).mockResolvedValue(created);

    const result: TaskResponseDto = await controller.createTask(dto);
    expect(mockService.createTask).toHaveBeenCalledWith(dto, undefined);
    expect(mockService.domainToResponse).toHaveBeenCalledWith(created);
    expect(result.title).toBe(dto.title);
  });

  it('getTaskById: returns response DTO when found', async () => {
    const found: Task = generateTask({ id: 321 });
    (mockService.getTaskById as jest.Mock).mockResolvedValue(found);

    const result: TaskResponseDto = await controller.getTaskById(321);
    expect(mockService.getTaskById).toHaveBeenCalledWith(321);
    expect(result.id).toBe(321);
  });

  it('getTaskById: throws NotFoundException when service returns undefined', async () => {
    (mockService.getTaskById as jest.Mock).mockResolvedValue(undefined);
    await expect(controller.getTaskById(999)).rejects.toThrow(NotFoundException);
  });

  it('updateTaskById: returns updated DTO when found', async () => {
    const id: number = 12;
    const dto: UpdateTaskDto = generateUpdateTaskDto({ title: 'updated', priority: 2 });
    const updated: Task = generateTask({ id, title: dto.title, priority: dto.priority });

    (mockService.updateTaskById as jest.Mock).mockResolvedValue(updated);

    const result: TaskResponseDto = await controller.updateTaskById(id, dto);
    expect(mockService.updateTaskById).toHaveBeenCalledWith(id, dto);
    expect(result.title).toBe(dto.title);
    expect(result.priority).toBe(dto.priority);
  });

  it('updateTaskById: throws NotFoundException when service returns undefined', async () => {
    (mockService.updateTaskById as jest.Mock).mockResolvedValue(undefined);
    await expect(controller.updateTaskById(999, generateUpdateTaskDto())).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deleteTaskById: returns void when deleted', async () => {
    (mockService.deleteTaskById as jest.Mock).mockResolvedValue(true);
    await expect(controller.deleteTaskById(42)).resolves.toBeUndefined();
    expect(mockService.deleteTaskById).toHaveBeenCalledWith(42);
  });

  it('deleteTaskById: throws NotFoundException when deletion failed', async () => {
    (mockService.deleteTaskById as jest.Mock).mockResolvedValue(false);
    await expect(controller.deleteTaskById(999)).rejects.toThrow(NotFoundException);
  });

  it('updateTasks: returns affected count', async () => {
    const ids: number[] = [1, 2];
    const patch: UpdateTaskDto = { priority: 3 };
    (mockService.updateTasks as jest.Mock).mockResolvedValue(2);

    const result: TasksUpdateResponse = await controller.updateTasks({ ids, patch });
    expect(mockService.updateTasks).toHaveBeenCalledWith(ids, patch);
    expect(result.affectedTasks).toBe(2);
  });

  it('deleteTasks: delegates to service', async () => {
    (mockService.deleteTasks as jest.Mock).mockResolvedValue(undefined);
    await expect(controller.deleteTasks()).resolves.toBeUndefined();
    expect(mockService.deleteTasks).toHaveBeenCalled();
  });
});
