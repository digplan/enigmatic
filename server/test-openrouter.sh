#!/usr/bin/env bash
# Test OpenRouter API with curl. Requires OPENROUTER_API_KEY in env (or source .env).
# Usage: OPENROUTER_API_KEY=sk-or-... ./test-openrouter.sh
#    or: source ../.env 2>/dev/null; ./test-openrouter.sh

set -e
KEY="${OPENROUTER_API_KEY:?Set OPENROUTER_API_KEY}"
echo "OPENROUTER_API_KEY: $KEY"

echo "=== OpenRouter chat/completions (curl) ==="
curl -sS -X POST "https://openrouter.ai/api/v1/chat/completions" \
  -H "Authorization: Bearer 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" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-3.5-turbo","messages":[{"role":"user","content":"Say hello in one word."}]}' | head -c 800
echo ""
