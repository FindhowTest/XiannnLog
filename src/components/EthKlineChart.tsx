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
  const result: { time: UTCTimestamp; value: number }[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) continue;
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += data[j].close;
    result.push({ time: data[i].time as UTCTimestamp, value: sum / period });
  }

  return result;
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

  /* ---------- init chart (once) ---------- */
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height: 380,
      layout: {
        background: { color: "transparent" },
        textColor: "#cbd5e1",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
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

    const ma20 = chart.addSeries(LineSeries, {
      color: "#f59e0b",
      lineWidth: 2,
    });

    const ma60 = chart.addSeries(LineSeries, {
      color: "#a78bfa",
      lineWidth: 2,
    });

    const markers = createSeriesMarkers(candles);

    chartRef.current = chart;
    candleRef.current = candles;
    ma20Ref.current = ma20;
    ma60Ref.current = ma60;
    markersRef.current = markers;

    setChartReady(true);

    const ro = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
      });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      setChartReady(false);
    };
  }, []);

  /* ---------- load data ---------- */
  const loadData = async () => {
    if (!chartReady || !candleRef.current || !chartRef.current) return;

    try {
      setError("");

      const limit = intervalToLimit(interval);
const url = `https://data.binance.com/api/v3/klines?symbol=ETHUSDT&interval=${interval}&limit=${limit}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Binance API 連線失敗");

      const rows = await res.json();

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

      chartRef.current.timeScale().fitContent();
    } catch (e: any) {
      setError(e?.message ?? "資料載入失敗");
    }
  };

  /* ---------- effects ---------- */

  // chart ready or interval change → 立刻抓一次
  useEffect(() => {
    if (!chartReady) return;
    loadData();
  }, [interval, chartReady]);

  // auto refresh（30 秒）
  useEffect(() => {
    if (!chartReady) return;

    const timer = window.setInterval(() => {
      loadData();
    }, AUTO_REFRESH_MS);

    return () => window.clearInterval(timer);
  }, [interval, chartReady]);

  /* ===================== UI ===================== */

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          ETH / USDT · MA20 / MA60 · 訓練日
        </span>

        <div className="flex gap-2">
          {(["1m", "5m", "15m", "1h", "4h", "1d"] as Interval[]).map((x) => (
            <button
              key={x}
              onClick={() => setInterval(x)}
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${
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
        <div ref={containerRef} className="w-full" />
      </div>

      <p className="text-xs text-muted-foreground">
        MA20（橙）/ MA60（紫）｜🔵 = 訓練日（localStorage）｜30 秒自動更新
      </p>
    </div>
  );
}
