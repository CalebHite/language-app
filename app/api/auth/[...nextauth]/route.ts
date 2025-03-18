import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { FaunaAdapter } from "@next-auth/fauna-adapter";
import { Client } from "faunadb";

const client = new Client({
  secret: process.env.FAUNA_SECRET || "",
});

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  adapter: FaunaAdapter(client),
  session: {
    strategy: "jwt" as const,
  },
};

// Export named functions for each HTTP method
export const GET = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
});

export async function POST(req, res) {
  return NextAuth(req, res, authOptions);
}

export { authOptions };