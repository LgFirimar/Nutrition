// ── Nutrition domain: food data, search, calculations, colors ─────────────────
// Moved out of App.jsx as part of splitting the 6000+ line single-file component
// into modules. Pure cut-and-paste — no behavior changes.
import { ls, loadJournal, loadCustomDB } from './storage.js';

// ── Food DB ────────────────────────────────────────────────────────────────────
export const FOOD_DB = [
  {names:["בננה","banana"],label:"🍌 בננה",kcal:89,carbs:23,protein:1.1,fat:0.3,defaultAmt:120,unit:"g"},
  {names:["תפוח","apple"],label:"🍎 תפוח",kcal:52,carbs:14,protein:0.3,fat:0.2,defaultAmt:150,unit:"g"},
  {names:["תות","תותים","strawberry"],label:"🍓 תותים",kcal:32,carbs:7.7,protein:0.7,fat:0.3,defaultAmt:100,unit:"g"},
  {names:["אבוקדו","avocado"],label:"🥑 אבוקדו",kcal:160,carbs:9,protein:2,fat:15,defaultAmt:80,unit:"g"},
  {names:["ענבים","grape"],label:"🍇 ענבים",kcal:67,carbs:17,protein:0.6,fat:0.4,defaultAmt:100,unit:"g"},
  {names:["מנגו","mango"],label:"🥭 מנגו",kcal:60,carbs:15,protein:0.8,fat:0.4,defaultAmt:150,unit:"g"},
  {names:["אגס","pear"],label:"🍐 אגס",kcal:57,carbs:15,protein:0.4,fat:0.1,defaultAmt:160,unit:"g"},
  {names:["אפרסק","peach"],label:"🍑 אפרסק",kcal:39,carbs:10,protein:0.9,fat:0.3,defaultAmt:130,unit:"g"},
  {names:["תמר","dates"],label:"🌴 תמר",kcal:277,carbs:75,protein:1.8,fat:0.2,defaultAmt:30,unit:"g"},
  {names:["בלוברי","אוכמניות"],label:"🫐 אוכמניות",kcal:57,carbs:14,protein:0.7,fat:0.3,defaultAmt:80,unit:"g"},
  {names:["גזר","carrot"],label:"🥕 גזר",kcal:41,carbs:10,protein:0.9,fat:0.2,defaultAmt:80,unit:"g"},
  {names:["מלפפון","cucumber"],label:"🥒 מלפפון",kcal:15,carbs:3.6,protein:0.7,fat:0.1,defaultAmt:150,unit:"g"},
  {names:["עגבניה","עגבנייה","tomato"],label:"🍅 עגבניה",kcal:18,carbs:3.9,protein:0.9,fat:0.2,defaultAmt:120,unit:"g"},
  {names:["פלפל אדום","red pepper"],label:"🌶 פלפל אדום",kcal:31,carbs:7.5,protein:1,fat:0.3,defaultAmt:100,unit:"g"},
  {names:["ברוקולי","broccoli"],label:"🥦 ברוקולי",kcal:34,carbs:7,protein:2.8,fat:0.4,defaultAmt:100,unit:"g"},
  {names:["תרד","spinach"],label:"🥬 תרד",kcal:23,carbs:3.6,protein:2.9,fat:0.4,defaultAmt:80,unit:"g"},
  {names:["ביצה","egg"],label:"🥚 ביצה",kcal:155,carbs:1.1,protein:13,fat:11,defaultAmt:55,unit:"g"},
  {names:["טופו","tofu"],label:"🧊 טופו",kcal:76,carbs:1.9,protein:8,fat:4.2,defaultAmt:100,unit:"g"},
  {names:["קוטג׳","cottage"],label:"🧀 קוטג׳",kcal:98,carbs:3.4,protein:11,fat:4.3,defaultAmt:100,unit:"g"},
  {names:["גבינה צהובה","yellow cheese","צ׳דר"],label:"🧀 גבינה צהובה",kcal:402,carbs:1.3,protein:25,fat:33,defaultAmt:30,unit:"g"},
  {names:["גבינת עיזים","goat cheese"],label:"🧀 גבינת עיזים",kcal:364,carbs:0.1,protein:22,fat:30,defaultAmt:30,unit:"g"},
  {names:["פטה","feta"],label:"🧀 פטה",kcal:264,carbs:4,protein:14,fat:21,defaultAmt:30,unit:"g"},
  {names:["בורטה","burrata"],label:"🧀 בורטה",kcal:300,carbs:1,protein:18,fat:25,defaultAmt:60,unit:"g"},
  {names:["טונה","tuna"],label:"🐟 טונה (שימור)",kcal:116,carbs:0,protein:26,fat:1,defaultAmt:80,unit:"g"},
  {names:["סלמון","salmon"],label:"🐟 סלמון",kcal:208,carbs:0,protein:20,fat:13,defaultAmt:120,unit:"g"},
  {names:["פריקי מבושל","פריקי","freekeh"],label:"🌾 פריקי מבושל",kcal:130,carbs:28,protein:5,fat:1,defaultAmt:150,unit:"g"},
  {names:["עדשים שחורות","עדשים בלוגה","black lentils","beluga"],label:"🫘 עדשים שחורות",kcal:116,carbs:20,protein:9,fat:0.4,defaultAmt:150,unit:"g"},
  {names:["עדשים כתומות","red lentils","עדשים אדומות"],label:"🫘 עדשים כתומות",kcal:116,carbs:20,protein:9,fat:0.4,defaultAmt:150,unit:"g"},
  {names:["עדשים ירוקות","green lentils"],label:"🫘 עדשים ירוקות",kcal:116,carbs:20,protein:9,fat:0.4,defaultAmt:150,unit:"g"},
  {names:["שעועית מש","מש","mung beans"],label:"🫘 שעועית מש",kcal:105,carbs:19,protein:7,fat:0.4,defaultAmt:150,unit:"g"},
  {names:["חומוס","hummus"],label:"🫘 חומוס ממרח",kcal:166,carbs:14,protein:8,fat:10,defaultAmt:50,unit:"g"},
  {names:["שעועית שחורה","black beans"],label:"🫘 שעועית שחורה",kcal:132,carbs:24,protein:8.9,fat:0.5,defaultAmt:150,unit:"g"},
  {names:["גרגירי חומוס","chickpeas"],label:"🫘 גרגירי חומוס",kcal:164,carbs:27,protein:8.9,fat:2.6,defaultAmt:150,unit:"g"},
  {names:["קינואה","quinoa"],label:"🌾 קינואה מבושלת",kcal:120,carbs:22,protein:4.1,fat:1.9,defaultAmt:150,unit:"g"},
  {names:["אורז","rice"],label:"🍚 אורז מבושל",kcal:130,carbs:28,protein:2.7,fat:0.3,defaultAmt:150,unit:"g"},
  {names:["פסטה","pasta"],label:"🍝 פסטה מבושלת",kcal:131,carbs:25,protein:5,fat:1.1,defaultAmt:180,unit:"g"},
  {names:["לחם","bread"],label:"🍞 לחם",kcal:265,carbs:49,protein:9,fat:3.2,defaultAmt:30,unit:"g"},
  {names:["שיבולת שועל","oats","שיבולת"],label:"🥣 שיבולת שועל",kcal:389,carbs:66,protein:17,fat:7,defaultAmt:40,unit:"g"},
  {names:["שמן זית","olive oil"],label:"🫒 שמן זית",kcal:884,carbs:0,protein:0,fat:100,defaultAmt:10,unit:"g"},
  {names:["שקדים","almonds"],label:"🌰 שקדים",kcal:579,carbs:22,protein:21,fat:50,defaultAmt:30,unit:"g"},
  {names:["אגוזי מלך","walnuts"],label:"🌰 אגוזי מלך",kcal:654,carbs:14,protein:15,fat:65,defaultAmt:30,unit:"g"},
  {names:["טחינה","tahini"],label:"🫙 טחינה גולמית",kcal:595,carbs:22,protein:17,fat:54,defaultAmt:15,unit:"g"},
  {names:["חלב","milk"],label:"🥛 חלב 2%",kcal:50,carbs:4.7,protein:3.4,fat:2,defaultAmt:200,unit:"ml"},
  {names:["יוגורט","yogurt","יוגורט יווני"],label:"🥛 יוגורט יווני",kcal:97,carbs:6,protein:9,fat:5,defaultAmt:150,unit:"g"},
  {names:["שמנת חמוצה","sour cream"],label:"🥛 שמנת חמוצה 5%",kcal:80,carbs:3.4,protein:2.7,fat:5,defaultAmt:30,unit:"g"},
  {names:["קפה שחור","coffee"],label:"☕ קפה שחור",kcal:2,carbs:0,protein:0.3,fat:0,defaultAmt:200,unit:"ml"},
  {names:["מיץ תפוזים","orange juice"],label:"🍊 מיץ תפוזים",kcal:45,carbs:10,protein:0.7,fat:0.2,defaultAmt:200,unit:"ml"},
  {names:["שוקולד מריר","dark chocolate"],label:"🍫 שוקולד מריר",kcal:546,carbs:60,protein:5,fat:31,defaultAmt:20,unit:"g"},
  {names:["דבש","honey"],label:"🍯 דבש",kcal:304,carbs:82,protein:0.3,fat:0,defaultAmt:10,unit:"g"},
  {names:["פופקורן","popcorn"],label:"🍿 פופקורן",kcal:387,carbs:78,protein:13,fat:4.5,defaultAmt:30,unit:"g"},
  {names:["חמאת בוטנים","peanut butter"],label:"🥜 חמאת בוטנים",kcal:588,carbs:20,protein:25,fat:50,defaultAmt:15,unit:"g"},
  {names:["יין לבן","white wine"],label:"🥂 יין לבן",kcal:81,carbs:2.6,protein:0.1,fat:0,defaultAmt:150,unit:"ml"},
  {names:["יין אדום","red wine"],label:"🍷 יין אדום",kcal:85,carbs:2.6,protein:0.1,fat:0,defaultAmt:150,unit:"ml"},
  {names:["בירה","beer"],label:"🍺 בירה",kcal:43,carbs:3.6,protein:0.5,fat:0,defaultAmt:330,unit:"ml"},
];

