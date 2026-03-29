import { UserContext } from '@common/types';
import { DomainEventBus } from '@events/domain-event-bus';
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
    private readonly eventBus: DomainEventBus,
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

      // TODO: what if event fails? Fix via outbox pattern
      await this.eventBus.publish({
        name: 'task.created',
        payload: {
          taskId: task.id,
          userId: user.userId,
          tenantId: user.tenantId,
        },
      });

      return task;
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }
}
