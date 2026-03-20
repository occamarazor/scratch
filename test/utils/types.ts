import type { Repository } from 'typeorm';
/**
 * Generic service mock that allows optional domainToResponse helper.
 */
export type ServiceMock<T extends object> = Partial<Record<keyof T, jest.Mock>> & {
  domainToResponse?: jest.Mock;
};

/**
 * Generic repo mock shape used in service tests
 * createQueryBuilder is optional because not all repos might use it
 */
export type RepoMock<T extends object> = Partial<Record<keyof Repository<T>, jest.Mock>> & {
  createQueryBuilder?: jest.Mock;
};

export interface QueryBuilderMock {
  update: jest.Mock;
  set: jest.Mock;
  where: jest.Mock;
  execute: jest.Mock;
}
