import { ArrowLeft, TrendingUp, Shield, LineChart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import EthKlineChart from "../components/EthKlineChart";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/AnimatedSection";

const principles = [
  {
    title: "不追高",
    desc: "不在情緒高點進場，只做自己能承受的決策。",
  },
  {
    title: "紀律第一",
    desc: "紀錄比預測重要，長期勝過短期刺激。",
  },
  {
    title: "身體優先",
    desc: "健身與生活穩定，才有資格談市場。",
  },
];

export default function WebsiteChallenge() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-hero border-b border-border/50">
        <div className="container mx-auto px-6 py-8">
          <Link to="/">
            <motion.div
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
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
                <TrendingUp className="text-primary" size={28} />
              </motion.div>
              <div>
                <span className="text-primary text-sm uppercase tracking-wider">
                  Build in Public
                </span>
                <h1 className="font-display text-4xl md:text-5xl">
                  ETH × 紀律儀表板
                </h1>
              </div>
            </div>

            <p className="text-muted-foreground max-w-2xl">
              不是投資建議，而是紀律紀錄。
              把健身、自律與市場觀察放在同一個節奏。
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 space-y-16">
        {/* ETH Chart */}
        <AnimatedSection>
          <div className="flex items-center gap-3 mb-4">
            <LineChart className="text-primary" />
            <h2 className="font-display text-3xl">ETH 市場觀察</h2>
          </div>

          <EthKlineChart />
        </AnimatedSection>

        {/* Principles */}
        <AnimatedSection>
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-primary" />
            <h2 className="font-display text-3xl">我的市場紀律</h2>
          </div>

          <StaggerContainer
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            staggerDelay={0.1}
          >
            {principles.map((p) => (
              <StaggerItem key={p.title}>
                <motion.div
                  className="p-6 rounded-xl bg-card/50 border border-border/50"
                  whileHover={{
                    y: -6,
                    borderColor: "hsl(24 100% 50% / 0.5)",
                  }}
                >
                  <h3 className="font-display text-xl mb-2 text-gradient">
                    {p.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{p.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </AnimatedSection>
      </div>
    </div>
  );
}
