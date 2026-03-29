import { Processor, WorkerHost } from '@nestjs/bullmq';
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
  async process(job: TaskJob): Promise<void> {
    // TODO: dummy await
    await Promise.resolve();

    if (job.name === 'task.created') {
      console.log(`Received task: '${job.name}'...`);
      console.log('Received payload: ', job.data);
      return;
    }

    console.warn('Unknown job: ', job.name);
  }
}
