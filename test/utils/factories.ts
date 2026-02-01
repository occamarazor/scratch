import { QueryBuilderMock, RepoMock, ServiceMock } from './types';

/**
 * Generic service mock factory
 * - `methodNames`: list of method names to convert into `jest.fn()`
 * - `domainToResponseFactory`: optional factory that returns a mock used to map domain → response (e.g. Task → TaskResponseDto).
 */
export const generateServiceMock = <T extends object>(
  methodNames: (keyof T)[] = [],
  domainToResponseFactory?: () => jest.Mock,
): ServiceMock<T> => {
  const mock: Record<string, jest.Mock> = {};

  for (const method of methodNames) {
    mock[method as string] = jest.fn();
  }

  // Optionally inject a domainToResponse mock
  if (domainToResponseFactory) {
    mock.domainToResponse = domainToResponseFactory();
  }

  return mock as ServiceMock<T>;
};

/**
 * Lightweight query builder mock
 * Matches small API used by TasksService.updateTasks
 */
export const generateQueryBuilderMock = (): QueryBuilderMock => {
  const execute = jest.fn().mockResolvedValue({ affected: 1 });
  const where = jest.fn().mockReturnValue({ execute });
  const set = jest.fn().mockReturnValue({ where });
  const update = jest.fn().mockReturnValue({ set });

  return { update, set, where, execute };
};

/**
 * Minimal repository mock
 * Returns object matching partial Repository<T>
 * Values are jest.fn() so tests can override behaviors
 */
export const generateRepoMock = <T extends object>(): RepoMock<T> => {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    clear: jest.fn(),
    delete: jest.fn(),
    merge: jest.fn(),
    createQueryBuilder: jest.fn().mockImplementation(generateQueryBuilderMock),
  };
};
