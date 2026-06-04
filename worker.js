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
      const { foodName, mealDescription } = await request.json();

      let prompt, model;
      if (mealDescription) {
        model = 'claude-sonnet-4-6';
        prompt = `You are a precise nutrition calculator. Calculate the TOTAL nutritional values for ALL ingredients in this meal combined.
Use standard nutritional databases. Be accurate with portion sizes — tablespoons of oil, grams of tofu, etc. all contribute significant calories.
Do NOT underestimate. Sum every ingredient carefully.

Meal: ${mealDescription}

Return ONLY this JSON (total for ALL ingredients combined, not per 100g):
{"label":"short Hebrew meal name","kcal":0,"carbs":0,"protein":0,"fat":0}`;
      } else {
        model = 'claude-haiku-4-5-20251001';
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
          model,
          max_tokens: 300,
          system: 'You are a nutrition database. Respond with ONLY a valid JSON object, no markdown, no explanation.',
          messages: [{ role: 'user', content: prompt }]
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
      const json = JSON.parse(text.replace(/```json|```/g, '').trim());

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
