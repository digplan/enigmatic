/**
 * LLM chat plugin: POST /llm/chat → OpenRouter (no auth).
 * Convention: routes + handle(req, ctx). See plugin/README.md.
 */
export function createLlmChat(env) {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing env: OPENROUTER_API_KEY");
  const fixedModel = env.USE_LLM_MODEL;

  const handle = async (req, ctx) => {
    console.log("[llm] %s %s from %s", ctx.method, ctx.path, ctx.origin || "-");
    try {
      const body = await req.json();
      const model = fixedModel || body?.model || "(none)";
      console.log("[llm] body: model=%s messages=%d", model, Array.isArray(body?.messages) ? body.messages.length : 0);
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: apiKey, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return ctx.json(await res.json(), res.status, {}, ctx.origin);
    } catch (e) {
      return ctx.json({ error: "LLM request failed", details: e.message }, 500, {}, ctx.origin);
    }
  };

  return {
    routes: { "/llm/chat": { POST: handle } },
  };
}

// Pre-initialized export using Bun.env
export const { routes } = createLlmChat(Bun.env);
