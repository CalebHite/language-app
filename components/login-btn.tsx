"use client";
import { useSession, signIn, signOut } from "next-auth/react"

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
    <>
      <button className="p-2 px-6 bg-blue-600 text-white rounded-full" onClick={() => signIn()}>Sign in</button>
    </>
  )
}