import { useEffect, useMemo, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  CandlestickData,
  UTCTimestamp,
  IChartApi,
  ISeriesApi,
} from "lightweight-charts";

/* ===================== config ===================== */

type Interval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

const AUTO_REFRESH_MS = 30_000;

/* ===================== utils ===================== */

function intervalToLimit(interval: Interval) {
  if (interval === "1m") return 300;
  if (interval === "5m") return 300;
  if (interval === "15m") return 300;
  if (interval === "1h") return 500;
  if (interval === "4h") return 500;
  return 365;
}

type LinePoint = { time: UTCTimestamp; value: number };

function calcMAFromCandles(candles: CandlestickData[], period: number): LinePoint[] {
  const result: LinePoint[] = [];
  if (candles.length < period) return result;

  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += candles[j].close;
    result.push({ time: candles[i].time as UTCTimestamp, value: sum / period });
  }
  return result;
}

function toHumanError(e: any) {
  const msg = String(e?.message ?? e ?? "");
  // 常見：iOS Safari / CF Pages 對跨網域或網路不穩 → 會變成 Failed to fetch
  if (msg.toLowerCase().includes("failed to fetch")) {
    return "網路或跨網域請求被阻擋（Failed to fetch）。建議換網路 / 重新整理 / 稍後再試。";
  }
  return msg || "資料載入失敗";
}

/* ===================== component ===================== */

export default function EthKlineChart() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const ma20Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const ma60Ref = useRef<ISeriesApi<"Line"> | null>(null);

  const [interval, setInterval] = useState<Interval>("1h");
  const [error, setError] = useState("");
  const [chartReady, setChartReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // 文字訊號
  const [trendText, setTrendText] = useState<string>("—");
  const [signalText, setSignalText] = useState<string>("—");
  const [lastUpdated, setLastUpdated] = useState<string>("—");

  const intervals = useMemo(() => (["1m", "5m", "15m", "1h", "4h", "1d"] as Interval[]), []);

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
      crosshair: { vertLine: { visible: true }, horzLine: { visible: true } },
    });

    const candles = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      borderVisible: false,
    });

    const ma20 = chart.addSeries(LineSeries, {
      color: "#f59e0b", // 橙
      lineWidth: 2,
    });

    const ma60 = chart.addSeries(LineSeries, {
      color: "#a78bfa", // 紫
      lineWidth: 2,
    });

    chartRef.current = chart;
    candleRef.current = candles;
    ma20Ref.current = ma20;
    ma60Ref.current = ma60;

    setChartReady(true);

    const ro = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      ma20Ref.current = null;
      ma60Ref.current = null;
      setChartReady(false);
    };
  }, []);

  /* ---------- core: apply rows & compute signal ---------- */
  function applyRows(rows: any[]) {
    const candles: CandlestickData[] = rows.map((r: any) => ({
      time: Math.floor(r[0] / 1000) as UTCTimestamp,
      open: Number(r[1]),
      high: Number(r[2]),
      low: Number(r[3]),
      close: Number(r[4]),
    }));

    candleRef.current?.setData(candles);

    // MA
    const ma20 = calcMAFromCandles(candles, 20);
    const ma60 = calcMAFromCandles(candles, 60);

    ma20Ref.current?.setData(ma20);
    ma60Ref.current?.setData(ma60);

    // 訊號（只用此時間週期的 MA 資料）
    const last20 = ma20[ma20.length - 1];
    const prev20 = ma20[ma20.length - 2];
    const last60 = ma60[ma60.length - 1];
    const prev60 = ma60[ma60.length - 2];

    if (last20 && prev20 && last60 && prev60) {
      const nowDiff = last20.value - last60.value;
      const prevDiff = prev20.value - prev60.value;

      const distPct = (nowDiff / last60.value) * 100;

      const trend =
        nowDiff > 0
          ? distPct > 0.5
            ? `偏多趨勢（強） +${distPct.toFixed(2)}%`
            : `偏多趨勢 +${distPct.toFixed(2)}%`
          : distPct < -0.5
          ? `偏空趨勢（強） ${distPct.toFixed(2)}%`
          : `偏空趨勢 ${distPct.toFixed(2)}%`;

      setTrendText(trend);

      if (prevDiff <= 0 && nowDiff > 0) {
        setSignalText("🟢 黃金交叉：MA20 上穿 MA60（偏多訊號）");
      } else if (prevDiff >= 0 && nowDiff < 0) {
        setSignalText("🔴 死亡交叉：MA20 下穿 MA60（偏空訊號）");
      } else {
        setSignalText("— 本次更新：無交叉訊號");
      }
    } else {
      setTrendText("— MA 資料不足（至少要 60 根 K 線）");
      setSignalText("— 訊號資料不足");
    }

    chartRef.current?.timeScale().fitContent();
    setLastUpdated(new Date().toLocaleString());
  }

  /* ---------- load data (per interval) ---------- */
  const loadData = async () => {
    if (!chartReady || !candleRef.current || !chartRef.current) return;

    try {
      setError("");
      setLoading(true);

      const limit = intervalToLimit(interval);

      // ✅ 建議用 api.binance.com（第一版你用這個較穩）
      const url = `https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=${interval}&limit=${limit}`;

      const res = await fetch(url, {
        method: "GET",
        // 避免某些快取造成你以為沒更新
        cache: "no-store",
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Binance API 失敗 (${res.status}) ${txt ? `: ${txt}` : ""}`);
      }

      const rows = await res.json();
      if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error("Binance 回傳資料格式異常或空資料");
      }

      applyRows(rows);
    } catch (e: any) {
      setError(toHumanError(e));
    } finally {
      setLoading(false);
    }
  };

  /* ---------- effects ---------- */

  // 切換週期 → 立刻抓一次
  useEffect(() => {
    if (!chartReady) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, chartReady]);

  // 自動更新（30 秒）
  useEffect(() => {
    if (!chartReady) return;

    const timer = window.setInterval(() => {
      loadData();
    }, AUTO_REFRESH_MS);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, chartReady]);

  /* ===================== UI ===================== */

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          ETH / USDT · MA20（橙）/ MA60（紫）
        </span>

        <div className="flex gap-2 overflow-x-auto">
          {intervals.map((x) => (
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

      {/* 訊號卡 */}
      <div className="rounded-xl border border-border/60 bg-card/40 px-4 py-3">
        <div className="text-sm">
          <span className="text-muted-foreground">週期：</span>
          <span className="text-foreground">{interval}</span>
        </div>
        <div className="text-sm mt-1">
          <span className="text-muted-foreground">趨勢：</span>
          <span className="text-foreground">{trendText}</span>
        </div>
        <div className="text-sm mt-1">
          <span className="text-muted-foreground">買賣訊號：</span>
          <span className="text-foreground">{signalText}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
          <span>更新：{lastUpdated}</span>
          <span>{loading ? "更新中…" : "每 30 秒自動更新"}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          ※ 這是技術指標「觀察提示」，不是投資建議。
        </div>
      </div>

      {/* 圖表 */}
      <div className="rounded-xl border border-border/60 bg-card/50 p-3">
        {error && <div className="text-sm text-red-400 mb-2">{error}</div>}
        <div ref={containerRef} className="w-full" />
      </div>

      <p className="text-xs text-muted-foreground">
        資料來源：Binance 公開 API
      </p>
    </div>
  );
}
