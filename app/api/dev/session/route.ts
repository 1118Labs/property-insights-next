import { NextResponse } from "next/server";

// DEV-ONLY session stub, not for production use.
const COOKIE_NAME = "pi_dev_session";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body?.email;
    if (!email || typeof email !== "string") {
      return NextResponse.json({ ok: false, error: "Email required" }, { status: 400 });
    }

    const payload = {
      email,
      role: "owner",
      accountId: "dev-account",
    };

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, JSON.stringify(payload), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    return res;
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, maxAge: -1, path: "/" });
  return res;
}
