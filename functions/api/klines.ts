export const onRequestGet = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);

  const symbol = (url.searchParams.get("symbol") || "ETHUSDT").toUpperCase();
  const interval = url.searchParams.get("interval") || "1h";
  const limit = url.searchParams.get("limit") || "500";

  const allow = new Set(["1m", "5m", "15m", "1h", "4h", "1d"]);
  if (!allow.has(interval)) {
    return new Response(JSON.stringify({ error: "invalid interval" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const endpoints = [
    "https://api.binance.com",
    "https://data-api.binance.vision",
    "https://api1.binance.com",
    "https://api2.binance.com",
    "https://api3.binance.com",
  ];

  for (const base of endpoints) {
    try {
      const upstream = `${base}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
      const res = await fetch(upstream);
      if (!res.ok) continue;

      const body = await res.text();
      return new Response(body, {
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "public, max-age=10",
        },
      });
    } catch {}
  }

  return new Response(JSON.stringify({ error: "upstream failed" }), {
    status: 502,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
