import 'reflect-metadata';

// TODO: path
import dataSource from '../src/data-source';
import { MessageEntity } from '../src/messages/entities/message.entity';

const seed = async () => {
  await dataSource.initialize();
  const repo = dataSource.getRepository(MessageEntity);
  await repo.clear();
  await repo.save([
    { content: 'Random message number UNO' },
    { content: 'Random message number DOS' },
    { content: 'Random message number TRES' },
  ]);
  await dataSource.destroy();
  console.log('seed finished');
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
