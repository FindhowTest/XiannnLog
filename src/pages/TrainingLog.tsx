import { ArrowLeft, Dumbbell, Calendar, TrendingUp, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";

const weeklyLogs = [
  {
    week: "第 12 週",
    date: "2024/12/16 - 12/22",
    focus: "胸 + 三頭",
    highlights: ["臥推突破 80kg", "三頭下壓進步", "體脂降至 15%"],
    status: "完成",
  },
  {
    week: "第 11 週",
    date: "2024/12/09 - 12/15",
    focus: "背 + 二頭",
    highlights: ["引體向上 +2 下", "划船重量提升", "背部線條更明顯"],
    status: "完成",
  },
  {
    week: "第 10 週",
    date: "2024/12/02 - 12/08",
    focus: "腿部訓練",
    highlights: ["深蹲 100kg 達成", "腿推 200kg", "小腿訓練加入"],
    status: "完成",
  },
  {
    week: "第 9 週",
    date: "2024/11/25 - 12/01",
    focus: "肩部 + 核心",
    highlights: ["肩推進步 5kg", "側平舉技巧改善", "核心穩定度提升"],
    status: "完成",
  },
];

const stats = [
  { icon: Calendar, value: "12", label: "訓練週數" },
  { icon: Dumbbell, value: "48", label: "訓練次數" },
  { icon: TrendingUp, value: "+15kg", label: "總重量提升" },
  { icon: Target, value: "85%", label: "目標達成" },
];

const TrainingLog = () => {
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
                <Dumbbell className="text-primary" size={28} />
              </motion.div>
              <div>
                <span className="text-primary text-sm uppercase tracking-wider">健身</span>
                <h1 className="font-display text-4xl md:text-5xl">每週訓練紀錄</h1>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              記錄每週的訓練內容、進步與心得，追蹤自己的成長軌跡
            </p>
          </AnimatedSection>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-6 py-12">
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16" staggerDelay={0.1}>
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <motion.div
                className="p-6 rounded-xl bg-card/50 border border-border/50 text-center"
                whileHover={{ 
                  borderColor: "hsl(24 100% 50% / 0.5)",
                  y: -5,
                }}
              >
                <stat.icon className="text-primary mx-auto mb-3" size={24} />
                <p className="font-display text-3xl text-gradient">{stat.value}</p>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Weekly Logs */}
        <AnimatedSection className="mb-8">
          <h2 className="font-display text-3xl mb-2">訓練週記</h2>
          <p className="text-muted-foreground">每週訓練重點與突破</p>
        </AnimatedSection>

        <StaggerContainer className="space-y-4" staggerDelay={0.1}>
          {weeklyLogs.map((log) => (
            <StaggerItem key={log.week}>
              <motion.div
                className="p-6 rounded-xl bg-card-gradient border border-border/50"
                whileHover={{ 
                  borderColor: "hsl(24 100% 50% / 0.5)",
                  x: 10,
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display text-2xl">{log.week}</h3>
                      <span className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full">
                        {log.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{log.date}</p>
                    <p className="text-foreground mb-3">
                      <span className="text-primary">訓練重點：</span> {log.focus}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {log.highlights.map((highlight, i) => (
                        <span 
                          key={i}
                          className="px-3 py-1 bg-card border border-border/50 text-sm rounded-lg"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
};

export default TrainingLog;
