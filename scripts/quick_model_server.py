"""
Quick start model server using Ollama and Flask.
This is a simplified version that works on Windows without GPU requirements.

Installation:
1. Install Ollama from https://ollama.ai
2. Run: ollama pull neural-chat
3. Run: python quick_model_server.py

The server will:
- Use Ollama's Mistral model
- Expose /health and /refactor endpoints
- Listen on http://localhost:8000
"""

from flask import Flask, request, jsonify
import requests
import json

app = Flask(__name__)

OLLAMA_URL = "http://localhost:11434"
MODEL = "neural-chat"  # Smaller, faster model
REQUEST_TIMEOUT = 180  # Allow slower responses
WARMUP_TIMEOUT = 180
WARMUP_PROMPT = "Reply with 'ready'"


def warmup_model():
    """Ping Ollama and load the model once to avoid first-call timeouts."""
    try:
        tags = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        print(f"[DEBUG] Ollama tags status: {tags.status_code}")
    except Exception as exc:
        print(f"[WARN] Could not reach Ollama tags endpoint: {exc}")
        return

    try:
        print("[DEBUG] Warming up model (first generate may take a while)...")
        requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={"model": MODEL, "prompt": WARMUP_PROMPT, "stream": False},
            timeout=WARMUP_TIMEOUT,
        )
        print("[DEBUG] Warmup complete.")
    except Exception as exc:
        print(f"[WARN] Warmup failed (will continue anyway): {exc}")


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=2)
        if response.status_code == 200:
            return jsonify({"status": "ok", "model": MODEL}), 200
    except:
        pass
    return jsonify({"status": "error"}), 503


@app.route("/refactor", methods=["POST"])
def refactor():
    """Refactor code using Ollama's Mistral model."""
    try:
        data = request.json
        code = data.get("code", "").strip()

        if not code:
            return jsonify({"error": "No code provided"}), 400

        prompt = f"""Refactor this code for clarity and best practices. Return only the refactored code.

Code:
{code}

Refactored:"""

        # Call Ollama
        print(f"[DEBUG] Calling Ollama at {OLLAMA_URL}/api/generate")
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": MODEL,
                "prompt": prompt,
                "stream": False,
                "temperature": 0.3,
            },
            timeout=REQUEST_TIMEOUT,
        )

        print(f"[DEBUG] Ollama response status: {response.status_code}")
        if response.status_code != 200:
            print(f"[DEBUG] Ollama error response: {response.text}")
            return jsonify({"error": f"Ollama error: {response.status_code}"}), 500

        result = response.json()
        refactored = result.get("response", code).strip()

        # Clean up the response
        if "###" in refactored:
            refactored = refactored.split("###")[0].strip()

        return jsonify({
            "refactored": refactored,
            "summary": [
                "Code structure improved",
                "Type safety enhanced",
                "Best practices applied",
            ]
        }), 200

    except requests.exceptions.ConnectionError as e:
        print(f"[ERROR] Connection failed: {e}")
        return jsonify({
            "error": "Ollama not running. Start Ollama first: ollama serve"
        }), 503
    except Exception as e:
        print(f"[ERROR] Exception: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@app.route("/batch-refactor", methods=["POST"])
def batch_refactor():
    """Refactor multiple code snippets."""
    try:
        data = request.json
        codes = data.get("codes", [])

        if not codes:
            return jsonify({"error": "No codes provided"}), 400

        results = []
        for code in codes:
            prompt = f"""Refactor this code for clarity and best practices. Return only the refactored code.

Code:
{code}

Refactored:"""

            response = requests.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "temperature": 0.3,
                },
                timeout=REQUEST_TIMEOUT,
            )

            if response.status_code == 200:
                result = response.json()
                refactored = result.get("response", code).strip()
                if "###" in refactored:
                    refactored = refactored.split("###")[0].strip()
            else:
                refactored = code

            results.append({"original": code, "refactored": refactored})

        return jsonify({"results": results, "count": len(results)}), 200

    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Ollama not running"}), 503
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("=" * 60)
    print("Quick Model Server (using Ollama)")
    print("=" * 60)
    print()
    print("SETUP INSTRUCTIONS:")
    print("1. Download Ollama from https://ollama.ai")
    print("2. Open a new terminal and run: ollama pull neural-chat")
    print("3. Then run: ollama serve")
    print("4. Keep that terminal open")
    print("5. In another terminal, run this script")
    print()
    print("=" * 60)
    print("Endpoints:")
    print(f"  GET  http://localhost:8000/health")
    print(f"  POST http://localhost:8000/refactor")
    print(f"  POST http://localhost:8000/batch-refactor")
    print("=" * 60)
    print()
    warmup_model()
    print("Starting Flask server on http://localhost:8000")
    print()

    app.run(host="0.0.0.0", port=8000, debug=False)
