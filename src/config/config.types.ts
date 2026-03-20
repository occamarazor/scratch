import { Nullable } from '@common/types';

import { NODE_ENV_DEVELOPMENT, NODE_ENV_PRODUCTION, NODE_ENV_TEST } from './config.constants';

export type NodeEnv =
  | typeof NODE_ENV_DEVELOPMENT
  | typeof NODE_ENV_TEST
  | typeof NODE_ENV_PRODUCTION;

export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
}

export interface AuthConfig {
  jwtSecret: Nullable<string>; // TODO: allow bootstrapping without in early dev
  jwtExpiresIn: string;
}

export interface AppConfig {
  appName: string;
  nodeEnv: NodeEnv;
  port: number;
  frontendUrl: Nullable<string>; // TODO: allow bootstrapping without in early dev
  database: DatabaseConfig;
  auth: AuthConfig;
}
