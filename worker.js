/**
 * Cloudflare Worker — NVIDIA API Proxy for FINA 3101 Tutor
 *
 * Deploy at: https://dash.cloudflare.com → Workers & Pages → Create Worker
 * Add secret:  wrangler secret put NVIDIA_API_KEY   (or via dashboard)
 */

const NVIDIA_BASE = "https://integrate.api.nvidia.com/v1";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
    }

    // Only allow the chat completions endpoint
    const url = new URL(request.url);
    if (url.pathname !== "/v1/chat/completions") {
      return new Response("Not found", { status: 404, headers: CORS_HEADERS });
    }

    // Forward request to NVIDIA with the secret key
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400, headers: CORS_HEADERS });
    }

    const nvidiaRes = await fetch(`${NVIDIA_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${env.NVIDIA_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await nvidiaRes.json();

    return new Response(JSON.stringify(data), {
      status: nvidiaRes.status,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
    });
  },
};
