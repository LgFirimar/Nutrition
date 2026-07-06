# Session Context — Nutrition App

## Project
React 19 SPA (Vite 8), Hebrew RTL, nutrition tracker.
- `src/App.jsx` — all components and logic
- `worker.js` — Cloudflare Worker for AI (Anthropic Claude)
- Deployed: GitHub Actions → Cloudflare Pages (on push to `main`)
- Worker URL: `https://nutrition-ai.lior0gal.workers.dev`
- Repo: `LgFirimar/Nutrition`

## Changes Made This Session (already committed & pushed to main)

### 1. Backup includes recipe book
`exportData` now includes `recipes:loadRecipes(p.id)` per profile.
`importData` now calls `saveRecipes(pd.recipes, profileId)` on import (v5 path) and v4 fallback.

### 2. Large recipe file fix (502 error)
`recipeText` branch in `worker.js`: `max_tokens` raised from 1400 → 2500.
Error body now read from non-OK responses in `loadFromFile` and `loadFromClaude`.

### 3. DB add-item: text hint alongside image
`askClaudeAdd` in `DBModal` passes `dbEditImageHint` with image requests.
`handleAddImage` passes `addText.trim()` as hint.
Worker `dbEditImageData` branch appends hint to prompt.

### 4. PhotoMealPanel: description textarea + re-analyze button
New state: `imgHint`, `storedB64`, `storedMime`.
Textarea for optional description; "Re-analyze with description" button appears when image is loaded and hint is typed.
Worker `imageData` branch appends `imageHint` to analysis prompt.

## Current Blocking Issue

**Anthropic API "credit balance too low" error on all AI calls.**

**Root cause:** The `ANTHROPIC_API_KEY` stored as a Cloudflare Worker secret belongs to a *different/old* Anthropic account, not the one showing $21.64 balance.

**Fix (user must do manually):**
1. Go to console.anthropic.com/settings/keys → Create Key → copy `sk-ant-api03-...`
2. Go to dash.cloudflare.com → Workers & Pages → nutrition-ai → Settings → Variables and Secrets → edit `ANTHROPIC_API_KEY` → paste new key → Save

No code change or redeploy needed — secret updates take effect immediately.

## Key localStorage Keys
- `nutrition_journal_${pid}` — daily journal
- `nutrition_custom_db_${pid}` — custom food DB
- `nutrition_recipes_${pid}` — recipe book
- `nutrition_quick_foods_${pid}` — quick foods
- `nutrition_custom_btns_${pid}` — custom buttons

## Worker Branches (worker.js)
`foodName` | `mealDescription` | `imageData` (+`imageHint`) | `imageMediaType` |
`mealPlan` | `shoppingList` | `pantryImageData` | `pantryBulkData` |
`dbEditText` | `dbEditImageData` (+`dbEditImageHint`) | `dbEditImageMediaType` |
`profileData` | `translateItems` | `recipeText`

## Dev Branch
Current feature branch: `claude/lgfirimar-taskup-is12cd`
