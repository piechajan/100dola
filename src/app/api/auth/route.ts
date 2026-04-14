import { NextRequest, NextResponse } from "next/server";

const PASSWORD = "100dola2025";
const COOKIE = "preview_auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password === PASSWORD) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE, PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 dní
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ ok: false }, { status: 401 });
}
