import { runWithOpenAI } from "./openai";
import type {
  ProviderRequest,
  ProviderRunResult,
  ProviderUsageSnapshot,
} from "./types";

const usage: ProviderUsageSnapshot = {
  openai: 0,
  "custom-finetuned": 0,
  deterministic: 0,
};

export async function runModel({
  provider,
  systemPrompt,
  userPrompt,
}: ProviderRequest): Promise<ProviderRunResult> {
  let result: ProviderRunResult;

  switch (provider) {
    case "openai":
      result = await runWithOpenAI(systemPrompt, userPrompt);
      break;
    case "custom-finetuned":
      // Custom model is handled in route.ts directly
      throw new Error("Custom model should be handled in API route");
    case "deterministic":
      result = {
        cleanedCode: userPrompt,
        summary: ["Returned deterministic output only (no LLM used)."],
      };
      break;
    default:
      throw new Error(`Unsupported provider: ${provider satisfies never}`);
  }

  usage[provider] += 1;
  return result;
}

export function getUsageSnapshot(): ProviderUsageSnapshot {
  return { ...usage };
}
