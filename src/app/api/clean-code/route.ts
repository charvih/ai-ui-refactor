import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { code } = body;

  if (!code) {
    return NextResponse.json({ error: "Code is required." }, { status: 400 });
  }

  // Placeholder for AI code cleaning logic
  const cleanedCode = `// Cleaned code placeholder\n${code}`;

  return NextResponse.json({ cleanedCode });
}

export const runtime = "edge";