import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { TaskProcessor } from './task.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'tasks',
    }),
  ],
  providers: [TaskProcessor],
  exports: [BullModule],
})
export class QueueModule {}
