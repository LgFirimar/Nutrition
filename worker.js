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

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: cors });
    }

    try {
      const { foodName, mealDescription, imageData, imageMediaType, mealPlan, shoppingList, pantryImageData, pantryImageMediaType, pantryBulkData, pantryBulkMediaType, dbEditText, dbEditImageData, dbEditImageMediaType, profileData } = await request.json();

      let prompt, model, system, max_tokens, messages;
      if (pantryBulkData) {
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
        messages = [{role:'user', content:[
          {type:'image', source:{type:'base64', media_type:dbEditImageMediaType||'image/jpeg', data:dbEditImageData}},
          {type:'text', text:'Calculate nutritional values for the total food visible in this image as 1 serving.\nReturn ONLY this JSON on the last line: {"label":"emoji + שם בעברית","kcal":0,"carbs":0,"protein":0,"fat":0}'}
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
        const analysisPrompt = `Analyze this food photo carefully.

Step 1 — identify each food item visible.
Step 2 — estimate each item's weight in grams using visual cues: plate/bowl diameter, food thickness, density, standard portion sizes (e.g. a whole chicken breast ≈ 160-200g, a cup of cooked rice ≈ 180g, a medium apple ≈ 180g, a slice of bread ≈ 30g).
Step 3 — sum the weights to get totalGrams (solid food only; exclude water/plain tea/coffee unless they ARE the main item).
Step 4 — calculate total nutrition, then divide by totalGrams×0.01 to get per100g values.
Step 5 — check if the photo shows a nutrition label or packaging with serving size expressed in "pieces" or "pcs" or similar. If so, set piecesCount to that number (e.g. "serving size: 5 pieces" → piecesCount:5, totalGrams = grams for those 5 pieces). Otherwise piecesCount:0.

Output ONLY this JSON on the very last line (no markdown):
{"label":"Hebrew meal name","kcal":TOTAL_INT,"carbs":TOTAL_FLOAT,"protein":TOTAL_FLOAT,"fat":TOTAL_FLOAT,"totalGrams":ESTIMATED_TOTAL_GRAMS_INT,"per100g":{"kcal":INT,"carbs":FLOAT,"protein":FLOAT,"fat":FLOAT},"portions":"Hebrew list: item ~Xg, e.g: עוף ~160g, אורז ~90g, שמן ~10ml","suggestedAmt":NATURAL_AMOUNT_NUMBER,"suggestedUnit":"natural unit: קוביות if photo shows pieces/pcs count, יח׳ if countable whole items (e.g. 2 cookies), g if weighed, מנות if a full meal","piecesCount":NUMBER}
For suggestedAmt/suggestedUnit: if photo has a nutrition label saying X pieces, use suggestedUnit=קוביות and suggestedAmt=X and piecesCount=X. For regular countable items use יח׳. For weighed food use g.`;
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
        const { preferences, people, refine, selectedMeal } = mealPlan;
        if (selectedMeal) {
          model = 'claude-sonnet-4-6';
          max_tokens = 900;
          system = 'אתה שף ותזונאי ישראלי. ענה בעברית תקנית. הפלט שלך הוא JSON בלבד — ללא הסבר, ללא markdown, ללא טקסט לפני או אחרי.';
          prompt = `כתוב מתכון עבור "${selectedMeal}" ל-${people} אנשים. עד 6 רכיבים, עד 4 שלבים.
{"recipe":{"name":"שם בעברית","ingredients":[{"item":"שם חומר","amount":"כמות"}],"steps":["שלב הכנה"],"kcalPerPerson":0,"carbsPerPerson":0,"proteinPerPerson":0,"fatPerPerson":0}}`;
        } else {
          model = 'claude-sonnet-4-6';
          max_tokens = 1100;
          system = 'אתה שף ותזונאי ישראלי. כתוב בעברית תקנית ונכונה. הפלט הוא JSON בלבד — ללא הסבר, ללא markdown, ללא טקסט לפני או אחרי.';
          const refineText = refine ? `\nהערות: ${refine}` : '';
          prompt = `הצע 3 ארוחות שונות ל-${people} אנשים. העדפות: ${preferences || 'ללא הגבלות'}${refineText}

חוקים לשדה ingredients (חובה בכל אפשרות!):
- רשום בדיוק 4-6 שמות מרכיבים עיקריים — שמות עצם של מצרכים בלבד
- דוגמאות טובות: "חזה עוף", "אורז", "עגבניות", "גבינה צהובה", "סלמון", "פסטה", "עדשים"
- אל תכלול: שמן, מלח, פלפל, מים, שום, בצל, חמאה, חומץ (מרכיבי בסיס)
- אל תכלול: כמויות, שיטות בישול, תארים

החזר JSON בלבד, בדיוק בפורמט הזה (ingredients חייב להיות נוכח בכל אפשרות):
{"options":[{"name":"שם ארוחה","description":"תיאור קצר","ingredients":["מרכיב1","מרכיב2","מרכיב3","מרכיב4"],"kcalPerPerson":0,"carbsPerPerson":0,"proteinPerPerson":0}]}`;
        }
      } else if (shoppingList) {
        model = 'claude-haiku-4-5-20251001';
        max_tokens = 600;
        system = 'אתה עוזר לתכנון קניות בסופר. ענה בעברית. החזר JSON בלבד, ללא הסבר.';
        const {pantry, recentFoods, isHe} = shoppingList;
        prompt = `המשתמש אכל לאחרונה: ${(recentFoods||[]).join(', ')||'לא ידוע'}.
במזווה/מקרר יש: ${pantry||'ריק'}.
הצע 6-10 פריטים לקנות בסופר — עדיפות לפריטים שחסרים במזווה ומופיעים בהרגלי האכילה.
{"items":[{"name":"שם מוצר","qty":"כמות מומלצת"}]}`;
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
