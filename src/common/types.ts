export type Nullable<T> = T | undefined;

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
