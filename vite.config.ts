import { resolve } from "path";
import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";

// Plugin is used to prevent a "JavaScript heap out of memory" error during build
// by excluding node_modules from sourcemap generation.
// See https://github.com/vitejs/vite/issues/2433 for details.
export function sourcemapExclude(): Plugin {
  return {
    name: "sourcemap-exclude",
    transform(code: string, id: string) {
      if (id.includes("node_modules")) {
        return {
          code,
          // https://github.com/rollup/rollup/blob/master/docs/plugin-development/index.md#source-code-transformations
          map: { mappings: "" },
        };
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), sourcemapExclude()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});
