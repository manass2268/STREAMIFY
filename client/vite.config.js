import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "modern-mammals-lick.loca.lt", // Tumhara current link
      ".loca.lt", // Ye isliye taaki agar baad mein link change ho jaye, toh bhi error na aaye
    ],
  },
});
