import 'reflect-metadata';

import { MessageEntity } from '@messages/entities/message.entity';

import AppDataSource from '../src/data-source';

const seed = async () => {
  await AppDataSource.initialize();

  const messagesRepo = AppDataSource.getRepository(MessageEntity);

  await messagesRepo.clear();
  await messagesRepo.save([
    { content: 'Random message number UNO' },
    { content: 'Random message number DOS' },
    { content: 'Random message number TRES' },
  ]);

  await AppDataSource.destroy();
  console.log('Messages seed complete');
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
