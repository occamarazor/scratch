import { QueryBuilderMock, RepoMock } from './tests.types';

/**
 * Lightweight query builder mock matching the small API used by TasksService.updateTasks
 */
export const createQueryBuilderMock = (): QueryBuilderMock => {
  const execute = jest.fn().mockResolvedValue({ affected: 1 });
  const where = jest.fn().mockReturnValue({ execute });
  const set = jest.fn().mockReturnValue({ where });
  const update = jest.fn().mockReturnValue({ set });

  return { update, set, where, execute };
};

/**
 * Minimal repository mock helper
 * Returns an object matching partial Repository<T> where values are jest.fn() so tests can override behaviors
 */
export const createRepoMock = <T extends object>(): RepoMock<T> => {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    clear: jest.fn(),
    delete: jest.fn(),
    merge: jest.fn(),
    createQueryBuilder: jest.fn().mockImplementation(createQueryBuilderMock),
  };
};
