import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 8080,
    proxy: {
      // Proxy API requests to the backend server
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: [
      'esteticaneon.meusaas.com.br',
      'esteticaas.meusaas.com.br',
      'belezaurbana.meusaas.com.br',
      'admin.meusaas.com.br',
      'painel.meusaas.com.br',
      'meusaas.com.br',
      'localhost', 
      '127.0.0.1'  
      
    ]
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "utils": path.resolve(__dirname, "./src/utils"),
    },
  },
}));
