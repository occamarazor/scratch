export type Nullable<T> = T | undefined;

export interface AuthUser {
  id: number;
  email?: string;
}
