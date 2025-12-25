import { useEffect, useMemo, useRef, useState } from "react";
import { createChart, CandlestickSeries, LineSeries, UTCTimestamp } from "lightweight-charts";

type Interval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

const ENDPOINTS = [
  "https://api.binance.com",
  "https://api1.binance.com",
  "https://api2.binance.com",
  "https://api3.binance.com",
  "https://data-api.binance.vision", // 備援節點
];

function intervalToLimit(interval: Interval) {
  if (interval === "1m") return 300;
  if (interval === "5m") return 300;
  if (interval === "15m") return 300;
  if (interval === "1h") return 500;
  if (interval === "4h") return 500;
  return 365;
}

type KlineRow = [number, string, string, string, string]; // openTime, open, high, low, close

function calcMA(
  candles: { time: UTCTimestamp; close: number }[],
  period: number
) {
  const out: { time: UTCTimestamp; value: number }[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) continue;
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += candles[j].close;
    out.push({ time: candles[i].time, value: sum / period });
  }
  return out;
}

async function fetchWithFailover(urlPath: string, signal: AbortSignal) {
  // 8 秒超時：iPhone 上很重要
  const timeout = 8000;

  for (const base of ENDPOINTS) {
    const controller = new AbortController();
    const t = window.setTimeout(() => controller.abort(), timeout);

    try {
      // 如果外層已 abort，就直接丟出
      if (signal.aborted) throw new DOMException("aborted", "AbortError");

      // 把外層 abort 也串到內層
      const onAbort = () => controller.abort();
      signal.addEventListener("abort", onAbort, { once: true });

      const res = await fetch(`${base}${urlPath}`, {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      });

      signal.removeEventListener("abort", onAbort);
      window.clearTimeout(t);

      if (!res.ok) {
        // 429/418/5xx 都算失敗，換節點
        continue;
      }

      return await res.json();
    } catch {
      window.clearTimeout(t);
      // 失敗換下一個節點
      continue;
    }
  }

  throw new Error("Load failed（Binance 連線不穩或被限制）");
}

export default function EthKlineChart() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);

  const candleRef = useRef<ReturnType<ReturnType<typeof createChart>["addSeries"]> | null>(null);
  const ma20Ref = useRef<ReturnType<ReturnType<typeof createChart>["addSeries"]> | null>(null);
  const ma60Ref = useRef<ReturnType<ReturnType<typeof createChart>["addSeries"]> | null>(null);

  const [interval, setInterval] = useState<Interval>("1h");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cacheKey = useMemo(() => `xiannn_eth_klines_${interval}_v1`, [interval]);

  // init chart once
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height: 380,
      layout: { background: { color: "transparent" }, textColor: "#cbd5e1" },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    });

    const candles = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      borderVisible: false,
    });

    const ma20 = chart.addSeries(LineSeries, { color: "#f59e0b", lineWidth: 2 });
    const ma60 = chart.addSeries(LineSeries, { color: "#a78bfa", lineWidth: 2 });

    chartRef.current = chart;
    candleRef.current = candles;
    ma20Ref.current = ma20;
    ma60Ref.current = ma60;

    const ro = new ResizeObserver(() => {
      if (!containerRef.current) return;
      chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      ma20Ref.current = null;
      ma60Ref.current = null;
    };
  }, []);

  // load data (no auto refresh — 先穩)
  useEffect(() => {
    if (!chartRef.current || !candleRef.current) return;

    const ac = new AbortController();

    async function load() {
      setLoading(true);
      setError("");

      // 先用快取畫一版（避免空白）
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const rows = JSON.parse(cached) as KlineRow[];
          applyRows(rows);
        }
      } catch {}

      try {
        const limit = intervalToLimit(interval);
        const rows = (await fetchWithFailover(
          `/api/v3/klines?symbol=ETHUSDT&interval=${interval}&limit=${limit}`,
          ac.signal
        )) as any[];

        // 保存快取（iPhone 很有用）
        try {
          localStorage.setItem(cacheKey, JSON.stringify(rows));
        } catch {}

        applyRows(rows);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setError(e?.message ?? "Load failed");
      } finally {
        setLoading(false);
      }
    }

    function applyRows(rows: any[]) {
      if (!candleRef.current || !chartRef.current) return;

      const candles = rows.map((r: any) => ({
        time: Math.floor(r[0] / 1000) as UTCTimestamp,
        open: Number(r[1]),
        high: Number(r[2]),
        low: Number(r[3]),
        close: Number(r[4]),
      }));

      candleRef.current.setData(candles);

      const closeSeries = candles.map((c: any) => ({ time: c.time, close: c.close }));
      ma20Ref.current?.setData(calcMA(closeSeries, 20));
      ma60Ref.current?.setData(calcMA(closeSeries, 60));

      chartRef.current.timeScale().fitContent();
    }

    load();
    return () => ac.abort();
  }, [interval, cacheKey]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">ETH / USDT · MA20 / MA60</span>

        <div className="flex gap-2 overflow-x-auto">
          {(["1m", "5m", "15m", "1h", "4h", "1d"] as Interval[]).map((x) => (
            <button
              key={x}
              onClick={() => setInterval(x)}
              className={`px-3 py-1 text-sm rounded-md border transition-colors whitespace-nowrap ${
                interval === x
                  ? "bg-primary/20 text-primary border-primary/30"
                  : "bg-card/40 border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/50 p-3">
        {error && <div className="text-sm text-red-400 mb-2">{error}</div>}
        {loading && !error && <div className="text-xs text-muted-foreground mb-2">Loading...</div>}
        <div ref={containerRef} className="w-full" />
      </div>

      <p className="text-xs text-muted-foreground">
        橙 = MA20｜紫 = MA60｜資料來源：Binance 公開 API（前端直連，已做多節點備援與快取）
      </p>
    </div>
  );
}
