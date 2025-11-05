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
  synchronize: true, // only in dev
});

export default AppDataSource;
