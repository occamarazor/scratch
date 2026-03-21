export type Nullable<T> = T | undefined;

// TODO: UserContext for future User Module (core abstraction)
export interface UserContext {
  userId: string;
  tenantId: string;
}

export type RequestWithUser = Request & { user: UserContext };
