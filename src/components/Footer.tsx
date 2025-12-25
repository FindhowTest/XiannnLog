import { Instagram, Github, Mail } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="font-display text-2xl text-primary-foreground">X</span>
            </div>
            <span className="font-display text-2xl tracking-wider">XIANNN</span>
          </motion.div>

          {/* Social Links */}
          <div className="flex gap-4">
            {[
              { icon: Instagram, href: "https://instagram.com" },
              { icon: Github, href: "https://github.com" },
              { icon: Mail, href: "mailto:hello@example.com" },
            ].map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-card rounded-lg flex items-center justify-center border border-border/50 text-muted-foreground hover:text-primary transition-colors"
                whileHover={{ 
                  scale: 1.1, 
                  borderColor: "hsl(24 100% 50% / 0.5)",
                  y: -3,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <social.icon size={18} />
              </motion.a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-muted-foreground text-sm">
            © 2024 Xiannn. 健身 × 建站紀錄
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
