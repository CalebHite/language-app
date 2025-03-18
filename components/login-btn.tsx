"use client";
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button";

export default function LoginBtn() {
  const { data: session } = useSession()
  if (session && session.user) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Button onClick={() => signIn()} className="bg-blue-600 hover:bg-blue-700 text-lg text-white">
        Login
      </Button>
    </div>
  )
}