export type ProviderId = "openai" | "custom-finetuned" | "deterministic";

export type ProviderRequest = {
  provider: ProviderId;
  systemPrompt: string;
  userPrompt: string;
};

export type ProviderRunResult = {
  cleanedCode: string;
  summary: string[];
  tokens?: number;
};

export type ProviderUsageSnapshot = Record<ProviderId, number>;
