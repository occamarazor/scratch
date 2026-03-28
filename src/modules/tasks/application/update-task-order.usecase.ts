import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class UpdateTaskOrderUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(firstId: number, secondId: number) {
    const qr: QueryRunner = this.dataSource.createQueryRunner();

    await qr.connect();
    await qr.startTransaction();

    try {
      // Step 1: lock first row explicitly
      await qr.query(`SELECT id FROM tasks WHERE id = $1 FOR UPDATE`, [firstId]);

      console.log(`Locked first row, ID: ${firstId}`);

      // Step 2: hold the lock long enough to trigger second request
      await new Promise((r) => setTimeout(r, 5000));

      // Step 3: try to lock second row explicitly
      await qr.query(`SELECT id FROM tasks WHERE id = $1 FOR UPDATE`, [secondId]);

      console.log(`Locked second row, ID: ${secondId}`);

      await qr.commitTransaction();
    } catch (e: unknown) {
      await qr.rollbackTransaction();

      if (e && typeof e === 'object' && 'code' in e) {
        if (e.code === '40P01') {
          // PostgreSQL deadlock
          throw new ConflictException('Deadlock detected, retry');
        }
      }

      throw e;
    } finally {
      await qr.release();
    }
  }
}
