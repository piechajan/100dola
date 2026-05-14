import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/accountant-auth";

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/login-ucetni", req.url));
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
