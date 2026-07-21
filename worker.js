export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    // ── Analytics ───────────────────────────────────────────────────────────────
    const url = new URL(request.url);

    if (url.pathname === '/ping' && request.method === 'POST') {
      if (env.ANALYTICS_KV) {
        try {
          const { deviceId } = await request.json();
          if (deviceId && deviceId.length >= 8) {
            const key = `device:${deviceId}`;
            const now = Date.now();
            const existing = await env.ANALYTICS_KV.getWithMetadata(key);
            const firstSeen = existing.value ? Number(existing.value) : now;
            if (!existing.value) {
              const cur = (await env.ANALYTICS_KV.get('__total', 'json')) || 0;
              await env.ANALYTICS_KV.put('__total', JSON.stringify(cur + 1));
            }
            await env.ANALYTICS_KV.put(key, String(firstSeen), {
              expirationTtl: 730 * 24 * 3600,
              metadata: { lastSeen: now },
            });
          }
        } catch (_) {}
      }
      return new Response('{}', { headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/stats') {
      if (!env.ANALYTICS_KV) {
        return new Response('KV not configured', { status: 500, headers: cors });
      }
      const total = (await env.ANALYTICS_KV.get('__total', 'json')) || 0;
      const now = Date.now();
      const week = now - 7 * 24 * 3600 * 1000;
      const month = now - 30 * 24 * 3600 * 1000;
      let activeWeek = 0, activeMonth = 0;
      let cursor, listComplete = false;
      while (!listComplete) {
        const res = await env.ANALYTICS_KV.list({ prefix: 'device:', limit: 1000, cursor });
        for (const k of res.keys) {
          const ls = k.metadata?.lastSeen || 0;
          if (ls > week) activeWeek++;
          if (ls > month) activeMonth++;
        }
        listComplete = res.list_complete;
        cursor = res.cursor;
      }
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nutrition — Stats</title>
<style>body{font-family:system-ui,sans-serif;max-width:420px;margin:60px auto;padding:0 20px;background:#f8fafc;color:#0f172a}h1{font-size:1.3rem;margin-bottom:4px}sub{color:#64748b;font-size:.8rem;font-weight:400}.stat{background:white;border-radius:16px;padding:20px 24px;margin:14px 0;box-shadow:0 1px 4px rgba(0,0,0,.08)}.num{font-size:2.6rem;font-weight:700;color:#0d9488;line-height:1}.label{font-size:.85rem;color:#64748b;margin-top:6px}footer{font-size:.72rem;color:#94a3b8;margin-top:20px}</style>
</head><body>
<h1>📊 Nutrition App <sub>usage stats</sub></h1>
<div class="stat"><div class="num">${total}</div><div class="label">Total unique devices (ever)</div></div>
<div class="stat"><div class="num">${activeWeek}</div><div class="label">Active last 7 days</div></div>
<div class="stat"><div class="num">${activeMonth}</div><div class="label">Active last 30 days</div></div>
<footer>As of ${new Date().toLocaleString('he-IL',{timeZone:'Asia/Jerusalem'})}</footer>
</body></html>`;
      return new Response(html, { headers: { ...cors, 'Content-Type': 'text/html; charset=utf-8' } });
    }
    // ───────────────────────────────────────────────────────────────────────────

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: cors });
    }

    try {
      const { foodName, mealDescription, imageData, imageMediaType, imageHint, mealPlan, shoppingList, pantryImageData, pantryImageMediaType, pantryBulkData, pantryBulkMediaType, dbEditText, dbEditImageData, dbEditImageMediaType, dbEditImageHint, profileData, dailyPlan, lang, translateItems, recipeText } = await request.json();

      let prompt, model, system, max_tokens, messages;
      if (recipeText) {
        const isHeR = (lang || 'he') !== 'en';
        model = 'claude-sonnet-4-6';
        max_tokens = 2500;
        system = isHeR
          ? 'אתה שף ותזונאי מנוסה. קרא מתכונים וחלץ את המבנה שלהם. החזר JSON בלבד, ללא markdown.'
          : 'You are an experienced chef and nutritionist. Parse recipe text and extract its structure. Return ONLY JSON, no markdown.';
        prompt = isHeR
          ? `קרא את המתכון הבא וחלץ ממנו את כל המידע:\n\n${recipeText}\n\nהחזר JSON בלבד בפורמט הזה (kcal/carbs/protein/fat לכל מנה, 0 אם לא ידוע):\n{"recipe":{"name":"שם המתכון","servings":2,"ingredients":[{"item":"שם מצרך","amount":"כמות"}],"steps":["שלב הכנה בזה אחר זה"],"kcalPerPerson":0,"carbsPerPerson":0,"proteinPerPerson":0,"fatPerPerson":0}}`
          : `Parse this recipe and extract all information:\n\n${recipeText}\n\nReturn ONLY JSON (kcal/carbs/protein/fat per serving, 0 if unknown):\n{"recipe":{"name":"recipe name","servings":2,"ingredients":[{"item":"ingredient name","amount":"quantity"}],"steps":["preparation step in order"],"kcalPerPerson":0,"carbsPerPerson":0,"proteinPerPerson":0,"fatPerPerson":0}}`;
      } else if (translateItems) {
        model = 'claude-haiku-4-5-20251001';
        max_tokens = 400;
        system = 'You are a translation assistant. Return ONLY valid JSON, no markdown.';
        prompt = `Translate these food/grocery item names to English. Return {"translations":["english1","english2",...]} same order, same count.\nItems: ${JSON.stringify(translateItems)}`;
      } else if (pantryBulkData) {
        model = 'claude-sonnet-4-6';
        max_tokens = 1200;
        system = 'You are a pantry and grocery expert. Identify food items in images. Return ONLY valid JSON, no markdown.';
        messages = [{role:'user', content:[
          {type:'image', source:{type:'base64', media_type:pantryBulkMediaType||'image/jpeg', data:pantryBulkData}},
          {type:'text', text:`Identify ALL food/grocery items visible in this image (receipt, shelf, or pantry contents).
For each item, assign a category from exactly these options: cheeses, veggies, protein, legumes, carbs, nuts, spices, other
Return ONLY this JSON: {"items":[{"name":"שם בעברית","qty":"כמות (e.g. 500g, 3 יח׳ — leave empty string if unknown)","cat":"category"}]}
Include every distinct item you can identify. Use Hebrew names.`}
        ]}];
      } else if (pantryImageData) {
        model = 'claude-haiku-4-5-20251001';
        max_tokens = 200;
        system = 'You are a grocery expert. Identify food items in images. Return ONLY valid JSON, no markdown.';
        messages = [{role:'user', content:[
          {type:'image', source:{type:'base64', media_type:pantryImageMediaType||'image/jpeg', data:pantryImageData}},
          {type:'text', text:'Identify the main food item in this image. Return ONLY this JSON: {"name":"שם בעברית","qty":"כמות אופציונלית כגון 500g, 3 יח׳ (leave empty string if unknown)"}'}
        ]}];
      } else if (dbEditImageData) {
        model = 'claude-sonnet-4-6';
        max_tokens = 512;
        system = 'You are a precise nutrition calculator with expert knowledge of food composition databases.';
        const hintLine = dbEditImageHint ? `\nUser description: ${dbEditImageHint}` : '';
        messages = [{role:'user', content:[
          {type:'image', source:{type:'base64', media_type:dbEditImageMediaType||'image/jpeg', data:dbEditImageData}},
          {type:'text', text:`Calculate nutritional values for the total food visible in this image as 1 serving.${hintLine}\nReturn ONLY this JSON on the last line: {"label":"emoji + שם בעברית","kcal":0,"carbs":0,"protein":0,"fat":0}`}
        ]}];
      } else if (dbEditText) {
        model = 'claude-sonnet-4-6';
        max_tokens = 512;
        system = 'You are a precise nutrition calculator with expert knowledge of food composition databases (USDA, Israeli food tables).';
        prompt = `Calculate nutritional values for: ${dbEditText}\nFirst break down each ingredient, then output ONLY this JSON on the last line: {"label":"emoji + שם בעברית","kcal":0,"carbs":0,"protein":0,"fat":0}`;
      } else if (imageData) {
        model = 'claude-sonnet-4-6';
        max_tokens = 1024;
        system = 'You are a precise nutrition calculator with expert knowledge of food composition databases.';
        const isHeImg = (lang || 'he') !== 'en';
        const imgHintLine = imageHint ? (isHeImg ? `\nהערת המשתמש: ${imageHint}` : `\nUser note: ${imageHint}`) : '';
        const analysisPrompt = isHeImg ? `נתח את תמונת האוכל הזו.${imgHintLine}

שלב 1 — זהה כל פריט אוכל גלוי.
שלב 2 — העריך משקל בגרמים לפי רמזים ויזואליים (קוטר צלחת, עובי, צפיפות, גודל סטנדרטי).
שלב 3 — סכום המשקלים = totalGrams (מוצקים בלבד).
שלב 4 — חשב ערכים תזונתיים כוללים, ולאחר מכן per100g = ערכים / totalGrams * 100.
שלב 5 — אם התמונה מציגה תווית תזונה עם "X pieces/pcs", קבע piecesCount=X ו-totalGrams=גרמים לאותן X חתיכות.

פלט JSON בלבד בשורה האחרונה:
{"label":"שם ארוחה בעברית","kcal":INT,"carbs":FLOAT,"protein":FLOAT,"fat":FLOAT,"totalGrams":INT,"per100g":{"kcal":INT,"carbs":FLOAT,"protein":FLOAT,"fat":FLOAT},"portions":"רשימה בעברית: פריט ~Xg","suggestedAmt":NUMBER,"suggestedUnit":"יח׳ או g או מנות או קוביות","piecesCount":NUMBER}`
        : `Analyze this food photo carefully.${imgHintLine}

Step 1 — identify each food item visible.
Step 2 — estimate each item's weight in grams (use visual cues: plate size, food thickness, standard portions: chicken breast ≈ 180g, cup rice ≈ 180g, apple ≈ 180g, bread slice ≈ 30g).
Step 3 — sum the weights = totalGrams (solid food only).
Step 4 — calculate total nutrition, then per100g = values / totalGrams * 100.
Step 5 — if the photo shows a nutrition label with "X pieces/pcs", set piecesCount=X and totalGrams=grams for those X pieces. Otherwise piecesCount:0.

Output ONLY this JSON on the last line (no markdown):
{"label":"English meal name","kcal":INT,"carbs":FLOAT,"protein":FLOAT,"fat":FLOAT,"totalGrams":INT,"per100g":{"kcal":INT,"carbs":FLOAT,"protein":FLOAT,"fat":FLOAT},"portions":"English list: item ~Xg, e.g: chicken ~160g, rice ~90g","suggestedAmt":NUMBER,"suggestedUnit":"pcs if countable items, g if weighed, servings if a full meal, cubes if pieces/pcs on label","piecesCount":NUMBER}`;
        messages = [{role:'user', content:[
          {type:'image', source:{type:'base64', media_type:imageMediaType||'image/jpeg', data:imageData}},
          {type:'text', text:analysisPrompt}
        ]}];
      } else if (mealDescription) {
        model = 'claude-sonnet-4-6';
        max_tokens = 1024;
        system = 'You are a precise nutrition calculator with expert knowledge of food composition databases (USDA, Israeli food tables).';
        prompt = `Calculate the total nutritional values for this meal.

First, break down EACH ingredient separately with its exact quantity and calories. Be precise — oil (1 tbsp = 120 kcal), cornstarch (1 tbsp = 28 kcal), avocado (~200g = 320 kcal), etc.

Meal: ${mealDescription}

After your calculation, output ONLY this JSON on the very last line (no markdown):
{"label":"short Hebrew meal name","kcal":TOTAL_INT,"carbs":TOTAL_FLOAT,"protein":TOTAL_FLOAT,"fat":TOTAL_FLOAT}`;
      } else if (mealPlan) {
        const { preferences, people, refine, selectedMeal, lang: mealLang, exclude } = mealPlan;
        const isHe = (mealLang || lang || 'he') !== 'en';
        if (selectedMeal) {
          model = 'claude-sonnet-4-6';
          max_tokens = 900;
          system = isHe
            ? 'אתה שף ותזונאי ישראלי. ענה בעברית תקנית. הפלט שלך הוא JSON בלבד — ללא הסבר, ללא markdown, ללא טקסט לפני או אחרי.'
            : 'You are a professional chef and nutritionist. Respond in English. Output ONLY valid JSON — no explanation, no markdown, no text before or after.';
          prompt = isHe
            ? `כתוב מתכון עבור "${selectedMeal}" ל-${people} אנשים. עד 6 רכיבים, עד 4 שלבים.\n{"recipe":{"name":"שם בעברית","ingredients":[{"item":"שם חומר","amount":"כמות"}],"steps":["שלב הכנה"],"kcalPerPerson":0,"carbsPerPerson":0,"proteinPerPerson":0,"fatPerPerson":0}}`
            : `Write a recipe for "${selectedMeal}" for ${people} people. Up to 6 ingredients, up to 4 steps.\n{"recipe":{"name":"meal name","ingredients":[{"item":"ingredient","amount":"quantity"}],"steps":["preparation step"],"kcalPerPerson":0,"carbsPerPerson":0,"proteinPerPerson":0,"fatPerPerson":0}}`;
        } else {
          model = 'claude-sonnet-4-6';
          max_tokens = 1100;
          system = isHe
            ? 'אתה שף ותזונאי ישראלי. כתוב בעברית תקנית ונכונה. הפלט הוא JSON בלבד — ללא הסבר, ללא markdown, ללא טקסט לפני או אחרי.'
            : 'You are a professional chef and nutritionist. Respond in English. Output ONLY valid JSON — no explanation, no markdown, no text before or after.';
          const refineText = refine ? (isHe ? `\nהערות: ${refine}` : `\nNotes: ${refine}`) : '';
          const excludeText = exclude?.length ? (isHe ? `\nאל תציע את הארוחות הבאות (כבר הוצעו): ${exclude.join(', ')}` : `\nDo NOT suggest these meals (already shown): ${exclude.join(', ')}`) : '';
          prompt = isHe
            ? `הצע 3 ארוחות שונות ל-${people} אנשים. העדפות: ${preferences || 'ללא הגבלות'}${refineText}${excludeText}

חוקים לשדה ingredients (חובה בכל אפשרות!):
- רשום בדיוק 4-6 שמות מרכיבים עיקריים — שמות עצם של מצרכים בלבד
- דוגמאות טובות: "חזה עוף", "אורז", "עגבניות", "גבינה צהובה", "סלמון", "פסטה", "עדשים"
- אל תכלול: שמן, מלח, פלפל, מים, שום, בצל, חמאה, חומץ (מרכיבי בסיס)
- אל תכלול: כמויות, שיטות בישול, תארים

החזר JSON בלבד, בדיוק בפורמט הזה (ingredients חייב להיות נוכח בכל אפשרות):
{"options":[{"name":"שם ארוחה","description":"תיאור קצר","ingredients":["מרכיב1","מרכיב2","מרכיב3","מרכיב4"],"kcalPerPerson":0,"carbsPerPerson":0,"proteinPerPerson":0}]}`
            : `Suggest 3 different meals for ${people} people. Preferences: ${preferences || 'none'}${refineText}${excludeText}

Rules for the ingredients field (required in every option!):
- List exactly 4-6 main ingredient names — nouns only, no quantities or cooking methods
- Good examples: "chicken breast", "rice", "tomatoes", "cheddar cheese", "salmon", "pasta", "lentils"
- Do NOT include: oil, salt, pepper, water, garlic, onion, butter, vinegar (base ingredients)

The fridge items listed in preferences may be in Hebrew. Also return "translatedFridge" — a JSON object mapping each Hebrew fridge item name to its English translation, e.g. {"עגבניות":"tomatoes"}.

Return ONLY JSON, exactly this format:
{"options":[{"name":"meal name","description":"short description","ingredients":["ingredient1","ingredient2","ingredient3","ingredient4"],"kcalPerPerson":0,"carbsPerPerson":0,"proteinPerPerson":0}],"translatedFridge":{"hebrewItem":"english",...}}`;
        }
      } else if (shoppingList) {
        const {pantry, recentFoods, isHe: shIsHe, lang: shLang} = shoppingList;
        const shHe = shIsHe !== false && (shLang||'he') !== 'en';
        model = 'claude-haiku-4-5-20251001';
        max_tokens = 600;
        system = shHe
          ? 'אתה עוזר לתכנון קניות בסופר. ענה בעברית. החזר JSON בלבד, ללא הסבר.'
          : 'You are a grocery shopping assistant. Respond in English. Return ONLY JSON, no explanation.';
        prompt = shHe
          ? `המשתמש אכל לאחרונה: ${(recentFoods||[]).join(', ')||'לא ידוע'}.\nבמזווה/מקרר יש: ${pantry||'ריק'}.\nהצע 6-10 פריטים לקנות בסופר — עדיפות לפריטים שחסרים במזווה ומופיעים בהרגלי האכילה.\n{"items":[{"name":"שם מוצר","qty":"כמות מומלצת"}]}`
          : `Recently eaten: ${(recentFoods||[]).join(', ')||'unknown'}.\nPantry/fridge has (may be in Hebrew): ${pantry||'empty'}.\nSuggest 6-10 items to buy — prioritize items missing from pantry that match eating habits.\n{"items":[{"name":"product name in English","qty":"recommended quantity"}]}`;
      } else if (dailyPlan) {
        const { profile: dp, history, lang: dpLang } = dailyPlan;
        const isHeDp = (dpLang || lang || 'he') !== 'en';
        model = 'claude-haiku-4-5-20251001';
        max_tokens = 600;
        // Build system with dietary hard-constraint so even system-prompt level enforces it
        const prefs0 = dp?.dietPrefs || [];
        const iv0 = prefs0.some(p=>p==='vegan'||/vegan|טבעוני/i.test(p));
        const ivg0 = iv0 || prefs0.some(p=>p==='veg'||/vegetarian|צמחוני/i.test(p));
        const sysRestrictHe = iv0 ? ' חוק מוחלט: אסור לכלול כל מוצר מן החי (בשר, עוף, דגים, פירות ים, ביצים, חלב, גבינה, יוגורט, דבש). כל רעיון חייב להיות 100% טבעוני.'
                             : ivg0 ? ' חוק מוחלט: אסור לכלול בשר, עוף, דגים ופירות ים בשום רעיון.' : '';
        const sysRestrictEn = iv0 ? ' HARD RULE: NO animal products — meat, poultry, fish, seafood, eggs, milk, cheese, yogurt, honey. Every idea must be 100% vegan.'
                             : ivg0 ? ' HARD RULE: NO meat, poultry, fish or seafood in any idea.' : '';
        system = isHeDp
          ? `תזונאית קלינית.${sysRestrictHe} החזר JSON בלבד, ללא markdown, ללא טקסט נוסף.`
          : `Clinical nutritionist.${sysRestrictEn} Return ONLY JSON, no markdown, no extra text.`;
        const gHe = dp?.gender === 'female' ? 'נקבה' : dp?.gender === 'male' ? 'זכר' : 'לא צוין';
        const bmi = (dp?.weight && dp?.height) ? (dp.weight / Math.pow(dp.height / 100, 2)).toFixed(1) : null;
        const foodList = (history?.topFoods || []).slice(0, 8).map(f => `${f.food}(${f.count}×)`).join(', ');
        const sugarNote = history?.sugarAvg ? (isHeDp ? ` סוכר ממוצע ${history.sugarAvg}` : ` avg sugar ${history.sugarAvg}`) : '';
        const condLine = (dp?.conditions || []).join(',') || (isHeDp ? 'אין' : 'none');
        const prefs = dp?.dietPrefs || [];
        const isVegan = prefs.some(p => p==='vegan' || /vegan|טבעוני/i.test(p));
        const isVeg = isVegan || prefs.some(p => p==='veg' || /vegetarian|צמחוני/i.test(p));
        const isGF = prefs.some(p => p==='gf' || /gluten|גלוטן/i.test(p));
        const isLF = prefs.some(p => p==='lf' || /lactose|לקטוז/i.test(p));
        const dietRuleHe = [
          isVegan ? '🚫 טבעוני: אסור לחלוטין בשר, עוף, דגים, פירות ים, ביצים, חלב, גבינה, יוגורט, דבש וכל מוצר מן החי.' : '',
          (!isVegan && isVeg) ? '🚫 צמחוני: אסור בשר, עוף, דגים ופירות ים. מותר ביצים ומוצרי חלב.' : '',
          isGF ? '🚫 ללא גלוטן: אסור חיטה, לחם, פסטה, שיבולת שועל רגילה.' : '',
          isLF ? '🚫 ללא לקטוז: אסור חלב, גבינה, יוגורט רגיל.' : '',
        ].filter(Boolean).join(' ');
        const dietRuleEn = [
          isVegan ? '🚫 VEGAN STRICT: FORBIDDEN — meat, poultry, fish, seafood, eggs, milk, cheese, yogurt, honey. ALL animal products forbidden.' : '',
          (!isVegan && isVeg) ? '🚫 VEGETARIAN STRICT: FORBIDDEN — meat, poultry, fish, seafood. Eggs and dairy are allowed.' : '',
          isGF ? '🚫 GLUTEN-FREE: FORBIDDEN — wheat, bread, pasta, regular oats.' : '',
          isLF ? '🚫 LACTOSE-FREE: FORBIDDEN — milk, cheese, regular yogurt.' : '',
        ].filter(Boolean).join(' ');
        const guideHe = (dp?.conditions||[]).includes('t2d')||(dp?.conditions||[]).includes('prediab') ? 'ADA: פחמ׳ נמוך GI. ' : '';
        const guideEn = (dp?.conditions||[]).includes('t2d')||(dp?.conditions||[]).includes('prediab') ? 'ADA: low GI carbs. ' : '';
        // Calculate per-meal macro targets that sum to daily goal
        const tKcal = dp?.maxKcal||1800, tCarbs = dp?.maxCarbs||130, tProt = dp?.maxProtein||90;
        const tFat = Math.round(tKcal * 0.28 / 9);
        // Split: breakfast 25%, snack 8%, lunch 35%, snack 8%, dinner 24%
        const mKcal  = [Math.round(tKcal*.25), Math.round(tKcal*.08), Math.round(tKcal*.35), Math.round(tKcal*.08), Math.round(tKcal*.24)];
        const mCarbs = [Math.round(tCarbs*.22), Math.round(tCarbs*.09), Math.round(tCarbs*.35), Math.round(tCarbs*.09), Math.round(tCarbs*.25)];
        const mProt  = [Math.round(tProt*.22),  Math.round(tProt*.09),  Math.round(tProt*.35),  Math.round(tProt*.09),  Math.round(tProt*.25)];
        const mFat   = [Math.round(tFat*.22),   Math.round(tFat*.09),   Math.round(tFat*.35),   Math.round(tFat*.09),   Math.round(tFat*.25)];
        const schemaHe=`{"meals":[{"type":"breakfast","label":"ארוחת בוקר","time":"07:00-09:00","targetKcal":${mKcal[0]},"targetCarbs":${mCarbs[0]},"targetProtein":${mProt[0]},"targetFat":${mFat[0]},"ideas":[],"note":""},{"type":"morning_snack","label":"ביניים בוקר","time":"10:30","targetKcal":${mKcal[1]},"targetCarbs":${mCarbs[1]},"targetProtein":${mProt[1]},"targetFat":${mFat[1]},"ideas":[],"note":""},{"type":"lunch","label":"ארוחת צהריים","time":"12:30-14:00","targetKcal":${mKcal[2]},"targetCarbs":${mCarbs[2]},"targetProtein":${mProt[2]},"targetFat":${mFat[2]},"ideas":[],"note":""},{"type":"afternoon_snack","label":"ביניים","time":"16:00","targetKcal":${mKcal[3]},"targetCarbs":${mCarbs[3]},"targetProtein":${mProt[3]},"targetFat":${mFat[3]},"ideas":[],"note":""},{"type":"dinner","label":"ארוחת ערב","time":"19:00-20:30","targetKcal":${mKcal[4]},"targetCarbs":${mCarbs[4]},"targetProtein":${mProt[4]},"targetFat":${mFat[4]},"ideas":[],"note":""}],"insight":"","totalKcal":${tKcal},"totalCarbs":${tCarbs},"totalProtein":${tProt},"totalFat":${tFat}}`;
        const schemaEn=`{"meals":[{"type":"breakfast","label":"Breakfast","time":"7:00-9:00","targetKcal":${mKcal[0]},"targetCarbs":${mCarbs[0]},"targetProtein":${mProt[0]},"targetFat":${mFat[0]},"ideas":[],"note":""},{"type":"morning_snack","label":"Morning Snack","time":"10:30","targetKcal":${mKcal[1]},"targetCarbs":${mCarbs[1]},"targetProtein":${mProt[1]},"targetFat":${mFat[1]},"ideas":[],"note":""},{"type":"lunch","label":"Lunch","time":"12:30-2:00","targetKcal":${mKcal[2]},"targetCarbs":${mCarbs[2]},"targetProtein":${mProt[2]},"targetFat":${mFat[2]},"ideas":[],"note":""},{"type":"afternoon_snack","label":"Afternoon Snack","time":"4:00-5:00","targetKcal":${mKcal[3]},"targetCarbs":${mCarbs[3]},"targetProtein":${mProt[3]},"targetFat":${mFat[3]},"ideas":[],"note":""},{"type":"dinner","label":"Dinner","time":"7:00-8:30","targetKcal":${mKcal[4]},"targetCarbs":${mCarbs[4]},"targetProtein":${mProt[4]},"targetFat":${mFat[4]},"ideas":[],"note":""}],"insight":"","totalKcal":${tKcal},"totalCarbs":${tCarbs},"totalProtein":${tProt},"totalFat":${tFat}}`;
        prompt = isHeDp
          ? `פרופיל: גיל ${dp?.age||'?'}, ${gHe}${bmi?`, BMI ${bmi}`:''}, מצבים: ${condLine}. יעד: ${tKcal}קק"ל/${tCarbs}g פחמ'/${tProt}g חלבון.${dietRuleHe?' הגבלות: '+dietRuleHe:''} ${guideHe}היסטוריה ${history?.days||0}ד: ממוצע ${history?.avgKcal||0}קק"ל, מזונות: ${foodList||'אין'}.${sugarNote}\nמלא ideas(2-3 אפשרויות בעברית) ו-insight, שמור שאר המספרים:\n${schemaHe}`
          : `Profile: age ${dp?.age||'?'}, ${dp?.gender||'?'}${bmi?`, BMI ${bmi}`:''}, conditions: ${condLine}. Targets: ${tKcal}kcal/${tCarbs}g carbs/${tProt}g protein.${dietRuleEn?' Rules: '+dietRuleEn:''} ${guideEn}History ${history?.days||0}d: avg ${history?.avgKcal||0}kcal, foods: ${foodList||'none'}.${sugarNote}\nFill ideas(2-3 options) and insight, keep all numbers:\n${schemaEn}`;
        // Stream from Anthropic — avoids Cloudflare's 30s subrequest timeout.
        // With stream:true, Anthropic returns HTTP headers + first SSE event within ~1-2s,
        // so the fetch() promise resolves immediately and body streams progressively.
        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {'Content-Type':'application/json','x-api-key':env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},
          body: JSON.stringify({model, max_tokens, system, messages:[{role:'user',content:prompt}], stream:true})
        });
        if (!anthropicRes.ok) {
          const errTxt = await anthropicRes.text();
          return new Response(JSON.stringify({error:'API error: '+errTxt}), {status:502,headers:{...cors,'Content-Type':'application/json'}});
        }
        const {readable, writable} = new TransformStream();
        const writer = writable.getWriter();
        const enc = new TextEncoder();
        (async () => {
          try {
            const reader = anthropicRes.body.getReader();
            const dec = new TextDecoder();
            let buf = '', txt = '';
            while (true) {
              const {done, value} = await reader.read();
              if (done) break;
              buf += dec.decode(value, {stream: true});
              const lines = buf.split('\n');
              buf = lines.pop() || '';
              for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const d = line.slice(6).trim();
                if (d === '[DONE]') continue;
                try {
                  const ev = JSON.parse(d);
                  if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') txt += ev.delta.text;
                } catch (_) {}
              }
            }
            let jsonStr = null, depth = 0, start = -1;
            for (let i = 0; i < txt.length; i++) {
              const c = txt[i];
              if (c === '{') { if (depth === 0) start = i; depth++; }
              else if (c === '}' && depth > 0) { depth--; if (depth === 0) { jsonStr = txt.slice(start, i+1); break; } }
            }
            if (!jsonStr) jsonStr = txt.replace(/```json|```/g, '').trim();
            await writer.write(enc.encode(JSON.stringify(JSON.parse(jsonStr))));
          } catch (e) {
            await writer.write(enc.encode(JSON.stringify({error: e.message})));
          } finally {
            await writer.close();
          }
        })();
        return new Response(readable, {headers: {...cors, 'Content-Type': 'application/json'}});
      } else if (profileData) {
        model = 'claude-sonnet-4-6';
        max_tokens = 2000;
        system = 'אתה תזונאי קליני ורופא משפחה מומחה. אתה מכיר היטב את הנחיות האיגודים הרפואיים הישראליים והבינלאומיים. ענה בעברית בלבד. החזר JSON בלבד ללא markdown.';
        const {age, gender, height, weight, conditions=[], dietPrefs=[], activity='moderate', activityText='', goals=[]} = profileData;
        const bmi = (weight && height) ? (weight / Math.pow(height/100, 2)).toFixed(1) : null;
        const genderHe = gender==='female'?'נקבה':gender==='male'?'זכר':'אחר';
        const actMap = {sedentary:'יושבני (ללא פעילות)',light:'קל (1-2×/שבוע)',moderate:'מתון (3-4×/שבוע)',active:'פעיל (5+×/שבוע)',very_active:'ספורטאי (יומי)'};
        prompt = `חשב יעדים תזונתיים יומיים מותאמים אישית:

גיל: ${age||'לא צוין'}, מין: ${genderHe}
גובה: ${height||'לא צוין'}ס"מ, משקל: ${weight||'לא צוין'}ק"ג${bmi?`, BMI: ${bmi}`:''}
בעיות רפואיות: ${conditions.length?conditions.join(', '):'אין'}
העדפות תזונה: ${dietPrefs.length?dietPrefs.join(', '):'אין'}
רמת פעילות: ${actMap[activity]||activity}${activityText?`\nסוג פעילות ומשך: ${activityText}`:''}
יעדים: ${goals.length?goals.join(', '):'בריאות כללית'}

חשב BMR לפי Mifflin-St Jeor, הכפל במקדם פעילות מתאים, והתאם לפי היעדים.
אם יש פירוט פעילות (סוג, משך, תדירות) — השתמש בו לחישוב מדויק יותר של TDEE: כמה קלוריות שורפים בפועל לפי סוג הפעילות והמשך שלה.
בסס על: ADA/IDF (סוכרת), NAMS/EMAS (גיל המעבר), ESC/AHA (לב), WHO, ואיגוד התזונה הישראלי.
ספק 3-5 מקורות עם קישורים אמיתיים.

החזר JSON בלבד:
{"kcal":מספר,"carbs":מספר,"protein":מספר,"fat":מספר,"explanation":"הסבר 3-4 משפטים בעברית","sources":[{"title":"שם המקור","url":"https://..."}]}`;
      } else {
        model = 'claude-haiku-4-5-20251001';
        max_tokens = 300;
        system = 'You are a nutrition database. Respond with ONLY a valid JSON object, no markdown, no explanation.';
        prompt = `Nutritional values per 100g for: ${foodName}
Return exactly this JSON structure:
{"name":"Hebrew name","label":"emoji + Hebrew name","names":["Hebrew","English"],"kcal":0,"carbs":0,"protein":0,"fat":0,"unit":"g","defaultAmt":100}`;
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model, max_tokens, system,
          messages: messages || [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        const err = await response.text();
        return new Response(JSON.stringify({ error: 'Claude API error: ' + err }), {
          status: 502,
          headers: { ...cors, 'Content-Type': 'application/json' }
        });
      }

      const data = await response.json();
      const text = data.content[0].text.trim();
      // Extract first complete JSON object using bracket counting
      let jsonStr = null, depth = 0, start = -1;
      for(let i = 0; i < text.length; i++){
        const c = text[i];
        if(c==='{'){if(depth===0)start=i; depth++;}
        else if(c==='}' && depth>0){depth--; if(depth===0){jsonStr=text.slice(start,i+1);break;}}
      }
      if(!jsonStr) jsonStr = text.replace(/```json|```/g,'').trim();
      const json = JSON.parse(jsonStr);

      return new Response(JSON.stringify(json), {
        headers: { ...cors, 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }
  }
};
