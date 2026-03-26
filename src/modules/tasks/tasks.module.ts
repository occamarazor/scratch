import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateTaskRawUseCase } from './application/create-task-raw.usecase';
import { TaskEntity } from './entities/task.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity])],
  providers: [CreateTaskRawUseCase, TasksService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
