import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  createSeriesMarkers,
  CandlestickData,
  UTCTimestamp,
  IChartApi,
  ISeriesApi,
  SeriesMarker,
} from "lightweight-charts";

/* ===================== config ===================== */

type Interval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

const AUTO_REFRESH_MS = 30_000;
const TRAINING_LS_KEY = "xiannn_training_logs_v1";

/* Binance API fallback（非常重要） */
const BINANCE_ENDPOINTS = [
  "https://data.binance.com",
  "https://api.binance.com",
  "https://api.binance.us",
];

/* ===================== utils ===================== */

function intervalToLimit(interval: Interval) {
  if (interval === "1m") return 300;
  if (interval === "5m") return 300;
  if (interval === "15m") return 300;
  if (interval === "1h") return 500;
  if (interval === "4h") return 500;
  return 365;
}

function calcMA(data: CandlestickData[], period: number) {
  const out: { time: UTCTimestamp; value: number }[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) continue;
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += data[j].close;
    out.push({ time: data[i].time as UTCTimestamp, value: sum / period });
  }
  return out;
}

function loadTrainingMarkers(): SeriesMarker<UTCTimestamp>[] {
  try {
    const raw = localStorage.getItem(TRAINING_LS_KEY);
    if (!raw) return [];
    const logs = JSON.parse(raw) as Array<{ date: string }>;
    if (!Array.isArray(logs)) return [];

    return logs.map((x) => ({
      time: Math.floor(new Date(`${x.date}T00:00:00Z`).getTime() / 1000) as UTCTimestamp,
      position: "belowBar",
      shape: "circle",
      color: "#38bdf8",
      text: "訓練",
    }));
  } catch {
    return [];
  }
}

/* ===================== component ===================== */

export default function EthKlineChart() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const ma20Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const ma60Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const markersRef = useRef<ReturnType<typeof createSeriesMarkers> | null>(null);

  const [interval, setInterval] = useState<Interval>("1h");
  const [error, setError] = useState("");
  const [chartReady, setChartReady] = useState(false);
  const hasLoadedOnceRef = useRef(false);

  /* ---------- init chart ---------- */
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth, // ⭐ 關鍵
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
    const markers = createSeriesMarkers(candles);

    chartRef.current = chart;
    candleRef.current = candles;
    ma20Ref.current = ma20;
    ma60Ref.current = ma60;
    markersRef.current = markers;

    setChartReady(true);

    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: containerRef.current!.clientWidth });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      setChartReady(false);
    };
  }, []);

  /* ---------- load data（含 fallback） ---------- */
  const loadData = async () => {
    if (!chartReady || !candleRef.current) return;

    for (const base of BINANCE_ENDPOINTS) {
      try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 8000);

        const limit = intervalToLimit(interval);
        const url = `${base}/api/v3/klines?symbol=ETHUSDT&interval=${interval}&limit=${limit}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("HTTP " + res.status);

        const rows = await res.json();
        if (!Array.isArray(rows)) throw new Error("invalid data");

        const candles: CandlestickData[] = rows.map((r: any) => ({
          time: Math.floor(r[0] / 1000) as UTCTimestamp,
          open: +r[1],
          high: +r[2],
          low: +r[3],
          close: +r[4],
        }));

        candleRef.current.setData(candles);
        ma20Ref.current?.setData(calcMA(candles, 20));
        ma60Ref.current?.setData(calcMA(candles, 60));
        markersRef.current?.setMarkers(loadTrainingMarkers());

        chartRef.current?.timeScale().fitContent();
        hasLoadedOnceRef.current = true;
        setError("");
        return;
      } catch {
        // try next endpoint
      }
    }

    if (!hasLoadedOnceRef.current) {
      setError("行情資料目前無法取得（Binance）");
    }
  };

  /* ---------- effects ---------- */
  useEffect(() => {
    if (!chartReady) return;
    loadData();
  }, [interval, chartReady]);

  useEffect(() => {
    if (!chartReady) return;
    const timer = setInterval(loadData, AUTO_REFRESH_MS);
    return () => clearInterval(timer);
  }, [interval, chartReady]);

  /* ===================== UI ===================== */

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          ETH / USDT · MA20 / MA60 · 訓練日
        </span>

        <div className="flex gap-2">
          {(["1m", "5m", "15m", "1h", "4h", "1d"] as Interval[]).map((x) => (
            <button
              key={x}
              onClick={() => setInterval(x)}
              className={`px-3 py-1 text-sm rounded-md border ${
                interval === x
                  ? "bg-primary/20 text-primary border-primary/30"
                  : "bg-card/40 border-border/60 text-muted-foreground"
              }`}
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/50 p-3">
        {error && <div className="text-sm text-red-400 mb-2">{error}</div>}
        <div ref={containerRef} />
      </div>
    </div>
  );
}
