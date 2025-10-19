// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session"; // for edge, consider 'iron-session/edge'

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "siwe-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // NOTE: for middleware you can also use getIronSession(request.cookies, sessionOptions)
  const session = await getIronSession(request.cookies, sessionOptions);

  console.log("session:", session);
  if (!session.address) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: "/dashboard/:path*",
};
