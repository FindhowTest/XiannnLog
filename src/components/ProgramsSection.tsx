import { Dumbbell, Code, Laptop, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import training1 from "@/assets/training-1.jpg";
import training2 from "@/assets/training-2.jpg";
import training3 from "@/assets/training-3.jpg";
import { motion } from "framer-motion";
import { AnimatedSection, StaggerContainer, StaggerItem } from "./AnimatedSection";

const journeyItems = [
  {
    title: "重訓日常",
    description: "每週訓練紀錄與心得分享",
    image: training1,
    icon: Dumbbell,
    tag: "健身",
    link: "/training",
  },
  {
    title: "建站挑戰",
    description: "從零開始打造這個網站的過程",
    image: training2,
    icon: Code,
    tag: "開發",
    link: "/challenge",
  },
  {
    title: "技術學習",
    description: "React、TypeScript 與設計技巧",
    image: training3,
    icon: Laptop,
    tag: "學習",
    link: "/learning",
  },
];

const stats = [
  {
    icon: Dumbbell,
    value: "3年",
    label: "健身經驗",
  },
  {
    icon: Code,
    value: "10+",
    label: "專案作品",
  },
  {
    icon: Laptop,
    value: "React",
    label: "主力技術",
  },
  {
    icon: Zap,
    value: "持續",
    label: "學習中",
  },
];

const ProgramsSection = () => {
  return (
    <section id="journey" className="py-24 bg-hero relative overflow-hidden">
      {/* Animated background glow */}
      <motion.div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-glow opacity-30"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16">
          <motion.span 
            className="inline-block px-4 py-2 bg-primary/20 border border-primary/30 rounded-full text-primary text-sm uppercase tracking-wider mb-4"
            whileHover={{ scale: 1.05 }}
          >
            我的旅程
          </motion.span>
          <h2 className="font-display text-5xl md:text-7xl mb-4">
            健身 × <span className="text-gradient">建站</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            記錄我在健身與程式開發這兩條道路上的成長與探索
          </p>
        </AnimatedSection>

        {/* Journey Grid */}
        <StaggerContainer className="grid md:grid-cols-3 gap-6 mb-24" staggerDelay={0.15}>
          {journeyItems.map((item) => (
            <StaggerItem key={item.title}>
              <Link to={item.link}>
                <motion.div
                  className="group relative overflow-hidden rounded-2xl bg-card-gradient border border-border/50 cursor-pointer"
                  whileHover={{ 
                    scale: 1.02,
                    borderColor: "hsl(24 100% 50% / 0.5)",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <motion.img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.15 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                  </div>

                  {/* Tag */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-primary/80 text-primary-foreground text-xs font-semibold rounded-full">
                      {item.tag}
                    </span>
                  </div>

                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 p-6"
                    initial={{ y: 20, opacity: 0.8 }}
                    whileHover={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div 
                        className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30"
                        whileHover={{ 
                          scale: 1.1, 
                          backgroundColor: "hsl(24 100% 50% / 0.3)",
                        }}
                      >
                        <item.icon className="text-primary" size={20} />
                      </motion.div>
                      <h3 className="font-display text-2xl">{item.title}</h3>
                    </div>
                    <motion.p 
                      className="text-muted-foreground text-sm"
                      initial={{ opacity: 0.7 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {item.description}
                    </motion.p>
                  </motion.div>

                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      background: "radial-gradient(circle at 50% 100%, hsl(24 100% 50% / 0.1) 0%, transparent 50%)",
                    }}
                  />
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Stats Grid */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4" staggerDelay={0.1}>
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <motion.div
                className="p-6 rounded-xl bg-card/50 border border-border/50 group text-center"
                whileHover={{ 
                  borderColor: "hsl(24 100% 50% / 0.5)",
                  backgroundColor: "hsl(var(--card))",
                  y: -5,
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto"
                  whileHover={{ 
                    scale: 1.1, 
                    backgroundColor: "hsl(24 100% 50% / 0.2)",
                    rotate: 5,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <stat.icon className="text-primary" size={24} />
                </motion.div>
                <p className="font-display text-3xl text-gradient mb-1">{stat.value}</p>
                <p className="text-muted-foreground text-sm">
                  {stat.label}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default ProgramsSection;
