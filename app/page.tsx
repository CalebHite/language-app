import { SessionProvider } from "next-auth/react"
import { AppProps } from "next/app"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LoginBtn from "../components/login-btn";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div>
        <h1>Please sign in to view this page.</h1>
        <LoginBtn />
      </div>
    );
  }
  else if (session.user){
    return <div>Welcome to the home page, {session.user.name}!</div>;
  }
}