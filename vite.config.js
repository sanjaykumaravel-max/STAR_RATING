import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('html2pdf') || id.includes('html2canvas') || id.includes('jspdf')) {
              return 'vendor-print';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('docx') || id.includes('jszip') || id.includes('file-saver')) {
              return 'vendor-docs';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});