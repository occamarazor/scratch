import 'reflect-metadata';

import configuration from '@config/configuration';
import { DataSource } from 'typeorm';

const cfg = configuration();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: cfg.database.host,
  port: cfg.database.port,
  username: cfg.database.user,
  password: cfg.database.password,
  database: cfg.database.name,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  // Do NOT use synchronize in prod; for dev set via env
  synchronize: false,
  logging: false,
});

export default AppDataSource;
