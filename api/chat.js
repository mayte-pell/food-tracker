// api/chat.js — Proxy seguro hacia la API de Anthropic.
// La clave NUNCA está en este archivo: vive en una variable de entorno de Vercel.
// Tu app (index.html) llama a /api/chat en vez de llamar directo a Anthropic.

export default async function handler(req, res) {
  // Solo aceptamos POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Falta ANTHROPIC_API_KEY en Vercel" });
  }

  try {
    const { messages, system, max_tokens } = req.body;

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: max_tokens || 1000,
        system: system || "",
        messages: messages || [],
      }),
    });

    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Proxy error", detail: String(err) });
  }
}
