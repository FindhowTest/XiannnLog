import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickData, UTCTimestamp } from "lightweight-charts";

type Interval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

function intervalToLimit(interval: Interval) {
  if (interval === "1m") return 300;
  if (interval === "5m") return 300;
  if (interval === "15m") return 300;
  if (interval === "1h") return 500;
  if (interval === "4h") return 500;
  return 365;
}

export default function EthKlineChart() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  const [interval, setInterval] = useState<Interval>("1h");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height: 360,
      layout: { background: { color: "transparent" }, textColor: "#cbd5e1" },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    });

    const series = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      borderVisible: false,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resize = new ResizeObserver(() => {
      chart.applyOptions({ width: containerRef.current!.clientWidth });
    });
    resize.observe(containerRef.current);

    return () => {
      resize.disconnect();
      chart.remove();
    };
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setError("");
        const limit = intervalToLimit(interval);
        const url = `https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=${interval}&limit=${limit}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Binance API 連線失敗");

        const rows = await res.json();
        const data: CandlestickData[] = rows.map((r: any) => ({
          time: Math.floor(r[0] / 1000) as UTCTimestamp,
          open: Number(r[1]),
          high: Number(r[2]),
          low: Number(r[3]),
          close: Number(r[4]),
        }));

        seriesRef.current.setData(data);
        chartRef.current.timeScale().fitContent();
      } catch (e: any) {
        setError(e.message);
      }
    }

    load();
  }, [interval]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">ETH / USDT</span>
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
        {error && <div className="text-sm text-red-400">{error}</div>}
        <div ref={containerRef} />
      </div>

      <p className="text-xs text-muted-foreground">
        資料來源：Binance 公開 API
      </p>
    </div>
  );
}
