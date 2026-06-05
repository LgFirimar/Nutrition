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
      const { foodName, mealDescription, imageData, imageMediaType, mealPlan } = await request.json();

      let prompt, model, system, max_tokens, messages;
      if (imageData) {
        model = 'claude-sonnet-4-6';
        max_tokens = 1024;
        system = 'You are a precise nutrition calculator with expert knowledge of food composition databases.';
        const analysisPrompt = `Analyze this food photo. For each visible item:
1. Identify the food
2. Estimate its weight/portion from visual cues (plate size, standard portions, density, etc.)
3. Calculate its nutritional contribution

Be specific with estimates (e.g. "chicken breast ~160g", "rice ~90g cooked", "olive oil drizzle ~10ml").

Output ONLY this JSON on the very last line (no markdown):
{"label":"Hebrew meal name","kcal":0,"carbs":0,"protein":0,"fat":0,"portions":"brief Hebrew description of each item with estimated weight, e.g: עוף ~160g, אורז ~90g, שמן ~10ml"}`;
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
        model = 'claude-sonnet-4-6';
        max_tokens = 2048;
        system = 'אתה תזונאי ושף מנוסה. ענה תמיד בעברית. החזר JSON תקין בלבד בשורה האחרונה, ללא markdown.';
        const { preferences, people, refine, selectedMeal } = mealPlan;
        if (selectedMeal) {
          prompt = `תכנן מתכון מפורט עבור "${selectedMeal}" ל-${people} אנשים.
השתמש במדידות מטריות בלבד (גרם, מ"ל, כפות).
החזר JSON בשורה האחרונה:
{"recipe":{"name":"שם","ingredients":[{"item":"חומר","amount":"כמות"}],"steps":["שלב 1"],"kcalPerPerson":0,"carbsPerPerson":0,"proteinPerPerson":0,"fatPerPerson":0}}`;
        } else {
          const refineText = refine ? `\n\nהערות לשיפור: ${refine}` : '';
          prompt = `הצע 3 אפשרויות ארוחה עבור ${people} אנשים.
העדפות: ${preferences || 'ללא הגבלות מיוחדות'}${refineText}
לכל אפשרות תן הערכה תזונתית לאדם אחד.
החזר JSON בשורה האחרונה:
{"options":[{"name":"שם","description":"תיאור קצר","kcalPerPerson":0,"carbsPerPerson":0,"proteinPerPerson":0}]}`;
        }
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
      // Extract last JSON object — handles nested structures (options, recipe)
      const lastBrace = text.lastIndexOf('{');
      const jsonStr = lastBrace >= 0 ? text.slice(lastBrace) : text.replace(/```json|```/g, '').trim();
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
