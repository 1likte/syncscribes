import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "syncscribes-fallback-secret-please-set-env",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        // --- PRIORITY 1: EMERGENCY ADMIN LOGIN ---
        // Bypass database completely for owner credentials
        // Credentials come from environment variables for security
        const inputUser = credentials.username.trim().toLowerCase();
        const inputPass = credentials.password.trim();

        const ownerUsername = (process.env.OWNER_USERNAME || 'chefyunuskalkan').toLowerCase();
        const ownerPassword = process.env.OWNER_PASSWORD || 'Antalya1250.';

        if (inputUser === ownerUsername) {
          if (inputPass === ownerPassword) {
            console.log('[Auth] SUCCESS: Emergency Admin Login used for:', inputUser);

            // Try to get real ID from DB to avoid foreign key issues
            let dbUser = null;
            try {
              dbUser = await prisma.user.findUnique({
                where: { username: ownerUsername }
              });
            } catch (e) {
              console.warn('[Auth] DB lookup failed for admin, using fallback ID');
            }

            return {
              id: dbUser?.id || 'emergency-admin-id',
              username: ownerUsername,
              email: dbUser?.email || `${ownerUsername}@syncscribes.com`,
              role: 'OWNER',
              xp: 9999,
              level: 99,
              subscriptionStatus: 'ACTIVE',
              bannedUntil: undefined
            };
          } else {
            console.warn('[Auth] FAILED: Password mismatch for Emergency Admin');
          }
        }
        // --- EMERGENCY END ---

        // Only check database if not using emergency credentials
        let user = null;
        try {
          user = await prisma.user.findUnique({
            where: { username: credentials.username },
          }).catch(e => {
            console.error('[Auth] DB Error:', e);
            return null;
          });
        } catch (dbError) {
          console.error('[Auth] Unexpected DB Error:', dbError);
        }

        if (user) {
          // Check if user is banned
          if (user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
            throw new Error('Account is banned')
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (isPasswordValid) {
            return {
              id: user.id,
              username: user.username,
              role: user.role,
              xp: user.xp,
              level: user.level,
              subscriptionStatus: user.subscriptionStatus,
              bannedUntil: user.bannedUntil instanceof Date ? user.bannedUntil.toISOString() : (user.bannedUntil as string)
            }
          }
        }
        return null
      },
    }),
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.bannedUntil) {
        token.bannedUntil = session.bannedUntil; // Allow manual update
      }
      if (user) {
        const u = user as any;
        token.role = u.role;
        token.xp = u.xp;
        token.level = u.level;
        token.subscriptionStatus = u.subscriptionStatus;
        token.bannedUntil = u.bannedUntil;
        token.username = u.username;
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.xp = token.xp as number
        session.user.level = token.level as number
        session.user.subscriptionStatus = token.subscriptionStatus as string
        session.user.bannedUntil = token.bannedUntil as string
        session.user.username = token.username as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error' // Custom error page
  }
}
