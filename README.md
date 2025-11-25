# AI Code Refactorer

This project came from my capstone: I kept seeing PRs that needed refactors, and I wanted to see how far LLMs could go in automating that review step. The app combines deterministic cleanup with LLM polishing and a diff-first UI to make reviews faster and more consistent.

## What it does
- **Deterministic cleanup first**: TypeScript/Babel pipeline removes unused imports, normalizes Tailwind classes, and sorts props before any model call.
- **LLM polishing**: choose OpenAI/Groq or a local Ollama model (`neural-chat`) for final refactors and summaries.
- **Diff-focused UI**: compare Original vs Deterministic vs AI output side by side, with usage counters and light/dark themes.
- **Download/share**: export the cleaned component as `.tsx`/`.jsx`.

## Architecture
- **Frontend**: Next.js (App Router) for the editor, diffs, and provider selection.
- **API route**: `/api/clean` orchestrates deterministic cleanup, then calls the chosen provider.
- **Custom model server**: `scripts/quick_model_server.py` (Flask) exposes `/health`, `/refactor`, `/batch-refactor` and calls Ollama `neural-chat` on `http://localhost:11434`.
- **Local LLM runtime**: Ollama for running the local model.

## Setup: frontend with hosted models
1) Install deps: `npm install`
2) Copy envs: `cp .env.example .env.local` then set:
   ```
   OPENAI_API_KEY=sk-...
   GROQ_API_KEY=...        # optional
   CUSTOM_MODEL_URL=http://localhost:8000
   ```
3) Run the app: `npm run dev` and open http://localhost:3000
4) In the UI, pick a provider (OpenAI/Groq) or “Custom Fine-tuned Model” if you’re running the local server below.

## Setup: local custom model (Ollama)
1) Install Ollama: https://ollama.ai
2) Pull the model: `ollama pull neural-chat`
3) Start Ollama: `ollama serve` (if port 11434 is busy, Ollama may already be running)
4) Run the Flask server:
   ```
   python scripts/quick_model_server.py
   ```
   - Warmup runs automatically; first response can take ~1–2 minutes.
   - Health check: `curl http://localhost:8000/health` → `{"status":"ok","model":"neural-chat"}`
5) Use the app with provider “Custom Fine-tuned Model”.

## Usage (API)
POST `/api/clean`
```json
{
  "code": "<component source>",
  "fileName": "Component.tsx",
  "provider": "openai" | "groq" | "custom-finetuned" | "deterministic"
}
```
Response includes cleaned/refactored code plus diagnostics and summaries.

## Why it exists
- Problem: frequent PRs with style/cleanup issues slowed review cycles.
- Approach: front-load deterministic fixes, then have an LLM finish and explain changes with diffs.
- Goal: faster, more consistent reviews and a playground to compare hosted vs local LLMs.
