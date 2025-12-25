import { Instagram, Mail, Github } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedSection } from "./AnimatedSection";

const socialLinks = [
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://instagram.com",
    description: "追蹤我的健身日常",
    color: "from-pink-500 to-purple-500",
  },
  {
    icon: Github,
    label: "GitHub",
    href: "https://github.com",
    description: "查看我的程式碼",
    color: "from-gray-600 to-gray-800",
  },
  {
    icon: Mail,
    label: "Email",
    href: "mailto:hello@example.com",
    description: "有任何問題歡迎聯繫",
    color: "from-primary to-accent",
  },
];

const ContactSection = () => {
  return (
    <section id="contact" className="py-24 bg-hero relative overflow-hidden">
      <motion.div 
        className="absolute top-0 right-0 w-1/2 h-full bg-glow opacity-20"
        animate={{
          x: [0, 50, 0],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <AnimatedSection className="text-center mb-16">
          <motion.span 
            className="inline-block px-4 py-2 bg-primary/20 border border-primary/30 rounded-full text-primary text-sm uppercase tracking-wider mb-4"
            whileHover={{ scale: 1.05 }}
          >
            聯繫我
          </motion.span>
          <h2 className="font-display text-5xl md:text-6xl mb-6">
            一起<span className="text-gradient">交流</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            歡迎追蹤我的社群，一起分享健身與開發的心得
          </p>
        </AnimatedSection>

        {/* Social Links Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {socialLinks.map((social, index) => (
            <motion.a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl bg-card-gradient border border-border/50 p-8 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ 
                scale: 1.02,
                borderColor: "hsl(24 100% 50% / 0.5)",
              }}
            >
              {/* Icon */}
              <motion.div 
                className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${social.color} flex items-center justify-center`}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: 5,
                }}
                transition={{ duration: 0.3 }}
              >
                <social.icon className="text-white" size={28} />
              </motion.div>

              <h3 className="font-display text-2xl mb-2">{social.label}</h3>
              <p className="text-muted-foreground text-sm">{social.description}</p>

              {/* Hover glow effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: "radial-gradient(circle at 50% 50%, hsl(24 100% 50% / 0.1) 0%, transparent 50%)",
                }}
              />
            </motion.a>
          ))}
        </div>

        {/* Instagram CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-full shadow-glow text-lg"
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px hsl(24 100% 50% / 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Instagram size={24} />
            追蹤我的 Instagram
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