export const getRecentFoodLabels=(pid,days=7)=>{
  const j=loadJournal(pid||"default");
  const labels=new Set();
  for(let i=0;i<days;i++){
    const d=new Date();d.setDate(d.getDate()-i);
    const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    (j[k]?.entries||[]).forEach(e=>e.label&&labels.add(e.label.replace(/🍳|🍽|🥚|🧀|🥑|🍌|🥗/g,'').replace(/\(.*?\)/g,'').trim()));
  }
  return [...labels].filter(Boolean).slice(0,30);
};

export const DAYS = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
export const getDateLabel = s => {
  let d;
  if (s) {
    const [y,m,day] = s.split('-').map(Number);
    d = new Date(y, m-1, day);
  } else {
    d = new Date();
  }
  const lang=localStorage.getItem('nutrition_lang')||'he';
  if(lang==='en') return d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  return `יום ${DAYS[d.getDay()]}, ${d.toLocaleDateString("he-IL")}`;
};
export const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

export const cleanQ = s => s.replace(/[^֐-׿\w\s]/g,'').trim().toLowerCase();
export const loadRecentFoods=()=>ls.get(`nutrition_recent_${window._activePid||"default"}`)||[];
export const addToRecentFoods=(food)=>{
  const pid=window._activePid||"default";
  const cur=ls.get(`nutrition_recent_${pid}`)||[];
  const updated=[{label:food.label,kcal:food.kcal,carbs:food.carbs,protein:food.protein,fat:food.fat||0},...cur.filter(f=>f.label!==food.label)].slice(0,5);
  ls.set(`nutrition_recent_${pid}`,updated);
};

