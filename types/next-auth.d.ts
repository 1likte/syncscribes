import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      xp: number;
      level: number;
      subscriptionStatus?: string;
      freeAccessGranted?: boolean;
      referralCount?: number;
      referralCode?: string;
      bannedUntil?: string;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    username: string;
    role: string;
    xp: number;
    level: number;
    subscriptionStatus?: string;
    freeAccessGranted?: boolean;
    referralCount?: number;
    referralCode?: string;
    bannedUntil?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    xp: number;
    level: number;
    subscriptionStatus?: string;
    bannedUntil?: string;
  }
}
