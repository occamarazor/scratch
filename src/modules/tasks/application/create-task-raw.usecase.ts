import { Injectable } from '@nestjs/common';
import { Task } from '@tasks/tasks.types';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class CreateTaskRawUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute() {
    const qr: QueryRunner = this.dataSource.createQueryRunner();

    await qr.connect();
    await qr.startTransaction();

    try {
      const tasks = (await qr.query(`
        INSERT INTO tasks (title, "tenantId", "ownerId")
        VALUES ('TX Task', 'tenant-1', 'user-1')
        RETURNING *;
      `)) as Task[];

      // TODO: simulate transaction failure
      throw new Error('Fail mid-transaction');

      const task: Task = tasks[0];

      await qr.commitTransaction();

      return task;
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }
}
