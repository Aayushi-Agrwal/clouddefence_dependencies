// next-auth-d.ts

import NextAuth, { DefaultSession } from "next-auth";

// Define accessToken type alias
type AccessToken = string;

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    /** Oauth access token */
    access_token?: AccessToken;
  }
}
