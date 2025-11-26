export type Nullable<T> = T | undefined;

export interface AuthUser {
  id: number;
  email?: string;
}

export type RequestWithUser = Request & { user?: AuthUser };
