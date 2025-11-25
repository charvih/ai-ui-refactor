import type { ProviderRunResult } from "./types";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama3-70b-8192";

export async function runWithGroq(
  systemPrompt: string,
  userPrompt: string,
): Promise<ProviderRunResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    throw new Error(`Groq request failed: ${response.status} ${errorPayload}`);
  }

  const json = await response.json();
  const choice = json.choices?.[0];
  const text: string = choice?.message?.content ?? "";
  const parsed = parseModelOutput(text);

  return {
    cleanedCode: parsed.cleanedCode ?? userPrompt,
    summary: parsed.summary ?? [],
    tokens: json.usage?.total_tokens,
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
