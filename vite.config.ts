import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 8080,
    },
    plugins: [
        react(),
        mode === "development" && componentTagger(),
        VitePWA({
            registerType: "autoUpdate",
            // 你等等會放到 public/icons 底下
            includeAssets: ["icons/pwa-192.png", "icons/pwa-512.png"],
            manifest: {
                name: "Xiannn Log",
                short_name: "XiannnLog",
                description: "健身訓練紀錄 × 建站紀錄",
                start_url: "/",
                scope: "/",
                display: "standalone",
                background_color: "#0b0b0b",
                theme_color: "#ff6a00",
                icons: [
                    { src: "/icons/pwa-192.png", sizes: "192x192", type: "image/png" },
                    { src: "/icons/pwa-512.png", sizes: "512x512", type: "image/png" }
                ]
            }
        }),
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));
