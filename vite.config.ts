import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        action: resolve(__dirname, "src/action/action.html"),
        background: resolve(__dirname, "src/background/background.html"),
      },
    },
  },
});
