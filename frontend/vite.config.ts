import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev-сервер проксирует API и WebSocket на локальный backend (:8080).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
      "/ws": { target: "ws://localhost:8080", ws: true },
    },
  },
});
