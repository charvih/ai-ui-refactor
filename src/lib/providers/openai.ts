import OpenAI from "openai";
import type { ProviderRunResult } from "./types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const OPENAI_MODEL = "gpt-4o-mini";

export async function runWithOpenAI(
  systemPrompt: string,
  userPrompt: string,
): Promise<ProviderRunResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    temperature: 0.1,
  });

  const text = completion.choices?.[0]?.message?.content ?? "";
  const parsed = parseModelOutput(text);

  return {
    cleanedCode: parsed.cleanedCode ?? userPrompt,
    summary: parsed.summary ?? [],
    tokens: completion.usage?.total_tokens,
  };
}

function parseModelOutput(text: string): {
  cleanedCode?: string;
  summary?: string[];
} {
  try {
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Missing JSON payload.");
    }
    const payload = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    return {
      cleanedCode:
        typeof payload.cleanedCode === "string"
          ? payload.cleanedCode
          : undefined,
      summary: Array.isArray(payload.summary)
        ? payload.summary.map(String)
        : undefined,
    };
  } catch {
    return {
      cleanedCode: text,
      summary: ["Model response could not be parsed. Returning raw output."],
    };
  }
}
