import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

//  TODO: define & move DomainEvent
export interface DomainEvent<T = Record<string, unknown>> {
  readonly name: string;
  readonly payload: T;
}

@Injectable()
export class DomainEventBus {
  constructor(@InjectQueue('tasks') private readonly queue: Queue) {}

  async publish<T>(event: DomainEvent<T>) {
    // Controlled retry
    await this.queue.add(event.name, event.payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }
}
