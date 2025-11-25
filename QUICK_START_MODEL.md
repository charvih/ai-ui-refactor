# Quick Start: Custom Model Server

Since installing PyTorch on Windows can be complex, we've created a **simple alternative** using Ollama - a local LLM runtime.

## Option A: Use Ollama (Easiest - 5 minutes)

### Step 1: Install Ollama

Download and install from: https://ollama.ai

### Step 2: Pull Neural Chat Model

```bash
ollama pull neural-chat
```

### Step 3: Start Ollama Service

Open a new terminal and run:

```bash
ollama serve
```

Keep this terminal open.

### Step 4: Start Model Server (in another terminal)

```bash
cd C:\Users\charv\OneDrive\Desktop\RMIT\ai-ui-refactor\ai-ui-refactor
python scripts/quick_model_server.py
```

### Step 5: Test in Your App

- Visit http://localhost:3000
- Select "Custom Fine-tuned Model"
- Paste code → "Clean Code"

**That's it!** Your app will now use Ollama's Neural Chat model for code refactoring.

---

## Option B: Use Fine-Tuned Model (Advanced - 2-4 hours)

If you want to train a custom model specifically on React refactoring patterns:

### Prerequisites

```bash
pip install unsloth[colab-new] xformers transformers datasets peft bitsandbytes
```

### Train

```bash
python scripts/finetune.py --epochs 3 --batch-size 2
```

### Serve

```bash
python scripts/model_server.py --model ./refactor-model-final --port 8000
```

---

## How It Works

```
Your App (Next.js)
    ↓
POST /api/clean with code
    ↓
API checks provider:
  - "openai" → calls OpenAI API
  - "custom-finetuned" → calls localhost:8000
    ↓
Model Server (Ollama or Fine-tuned)
    ↓
Returns refactored code
    ↓
App displays diff + saves output
```

---

## Troubleshooting

**Error: "Custom model error: fetch failed"**

- Make sure `ollama serve` is running
- Make sure `python scripts/quick_model_server.py` is running
- Check: http://localhost:8000/health should return `{"status": "ok"}`

**Error: "Ollama not running"**

- Open a new terminal
- Run: `ollama serve`
- Keep it open while using the app

**Model is slow**

- Ollama uses CPU by default
- First request takes 30-60 seconds (model loading)
- Subsequent requests are ~10-20 seconds
- For GPU support, restart Ollama with GPU enabled

---

## Next Steps

1. **Try Ollama** (Option A) - fastest way to test
2. **Add more training data** to `refactor_data.jsonl` for better results
3. **Fine-tune your own model** (Option B) once you're comfortable
4. **Deploy to production** on HuggingFace Spaces or AWS
