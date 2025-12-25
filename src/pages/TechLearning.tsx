import { ArrowLeft, Laptop, BookOpen, Star, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";

const learningTopics = [
  {
    category: "React",
    icon: "⚛️",
    items: [
      { title: "React Hooks 深入理解", level: "進階", status: "completed" },
      { title: "Custom Hooks 實作", level: "進階", status: "completed" },
      { title: "React Query 資料管理", level: "中級", status: "in-progress" },
      { title: "React Performance 優化", level: "進階", status: "upcoming" },
    ],
  },
  {
    category: "TypeScript",
    icon: "📘",
    items: [
      { title: "基礎型別與介面", level: "基礎", status: "completed" },
      { title: "泛型 Generics", level: "進階", status: "completed" },
      { title: "Utility Types 應用", level: "進階", status: "in-progress" },
    ],
  },
  {
    category: "CSS & 動畫",
    icon: "🎨",
    items: [
      { title: "Tailwind CSS 進階技巧", level: "中級", status: "completed" },
      { title: "Framer Motion 動畫", level: "中級", status: "completed" },
      { title: "CSS Grid 深入", level: "中級", status: "completed" },
    ],
  },
  {
    category: "工具與部署",
    icon: "🛠️",
    items: [
      { title: "Vite 建構工具", level: "基礎", status: "completed" },
      { title: "Git 版本控制", level: "基礎", status: "completed" },
      { title: "Vercel 部署", level: "基礎", status: "upcoming" },
    ],
  },
];

const resources = [
  { name: "React 官方文檔", url: "https://react.dev", type: "文檔" },
  { name: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/", type: "文檔" },
  { name: "Tailwind CSS", url: "https://tailwindcss.com/docs", type: "文檔" },
  { name: "Framer Motion", url: "https://www.framer.com/motion/", type: "文檔" },
];

const TechLearning = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'in-progress': return 'bg-accent/20 text-accent';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'in-progress': return '學習中';
      default: return '待學習';
    }
  };

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
                <Laptop className="text-primary" size={28} />
              </motion.div>
              <div>
                <span className="text-primary text-sm uppercase tracking-wider">學習</span>
                <h1 className="font-display text-4xl md:text-5xl">技術學習</h1>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              持續學習前端技術，記錄學習進度與心得筆記
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Learning Progress */}
        <StaggerContainer className="grid md:grid-cols-2 gap-6 mb-16" staggerDelay={0.1}>
          {learningTopics.map((topic) => (
            <StaggerItem key={topic.category}>
              <motion.div
                className="p-6 rounded-xl bg-card-gradient border border-border/50 h-full"
                whileHover={{ 
                  borderColor: "hsl(24 100% 50% / 0.5)",
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{topic.icon}</span>
                  <h3 className="font-display text-2xl">{topic.category}</h3>
                </div>

                <div className="space-y-3">
                  {topic.items.map((item, i) => (
                    <motion.div 
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/30"
                      whileHover={{ x: 5, borderColor: "hsl(24 100% 50% / 0.3)" }}
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen size={16} className="text-primary" />
                        <div>
                          <p className="text-foreground text-sm">{item.title}</p>
                          <p className="text-muted-foreground text-xs">{item.level}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Resources */}
        <AnimatedSection className="mb-8">
          <h2 className="font-display text-3xl mb-2">學習資源</h2>
          <p className="text-muted-foreground">推薦的學習文檔與教程</p>
        </AnimatedSection>

        <StaggerContainer className="grid md:grid-cols-4 gap-4" staggerDelay={0.05}>
          {resources.map((resource) => (
            <StaggerItem key={resource.name}>
              <motion.a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-xl bg-card/50 border border-border/50 group"
                whileHover={{ 
                  borderColor: "hsl(24 100% 50% / 0.5)",
                  y: -5,
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <Star size={16} className="text-primary" />
                  <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="font-display text-lg mb-1">{resource.name}</p>
                <p className="text-muted-foreground text-xs">{resource.type}</p>
              </motion.a>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
};

export default TechLearning;
