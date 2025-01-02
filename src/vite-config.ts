import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist", // Папка для сборки
    assetsDir: "static", // Папка для ассетов
    rollupOptions: {
      input: "./client/index.html", // Точка входа
    },
  },
});
