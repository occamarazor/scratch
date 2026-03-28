import { UserContext } from '@common/types';
import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from '@tasks/dto/create-task.dto';
import { TasksService } from '@tasks/tasks.service';
import { Task } from '@tasks/tasks.types';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class CreateTaskRawUseCase {
  constructor(
    private readonly dataSource: DataSource,
    private readonly tasksService: TasksService,
  ) {}

  async execute(dto: CreateTaskDto, user: UserContext): Promise<Task> {
    const qr: QueryRunner = this.dataSource.createQueryRunner();

    await qr.connect();
    await qr.startTransaction();

    try {
      const task: Task = await this.tasksService.insertTaskRaw(qr, dto, user);

      // Failure simulation (toggle)
      // throw new Error('Fail mid-transaction');

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
