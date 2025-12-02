import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const url = new URL(req.url);
  const headers = new Headers(req.headers);
  const responseHeaders = new Headers({
    "Content-Security-Policy": "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'",
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
  });

  if (url.pathname.startsWith("/portal")) {
    const token = url.pathname.split("/")[2] || url.searchParams.get("token") || "";
    if (token) {
      headers.set("x-portal-token", token);
    }
  }

  const res = NextResponse.next({ request: { headers } });
  responseHeaders.forEach((v, k) => res.headers.set(k, v));
  return res;
}

export const config = {
  matcher: ["/(.*)"],
};
