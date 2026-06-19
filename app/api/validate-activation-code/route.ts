import { NextResponse } from "next/server";
import { validateActivationCodeAvailable } from "@/lib/access-codes";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Enumeration hardening: throttle repeated checks per client.
    const { ok, retryAfter } = rateLimit(`activation:${clientIp(request)}`);
    if (!ok) {
      return NextResponse.json(
        { valid: false, error: "rate_limited" },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, error: "invalid_code" },
        { status: 400 }
      );
    }

    const result = await validateActivationCodeAvailable(code);

    // Return only the boolean. Do not leak license_type or the specific reason
    // (expired / exhausted) to unauthenticated callers — that aids enumeration.
    return NextResponse.json({ valid: result.valid });
  } catch (error) {
    console.error("Failed to validate activation code:", error);
    return NextResponse.json(
      { valid: false, error: "database_error" },
      { status: 500 }
    );
  }
}
