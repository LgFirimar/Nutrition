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
      const { foodName, mealDescription, imageData, imageMediaType, mealPlan, shoppingList, pantryImageData, pantryImageMediaType, dbEditText, dbEditImageData, dbEditImageMediaType } = await request.json();

      let prompt, model, system, max_tokens, messages;
      if (pantryImageData) {
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
        const analysisPrompt = `Analyze this food photo. For each visible item:
1. Identify the food
2. Estimate its weight/portion from visual cues (plate size, standard portions, density, etc.)
3. Calculate its nutritional contribution

Be specific with estimates (e.g. "chicken breast ~160g", "rice ~90g cooked", "olive oil drizzle ~10ml").

Output ONLY this JSON on the very last line (no markdown):
{"label":"Hebrew meal name","kcal":0,"carbs":0,"protein":0,"fat":0,"totalGrams":total_estimated_weight_int,"portions":"brief Hebrew description of each item with estimated weight, e.g: עוף ~160g, אורז ~90g, שמן ~10ml"}`;
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
          max_tokens = 600;
          system = 'אתה שף ותזונאי ישראלי. כתוב בעברית תקנית ונכונה. הפלט הוא JSON בלבד — ללא הסבר, ללא markdown, ללא טקסט לפני או אחרי.';
          const refineText = refine ? `\nהערות: ${refine}` : '';
          prompt = `הצע 3 ארוחות ל-${people} אנשים. העדפות: ${preferences || 'ללא הגבלות'}${refineText}
{"options":[{"name":"שם ארוחה","description":"תיאור קצר בעברית","kcalPerPerson":0,"carbsPerPerson":0,"proteinPerPerson":0}]}`;
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
