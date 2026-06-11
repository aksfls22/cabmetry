import { NextResponse } from "next/server";
import { validateActivationCodeAvailable } from "@/lib/access-codes";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, error: "invalid_code" },
        { status: 400 }
      );
    }

    const result = await validateActivationCodeAvailable(code);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to validate activation code:", error);
    return NextResponse.json(
      { valid: false, error: "database_error" },
      { status: 500 }
    );
  }
}
