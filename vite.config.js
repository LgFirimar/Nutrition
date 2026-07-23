import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/Nutrition/',
  plugins: [
    react(),
    VitePWA({
      // The app already ships its own public/manifest.json (linked from index.html) —
      // keep using that one as-is rather than having the plugin generate a new one.
      manifest: false,
      registerType: 'autoUpdate',
      // This app deploys often (see git history) — autoUpdate + clientsClaim/skipWaiting
      // means a reload after deploy always picks up the new service worker instead of a
      // user getting stuck on a stale cached build.
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // Precache the app shell + the small static assets (icons, splash pngs, manifest).
        // Deliberately EXCLUDES .mp4 — the loader/onboarding videos total ~12MB and aren't
        // needed for the very first paint, so they're handled by the runtimeCaching rule
        // below instead (cached lazily the first time each one is actually played, which in
        // practice happens during the same online session used to install the app).
        globPatterns: ['**/*.{js,css,html,svg,ico,webmanifest,json,png,jpg,jpeg,webp}'],
        runtimeCaching: [
          {
            urlPattern: ({ url, sameOrigin }) => sameOrigin && /\.mp4$/i.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'nutrition-videos',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
