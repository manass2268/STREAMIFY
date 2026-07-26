import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // LightningCSS ki jagah standard esbuild use karne ke liye taaki Tailwind at-rules fail na ho
    cssMinify: "esbuild",
  },
});
