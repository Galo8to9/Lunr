import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

const sessionOptions = {
  cookieName: "siwe-session",
  password: process.env.SESSION_SECRET!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    path: "/", // make sure it matches your middleware usage
  },
};

export async function POST() {
  // Bind iron-session to Next's cookie store
  const session = await getIronSession(cookies(), sessionOptions);

  // This clears the iron-session cookie by setting an expired Set-Cookie header
  await session.destroy();

  // Also nuke any extra auth cookie you had, e.g. `siwe-token`
  const res = NextResponse.json({ ok: true });
  res.cookies.set("siwe-token", "", { expires: new Date(0), path: "/" });

  return res;
}
