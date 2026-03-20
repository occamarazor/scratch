import { TaskEntity } from '@tasks/entities/task.entity';
import { TaskStatus } from '@tasks/tasks.types';

import AppDataSource from '../src/data-source';

const seed = async () => {
  await AppDataSource.initialize();

  const tasksRepo = AppDataSource.getRepository(TaskEntity);

  await tasksRepo.clear();
  await tasksRepo.save([
    {
      title: 'Buy groceries',
      description: 'Milk, eggs',
      status: TaskStatus.IN_PROGRESS,
      priority: 3,
      dueAt: '2025-10-01T12:00:00.000Z',
      ownerId: 1,
    },
    {
      title: 'Prepare demo',
      description: 'Slides',
      status: TaskStatus.DONE,
      priority: 4,
      dueAt: '2025-11-01T12:00:00.000Z',
      ownerId: 1,
    },
    {
      title: 'Walk',
    },
  ]);

  await AppDataSource.destroy();
  console.log('Tasks seed complete');
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
