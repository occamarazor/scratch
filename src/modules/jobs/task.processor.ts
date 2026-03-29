import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

// TODO: move types
export interface TaskCreatedPayload {
  taskId: string;
  userId: string;
}

// TaskCreatedPayload OR unknown for fallback
export type TaskJob =
  | Job<TaskCreatedPayload, unknown, 'task.created'>
  | Job<unknown, unknown, string>;

@Processor('tasks')
export class TaskProcessor extends WorkerHost {
  // NestJS/BullMQ doesn't print worker stack traces to console by default
  @OnWorkerEvent('failed')
  onFailed(job: TaskJob, error: Error) {
    console.error(`Job ${job.id} failed: ${error.message}`);
  }

  async process(job: TaskJob): Promise<void> {
    // TODO: dummy await
    await Promise.resolve();

    if (job.name === 'task.created') {
      console.log(`Received task: '${job.name}'...`);
      console.log('Received payload: ', job.data);

      // Random failure simulation (toggle)
      // if (Math.random() < 0.7) {
      //   throw new Error('Random failure');
      // }

      // Service failure simulation (toggle)
      // throw new Error('External service failure');

      return;
    }

    console.warn('Unknown job: ', job.name);
  }
}
