import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface User {
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

// `next-auth/jwt` re-exports its `JWT` type from `@auth/core/jwt` via `export *`,
// so augmenting only "next-auth/jwt" doesn't merge onto the interface Auth.js
// actually uses in callbacks — augment the source module too.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
