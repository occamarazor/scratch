import { TaskEntity } from '@tasks/entities/task.entity';

import AppDataSource from '../src/data-source';

const seed = async () => {
  await AppDataSource.initialize();

  const tasksRepo = AppDataSource.getRepository(TaskEntity);

  await tasksRepo.clear();
  await tasksRepo.save([
    { title: 'Buy groceries', description: 'Milk, eggs', status: 'TODO', priority: 1 },
    { title: 'Prepare demo', description: 'Slides', status: 'IN_PROGRESS', priority: 2 },
  ]);

  await AppDataSource.destroy();
  console.log('Tasks seed complete');
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
