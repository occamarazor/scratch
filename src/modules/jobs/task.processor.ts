import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';

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
  constructor(private readonly dataSource: DataSource) {
    super();
  }

  // NestJS/BullMQ doesn't print worker stack traces to console by default
  @OnWorkerEvent('failed')
  onFailed(job: TaskJob, error: Error) {
    console.error(`Job ${job.id} failed: ${error.message}`);
  }

  async process(job: TaskJob): Promise<void> {
    if (job.name !== 'task.created') return;

    const divider = '-----------------------------------';
    const taskId = (job.data as TaskCreatedPayload).taskId;
    const key = `task.created:${taskId}`;

    console.log(divider);
    console.log(`Processing job ${job.id} with key ${key}...`);

    // SIMULATION: Dummy await for any failure simulation
    // await Promise.resolve();

    // SIMULATION: Service failure (toggle)
    // throw new Error('External service failure');

    // SIMULATION: Random failure BEFORE insert (toggle)
    if (Math.random() < 0.5) {
      throw new Error('Random failure');
    }

    try {
      await this.dataSource.query(`INSERT INTO processed_jobs (job_key) VALUES ($1)`, [key]);
    } catch (e: unknown) {
      // Duplicate → already processed
      console.warn(`Error: ${(e as Error).message}`);
      console.log(`Duplicate job ${job.id} with key ${key} skipped`);
      console.log(divider);

      return;
    }

    // SIMULATION: Random failure AFTER insert (toggle)
    // if (Math.random() < 0.5) {
    //   throw new Error('Random failure');
    // }

    // Real processing (only once)
    console.log(`PROCESSED job ${job.id} with key ${key}`);
    console.log(divider);
  }
}
