import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // GitHub Pages project-site URL: /movie-booking/
  base: "/movie-booking/",
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
});
