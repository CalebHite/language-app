import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
    schema: 'next_auth',
  }),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      // Pass the target_lang from the token to the session
      session.target_lang = token.target_lang || "en";
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      // For first-time sign in
      if (user && !token.target_lang) {
        // Try to load existing preference from database
        try {
          const { data } = await supabase
            .from('users')
            .select('target_lang')
            .eq('email', user.email)
            .single();
          
          // If found in database, use it
          if (data && data.target_lang) {
            token.target_lang = data.target_lang;
          } else {
            // Otherwise set default
            token.target_lang = "en";
            
            // Save default to database for future
            await supabase
              .from('users')
              .update({ target_lang: "en" })
              .eq('email', user.email);
          }
        } catch (error) {
          // If database query fails, still set a default
          console.error("Error fetching language preference:", error);
          token.target_lang = "en";
        }
      }
      
      // When user updates their preference
      if (trigger === "update" && session?.target_lang) {
        // Update the token
        token.target_lang = session.target_lang;
        
        // Also try to update the database
        try {
          await supabase
            .from('users')
            .update({ target_lang: session.target_lang })
            .eq('email', token.email);
        } catch (error) {
          console.error("Error saving language preference:", error);
        }
      }
      
      return token;
    }
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };