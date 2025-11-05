import { Nullable } from '@common/types';

export type NodeEnv = 'development' | 'test' | 'production';

export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
}

export interface AuthConfig {
  jwtSecret: Nullable<string>; // Allow bootstrapping without a secret in early dev
  jwtExpiresIn: string;
}

export interface AppConfig {
  appName: string;
  nodeEnv: NodeEnv;
  port: number;
  frontendUrl: Nullable<string>; // Useful for CORS
  database: DatabaseConfig;
  auth: AuthConfig;
}
