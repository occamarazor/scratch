export type Nullable<T> = T | undefined | null;

export enum Notification {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export interface Response<T> {
  timestamp: Date;
  type: Notification;
  message: string;
  data: T;
}
