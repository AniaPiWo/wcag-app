import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcrypt';

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
  }
}

// Hardcoded admin credentials for development
// In a production environment, these should be stored securely
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$10$Oc9vB7OUO1wfP.aEbJJVj.eQlJXKnfZpA5W9.QGBwNPC9ZXbIJTdK'; // hash for 'admin123'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check if the provided credentials match the admin credentials
        if (credentials.email === ADMIN_EMAIL) {
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            ADMIN_PASSWORD_HASH
          );

          if (passwordMatch) {
            return {
              id: '1',
              email: ADMIN_EMAIL,
              name: 'Administrator',
              role: 'admin',
            };
          }
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
