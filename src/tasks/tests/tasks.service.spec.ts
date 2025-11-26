import type { CreateTaskDto } from '@tasks/dto/create-task.dto';
import type { UpdateTaskDto } from '@tasks/dto/update-task.dto';
import { TaskEntity } from '@tasks/entities/task.entity';
import { TasksService } from '@tasks/tasks.service';
import { TaskStatus } from '@tasks/tasks.types';
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
  const executeMock = jest.fn().mockResolvedValue({ affected: 1 });
  const whereMock = jest.fn().mockReturnValue({ execute: executeMock });
  const setMock = jest.fn().mockReturnValue({ where: whereMock });
  const updateMock = jest.fn().mockReturnValue({ set: setMock });

  return {
    update: updateMock,
    set: setMock,
    where: whereMock,
    execute: executeMock,
  };
};

describe('TasksService', () => {
  let service: TasksService;
  let mockRepo: MockRepo<TaskEntity>;

  beforeEach(() => {
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

  it('createTask: should create & save an entity and return domain object', async () => {
    const dto: CreateTaskDto = {
      title: 'Test title',
      description: 'Test description',
      status: TaskStatus.TODO,
      priority: 1,
      dueAt: undefined,
    };

    const createdEntity: Partial<TaskEntity> = {
      id: 42,
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      dueAt: undefined,
      ownerId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Repo create & save mock returning new entity
    (mockRepo.create as jest.Mock).mockReturnValue(createdEntity);
    (mockRepo.save as jest.Mock).mockResolvedValue(createdEntity);

    const result = await service.createTask(dto);
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: undefined,
        title: 'Test title',
        description: 'Test description',
        status: 'TODO',
        priority: 1,
        dueAt: undefined,
      }),
    );
    expect(mockRepo.save).toHaveBeenCalledWith(createdEntity);
    expect(result.id).toBe(42);
    expect(result.title).toBe('Test title');
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
    const entity: Partial<TaskEntity> = {
      id: 100,
      title: 'Test title',
      description: undefined,
      status: TaskStatus.TODO,
      priority: 0,
      dueAt: undefined,
      ownerId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (mockRepo.findOne as jest.Mock).mockResolvedValue(entity);
    const foundEntity = await service.getTaskById(100);
    expect(foundEntity).toBeDefined();
    expect(foundEntity?.id).toBe(100);

    (mockRepo.findOne as jest.Mock).mockResolvedValue(undefined);
    const notFoundEntity = await service.getTaskById(99999);
    expect(notFoundEntity).toBeUndefined();
  });
});
