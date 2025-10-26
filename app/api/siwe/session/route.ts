import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { NextResponse } from "next/server";

// Define the session data structure
interface SessionData {
  address?: string;
  chainId?: number;
  nonce?: string;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "siwe-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function GET() {
  // Pass the SessionData type to getIronSession
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );

  console.log("API Route - Session:", session);

  return NextResponse.json({
    address: session.address || null,
    chainId: session.chainId || null,
  });
}