export function searchFood(q) {
  const query = cleanQ(q);
  if (!query) return null;
  const customDB = loadCustomDB(window._activePid||"default");
  for (const f of [...customDB, ...FOOD_DB]) {
    if (f.names.some(n => n.toLowerCase() === query)) return f;
  }
  if (query.includes("+") || query.split(/\s+/).length > 4) return null;
  for (const f of [...customDB, ...FOOD_DB]) {
    if (f.names.some(n => n.toLowerCase().startsWith(query) || n.toLowerCase().includes(query))) return f;
  }
  return null;
}

export function searchAllFoods(q) {
  const query = cleanQ(q);
  if (!query || query.length < 2) return [];
  const customDB = loadCustomDB(window._activePid||"default");
  const seen = new Set();
  const results = [];
  const add = (f, score) => { if (!seen.has(f.label)) { seen.add(f.label); results.push({f, score}); } };
  for (const f of [...customDB, ...FOOD_DB]) {
    const names = f.names.map(n => n.toLowerCase());
    if (names.some(n => n === query)) add(f, 3);
    else if (names.some(n => n.startsWith(query))) add(f, 2);
    else if (names.some(n => n.includes(query))) add(f, 1);
  }
  return results.sort((a,b) => b.score - a.score).map(r => r.f);
}
export function unitToG(amt, unit) {
  // convert spoon/cup units to grams/ml equivalent
  if(unit==="כף") return amt * 15;
  if(unit==="כפית") return amt * 5;
  if(unit==="כוס") return amt * 240;
  return amt; // g, ml, יח׳, קוביות — pass through
}
export function calcNutrition(f, amt, unit) {
  const a = unit ? unitToG(amt, unit) : amt;
  let r;
  if(f.cubes_per_bar) {
    // values are per whole bar; divide by total cubes
    r = a / f.cubes_per_bar;
  } else if(f.serving_size) {
    // values are per serving_size units
    r = a / f.serving_size;
  } else if(unit === "מנה" || unit === "serving" || f.unit === "מנה") {
    // values are already per 1 serving; use amount as direct multiplier
    r = a;
  } else {
    // values are per 100g/ml
    r = a / 100;
  }
  return { kcal:Math.round(f.kcal*r), carbs:parseFloat((f.carbs*r).toFixed(1)), protein:parseFloat((f.protein*r).toFixed(1)), fat:parseFloat((f.fat*r).toFixed(1)) };
}

