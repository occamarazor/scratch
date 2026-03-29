import { DomainEventBus } from '@events/domain-event-bus';
import { QueueModule } from '@jobs/queue.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateTaskRawUseCase } from './application/create-task-raw.usecase';
import { UpdateTaskOrderUseCase } from './application/update-task-order.usecase';
import { TaskEntity } from './entities/task.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity]), QueueModule],
  providers: [CreateTaskRawUseCase, UpdateTaskOrderUseCase, TasksService, DomainEventBus],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
