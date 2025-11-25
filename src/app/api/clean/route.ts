import { runDeterministicCleanup } from "@/lib/cleanup/pipeline";
import { getUsageSnapshot, runModel } from "@/lib/providers";
import type { ProviderId } from "@/lib/providers/types";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are an expert React UI refactor assistant.
- Respect component behavior and improve readability.
- Prefer concise React patterns, accessibility improvements, and idiomatic Tailwind usage.
- Always respond with JSON in the shape:
  {
    "cleanedCode": "<tsx string>",
    "summary": ["short bullet"]
  }
`.trim();

const CUSTOM_MODEL_URL =
  process.env.CUSTOM_MODEL_URL || "http://localhost:8000";

type CleanRequestBody = {
  code: string;
  fileName?: string;
  provider?: ProviderId;
};

export async function POST(request: Request) {
  const {
    code,
    fileName,
    provider = "openai",
  } = (await request.json()) as CleanRequestBody;

  if (!code || typeof code !== "string" || !code.trim()) {
    return NextResponse.json(
      { error: "Code is required for refactoring." },
      { status: 400 },
    );
  }

  try {
    const cleanupResult = runDeterministicCleanup(code);

    const userPrompt = [
      fileName ? `Component: ${fileName}` : "",
      "Deterministic cleanup (already applied on our side):",
      "```tsx",
      cleanupResult.code,
      "```",
      "Please deliver an improved, production-ready variant (in JSON as described).",
    ]
      .filter(Boolean)
      .join("\n");

    if (provider === "deterministic") {
      return NextResponse.json({
        provider,
        diagnostics: cleanupResult.diagnostics,
        summary: ["Returned deterministic output only (no LLM used)."],
        artifacts: {
          original: code,
          deterministic: cleanupResult.code,
          aiOutput: cleanupResult.code,
        },
        usage: getUsageSnapshot(),
      });
    }

    if (provider === "custom-finetuned") {
      try {
        const response = await fetch(`${CUSTOM_MODEL_URL}/refactor`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: cleanupResult.code }),
        });

        if (!response.ok) {
          throw new Error(`Custom model returned ${response.status}`);
        }

        const data = await response.json();
        const cleanedCode = data.refactored || cleanupResult.code;
        const summary = data.summary || ["Refactored with fine-tuned model"];

        return NextResponse.json({
          provider,
          diagnostics: cleanupResult.diagnostics,
          summary,
          artifacts: {
            original: code,
            deterministic: cleanupResult.code,
            aiOutput: cleanedCode,
          },
          usage: getUsageSnapshot(),
        });
      } catch (error) {
        throw new Error(
          `Custom model error: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    const aiResult = await runModel({
      provider,
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
    });

    return NextResponse.json({
      provider,
      diagnostics: cleanupResult.diagnostics,
      summary: aiResult.summary,
      artifacts: {
        original: code,
        deterministic: cleanupResult.code,
        aiOutput: aiResult.cleanedCode,
      },
      usage: getUsageSnapshot(),
    });
  } catch (error) {
    console.error("Failed to clean code:", error);
    const message =
      error instanceof Error
        ? error.message
        : "AI cleaning failed. Please try again.";

    const quota =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "insufficient_quota";

    return NextResponse.json(
      {
        error: quota
          ? "Provider quota exceeded. Update billing or switch to another provider."
          : message,
      },
      { status: quota ? 429 : 500 },
    );
  }
}

export const runtime = "nodejs";
