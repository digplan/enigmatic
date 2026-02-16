export default function (app) {
  const apiKey = Bun.env.OPENROUTER_API_KEY;
  const auth = apiKey?.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey || ""}`;
  app.requiredEnvs = [...(app.requiredEnvs || []), "OPENROUTER_API_KEY"];

  const k = "POST /llm/chat";
  const fn = async (req, ctx) => {
    if (!apiKey) return ctx.json({ error: "Missing OPENROUTER_API_KEY" }, 503);
    const body = await req.json().catch(() => ({}));
    const model = Bun.env.USE_LLM_MODEL;
    if (model && !body.model) body.model = model;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return ctx.json(await res.json(), res.status);
  };
  app.routes[k] = app.routes[k] ? (Array.isArray(app.routes[k]) ? [...app.routes[k], fn] : [app.routes[k], fn]) : fn;
}
