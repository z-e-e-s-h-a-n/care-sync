import type { UserStatus, UserRole } from "@workspace/db/client";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: UserRole;
      status: UserStatus;
      sessionId?: string;
    }
  }
}

export {};
