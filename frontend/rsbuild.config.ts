import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/rspack";
import { pluginCssMinimizer } from "@rsbuild/plugin-css-minimizer";

export default defineConfig({
  plugins: [pluginReact(), pluginCssMinimizer()],
  html: {
    title: "Minimal URL Shortener",
    meta: {
      description: "Fast, simple URL shortener with Instagram story support.",
    },
  },
  source: {
    entry: {
      index: "./src/main.tsx",
    },
  },
  tools: {
    lightningcssLoader: false,
    rspack: {
      experiments: {
        css: true,
      },
      plugins: [
        tanstackRouter({
          target: "react",
          autoCodeSplitting: true,
        }),
      ],
    },
    postcss: {
      postcssOptions: {
        plugins: ["@tailwindcss/postcss"],
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5937",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
