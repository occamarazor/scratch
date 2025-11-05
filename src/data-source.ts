import 'reflect-metadata';

import configuration from '@config/configuration';
import { DataSource } from 'typeorm';

const cfg = configuration();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? cfg.database.host,
  port: Number(process.env.DATABASE_PORT ?? cfg.database.port),
  username: process.env.DATABASE_USER ?? cfg.database.user,
  password: process.env.DATABASE_PASSWORD ?? cfg.database.password,
  database: process.env.DATABASE_NAME ?? cfg.database.name,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false, // migrations instead
});