export const C = { accent:"#0d9488", warn:"#d97706", danger:"#dc2626", blue:"#2563eb", muted:"#64748b", text:"#0f172a", border:"rgba(148,163,184,.25)" };
export const sugarColor = v => { const n=Number(v); return n>=100?'#dc2626':n>=86?'#f59e0b':n>0?'#15803d':'#94a3b8'; };
// Returns color based on % of daily goal: dark-green → amber → orange → red
export const goalColor=(consumed,max)=>{
  if(!max||isNaN(consumed)) return "#166534";
  const p=consumed/max;
  if(p>=0.85) return "#dc2626";
  if(p>=0.6) return "#ea580c";
  if(p>=0.35) return "#ca8a04";
  return "#166534";
};
export const goalGrad=(consumed,max)=>{
  if(!max) return ["#166534","#22c55e"];
  const p=consumed/max;
  if(p>=0.85) return ["#dc2626","#f87171"];
  if(p>=0.6) return ["#ea580c","#fb923c"];
  if(p>=0.35) return ["#ca8a04","#fbbf24"];
  return ["#166534","#22c55e"];
};
// Protein: inverted scale — red when low, green when at/near goal
export const goalColorInv=(consumed,max)=>{
  if(!max||isNaN(consumed)) return "#dc2626";
  const p=consumed/max;
  if(p>=0.85) return "#166534";
  if(p>=0.6) return "#ca8a04";
  if(p>=0.35) return "#ea580c";
  return "#dc2626";
};
export const goalGradInv=(consumed,max)=>{
  if(!max) return ["#dc2626","#f87171"];
  const p=consumed/max;
  if(p>=0.85) return ["#166534","#22c55e"];
  if(p>=0.6) return ["#ca8a04","#fbbf24"];
  if(p>=0.35) return ["#ea580c","#fb923c"];
  return ["#dc2626","#f87171"];
};
export const MAX_KCAL=1800, MAX_CARBS=80;
export const QUICK_FOODS = [
  {id:"cheese",label:"🧀 אצבע גבינה",labelEn:"🧀 Cheese Finger",kcal:60,carbs:1,protein:6,fat:3.5},
  {id:"egg_lunch",label:"🥚 לאנץ׳ ביצים",labelEn:"🥚 Egg Lunch",kcal:335,carbs:6,protein:22,fat:24},
  {id:"yolk",label:"🟡 חלמון ביצה",labelEn:"🟡 Egg Yolk",kcal:55,carbs:0.3,protein:2.7,fat:4.5},
  {id:"egg1",label:"🥚 ביצה קשה",labelEn:"🥚 Hard Boiled Egg",kcal:70,carbs:0.5,protein:6,fat:5},
  {id:"yogurt",label:"🍓 יוגורט + גרנולה ביתית",labelEn:"🍓 Yogurt + Homemade Granola",kcal:143,carbs:13.7,protein:5,fat:5},
  {id:"scone",label:"🫓 סקון בוקר",labelEn:"🫓 Morning Scone",kcal:364,carbs:52,protein:7,fat:15},
  {id:"scone_spread",label:"🍓 סקון - מריחה",labelEn:"🍓 Scone Spread",kcal:75,carbs:8,protein:0.3,fat:4},
];
export const VAR_FOODS = {
  crackers:{label:"🫙 קרקרים",labelEn:"🫙 Crackers",kcalPer100:483,carbsPer100:27,protPer100:17,fatPer100:33,def:30},
  granola:{label:"🥣 גרנולה ביתית",labelEn:"🥣 Homemade Granola",kcalPer100:500,carbsPer100:41.8,protPer100:13.6,fatPer100:33.7,def:40},
};
export const getFoodLabel = food => {
  const lang = localStorage.getItem('nutrition_lang') || 'he';
  return (lang === 'en' && food.labelEn) ? food.labelEn : food.label;
};
export const MILK={kcal:0.5,carbs:0.047,protein:0.034,fat:0.02};

// ── Pantry categories + shared AI worker endpoint ──────────────────────────────
export const API="https://nutrition-ai.lior0gal.workers.dev";
export const FRIDGE_CATS=[
  {key:"cheeses", he:"גבינות",       en:"Cheeses"},
  {key:"veggies", he:"ירקות ופירות", en:"Vegetables & Fruits"},
  {key:"protein", he:"חלבון",        en:"Protein"},
  {key:"legumes", he:"קטניות",       en:"Legumes"},
  {key:"carbs",   he:"פחמימה",       en:"Carbs"},
  {key:"nuts",    he:"פיצוחים",      en:"Nuts & Seeds"},
  {key:"spices",  he:"תבלינים",      en:"Spices"},
  {key:"other",   he:"אחר",          en:"Other"},
];
