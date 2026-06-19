import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const { ok, retryAfter } = rateLimit(`beta:${clientIp(request)}`);
    if (!ok) {
      return NextResponse.json(
        { valid: false },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const validBetaCode = process.env.BETA_CODE;

    if (!validBetaCode) {
      console.error("BETA_CODE environment variable is not set");
      return NextResponse.json({ valid: false }, { status: 500 });
    }

    const valid = code.trim() === validBetaCode;

    return NextResponse.json({ valid });
  } catch (error) {
    console.error("Failed to validate beta code:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
