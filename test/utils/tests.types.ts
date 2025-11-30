import { Repository } from 'typeorm';

/**
 * Helper type: keys are repo method names, values are jest.Mock
 * createQueryBuilder added explicitly because updateTasks relies on it
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
