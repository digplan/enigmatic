/*
# `src/plugins/llm/llmchat.js`

## Purpose

Proxies chat completion requests to OpenRouter.

## Required Env

- `OPENROUTER_API_KEY`

Optional:

- `USE_LLM_MODEL` (default model when request body omits `model`)

## Route

- `POST /llm/chat`
  - reads JSON request body
  - injects `USE_LLM_MODEL` if present and body has no `model`
  - forwards request to `https://openrouter.ai/api/v1/chat/completions`
  - returns upstream JSON and status code

## Error Behavior

- when API key is missing, returns:
  - status `503`
  - `{ "error": "Missing OPENROUTER_API_KEY" }`

*/