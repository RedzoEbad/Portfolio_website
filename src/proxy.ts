import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Optimistic gate for /admin pages: bounces requests without a valid signed session
 * before any page code runs. This is NOT the only check — every admin page,
 * Server Action and Route Handler re-verifies the session against MongoDB.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get("pf_session")?.value;
  const secret = process.env.AUTH_SECRET;
  let valid = false;
  if (token && secret) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret), { issuer: "portfolio-admin", audience: "portfolio-admin", algorithms: ["HS256"] });
      valid = true;
    } catch {
      valid = false;
    }
  }
  if (valid) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/preview/:path*"],
};
