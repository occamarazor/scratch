import type { Nullable } from '@common/types';
import type { CreateTaskDto } from '@tasks/dto/create-task.dto';
import { UpdateTaskDto } from '@tasks/dto/update-task.dto';
import { TaskEntity } from '@tasks/entities/task.entity';
import { TasksService } from '@tasks/tasks.service';
import type { Task } from '@tasks/tasks.types';
import {
  generateCreateTaskDto,
  generateTaskEntity,
  resetFactories,
} from '@tasks/tests/fixtures/tasks.factories';
import { Repository } from 'typeorm';

// Helper type: keys are repo method names, values are jest.Mock
// createQueryBuilder added explicitly because updateTasks relies on it
type MockRepo<T extends object> = Partial<Record<keyof Repository<T>, jest.Mock>> & {
  createQueryBuilder?: jest.Mock;
};

type QueryBuilderMock = {
  update: jest.Mock;
  set: jest.Mock;
  where: jest.Mock;
  execute: jest.Mock;
};

// Emulates the small part of TypeORM’s query builder API used by TasksService.updateTasks
const createQueryBuilderMock = (): QueryBuilderMock => {
  const execute = jest.fn().mockResolvedValue({ affected: 1 });
  const where = jest.fn().mockReturnValue({ execute });
  const set = jest.fn().mockReturnValue({ where });
  const update = jest.fn().mockReturnValue({ set });

  return {
    update,
    set,
    where,
    execute,
  };
};

describe('TasksService', () => {
  let service: TasksService;
  let mockRepo: MockRepo<TaskEntity>;

  beforeEach(() => {
    resetFactories();

    mockRepo = {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      clear: jest.fn(),
      delete: jest.fn(),
      merge: jest.fn(),
      createQueryBuilder: jest.fn().mockImplementation(createQueryBuilderMock),
    };

    // Deliberate double cast: Partial mock -> Repository<T>
    service = new TasksService(mockRepo as unknown as Repository<TaskEntity>);
  });

  afterEach(() => jest.resetAllMocks());

  it('getTasks: should map entities to domain', async () => {
    const e1: TaskEntity = generateTaskEntity({ id: 1, title: 't1', ownerId: 5 });
    const e2: TaskEntity = generateTaskEntity({ id: 2, title: 't2', ownerId: 5 });
    (mockRepo.find as jest.Mock).mockResolvedValue([e1, e2]);

    const result: Task[] = await service.getTasks(5);
    expect(mockRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerId: 5 },
      }),
    );
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[0].title).toBe('t1');
    expect(result[0].ownerId).toBe(5);
  });

  it('createTask: should create & save entity and return domain object', async () => {
    const dto: CreateTaskDto = generateCreateTaskDto({ dueAt: '2025-11-20T12:00:00.000Z' });

    const entity: TaskEntity = generateTaskEntity({
      title: dto.title,
      description: dto.description,
      dueAt: new Date(dto.dueAt as string),
      ownerId: 11,
    });

    // Repo create & save mock returning new entity
    (mockRepo.create as jest.Mock).mockReturnValue(entity);
    (mockRepo.save as jest.Mock).mockResolvedValue(entity);

    const result: Task = await service.createTask(dto, 11);

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: dto.title,
        description: dto.description,
        dueAt: new Date(dto?.dueAt as string),
        ownerId: 11,
      }),
    );
    expect(result.id).toBe(entity.id);
    expect(result.dueAt).toBeInstanceOf(Date);
    expect(result.ownerId).toBe(11);
  });

  it('updateTasks: should run bulk update and return affected count', async () => {
    const ids: number[] = [1, 2, 3];
    const patch: Partial<UpdateTaskDto> = { priority: 2 };

    // Create qb and set affected count to 3
    const qb: QueryBuilderMock = createQueryBuilderMock();
    qb.execute.mockResolvedValue({ affected: 3 });
    (mockRepo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

    const affected: number = await service.updateTasks(ids, patch);
    expect(mockRepo.createQueryBuilder).toHaveBeenCalled();
    expect(affected).toBe(3);
  });

  it('getTaskById: returns domain object if found, undefined if not', async () => {
    const entity: TaskEntity = generateTaskEntity({ id: 10 });
    (mockRepo.findOne as jest.Mock).mockResolvedValueOnce(entity);
    const found: Nullable<Task> = await service.getTaskById(10);
    expect(found?.id).toBe(10);

    (mockRepo.findOne as jest.Mock).mockResolvedValueOnce(undefined);
    const notFound: Nullable<Task> = await service.getTaskById(999);
    expect(notFound).toBeUndefined();
  });
});
