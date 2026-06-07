# Nutrition App

React SPA (Vite) — אפליקציית מעקב תזונה בעברית.

## מבנה
- `src/App.jsx` — כל הקוד (קומפוננטות, לוגיקה, UI)
- `src/index.css` — עיצוב
- `worker.js` + `wrangler.toml` — Cloudflare Worker לבקשות AI
- `public/` — תמונות ווידאו

## Deploy
GitHub Actions → Cloudflare Pages בכל push ל-main.
AI Worker: `https://nutrition-ai.lior0gal.workers.dev`

## ריפו
`/tmp/Nutrition` (clone של `LgFirimar/Nutrition`)
לדחיפה: `cd /tmp/Nutrition && git push origin main`

## טכנולוגיות
- React 19, Vite 8
- Firebase Realtime Database (משק בית משותף)
- localStorage לנתוני משתמש (יומן, פרופילים, מזווה)

## מוסכמות
- כל ה-state מנוהל ב-`App()` (component אחד ראשי)
- `FRIDGE_CATS` — קטגוריות מזווה/מקרר (cheeses, veggies, protein, legumes, carbs, nuts, spices, other)
- `LANG` object — תרגומים עברית/אנגלית
- `ls.get/set` — wrapper ל-localStorage
