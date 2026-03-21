import { Nullable } from '@common/types';

import type { AppConfig } from './config.types';

export const NODE_ENV_DEVELOPMENT = 'development';
export const NODE_ENV_TEST = 'test';
export const NODE_ENV_PRODUCTION = 'production';

export const AppConfigDefaults: AppConfig = {
  appName: 'Scratch',
  nodeEnv: NODE_ENV_DEVELOPMENT,
  port: 3000,
  frontendUrl: undefined as Nullable<string>, // TODO: allow bootstrapping without in early dev

  database: {
    host: 'localhost',
    port: 5432,
    name: 'scratch_db',
    user: 'postgres',
    password: 'postgres',
  },

  auth: {
    jwtSecret: '',
    jwtExpiresIn: '1h',
  },
} as const;
