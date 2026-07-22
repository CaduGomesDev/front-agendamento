import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Alvo de deploy: VERCEL.
// O TanStack Start compila o servidor via Nitro (plugin `nitro/vite`). No build
// da Vercel, o Nitro detecta o ambiente automaticamente e gera Vercel Functions
// — não é preciso configurar preset, build command nem output (ver vercel.json).
export default defineConfig({
  plugins: [tanstackStart(), nitro(), viteReact(), tailwindcss()],
  resolve: {
    // Alias "@/..." -> "src/..." (usado em todo o projeto).
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
