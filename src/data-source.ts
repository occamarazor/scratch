import 'reflect-metadata';

import { AppConfig } from '@config/config.types';
import configuration from '@config/config.factory';
import { DataSource } from 'typeorm';

const cfg: AppConfig = configuration();

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
