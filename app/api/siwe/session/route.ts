import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { NextResponse } from "next/server";

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "siwe-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function GET() {
  // Use cookies() from next/headers for App Router API routes
  const session = await getIronSession(await cookies(), sessionOptions);

  console.log("API Route - Session:", session);

  return NextResponse.json({
    address: session.address || null,
    chainId: session.chainId || null,
  });
}
