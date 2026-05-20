import { NextResponse } from "next/server";

import { saveDailyKilometers } from "@/lib/daily-metrics";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const kilometers = Number(body.kilometers);

    if (Number.isNaN(kilometers) || kilometers < 0) {
      return NextResponse.json(
        { error: "Invalid kilometers value" },
        { status: 400 }
      );
    }

    await saveDailyKilometers(kilometers);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Failed to save daily kilometers:", error);

    return NextResponse.json(
      { error: "Failed to save daily kilometers" },
      { status: 500 }
    );
  }
}