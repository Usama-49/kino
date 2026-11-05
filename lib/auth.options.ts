import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDB } from "./db";
import userModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "randomguy@mail.com" },
        password: { label: "Password", type: "password" },
      },
      /* 
      When a user submits their login form on the frontend using 
      signIn("credentials", { email, password }), NextAuth sends those
      input fields straight to this authorize() function.
      */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password!");
        }
        try {
          await connectToDB();
          const user = await userModel.findOne({ email: credentials.email });
          if (!user || !user.password) {
            throw new Error("Invalid email or password");
          }
          const isPassValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPassValid) {
            throw new Error("Invalid email or password");
          }
          return {
            //? user in callbacks
            id: user._id.toString(),
            email: user.email,
          };
        } catch (err) {
          console.error("Credentials Auth Error:", err);
          throw new Error(err instanceof Error ? err.message : "Authentication failed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 3600,
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectToDB();
          const existingUser = await userModel.findOne({ email: user.email });

          if (!existingUser) {
            // Create user in MongoDB for first-time Google sign-ins
            await userModel.create({
              email: user.email,
              provider: "google",
            });
          }
          return true;
        } catch (error) {
          console.error("Error saving Google user to DB:", error);
          // Return true instead of false so transient DB connection
          //  hiccups don't throw AccessDenied and abort Google auth
          return true;
        }
      }
      return true;
    },
    /* 
    Because I configured session: { strategy: "jwt" }, NextAuth does not store 
    session data in a database. Instead, it creates an encrypted JSON Web Token (JWT)
    and saves it in a secure HTTP-Only cookie in the user's browser.
    It runs On initial login ... When user exists obviously ...
    */

    async jwt({ token, user, account }) {
      // For Google logins, fetch the real MongoDB _id so token.id is consistent across all auth types
      if (user) {
        if (account?.provider === "google") {
          try {
            await connectToDB();
            const dbUser = await userModel.findOne({ email: user.email });
            if (dbUser) {
              token.id = dbUser._id.toString();
            } else {
              token.id = user.id;
            }
          } catch (err) {
            console.error("Error fetching Google user in JWT callback:", err);
            // Assigned fallback user.id so JWT token generation succeeds even when DB connection fails
            token.id = user.id;
          }
        } else {
          token.id = user.id;
        }
      }
      return token;
    },
    /* 
    The client application cannot directly read the encrypted JWT cookie in the browser
    (for security against XSS attacks). Instead, NextAuth decrypts the cookie on the server
    and generates a clean session object that your React components can read via useSession()
    or getServerSession()
    */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string; //* Copy 'id' from decrypted JWT token into session.user
      }
      return session; //* This returned session object is what frontend receives
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  // node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
};

/* 
 1. authorize() returns:   { id: "123", email: "a@b.com" }
                                  │
                                  ▼ (Passed as 'user' parameter)
 2. jwt() puts it in token: token.id = user.id
                                  │
                                  ▼ (Saved into encrypted cookie)
 3. session() puts in UI:   session.user.id = token.id
                                  │
                                  ▼
 4. Your Frontend gets:    const { data: session } = useSession();
                           console.log(session.user.id); // "123"
*/

/*
  HOW NEXTAUTH JWT & SESSION CALLBACKS WORK:
  1. authorize(): Validates credentials with DB and returns basic user data.
  2. jwt(): Packs user fields (like 'id') into the JWT token payload. 
     NextAuth encrypts this token and stores it in the browser as an httpOnly cookie.
  3. session(): Runs whenever the frontend/SSR requests session data. It decrypts
     the cookie on the server and exposes safe fields (token.id -> session.user.id)
     to client/server components via useSession() or getServerSession().
*/
