import { TaskEntity } from '@tasks/entities/task.entity';

import AppDataSource from '../src/data-source';

const seed = async () => {
  await AppDataSource.initialize();

  const tasksRepo = AppDataSource.getRepository(TaskEntity);

  await tasksRepo.clear();
  await tasksRepo.save([
    {
      title: 'Buy groceries',
      description: 'Milk, eggs',
      status: 'DONE',
      priority: 1,
      ownerId: 1,
    },
    {
      title: 'Prepare demo',
      description: 'Slides',
      status: 'IN_PROGRESS',
      priority: 3,
      dueAt: '2025-10-01T12:00:00.000Z',
      ownerId: 1,
    },
    {
      title: 'Walk',
      description: 'At the park',
      status: 'TODO',
      priority: 4,
      dueAt: '2025-11-01T12:00:00.000Z',
      ownerId: 0,
    },
  ]);

  await AppDataSource.destroy();
  console.log('Tasks seed complete');
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
