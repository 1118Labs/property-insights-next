import { NextResponse } from "next/server";

const DEMO_TOKEN = "demo-preview-token-123";

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = `${baseUrl}/portal/${DEMO_TOKEN}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Error generating portal link:", err);
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}
