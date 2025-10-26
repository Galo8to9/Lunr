import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SiweMessage } from "siwe";

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
    // Fixed typo: was "cookieOption"
    secure: process.env.NODE_ENV === "production",
  },
};

export async function POST(req: NextRequest) {
  try {
    const { message, signature } = await req.json();

    console.log("=== SIWE Debug ===");
    console.log("Message type:", typeof message);
    console.log("Message:", message);
    console.log("Signature:", signature);

    let siweMessage: SiweMessage;
    siweMessage = new SiweMessage(message);
    console.log("Parsed SIWE message:", siweMessage);

    const verificationResult = await siweMessage.verify({ signature });
    console.log("Verification result:", verificationResult);

    if (verificationResult.success) {
      const cookieStore = await cookies();
      const session = await getIronSession<SessionData>(
        cookieStore,
        sessionOptions
      );

      session.address = siweMessage.address;
      session.chainId = siweMessage.chainId;
      await session.save();

      console.log("Sessions saved:", session);

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      {
        ok: false,
        error: "Verification failed",
        details: verificationResult,
      },
      { status: 401 }
    );
  } catch (error) {
    console.error("=== SIWE Error ===");
    console.error("Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
