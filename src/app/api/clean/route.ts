import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are an expert React UI refactor assistant. When you receive a component file:
- Clean up Tailwind utility class order (use logical grouping).
- Remove unused imports.
- Prefer functional components and concise hooks.
- Normalize inline styles into Tailwind classes when possible.
- Preserve behavior; only improve readability and consistency.
Return ONLY the transformed code with no explanation.
`.trim();

export async function POST(request: Request) {
  const { code, fileName } = await request.json();

  if (!code || typeof code !== "string" || !code.trim()) {
    return NextResponse.json(
      { error: "Code is required for refactoring." },
      { status: 400 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Missing OPENAI_API_KEY. Add it to your environment to enable AI cleaning.",
      },
      { status: 500 },
    );
  }

  try {
    const completion = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: [
                fileName ? `File: ${fileName}` : "",
                "Refactor the following component:",
                "```tsx",
                code,
                "```",
              ]
                .filter(Boolean)
                .join("\n"),
            },
          ],
        },
      ],
      temperature: 0.1,
    });

    const cleanedCode =
      completion.output?.[0]?.content?.[0]?.text?.trim() ?? code;

    return NextResponse.json({ cleanedCode });
  } catch (error) {
    console.error("Failed to clean code:", error);
    return NextResponse.json(
      { error: "AI cleaning failed. Please try again." },
      { status: 500 },
    );
  }
}

export const runtime = "edge";
