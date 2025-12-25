import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
    Trash2,
    Pencil,
    Save,
    X,
    Plus,
    ArrowLeft,
    CalendarIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import heroImage from "@/assets/hero-gym.jpg";

/* ================= types ================= */

type TrainingLogItem = {
    id: string;
    date: string; // yyyy-MM-dd
    title: string;
    content: string;
    feeling?: string;
    createdAt: number;
    updatedAt: number;
};

const LS_KEY = "xiannn_training_logs_v1";

/* ================= utils ================= */

function uid() {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/* ================= page ================= */

export default function TrainingLogPage() {
    const [logs, setLogs] = useState<TrainingLogItem[]>([]);

    // 📅 使用 Date（給 Calendar 用）
    const [date, setDate] = useState<Date>(new Date());
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [feeling, setFeeling] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [q, setQ] = useState("");

    /* ===== localStorage ===== */

    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as TrainingLogItem[];
            if (Array.isArray(parsed)) setLogs(parsed);
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(logs));
        } catch {
            /* ignore */
        }
    }, [logs]);

    /* ===== computed ===== */

    const filtered = useMemo(() => {
        const keyword = q.trim().toLowerCase();
        const list = [...logs].sort(
            (a, b) =>
                b.date.localeCompare(a.date) || b.updatedAt - a.updatedAt
        );

        if (!keyword) return list;

        return list.filter((x) => {
            const hay = `${x.date} ${x.title} ${x.content} ${x.feeling ?? ""
                }`.toLowerCase();
            return hay.includes(keyword);
        });
    }, [logs, q]);

    const isEditing = editingId !== null;

    /* ===== actions ===== */

    function resetForm() {
        setDate(new Date());
        setTitle("");
        setContent("");
        setFeeling("");
        setEditingId(null);
    }

    function submit() {
        const t = title.trim();
        const c = content.trim();
        if (!t || !c) return;

        const now = Date.now();
        const isoDate = format(date, "yyyy-MM-dd");

        if (editingId) {
            setLogs((prev) =>
                prev.map((x) =>
                    x.id === editingId
                        ? {
                            ...x,
                            date: isoDate,
                            title: t,
                            content: c,
                            feeling: feeling.trim() || undefined,
                            updatedAt: now,
                        }
                        : x
                )
            );
        } else {
            const item: TrainingLogItem = {
                id: uid(),
                date: isoDate,
                title: t,
                content: c,
                feeling: feeling.trim() || undefined,
                createdAt: now,
                updatedAt: now,
            };
            setLogs((prev) => [item, ...prev]);
        }

        resetForm();
    }

    function edit(item: TrainingLogItem) {
        setEditingId(item.id);
        setDate(new Date(item.date));
        setTitle(item.title);
        setContent(item.content);
        setFeeling(item.feeling ?? "");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function remove(id: string) {
        setLogs((prev) => prev.filter((x) => x.id !== id));
        if (editingId === id) resetForm();
    }

    function clearAll() {
        if (!confirm("確定要清空全部訓練紀錄？（無法復原）")) return;
        setLogs([]);
        resetForm();
    }

    /* ================= UI ================= */

    return (
        <div className="min-h-screen bg-background">
            {/* 背景 */}
            <div className="fixed inset-0 -z-10">
                <img
                    src={heroImage}
                    alt="bg"
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/30" />
                <div className="absolute inset-0 bg-glow opacity-60" />
            </div>

            <div className="container px-6 pt-10 pb-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-3">
                            <Badge className="bg-primary/20 border border-primary/30 text-primary">
                                健身 × 建站紀錄
                            </Badge>
                            <Badge variant="secondary" className="bg-secondary/60">
                                localStorage
                            </Badge>
                        </div>

                        <h1 className="font-display text-5xl md:text-6xl leading-none">
                            <span className="text-foreground">Training</span>{" "}
                            <span className="text-gradient">Log</span>
                        </h1>

                        <p className="text-muted-foreground mt-2">
                            新增 / 編輯 / 刪除 / 搜尋（資料存在本機瀏覽器）。
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="heroOutline"
                            onClick={() => (window.location.href = "/")}
                        >
                            <ArrowLeft className="mr-2" size={18} />
                            回首頁
                        </Button>

                        <Button variant="destructive" onClick={clearAll}>
                            <Trash2 className="mr-2" size={18} />
                            清空全部
                        </Button>
                    </div>
                </div>

                <Separator className="my-6 opacity-60" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* 表單 */}
                    <Card className="lg:col-span-5 bg-card/70 backdrop-blur border-border/60 shadow-card">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="text-gradient">
                                    {isEditing ? "編輯紀錄" : "新增紀錄"}
                                </span>
                                {isEditing && (
                                    <Button variant="ghost" onClick={resetForm}>
                                        <X className="mr-2" size={18} />
                                        取消編輯
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* 📅 日期（日曆） */}
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">日期</div>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="heroOutline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                            {format(date, "yyyy-MM-dd")}
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent
                                        className="w-auto p-0 bg-card/90 backdrop-blur border-border/60"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={(d) => d && setDate(d)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* 標題 */}
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">標題</div>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="例如：胸＋三頭 / 背＋二頭"
                                />
                            </div>

                            {/* 內容 */}
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">內容</div>
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="臥推 4x8 60kg；上斜啞鈴 3x10..."
                                    className="min-h-32"
                                />
                            </div>

                            {/* 感受 */}
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">
                                    感受（可選）
                                </div>
                                <Input
                                    value={feeling}
                                    onChange={(e) => setFeeling(e.target.value)}
                                    placeholder="例如：狀態不錯 / 有點累"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="hero"
                                    onClick={submit}
                                    disabled={!title.trim() || !content.trim()}
                                >
                                    {isEditing ? (
                                        <>
                                            <Save className="mr-2" size={18} />
                                            儲存修改
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-2" size={18} />
                                            新增紀錄
                                        </>
                                    )}
                                </Button>

                                <Button variant="heroOutline" onClick={resetForm}>
                                    重設
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground pt-2">
                                localStorage 僅存在於同一台裝置與瀏覽器。
                            </p>
                        </CardContent>
                    </Card>

                    {/* 列表 */}
                    <div className="lg:col-span-7 space-y-4">
                        <Card className="bg-card/60 backdrop-blur border-border/60 shadow-card">
                            <CardContent className="p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                                <Badge className="bg-primary/20 border border-primary/30 text-primary">
                                    總筆數：{logs.length}
                                </Badge>
                                <Input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="搜尋：日期 / 標題 / 內容"
                                    className="md:w-72"
                                />
                            </CardContent>
                        </Card>

                        {filtered.length === 0 ? (
                            <div className="text-muted-foreground">
                                還沒有紀錄，先新增第一筆吧。
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filtered.map((item) => (
                                    <Card
                                        key={item.id}
                                        className="bg-card/70 backdrop-blur border-border/60 shadow-card hover:shadow-glow"
                                    >
                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-secondary/60">
                                                            {item.date}
                                                        </Badge>
                                                        <h3 className="font-display text-2xl">
                                                            {item.title}
                                                        </h3>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        建立：
                                                        {new Date(
                                                            item.createdAt
                                                        ).toLocaleString()}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => edit(item)}
                                                    >
                                                        <Pencil className="mr-2" size={16} />
                                                        編輯
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => remove(item.id)}
                                                    >
                                                        <Trash2 className="mr-2" size={16} />
                                                        刪除
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-3">
                                            <div className="whitespace-pre-wrap leading-relaxed">
                                                {item.content}
                                            </div>

                                            {item.feeling && (
                                                <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                                                    <div className="text-xs text-muted-foreground mb-1">
                                                        感受
                                                    </div>
                                                    <div className="text-sm">{item.feeling}</div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
