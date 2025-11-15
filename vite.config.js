import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        // Optimize chunk splitting for better caching
        manualChunks: (id) => {
          // Vendor chunks for third-party libraries
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "react-vendor";
            if (id.includes("react-router")) return "router-vendor";
            if (id.includes("lucide")) return "icons-vendor";
            return "vendor";
          }

          // Feature-based chunks
          if (id.includes("pages/")) return "pages";
          if (id.includes("components/")) return "components";
          if (id.includes("hooks/")) return "hooks";
          if (id.includes("services/")) return "services";
          if (id.includes("utils/")) return "utils";

          return "index";
        },
        // Optimize chunk size
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? `facade-${chunkInfo.facadeModuleId}`
            : "chunk";
          return `assets/js/[name]-[hash].js`;
        },
        entryFileNames: `assets/js/[name]-[hash].js`,
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split(".").pop();
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/.test(assetInfo.name)) {
            return `assets/media/[name]-[hash][extname]`;
          }
          if (/\.(png|jpe?g|gif|svg|ico|webp)$/.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[ext]/[name]-[hash][extname]`;
        },
      },
    },
    // Enable build optimizations
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: [
          "console.log",
          "console.info",
          "console.debug",
          "console.warn",
        ],
      },
      mangle: {
        properties: {
          regex: /^_/, // Private properties
        },
      },
    },
    // Enable source maps for production debugging
    sourcemap: false,
    // Optimize bundle size
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 4096, // 4kb
  },
  server: {
    port: 3000,
    open: true,
    // No proxy needed - frontend directly connects to api.jun-oro.com
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
      clientPort: 3000,
    },
  },
  publicDir: "public",
  // Enable dependency pre-bundling
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
  // Enable experimental features for better performance
  // Note: renderBuiltUrl is deprecated in current Vite version
  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      "@": "/src",
      "@components": "/src/components",
      "@hooks": "/src/hooks",
      "@services": "/src/services",
      "@utils": "/src/utils",
      "@pages": "/src/pages",
    },
  },
});
