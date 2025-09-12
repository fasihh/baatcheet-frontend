import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();

  const res = await fetch(`${process.env.API_URL}/users/friends`, {
    headers: { Authorization: `Bearer ${session}` },
  });

  const data = await res.json();
  return NextResponse.json(data);
}
