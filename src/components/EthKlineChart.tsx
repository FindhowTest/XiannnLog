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
    const logs = JSON.parse(raw) as Array<{ date: string; title?: string }>;
    if (!Array.isArray(logs)) return [];

    return logs
      .filter((x) => x?.date)
      .map((x) => ({
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

function getMACrossSignal(
  ma20: { value: number }[],
  ma60: { value: number }[]
) {
  if (ma20.length < 2 || ma60.length < 2) return "";
  const a1 = ma20[ma20.length - 2].value;
  const a2 = ma20[ma20.length - 1].value;
  const b1 = ma60[ma60.length - 2].value;
  const b2 = ma60[ma60.length - 1].value;

  const prev = a1 - b1;
  const now = a2 - b2;

  if (prev <= 0 && now > 0) return "MA20 上穿 MA60（偏多轉強）";
  if (prev >= 0 && now < 0) return "MA20 下穿 MA60（偏空轉弱）";
  return "";
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
  const [signal, setSignal] = useState("");
  const [chartReady, setChartReady] = useState(false);

  const hasLoadedOnceRef = useRef(false);
  const loadingRef = useRef(false);

  /* ---------- init chart ---------- */
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 380,
      layout: { background: { color: "transparent" }, textColor: "#cbd5e1" },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      crosshair: { vertLine: { visible: true }, horzLine: { visible: true } },
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
      if (!containerRef.current) return;
      chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      setChartReady(false);
    };
  }, []);

  /* ---------- load data via Pages Function ---------- */
  const loadData = async () => {
    if (!chartReady || !candleRef.current) return;
    if (loadingRef.current) return; // 避免 interval + timer 同時打
    loadingRef.current = true;

    try {
      const limit = intervalToLimit(interval);
      const url = `/api/klines?symbol=ETHUSDT&interval=${interval}&limit=${limit}`;

      const controller = new AbortController();
      const t = window.setTimeout(() => controller.abort(), 10_000);

      const res = await fetch(url, { signal: controller.signal });
      window.clearTimeout(t);

      if (!res.ok) throw new Error("Load failed");

      const rows = await res.json();
      if (!Array.isArray(rows) || rows.length === 0) throw new Error("Load failed");

      const candles: CandlestickData[] = rows.map((r: any) => ({
        time: Math.floor(r[0] / 1000) as UTCTimestamp,
        open: +r[1],
        high: +r[2],
        low: +r[3],
        close: +r[4],
      }));

      candleRef.current.setData(candles);

      const ma20 = calcMA(candles, 20);
      const ma60 = calcMA(candles, 60);
      ma20Ref.current?.setData(ma20);
      ma60Ref.current?.setData(ma60);

      markersRef.current?.setMarkers(loadTrainingMarkers());

      const sig = getMACrossSignal(ma20, ma60);
      setSignal(sig);

      chartRef.current?.timeScale().fitContent();

      hasLoadedOnceRef.current = true;
      setError("");
    } catch (e) {
      // 只有「從來沒成功載入」才顯示 error（避免閃爍）
      if (!hasLoadedOnceRef.current) setError("Load failed");
    } finally {
      loadingRef.current = false;
    }
  };

  /* ---------- effects ---------- */
  useEffect(() => {
    if (!chartReady) return;
    setError("");
    setSignal("");
    hasLoadedOnceRef.current = false;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartReady, interval]);

  useEffect(() => {
    if (!chartReady) return;
    const timer = window.setInterval(loadData, AUTO_REFRESH_MS);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartReady, interval]);

  /* ===================== UI ===================== */

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">ETH / USDT</div>
          <div className="text-xs text-muted-foreground">
            MA20（橙）/ MA60（紫）｜🔵 訓練日（localStorage）｜30 秒更新
          </div>
        </div>

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
        {signal && <div className="text-xs text-primary mb-2">📌 {signal}</div>}
        {error && <div className="text-sm text-red-400 mb-2">{error}</div>}

        {/* iPhone / Safari 最穩：直接給高度 */}
        <div ref={containerRef} style={{ width: "100%", height: 380 }} />
      </div>

      <p className="text-xs text-muted-foreground">
        訊號為「教育用途提示」，不構成投資建議。
      </p>
    </div>
  );
}
