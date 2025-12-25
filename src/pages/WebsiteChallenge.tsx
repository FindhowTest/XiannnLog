import { ArrowLeft, Code, GitBranch, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";

const challengeSteps = [
  {
    phase: "Phase 1",
    title: "專案規劃",
    date: "2024/12/01",
    description: "確定網站目標、設計風格與功能需求",
    tasks: ["決定主題：健身 × 建站", "選擇技術棧：React + TypeScript", "設計色彩方案：深色 + 電光橙"],
    status: "completed",
  },
  {
    phase: "Phase 2",
    title: "UI 設計",
    date: "2024/12/08",
    description: "使用 Tailwind CSS 建立設計系統與組件",
    tasks: ["建立色彩變數與字體設定", "設計 Hero Section", "製作動畫效果"],
    status: "completed",
  },
  {
    phase: "Phase 3",
    title: "功能開發",
    date: "2024/12/15",
    description: "實作各個頁面與互動功能",
    tasks: ["訓練紀錄頁面", "建站挑戰頁面", "技術學習頁面"],
    status: "in-progress",
  },
  {
    phase: "Phase 4",
    title: "優化上線",
    date: "即將開始",
    description: "效能優化、SEO 設定與部署",
    tasks: ["圖片優化", "SEO meta 設定", "部署至 Vercel"],
    status: "upcoming",
  },
];

const techStack = [
  { name: "React", description: "前端框架" },
  { name: "TypeScript", description: "型別安全" },
  { name: "Tailwind CSS", description: "樣式設計" },
  { name: "Framer Motion", description: "動畫效果" },
  { name: "Vite", description: "建構工具" },
  { name: "Lovable", description: "AI 開發" },
];

const WebsiteChallenge = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-hero border-b border-border/50">
        <div className="container mx-auto px-6 py-8">
          <Link to="/">
            <motion.div 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft size={20} />
              返回首頁
            </motion.div>
          </Link>
          
          <AnimatedSection>
            <div className="flex items-center gap-4 mb-4">
              <motion.div 
                className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Code className="text-primary" size={28} />
              </motion.div>
              <div>
                <span className="text-primary text-sm uppercase tracking-wider">開發</span>
                <h1 className="font-display text-4xl md:text-5xl">建站挑戰</h1>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              從零開始打造這個個人網站的完整過程，記錄每個階段的學習與突破
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Tech Stack */}
        <AnimatedSection className="mb-12">
          <h2 className="font-display text-3xl mb-6">技術棧</h2>
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-6 gap-4" staggerDelay={0.05}>
            {techStack.map((tech) => (
              <StaggerItem key={tech.name}>
                <motion.div
                  className="p-4 rounded-xl bg-card/50 border border-border/50 text-center"
                  whileHover={{ 
                    borderColor: "hsl(24 100% 50% / 0.5)",
                    y: -5,
                  }}
                >
                  <p className="font-display text-lg text-gradient">{tech.name}</p>
                  <p className="text-muted-foreground text-xs">{tech.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </AnimatedSection>

        {/* Timeline */}
        <AnimatedSection className="mb-8">
          <h2 className="font-display text-3xl mb-2">開發時程</h2>
          <p className="text-muted-foreground">網站建置的完整旅程</p>
        </AnimatedSection>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border/50 hidden md:block" />

          <StaggerContainer className="space-y-6" staggerDelay={0.15}>
            {challengeSteps.map((step, index) => (
              <StaggerItem key={step.phase}>
                <motion.div
                  className="relative pl-0 md:pl-16"
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Timeline dot */}
                  <div className="hidden md:block absolute left-4 top-6 w-4 h-4 rounded-full bg-primary border-4 border-background" />

                  <div className={`p-6 rounded-xl border ${
                    step.status === 'completed' 
                      ? 'bg-card-gradient border-primary/30' 
                      : step.status === 'in-progress'
                      ? 'bg-card-gradient border-accent/50'
                      : 'bg-card/30 border-border/30'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-primary text-sm font-semibold">{step.phase}</span>
                          {step.status === 'completed' && (
                            <CheckCircle className="text-green-500" size={16} />
                          )}
                          {step.status === 'in-progress' && (
                            <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full animate-pulse">
                              進行中
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-2xl mb-1">{step.title}</h3>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                          <Clock size={14} />
                          {step.date}
                        </p>
                      </div>
                    </div>

                    <p className="text-foreground mb-4">{step.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {step.tasks.map((task, i) => (
                        <span 
                          key={i}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-card border border-border/50 text-sm rounded-lg"
                        >
                          <GitBranch size={12} className="text-primary" />
                          {task}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </div>
  );
};

export default WebsiteChallenge;
