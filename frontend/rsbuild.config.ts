import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/rspack";
import { pluginCssMinimizer } from "@rsbuild/plugin-css-minimizer";

export default defineConfig({
  plugins: [pluginReact(), pluginCssMinimizer()],
  html: {
    title: "Links by IOIT ACM",
    meta: {
      description:
        "Create clean, shareable short links with Instagram-friendly previews.",
      keywords: "url shortener, ioit acm, links",
      author: "IOIT ACM",
      "theme-color": "#FF6A00",

      "og:title": "Links by IOIT ACM",
      "og:description": "Fast, simple URL shortener built by IOIT ACM.",
      "og:type": "website",
      "og:url": "https://links.ioit.acm.org",
      "og:image": "https://links.ioit.acm.org/og-image.jpeg",

      "twitter:card": "summary_large_image",
      "twitter:title": "Links by IOIT ACM",
      "twitter:description": "Fast, simple URL shortener built by IOIT ACM.",
      "twitter:image": "https://links.ioit.acm.org/og-image.jpeg",
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
