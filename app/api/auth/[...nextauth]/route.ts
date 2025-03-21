import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      // Add target_lang to the session with default value "en"
      session.target_lang = token.target_lang || "de";
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      // Initialize target_lang when token is first created
      if (user) {
        token.target_lang = "en";
      }
      
      // Handle updates when session is updated
      if (trigger === "update" && session?.target_lang) {
        token.target_lang = session.target_lang;
      }

      // Save target_lang even after logout
      if (!user) {
        token.target_lang = token.target_lang || "de"; // Retain the value
      }
      
      return token;
    }
  },
  debug: process.env.NODE_ENV === "development",
};

// Create handler
const handler = NextAuth(authOptions);

// Export route handlers
export { handler as GET, handler as POST };