// src/lib/free-coach.ts
export type Log = {
    date: string; // yyyy-MM-dd
    title: string;
    content: string;
    feeling?: string;
};

const PARTS = [
    { key: "chest", label: "胸", kws: ["胸", "bench", "臥推", "上斜", "飛鳥"] },
    { key: "back", label: "背", kws: ["背", "划船", "下拉", "引體", "拉"] },
    { key: "legs", label: "腿", kws: ["腿", "深蹲", "硬舉", "腿推", "弓箭步", "腿屈伸"] },
    { key: "shoulder", label: "肩", kws: ["肩", "推舉", "側平舉", "後三角", "肩推"] },
    { key: "arms", label: "手", kws: ["二頭", "三頭", "彎舉", "下壓", "槌式"] },
    { key: "core", label: "核心", kws: ["核心", "腹", "棒式", "卷腹", "側棒式"] },
    { key: "cardio", label: "有氧", kws: ["跑", "慢跑", "飛輪", "划船機", "HIIT", "走路"] },
] as const;

function includesAny(text: string, kws: readonly string[]) {
    const t = (text || "").toLowerCase();
    return kws.some((k) => t.includes(k.toLowerCase()));
}

function weekStartISO(date: Date) {
    // 以週一為一週起點
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
}

export function analyzeLogsFree(all: Log[]) {
    // 只看最近 30 筆
    const logs = [...all]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 30);

    const baseDate = logs[0]?.date ? new Date(logs[0].date) : new Date();
    const wk = weekStartISO(baseDate);

    const inWeek = logs.filter((x) => weekStartISO(new Date(x.date)) === wk);
    const totalSessions = inWeek.length;

    const counts: Record<string, number> = {};
    for (const p of PARTS) counts[p.key] = 0;

    for (const x of inWeek) {
        const hay = `${x.title} ${x.content}`.trim();
        for (const p of PARTS) {
            if (includesAny(hay, p.kws)) counts[p.key] += 1;
        }
    }

    const fatigueWords = ["累", "痛", "疲勞", "睡不好", "沒力", "痠", "不舒服", "緊"];
    const fatigueHits = inWeek.filter((x) => includesAny(x.feeling ?? "", fatigueWords)).length;

    const sortedParts = [...PARTS]
        .map((p) => ({ ...p, n: counts[p.key] }))
        .sort((a, b) => b.n - a.n);

    const top = sortedParts[0];
    const low = sortedParts.slice(-2).reverse(); // low[0] 最弱

    const summary = [
        `本週訓練：${totalSessions} 次（週起點：${wk}）`,
        `部位分布：${sortedParts.some((x) => x.n > 0)
            ? sortedParts.filter((x) => x.n > 0).map((x) => `${x.label}×${x.n}`).join("、")
            : "（尚未辨識到部位，建議在標題/內容加上胸背腿等關鍵字）"
        }`,
        fatigueHits ? `疲勞訊號：${fatigueHits} 次（建議降量/早睡/伸展/補水）` : `疲勞訊號：少（可維持訓練）`,
    ];

    const nextWeekPlan = [
        low?.[0]?.label ? `Day 1：${low[0].label}（補弱項）＋核心 10 分` : `Day 1：弱項補強＋核心`,
        top?.label ? `Day 2：${top.label}（維持強項）＋有氧 10–15 分` : `Day 2：主力部位＋有氧`,
        low?.[1]?.label ? `Day 3：${low[1].label}（補弱項）＋伸展/放鬆` : `Day 3：補強＋伸展/放鬆`,
    ];

    const igCaption = [
        `本週訓練 ${totalSessions} 天，`,
        top?.label ? `主打 ${top.label}，` : "",
        low?.[0]?.label ? `下週要補 ${low[0].label}。` : "",
        fatigueHits ? `狀態有點累，但我還是完成了。` : `狀態不錯，穩定推進。`,
        `\n\n#健身紀錄 #BuildInPublic #XiannnLog`,
    ].join("");

    return {
        weekStart: wk,
        totalSessions,
        counts: sortedParts, // 給你未來做圖表用
        summary,
        nextWeekPlan,
        igCaption,
    };
}
