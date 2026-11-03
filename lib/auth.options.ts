import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDB } from "./db";
import userModel from "@/models/user.model";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
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
          if (!user) {
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
          console.log(err);
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
    /* 
    Because I configured session: { strategy: "jwt" }, NextAuth does not store 
    session data in a database. Instead, it creates an encrypted JSON Web Token (JWT)
    and saves it in a secure HTTP-Only cookie in the user's browser.
    It runs On initial login ... When user exists obviously ...
    */
    async jwt({ token, user }) {
      //* The Lockbox Maker
      if (user) {
        token.id = user.id;
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
