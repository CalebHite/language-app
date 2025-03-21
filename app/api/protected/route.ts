import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  return NextResponse.json({ user: data });
}
