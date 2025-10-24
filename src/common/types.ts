export type TNullable<T> = T | undefined;

export enum ENotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export interface ISystemResponse<T> {
  timestamp: Date;
  type: ENotificationType;
  message: string;
  data: T;
}
