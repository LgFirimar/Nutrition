import React, { useState, useRef, useEffect, useMemo } from 'react';
const imgUtilsReady = import('./imgUtils.js');


// ── Food DB ────────────────────────────────────────────────────────────────────
const FOOD_DB = [
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

// ── Storage ────────────────────────────────────────────────────────────────────
const ls = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)||"null"); } catch { return null; } },
  set: (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
// ── Profiles ───────────────────────────────────────────────────────────────────
const loadProfiles = () => ls.get("nutrition_profiles") || [];
const saveProfiles = p => ls.set("nutrition_profiles", p);
const loadActiveProfileId = () => ls.get("nutrition_active_profile") || "default";
const saveActiveProfileId = id => ls.set("nutrition_active_profile", id);

const pKey = (pid, k) => k + "_" + pid;
const loadJournal = (pid) => { pid=pid||"default"; return ls.get(pKey(pid,"nutrition_journal")) || {}; };
const saveJournal = (j, pid) => { pid=pid||"default"; ls.set(pKey(pid,"nutrition_journal"), j); };
const loadCustomBtns = (pid) => { pid=pid||"default"; return ls.get(pKey(pid,"nutrition_custom_btns")) || []; };
const saveCustomBtns = (b, pid) => { pid=pid||"default"; ls.set(pKey(pid,"nutrition_custom_btns"), b); };
const loadCustomDB = (pid) => { pid=pid||"default"; return ls.get(pKey(pid,"nutrition_food_db")) || []; };
const saveCustomDB = (db, pid) => { pid=pid||"default"; ls.set(pKey(pid,"nutrition_food_db"), db); };
const loadQuickFoods = (pid) => { pid=pid||"default"; return ls.get(pKey(pid,"nutrition_quick_foods")); }; // null = use defaults
const saveQuickFoods = (f, pid) => { pid=pid||"default"; ls.set(pKey(pid,"nutrition_quick_foods"), f); };

// ── Data Migration (old keys → pid-based keys) ────────────────────────────────
function migrateOldData() {
  // Run migration every time - check all possible old key formats
  const oldJournal = ls.get("nutrition_journal");
  const oldBtns = ls.get("nutrition_custom_btns");
  const oldDB = ls.get("nutrition_food_db");
  const newJournal = ls.get("nutrition_journal_default");
  const newDB = ls.get("nutrition_food_db_default");
  // migrate journal
  if (oldJournal && !newJournal) {
    saveJournal(oldJournal, "default");
  }
  // migrate custom buttons
  if (oldBtns && !ls.get("nutrition_custom_btns_default")) {
    saveCustomBtns(oldBtns, "default");
  }
  // migrate food db
  if (oldDB && !newDB) {
    saveCustomDB(oldDB, "default");
  }
  // also handle keys with _profile_ prefix
  const keys = Object.keys(localStorage);
  keys.forEach(k => {
    if(k.startsWith("nutrition_journal_profile_") || k.startsWith("nutrition_food_db_profile_")) {
      // already in new format, no action needed
    }
  });
}
migrateOldData();

// ── Pantry & Shopping helpers ─────────────────────────────────────────────────
const loadPantry=()=>{try{return JSON.parse(localStorage.getItem("nutrition_pantry")||"{}");}catch{return {};}};
const savePantryLS=p=>localStorage.setItem("nutrition_pantry",JSON.stringify(p));
const loadShopping=()=>{try{return JSON.parse(localStorage.getItem("nutrition_shopping")||"[]");}catch{return [];}};
const saveShopping=s=>localStorage.setItem("nutrition_shopping",JSON.stringify(s));
const getRecentFoodLabels=(pid,days=7)=>{
  const j=loadJournal(pid||"default");
  const labels=new Set();
  for(let i=0;i<days;i++){
    const d=new Date();d.setDate(d.getDate()-i);
    const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    (j[k]?.entries||[]).forEach(e=>e.label&&labels.add(e.label.replace(/🍳|🍽|🥚|🧀|🥑|🍌|🥗/g,'').replace(/\(.*?\)/g,'').trim()));
  }
  return [...labels].filter(Boolean).slice(0,30);
};

const DAYS = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
const getDateLabel = s => {
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
const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const cleanQ = s => s.replace(/[^֐-׿\w\s]/g,'').trim().toLowerCase();
const loadRecentFoods=()=>ls.get(`nutrition_recent_${window._activePid||"default"}`)||[];
const addToRecentFoods=(food)=>{
  const pid=window._activePid||"default";
  const cur=ls.get(`nutrition_recent_${pid}`)||[];
  const updated=[{label:food.label,kcal:food.kcal,carbs:food.carbs,protein:food.protein,fat:food.fat||0},...cur.filter(f=>f.label!==food.label)].slice(0,5);
  ls.set(`nutrition_recent_${pid}`,updated);
};

function searchFood(q) {
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

function searchAllFoods(q) {
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
function unitToG(amt, unit) {
  // convert spoon/cup units to grams/ml equivalent
  if(unit==="כף") return amt * 15;
  if(unit==="כפית") return amt * 5;
  if(unit==="כוס") return amt * 240;
  return amt; // g, ml, יח׳, קוביות — pass through
}
function calcNutrition(f, amt, unit) {
  const a = unit ? unitToG(amt, unit) : amt;
  let r;
  if(f.cubes_per_bar) {
    // values are per whole bar; divide by total cubes
    r = a / f.cubes_per_bar;
  } else if(f.serving_size) {
    // values are per serving_size units
    r = a / f.serving_size;
  } else if(unit === "מנה" || unit === "serving") {
    // values are already per 1 serving; use amount as direct multiplier
    r = a;
  } else {
    // values are per 100g/ml
    r = a / 100;
  }
  return { kcal:Math.round(f.kcal*r), carbs:parseFloat((f.carbs*r).toFixed(1)), protein:parseFloat((f.protein*r).toFixed(1)), fat:parseFloat((f.fat*r).toFixed(1)) };
}

const C = { accent:"#0d9488", warn:"#d97706", danger:"#dc2626", blue:"#2563eb", muted:"#64748b", text:"#0f172a", border:"rgba(148,163,184,.25)" };
const sugarColor = v => { const n=Number(v); return n>=100?'#dc2626':n>=86?'#f59e0b':n>0?'#15803d':'#94a3b8'; };
// Returns color based on % of daily goal: dark-green → amber → orange → red
const goalColor=(consumed,max)=>{
  if(!max||isNaN(consumed)) return "#166534";
  const p=consumed/max;
  if(p>=0.9) return "#dc2626";
  if(p>=0.6) return "#ea580c";
  if(p>=0.35) return "#ca8a04";
  return "#166534";
};
const goalGrad=(consumed,max)=>{
  if(!max) return ["#166534","#22c55e"];
  const p=consumed/max;
  if(p>=0.9) return ["#dc2626","#f87171"];
  if(p>=0.6) return ["#ea580c","#fb923c"];
  if(p>=0.35) return ["#ca8a04","#fbbf24"];
  return ["#166534","#22c55e"];
};
const MAX_KCAL=1800, MAX_CARBS=80;
const QUICK_FOODS = [
  {id:"cheese",label:"🧀 אצבע גבינה",labelEn:"🧀 Cheese Finger",kcal:60,carbs:1,protein:6,fat:3.5},
  {id:"egg_lunch",label:"🥚 לאנץ׳ ביצים",labelEn:"🥚 Egg Lunch",kcal:335,carbs:6,protein:22,fat:24},
  {id:"yolk",label:"🟡 חלמון ביצה",labelEn:"🟡 Egg Yolk",kcal:55,carbs:0.3,protein:2.7,fat:4.5},
  {id:"egg1",label:"🥚 ביצה קשה",labelEn:"🥚 Hard Boiled Egg",kcal:70,carbs:0.5,protein:6,fat:5},
  {id:"yogurt",label:"🍓 יוגורט + גרנולה ביתית",labelEn:"🍓 Yogurt + Homemade Granola",kcal:143,carbs:13.7,protein:5,fat:5},
  {id:"scone",label:"🫓 סקון בוקר",labelEn:"🫓 Morning Scone",kcal:364,carbs:52,protein:7,fat:15},
  {id:"scone_spread",label:"🍓 סקון - מריחה",labelEn:"🍓 Scone Spread",kcal:75,carbs:8,protein:0.3,fat:4},
];
const VAR_FOODS = {
  crackers:{label:"🫙 קרקרים",labelEn:"🫙 Crackers",kcalPer100:483,carbsPer100:27,protPer100:17,fatPer100:33,def:30},
  granola:{label:"🥣 גרנולה ביתית",labelEn:"🥣 Homemade Granola",kcalPer100:500,carbsPer100:41.8,protPer100:13.6,fatPer100:33.7,def:40},
};
const getFoodLabel = food => {
  const lang = localStorage.getItem('nutrition_lang') || 'he';
  return (lang === 'en' && food.labelEn) ? food.labelEn : food.label;
};
const MILK={kcal:0.5,carbs:0.047,protein:0.034,fat:0.02};

// ── StatBar ────────────────────────────────────────────────────────────────────
function StatBar({value,max,color}){
  const pct=Math.min(value/max*100,100);
  const col=pct>90?C.danger:pct>70?C.warn:color;
  return <div className="stat-bar-bg"><div className="stat-bar" style={{width:`${pct}%`,background:col}}/></div>;
}

// ── EntryRow ───────────────────────────────────────────────────────────────────
function EntryRow({entry,onRemove,onUpdate,lang}){
  const T=LANG[lang||localStorage.getItem('nutrition_lang')||'he']||LANG.he;
  const [editing,setEditing]=useState(false);
  const [qty,setQty]=useState("");
  const m=entry.label.match(/\((\d+\.?\d*)\s*([^\)]*)\)$/);
  const origQty=m?parseFloat(m[1]):null;
  const origUnit=m?m[2].trim():null;

  const applyEdit=()=>{
    const nq=parseFloat(qty);
    if(!nq||!origQty||nq===origQty){setEditing(false);return;}
    const f=nq/origQty;
    onUpdate(entry.uid,{
      label:entry.label.replace(/\(\d+\.?\d*\s*[^\)]*\)$/,`(${nq}${origUnit?" "+origUnit:""})`),
      kcal:Math.round(entry.kcal*f*10)/10,
      carbs:Math.round(entry.carbs*f*10)/10,
      protein:Math.round(entry.protein*f*10)/10,
      fat:Math.round((entry.fat||0)*f*10)/10,
    });
    setEditing(false);
  };

  const changeCount=(n)=>{
    if(!entry.perUnit||n<1)return;
    const baseLabel=entry.label.replace(/\s×\d+$/,"");
    onUpdate(entry.uid,{
      count:n,
      label:n>1?`${baseLabel} ×${n}`:baseLabel,
      kcal:Math.round(entry.perUnit.kcal*n),
      carbs:parseFloat((entry.perUnit.carbs*n).toFixed(1)),
      protein:parseFloat((entry.perUnit.protein*n).toFixed(1)),
      fat:parseFloat(((entry.perUnit.fat||0)*n).toFixed(1)),
    });
  };

  const count=entry.count||1;

  return (
    <div style={{borderBottom:"1px solid #e0e0e5",animation:"fadeIn 0.2s ease"}}>
      <div className="entry-row">
        <div style={{flex:1}}>
          <div className="entry-label">{entry.label}</div>
          <div className="entry-sub">{Math.round(entry.kcal)} {T.kcal} · {Number(entry.carbs).toFixed(1)}g {T.carbs} · {Number(entry.protein).toFixed(1)}g {T.protein}</div>
        </div>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          {entry.perUnit&&(
            <div style={{display:"flex",alignItems:"center",gap:2,background:"#f5f5f7",borderRadius:6,padding:"2px 4px"}}>
              <button onClick={()=>changeCount(count-1)} style={{background:"none",border:"none",color:count>1?C.text:"#ccc",fontSize:14,cursor:count>1?"pointer":"default",padding:"0 3px",lineHeight:1}}>−</button>
              <span style={{fontWeight:700,fontSize:12,color:C.accent,minWidth:14,textAlign:"center"}}>{count}</span>
              <button onClick={()=>changeCount(count+1)} style={{background:"none",border:"none",color:C.text,fontSize:14,cursor:"pointer",padding:"0 3px",lineHeight:1}}>+</button>
            </div>
          )}
          {origQty && <button onClick={()=>{setEditing(v=>!v);setQty(String(origQty));}} style={{background:editing?"#fff8e1":"none",border:editing?`1px solid ${C.warn}`:"none",color:editing?C.warn:C.muted,fontSize:15,cursor:"pointer",padding:"4px 6px",borderRadius:6,lineHeight:1}}>✏️</button>}
          <button onClick={()=>onRemove(entry.uid)} style={{background:"none",border:"none",color:C.muted,fontSize:18,cursor:"pointer",padding:"4px 6px",lineHeight:1}}>×</button>
        </div>
      </div>
      {editing && (
        <div className="edit-row fade">
          <div style={{fontSize:12,color:C.muted,whiteSpace:"nowrap"}}>כמות חדשה:</div>
          <input type="number" value={qty} onChange={e=>setQty(e.target.value)} onKeyDown={e=>e.key==="Enter"&&applyEdit()}
            style={{flex:1,background:"#f5f5f7",border:`1px solid ${C.warn}`,borderRadius:8,color:C.text,padding:"7px 10px",fontSize:14,fontWeight:700,textAlign:"center"}}/>
          {origUnit && <div style={{fontSize:12,color:C.muted}}>{origUnit}</div>}
          <button onClick={applyEdit} style={{background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"7px 14px",fontSize:13,fontWeight:700,cursor:"pointer"}}>עדכן</button>
        </div>
      )}
    </div>
  );
}

// ── VPopup ─────────────────────────────────────────────────────────────────────
function VPopup({label,value,setValue,step,min,kcal,carbs,onAdd}){
  return (
    <div className="vpopup fade">
      <div style={{fontSize:11,color:C.muted,marginBottom:8}}>{label}</div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <button onClick={()=>setValue(v=>Math.max(min,v-step))} style={{background:"#e8e8ec",border:"none",color:C.text,borderRadius:6,width:28,height:28,cursor:"pointer",fontSize:16}}>−</button>
        <input type="number" value={value} onChange={e=>setValue(Math.max(min,parseInt(e.target.value)||min))}
          style={{flex:1,background:"#f5f5f7",border:"1px solid #e0e0e5",borderRadius:6,color:C.text,padding:"4px 0",fontSize:15,fontWeight:700,textAlign:"center"}}/>
        <button onClick={()=>setValue(v=>v+step)} style={{background:"#e8e8ec",border:"none",color:C.text,borderRadius:6,width:28,height:28,cursor:"pointer",fontSize:16}}>+</button>
      </div>
      <div style={{fontSize:11,color:C.accent,marginBottom:8,textAlign:"center"}}>{kcal} {getT().kcal} · {carbs}g {getT().carbs}</div>
      <button onClick={onAdd} style={{width:"100%",background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"8px",fontSize:13,fontWeight:700,cursor:"pointer"}}>{getT().add}</button>
    </div>
  );
}

const loadSpecialEdits=()=>ls.get("nutrition_special_edits")||{};
const saveSpecialEdit=(id,data)=>{const e=loadSpecialEdits();ls.set("nutrition_special_edits",{...e,[id]:data});};
const getSpecialEdit=(id)=>loadSpecialEdits()[id]||null;
const loadHiddenSpecial=()=>ls.get("nutrition_hidden_special")||[];
const toggleHiddenSpecial=(id)=>{const h=loadHiddenSpecial();ls.set("nutrition_hidden_special",h.includes(id)?h.filter(x=>x!==id):[...h,id]);};
const isHiddenSpecial=(id)=>loadHiddenSpecial().includes(id);

function VarButton({foodKey,onAdd,editMode,onEdit}){
  const base=VAR_FOODS[foodKey];
  const ov=getSpecialEdit(`var_${foodKey}`);
  const food=ov?{...base,kcalPer100:ov.kcal,carbsPer100:ov.carbs,protPer100:ov.protein,fatPer100:ov.fat,label:ov.label||base.label}:base;
  const [g,setG]=useState(food.def);
  const [open,setOpen]=useState(false);
  const displayLabel=getFoodLabel(food);
  const calc=v=>({label:`${displayLabel} (${v}g)`,kcal:food.kcalPer100*v/100,carbs:food.carbsPer100*v/100,protein:food.protPer100*v/100,fat:food.fatPer100*v/100});
  return (
    <div style={{position:"relative"}}>
      <button className="chip" style={{background:open&&!editMode?"rgba(90,158,30,0.08)":"#fff",border:`1px solid ${open&&!editMode?C.accent:C.border}`,opacity:editMode?0.7:1}} onClick={()=>editMode?null:setOpen(v=>!v)}>
        <span>{displayLabel}</span>
        <span className="chip-sub">{Math.round(food.kcalPer100*g/100)} {getT().kcal} ({g}g)</span>
      </button>
      {!editMode&&open && <VPopup label={getT().howMuchG||"g?"} value={g} setValue={setG} step={5} min={5}
        kcal={Math.round(food.kcalPer100*g/100)} carbs={(food.carbsPer100*g/100).toFixed(1)}
        onAdd={()=>{onAdd(calc(g));setOpen(false);setG(food.def);}}/>}
      {editMode&&<><button onClick={()=>onEdit({id:`var_${foodKey}`,label:food.label,kcal:food.kcalPer100,carbs:food.carbsPer100,protein:food.protPer100,fat:food.fatPer100,_type:'var',_key:foodKey})}
        style={{position:"absolute",top:-4,left:-4,background:C.warn,border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✏</button>
      <button onClick={()=>{toggleHiddenSpecial(`var_${foodKey}`);onEdit(null);}}
        style={{position:"absolute",top:-4,right:-4,background:C.danger,border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>×</button></>}
    </div>
  );
}


// ── YogurtBtn ──────────────────────────────────────────────────────────────────
function YogurtBtn({onAdd,editMode,onEdit}){
  const ov=getSpecialEdit('yogurt');
  const per100=ov||{kcal:97,carbs:6,protein:9,fat:10};
  const label=(ov&&ov.label)||(getT().yogurtLabel||'🥛 יוגורט 10%');
  const [open,setOpen]=useState(false);
  const [ml,setMl]=useState(30);
  const calc={kcal:Math.round(per100.kcal/100*ml),carbs:parseFloat((per100.carbs/100*ml).toFixed(1)),protein:parseFloat((per100.protein/100*ml).toFixed(1)),fat:parseFloat(((per100.fat||0)/100*ml).toFixed(1))};
  const add=()=>{
    onAdd({uid:Date.now()+Math.random(),label:`${label} (${ml}מ״ל)`,kcal:calc.kcal,carbs:calc.carbs,protein:calc.protein,fat:calc.fat});
    setOpen(false);
  };
  return (
    <div style={{position:"relative"}}>
      <button className="chip" onClick={()=>editMode?null:setOpen(v=>!v)} style={{opacity:editMode?0.7:1}}>
        <span>{label}</span>
        <span className="chip-sub">{calc.kcal} {getT().kcal} · {calc.carbs}g</span>
      </button>
      {open && (
        <div className="vpopup" style={{width:190}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:700}}>יוגורט יווני 10%</div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <button onClick={()=>setMl(v=>Math.max(5,v-5))} style={{width:30,height:30,border:`1px solid ${C.border}`,borderRadius:6,background:"#f5f5f7",cursor:"pointer",fontSize:16}}>−</button>
            <div style={{flex:1,textAlign:"center"}}>
              <input type="number" value={ml} onChange={e=>setMl(Math.max(1,parseInt(e.target.value)||1))}
                style={{width:"100%",border:"none",background:"transparent",textAlign:"center",fontWeight:900,fontSize:16,color:C.accent,fontFamily:"inherit"}}/>
            </div>
            <button onClick={()=>setMl(v=>v+5)} style={{width:30,height:30,border:`1px solid ${C.border}`,borderRadius:6,background:"#f5f5f7",cursor:"pointer",fontSize:16}}>+</button>
          </div>
          <div style={{fontSize:10,color:C.muted,textAlign:"center",marginBottom:4}}>מ״ל</div>
          <div style={{display:"flex",gap:4,marginBottom:10}}>
            {[{l:"כפית",v:5},{l:"כף",v:15},{l:"2 כף",v:30}].map(({l,v})=>(
              <button key={v} onClick={()=>setMl(v)} style={{flex:1,background:ml===v?"rgba(90,158,30,0.1)":"#f5f5f7",border:`1px solid ${ml===v?C.accent:C.border}`,borderRadius:6,padding:"4px 2px",fontSize:9,color:ml===v?C.accent:C.muted,cursor:"pointer"}}>{l}</button>
            ))}
          </div>
          <div style={{fontSize:11,color:C.muted,textAlign:"center",marginBottom:8}}>{calc.kcal} {getT().kcal} · {calc.carbs}g {getT().carbs}</div>
          <button className="btn-accent" onClick={add}>+ {getT().add}</button>
        </div>
      )}
      {editMode&&<><button onClick={()=>onEdit({id:'yogurt',label,kcal:per100.kcal,carbs:per100.carbs,protein:per100.protein,fat:per100.fat||0,_type:'yogurt',_note:'ערכים ל-100מ״ל'})}
        style={{position:"absolute",top:-4,left:-4,background:C.warn,border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✏</button>
      <button onClick={()=>{toggleHiddenSpecial('yogurt');onEdit(null);}}
        style={{position:"absolute",top:-4,right:-4,background:C.danger,border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>×</button></>}
    </div>
  );
}
function CoffeeBtn({onAdd,editMode,onEdit}){
  const ov=getSpecialEdit('coffee');
  const per100=ov||{kcal:50,carbs:4.7,protein:3.4,fat:2};
  const coffeeLabel=(ov&&ov.label)||(getT().coffeeLabel||'☕ קפה עם חלב 2%');
  const [ml,setMl]=useState(75);
  const [open,setOpen]=useState(false);
  const milk={kcal:per100.kcal/100,carbs:per100.carbs/100,protein:per100.protein/100,fat:per100.fat/100};
  const calc=m=>({label:`${coffeeLabel} (${m} מ״ל)`,kcal:Math.round(milk.kcal*m),carbs:parseFloat((milk.carbs*m).toFixed(1)),protein:parseFloat((milk.protein*m).toFixed(1)),fat:parseFloat((milk.fat*m).toFixed(1))});
  return (
    <div style={{position:"relative"}}>
      <button className="chip" style={{background:open&&!editMode?"rgba(90,158,30,0.08)":"#fff",border:`1px solid ${open&&!editMode?C.accent:C.border}`,opacity:editMode?0.7:1}} onClick={()=>editMode?null:setOpen(v=>!v)}>
        <span>{coffeeLabel}</span>
        <span className="chip-sub">{Math.round(milk.kcal*ml)} {getT().kcal} ({ml}ml)</span>
      </button>
      {!editMode&&open && <VPopup label="כמה מ״ל חלב?" value={ml} setValue={setMl} step={10} min={10}
        kcal={Math.round(milk.kcal*ml)} carbs={(milk.carbs*ml).toFixed(1)}
        onAdd={()=>{const c=calc(ml);onAdd({...c,uid:Date.now()+Math.random(),count:1,perUnit:{kcal:c.kcal,carbs:c.carbs,protein:c.protein,fat:c.fat||0}});setOpen(false);setMl(75);}}/>}
      {editMode&&<><button onClick={()=>onEdit({id:'coffee',label:coffeeLabel,kcal:per100.kcal,carbs:per100.carbs,protein:per100.protein,fat:per100.fat,_type:'coffee',_note:'ערכים ל-100מ״ל חלב'})}
        style={{position:"absolute",top:-4,left:-4,background:C.warn,border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✏</button>
      <button onClick={()=>{toggleHiddenSpecial('coffee');onEdit(null);}}
        style={{position:"absolute",top:-4,right:-4,background:C.danger,border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>×</button></>}
    </div>
  );
}

// ── PasteFromClaude ────────────────────────────────────────────────────────────
function PasteFromClaude({onParsed,amount,unit}){
  const [preview,setPreview]=useState(null);
  const [error,setError]=useState(false);
  const [lastRaw,setLastRaw]=useState(null);
  const [saveName,setSaveName]=useState("");
  const [savedOk,setSavedOk]=useState(false);

  const applyJSON=(raw,qty,u)=>{
    setError(false);setPreview(null);setSavedOk(false);
    try{
      const d=JSON.parse(raw.replace(/```json|```/g,"").trim());
      if(d.kcal===undefined)throw new Error();
      const q=parseFloat(qty)||1;
      const divisor=d.cubes_per_bar?d.cubes_per_bar:d.serving_size?d.serving_size:100;
      const pu=d.per_unit||{kcal:d.kcal/divisor,carbs:(d.carbs||0)/divisor,protein:(d.protein||0)/divisor,fat:(d.fat||0)/divisor};
      const result={kcal:Math.round(pu.kcal*q*10)/10,carbs:Math.round(pu.carbs*q*10)/10,protein:Math.round(pu.protein*q*10)/10,fat:Math.round(pu.fat*q*10)/10,name:d.name};
      setPreview({result,qty:q,unit:u,raw:d});
      setSaveName(d.name||"");
      setLastRaw(raw);
    }catch{setError(true);}
  };

  const handleClick=async()=>{
    setError(false);setPreview(null);
    try{const t=await navigator.clipboard.readText();applyJSON(t,amount,unit);}
    catch{setError(true);}
  };

  const recalc=()=>{if(lastRaw)applyJSON(lastRaw,amount,unit);};

  const loadOnly=()=>{
    if(!preview)return;
    onParsed(preview.result);
    setPreview(null);
  };

  const loadAndSave=()=>{
    if(!preview||!saveName)return;
    const d=preview.raw;
    const entry={
      names:[saveName.toLowerCase(),...(d.names||[d.name||saveName]).map(n=>n.toLowerCase())].filter((v,i,a)=>a.indexOf(v)===i),
      label:d.label||saveName, kcal:d.kcal, carbs:d.carbs||0, protein:d.protein||0, fat:d.fat||0,
      defaultAmt:d.defaultAmt||(d.cubes_per_bar?2:d.serving_size||100),
      unit:d.unit||(d.cubes_per_bar?"קוביות":"g"),
      ...(d.serving_size&&{serving_size:d.serving_size}),
      ...(d.cubes_per_bar&&{cubes_per_bar:d.cubes_per_bar}),
    };
    const db=loadCustomDB(window._activePid||"default");
    saveCustomDB([...db.filter(f=>!f.names.some(n=>entry.names.includes(n))),entry],window._activePid||"default");
    onParsed(preview.result);
    setSavedOk(true);setPreview(null);
  };

  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",gap:6}}>
        <button className="btn-warn" onClick={handleClick}>📋 הדבק ניתוח מ-Claude</button>
        {lastRaw && <button onClick={recalc} style={{background:"#fff8e1",border:`1px solid ${C.warn}`,borderRadius:8,padding:"9px 12px",fontSize:16,color:C.warn,cursor:"pointer"}}>🔄</button>}
      </div>
      {error && <div style={{fontSize:11,color:C.danger,marginTop:6,textAlign:"center"}}>לא הצלחתי לקרוא את הלוח — העתיקי שוב ונסי</div>}
      {savedOk && <div style={{fontSize:11,color:C.accent,textAlign:"center",marginTop:4}}>✓ נשמר!</div>}
      {preview && (
        <div className="green-box fade" style={{marginTop:8}}>
          <div style={{fontSize:11,color:C.accent,fontWeight:700,marginBottom:8}}>✦ {preview.qty} {preview.unit}</div>
          <div className="g3" style={{marginBottom:10}}>
            {[{l:"קק״ל",v:preview.result.kcal,c:C.accent},{l:"פחמ׳g",v:preview.result.carbs,c:C.warn},{l:"חלבוןg",v:preview.result.protein,c:C.blue}].map(({l,v,c})=>(
              <div key={l} className="preview-box"><div className="preview-val" style={{color:c}}>{v}</div><div className="preview-lbl">{l}</div></div>
            ))}
          </div>
          <div style={{fontSize:10,color:C.muted,marginBottom:4}}>שם לשמירה במאגר (ניתן לעריכה):</div>
          <input value={saveName} onChange={e=>setSaveName(e.target.value)} className="inp" style={{marginBottom:8,fontSize:13,borderColor:saveName?C.accent:C.border}}/>
          <div style={{display:"flex",gap:6}}>
            <button onClick={loadAndSave} disabled={!saveName}
              style={{flex:2,background:saveName?C.accent:"#ddd",border:"none",borderRadius:8,color:saveName?"#fff":"#aaa",padding:"9px 6px",fontSize:12,fontWeight:700,cursor:saveName?"pointer":"default"}}>
              הוסף + שמור
            </button>
            <button onClick={loadOnly}
              style={{flex:1,background:"#f5f5f7",border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,padding:"9px 6px",fontSize:11,fontWeight:600,cursor:"pointer"}}>
              הוסף ללא שמירה
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── LoadFoodToDB ───────────────────────────────────────────────────────────────
function LoadFoodToDB({foodName,amount,unit,onAddToDay,onSaved}){
  const [preview,setPreview]=useState(null);
  const [error,setError]=useState(false);
  const [savedOk,setSavedOk]=useState(false);
  const [savingMode,setSavingMode]=useState(false);
  const [saveName,setSaveName]=useState("");

  const handlePaste=async()=>{
    setError(false);setPreview(null);
    try{
      const t=await navigator.clipboard.readText();
      const d=JSON.parse(t.replace(/```json|```/g,"").trim());
      if(!d.kcal)throw new Error();
      // calc for current amount if given
      const qty = parseFloat(amount) || parseFloat(d.defaultAmt) || 100;
      // if serving_size defined, values are per serving_size units; else per 100g
      const divisor = d.cubes_per_bar ? d.cubes_per_bar : d.serving_size ? d.serving_size : 100;
      const per1 = d.per_unit
        ? d.per_unit
        : { kcal: d.kcal/divisor, carbs: (d.carbs||0)/divisor, protein: (d.protein||0)/divisor, fat: (d.fat||0)/divisor };
      const calc = {
        kcal:    Math.round(per1.kcal    * qty * 10) / 10,
        carbs:   Math.round(per1.carbs   * qty * 10) / 10,
        protein: Math.round(per1.protein * qty * 10) / 10,
        fat:     Math.round(per1.fat     * qty * 10) / 10,
      };
      const entry={names:d.names||[d.name||foodName],label:d.label||d.name||foodName,kcal:d.kcal,carbs:d.carbs||0,protein:d.protein||0,fat:d.fat||0,defaultAmt:d.defaultAmt||100,unit:d.unit||"g"};
      setPreview({calc, entry, qty, raw:d, unit: unit||d.unit||"g"});
      setSaveName(d.name||d.label||foodName||"");
    }catch{setError(true);}
  };

  const addToDay=()=>{
    if(!preview)return;
    const label=`${preview.entry.label}${amount?` (${amount}${unit||""})` : ""}`;
    onAddToDay({uid:Date.now()+Math.random(),label,...preview.calc});
  };

  const saveToDb=()=>{
    if(!preview||!saveName)return;
    const nameVariants=[saveName,...(preview.entry.names||[])].map(n=>n.toLowerCase());
    const entry={
      ...preview.entry,
      label:saveName,
      names:[...new Set([saveName.toLowerCase(),...nameVariants])],
    };
    const db=loadCustomDB(window._activePid||"default");
    saveCustomDB([...db.filter(f=>!f.names.some(n=>entry.names.includes(n.toLowerCase()))),entry], window._activePid||"default");
    setSavedOk(true);setSavingMode(false);
    setTimeout(()=>{ onSaved(); },700);
  };

  return (
    <div>
      <button onClick={handlePaste} style={{width:"100%",background:"#fff8e1",border:`1px solid ${C.warn}`,borderRadius:8,padding:"9px",fontSize:12,color:C.warn,cursor:"pointer",fontWeight:600,marginBottom:preview?8:0}}>
        📋 הדבק JSON מ-Claude
      </button>
      {error && <div style={{fontSize:11,color:C.danger,marginTop:4,textAlign:"center"}}>JSON לא תקין — העתיקי שוב</div>}

      {preview && (
        <div className="green-box fade">
          {!savedOk ? (
            <>
              <div style={{fontSize:11,color:C.accent,fontWeight:700,marginBottom:8}}>
                ✦ {preview.qty} {preview.unit} — ערכים מחושבים
              </div>
              <div className="g3" style={{marginBottom:10}}>
                {[{l:"קק״ל",v:preview.calc.kcal,c:C.accent},{l:"פחמ׳g",v:preview.calc.carbs,c:C.warn},{l:"חלבוןg",v:preview.calc.protein,c:C.blue}].map(({l,v,c})=>(
                  <div key={l} className="preview-box"><div className="preview-val" style={{color:c}}>{v}</div><div className="preview-lbl">{l}</div></div>
                ))}
              </div>
              <div style={{display:"flex",gap:8,marginBottom:savingMode?8:0}}>
                <button onClick={addToDay} style={{flex:1,background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"9px 6px",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ הוסף ליום</button>
                <button onClick={()=>setSavingMode(v=>!v)} style={{flex:1,background:savingMode?"#fff8e1":"#f5f5f7",border:`1px solid ${savingMode?C.warn:C.border}`,borderRadius:8,color:savingMode?C.warn:C.muted,padding:"9px 6px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  💾 שמור למאגר
                </button>
              </div>
              {savingMode && (
                <div className="fade">
                  <input value={saveName} onChange={e=>setSaveName(e.target.value)} placeholder="שם לשמירה..."
                    className="inp" style={{marginBottom:6,fontSize:14,borderColor:saveName?C.accent:C.border}}/>
                  <div style={{fontSize:11,color:C.muted,marginBottom:8,textAlign:"center"}}>
                    {preview.entry.kcal} קק״ל · {preview.entry.carbs}g פחמ׳ · {preview.entry.protein}g חלבון ל-100{preview.entry.unit||"g"}
                  </div>
                  <button onClick={saveToDb} disabled={!saveName}
                    style={{width:"100%",background:saveName?C.warn:"#ddd",border:"none",borderRadius:8,color:saveName?"#fff":"#aaa",padding:"9px",fontSize:13,fontWeight:700,cursor:saveName?"pointer":"default"}}>
                    💾 שמור
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{textAlign:"center",color:C.accent,fontSize:12,fontWeight:700,padding:4}}>✓ נשמר למאגר!</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── DBManagerModal ─────────────────────────────────────────────────────────────
function DBManagerModal({onClose,pid,lang}){
  const T=LANG[lang]||LANG.he;
  const activePid = window._activePid||pid||'default';
  const [db,setDb]=useState(()=>loadCustomDB(activePid));
  useEffect(()=>{ setDb(loadCustomDB(window._activePid||pid||'default')); },[pid]);
  const [search,setSearch]=useState("");
  const [editing,setEditing]=useState(null);
  const [editData,setEditData]=useState({});
  const [editClaudeText,setEditClaudeText]=useState("");
  const [editQty,setEditQty]=useState(1);
  const [editLoading,setEditLoading]=useState(false);
  const [editPreview,setEditPreview]=useState(null);
  const editImgRef=useRef(null);

  const filtered=search.trim()?db.filter(f=>f.label.toLowerCase().includes(search.toLowerCase())||f.names.some(n=>n.toLowerCase().includes(search.toLowerCase()))):db;
  const apid=()=>window._activePid||pid||'default';

  const remove=name=>{
    const updated=db.filter(f=>f.label!==name);
    saveCustomDB(updated,apid()); setDb(updated);
    if(editing!==null) setEditing(null);
  };

  const startEdit=(f,i)=>{
    setEditing(i);
    setEditData({label:f.label,kcal:String(f.kcal),carbs:String(f.carbs),protein:String(f.protein),fat:String(f.fat||0),unit:f.unit||"g"});
    setEditClaudeText(""); setEditQty(1); setEditPreview(null);
  };

  const saveEdit=(origLabel)=>{
    const updated=db.map(f=>f.label===origLabel?{
      ...f,
      label:editData.label||f.label,
      kcal:parseFloat(editData.kcal)||f.kcal,
      carbs:parseFloat(editData.carbs)||0,
      protein:parseFloat(editData.protein)||0,
      fat:parseFloat(editData.fat)||0,
      unit:editData.unit||f.unit,
      names:[...(f.names||[]),editData.label.toLowerCase()].filter((v,i,a)=>a.indexOf(v)===i),
    }:f);
    saveCustomDB(updated,apid()); setDb(updated); setEditing(null);
  };

  const applyClaudeResult=(d)=>{
    const q=Math.max(1,editQty);
    setEditData(ed=>({...ed,
      kcal:String(Math.round((d.kcal||0)/q)),
      carbs:String(parseFloat(((d.carbs||0)/q).toFixed(1))),
      protein:String(parseFloat(((d.protein||0)/q).toFixed(1))),
      fat:String(parseFloat(((d.fat||0)/q).toFixed(1))),
    }));
    setEditPreview(d);
    setEditLoading(false);
  };

  const askClaudeText=async()=>{
    if(!editClaudeText.trim())return;
    setEditLoading(true);setEditPreview(null);
    try{
      const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({dbEditText:editClaudeText})});
      if(!res.ok) throw new Error();
      const d=await res.json();
      if(!d.kcal) throw new Error();
      applyClaudeResult(d);
    }catch{setEditLoading(false);}
  };

  const handleEditImage=e=>{
    const file=e.target.files[0];
    if(!file)return; e.target.value="";
    setEditLoading(true);setEditPreview(null);
    const reader=new FileReader();
    reader.onload=async ev=>{
      const b64=ev.target.result.split(',')[1];
      try{
        const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({dbEditImageData:b64,dbEditImageMediaType:file.type||'image/jpeg'})});
        if(!res.ok) throw new Error();
        const d=await res.json();
        if(!d.kcal) throw new Error();
        applyClaudeResult(d);
      }catch{setEditLoading(false);}
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide" style={{maxHeight:"85vh"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:15,fontWeight:700}}>{T.dbTitle}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={T.search} className="inp" style={{marginBottom:12}}/>
        {filtered.length===0
          ? <div style={{textAlign:"center",color:C.muted,fontSize:13,padding:"20px 0"}}>{db.length===0?T.dbEmpty:T.noResults}</div>
          : <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {filtered.map((f,i)=>(
                <div key={i} style={{background:"#f5f5f7",borderRadius:10,overflow:"hidden"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:C.text}}>{f.label}</div>
                      <div style={{fontSize:11,color:C.muted,marginTop:2}}>{f.kcal} {T.kcal} · {f.carbs}g {T.carbs} · {f.protein}g {T.protein} {T.per100}{f.unit}</div>
                    </div>
                    <div style={{display:"flex",gap:4}}>
                      <button onClick={()=>editing===i?setEditing(null):startEdit(f,i)}
                        style={{background:editing===i?"#fff8e1":"none",border:editing===i?`1px solid ${C.warn}`:"none",color:editing===i?C.warn:C.muted,fontSize:15,cursor:"pointer",padding:"4px 8px",borderRadius:6}}>✏️</button>
                      <button onClick={()=>remove(f.label)} style={{background:"none",border:"none",color:C.danger,fontSize:18,cursor:"pointer",padding:"4px 8px"}}>🗑</button>
                    </div>
                  </div>
                  {editing===i && (
                    <div className="fade" style={{padding:"0 14px 12px",display:"flex",flexDirection:"column",gap:8}}>
                      <input value={editData.label} onChange={e=>setEditData(d=>({...d,label:e.target.value}))}
                        placeholder="שם" className="inp" style={{fontSize:13}}/>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        {[["kcal",T.kcal,C.accent],["carbs",T.carbs+" g",C.warn],["protein",T.protein+" g",C.blue],["fat",T.fat+" g","#999"]].map(([k,l,c])=>(
                          <div key={k} className="num-wrap">
                            <input type="number" value={editData[k]} onChange={e=>setEditData(d=>({...d,[k]:e.target.value}))}
                              style={{borderColor:c}} className="num-wrap"/>
                            <div className="num-lbl" style={{color:c}}>{l}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        <select value={editData.unit} onChange={e=>setEditData(d=>({...d,unit:e.target.value}))} className="inp" style={{flex:1,fontSize:12}}>
                          <option value="g">גר׳</option><option value="ml">מ״ל</option><option value="יח׳">יח׳</option><option value="קוביות">קוביות</option><option value="מנה">מנה</option>
                        </select>
                        <button onClick={()=>setEditing(null)} className="btn-muted" style={{flex:1,padding:"8px"}}>{T.cancel}</button>
                        <button onClick={()=>saveEdit(f.label)} style={{flex:2,background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"8px",fontSize:13,fontWeight:700,cursor:"pointer"}}>{T.save}</button>
                      </div>
                      {/* Claude recalculation section */}
                      <input ref={editing===i?editImgRef:null} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif" onChange={handleEditImage} style={{display:"none"}}/>
                      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:8,marginTop:2}}>
                        <div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:6}}>חשב מחדש עם Claude</div>
                        <textarea value={editClaudeText} onChange={e=>setEditClaudeText(e.target.value)}
                          placeholder="תאר את המאכל... (למשל: 100g עוף + 50g אורז)"
                          className="inp" rows={2} style={{fontSize:12,resize:"none",marginBottom:6}}/>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                          <span style={{fontSize:11,color:C.muted}}>מספר מנות:</span>
                          <button onClick={()=>setEditQty(v=>Math.max(1,v-1))} style={{width:24,height:24,border:`1px solid ${C.border}`,borderRadius:6,background:"#f5f5f7",cursor:"pointer",fontSize:13}}>−</button>
                          <input type="number" value={editQty} min="1" onChange={e=>setEditQty(Math.max(1,parseInt(e.target.value)||1))} style={{width:38,textAlign:"center",border:`1px solid ${C.border}`,borderRadius:6,padding:"3px",fontSize:13,fontFamily:"inherit"}}/>
                          <button onClick={()=>setEditQty(v=>v+1)} style={{width:24,height:24,border:`1px solid ${C.border}`,borderRadius:6,background:"#f5f5f7",cursor:"pointer",fontSize:13}}>+</button>
                          <button onClick={askClaudeText} disabled={!editClaudeText.trim()||editLoading}
                            style={{flex:1,background:editClaudeText.trim()&&!editLoading?C.accent:"#ddd",border:"none",borderRadius:8,color:editClaudeText.trim()&&!editLoading?"#fff":"#aaa",padding:"6px 8px",fontSize:12,fontWeight:700,cursor:editClaudeText.trim()&&!editLoading?"pointer":"default"}}>
                            {editLoading?<span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⟳</span>:"✨ חשב מחדש"}
                          </button>
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          <button onClick={()=>editImgRef.current&&editImgRef.current.click()} disabled={editLoading}
                            style={{flex:1,background:"#f5f5f7",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px",fontSize:12,color:C.muted,cursor:"pointer",fontFamily:"inherit"}}>
                            📷 מצלמה / גלריה
                          </button>
                        </div>
                        {editPreview&&<div style={{marginTop:6,fontSize:11,color:C.accent,background:"#f0fae8",borderRadius:8,padding:"6px 10px"}}>✨ {editPreview.label} — עודכן למנה ({editQty} {editQty===1?"מנה":"מנות"})</div>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}

// ── FoodAutocomplete ───────────────────────────────────────────────────────────
function FoodAutocomplete({value, onChange, onSelect, onSelectFood, placeholder}){
  const [open, setOpen] = useState(false);

  const allFoods = [
    ...loadCustomDB(window._activePid||"default").map(f=>({label:f.label, name:f.names[0], food:f})),
    ...FOOD_DB.map(f=>({label:f.label, name:f.names[0], food:f})),
  ];

  const q = value.trim().toLowerCase();
  const suggestions = q.length < 1 ? [] : allFoods.filter(f =>
    f.label.toLowerCase().includes(q) ||
    f.name.toLowerCase().includes(q)
  ).slice(0, 6);

  return (
    <div style={{position:"relative", marginBottom:8}}>
      <input
        value={value}
        onChange={e=>{ onChange(e.target.value); setOpen(true); }}
        onKeyDown={e=>{ if(e.key==="Enter"){ setOpen(false); onSelect(value); } if(e.key==="Escape") setOpen(false); }}
        onFocus={()=>setOpen(true)}
        placeholder={placeholder}
        className="inp"
        style={{fontSize:15, width:"100%"}}
      />
      {open && suggestions.length > 0 && (
        <div style={{position:"absolute", top:"calc(100% + 4px)", right:0, left:0, background:"#fff", border:`1px solid ${C.accent}`, borderRadius:10, zIndex:50, overflow:"hidden", boxShadow:"0 6px 20px rgba(0,0,0,0.1)", animation:"fadeIn 0.1s ease"}}>
          {suggestions.map((f,i)=>(
            <div key={i} onMouseDown={e=>{
              e.preventDefault();
              onChange(f.label);
              setOpen(false);
              if(onSelectFood) onSelectFood(f.food);
            }}
              style={{padding:"10px 14px", fontSize:13, color:C.text, cursor:"pointer", borderBottom:i<suggestions.length-1?`1px solid ${C.border}`:"none", background:"#fff"}}
              onMouseEnter={e=>e.currentTarget.style.background="#f0fae8"}
              onMouseLeave={e=>e.currentTarget.style.background="#fff"}
            >
              {f.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ── AskClaude ──────────────────────────────────────────────────────────────────
function AskClaude({foodName, amount, unit, onAddToDay, onSaved}){
  const [loading,setLoading]=useState(false);
  const [preview,setPreview]=useState(null);
  const [errorMsg,setErrorMsg]=useState(null);
  const [saveName,setSaveName]=useState("");
  const [savedOk,setSavedOk]=useState(false);
  const [localAmt,setLocalAmt]=useState(amount||"100");
  const [localUnit,setLocalUnit]=useState(unit||"g");

  const calcFromRaw=(d,qty,u)=>{
    const divisor=d.cubes_per_bar?d.cubes_per_bar:d.serving_size?d.serving_size:100;
    const per1={kcal:d.kcal/divisor,carbs:(d.carbs||0)/divisor,protein:(d.protein||0)/divisor,fat:(d.fat||0)/divisor};
    return {kcal:Math.round(per1.kcal*qty),carbs:parseFloat((per1.carbs*qty).toFixed(1)),protein:parseFloat((per1.protein*qty).toFixed(1)),fat:parseFloat((per1.fat*qty).toFixed(1))};
  };

  const recalc=()=>{
    if(!preview)return;
    const qty=parseFloat(localAmt)||1;
    setPreview(p=>({...p,calc:calcFromRaw(p.raw,qty,localUnit),qty,unit:localUnit}));
  };

  const ask=async()=>{
    if(!foodName.trim())return;
    setLoading(true);setPreview(null);setErrorMsg(null);setSavedOk(false);
    try{
      const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({foodName,amount:localAmt,unit:localUnit})
      });
      if(!res.ok) throw new Error(`שגיאת שרת ${res.status}`);
      const d=await res.json();
      if(d.error) throw new Error(d.error);
      if(!d.kcal) throw new Error("תגובה לא תקינה");
      const qty=parseFloat(localAmt)||d.defaultAmt||100;
      setPreview({calc:calcFromRaw(d,qty,localUnit),raw:d,qty,unit:localUnit||d.unit||"g"});
      setSaveName(d.name||d.label||foodName);
    }catch(e){
      setErrorMsg(e.message||"שגיאה");
    }
    setLoading(false);
  };

  const doSave=(name)=>{
    const d=preview.raw;
    const entry={
      names:[name.toLowerCase(),...(d.names||[]).map(n=>n.toLowerCase())].filter((v,i,a)=>a.indexOf(v)===i),
      label:d.label||name,
      kcal:d.kcal,carbs:d.carbs||0,protein:d.protein||0,fat:d.fat||0,
      defaultAmt:d.defaultAmt||100,unit:d.unit||"g",
      ...(d.serving_size&&{serving_size:d.serving_size}),
      ...(d.cubes_per_bar&&{cubes_per_bar:d.cubes_per_bar}),
    };
    const db=loadCustomDB(window._activePid||"default");
    saveCustomDB([...db.filter(f=>!f.names.some(n=>entry.names.includes(n))),entry],window._activePid||"default");
    setSavedOk(true);
    setTimeout(()=>{onSaved();},300);
  };

  const addToDay=(withSave)=>{
    if(!preview)return;
    if(withSave&&saveName) doSave(saveName);
    onAddToDay({uid:Date.now()+Math.random(),
      label:`${preview.raw.label||foodName} (${preview.qty}${preview.unit})`,
      kcal:preview.calc.kcal,carbs:preview.calc.carbs,protein:preview.calc.protein,fat:preview.calc.fat});
  };

  return (
    <div style={{marginTop:8}}>
      {!preview&&(
        <button onClick={ask} disabled={loading} style={{width:"100%",background:"linear-gradient(135deg,#5a9e1e,#7bc42e)",border:"none",borderRadius:8,color:"#fff",padding:"10px",fontSize:13,fontWeight:700,cursor:loading?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:loading?0.85:1}}>
          {loading?<span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⟳</span>:"✨"}
          {loading?"מחפש ערכים...":"שאל את Claude"}
        </button>
      )}
      {errorMsg&&(
        <div style={{marginTop:6,background:"#fff0f0",border:`1px solid ${C.danger}`,borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
          <span style={{fontSize:11,color:C.danger}}>⚠ {errorMsg}</span>
          <button onClick={ask} style={{background:C.danger,border:"none",borderRadius:6,color:"#fff",padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>נסה שוב</button>
        </div>
      )}
      {preview&&(
        <div className="green-box fade">
          <div style={{fontSize:11,color:C.accent,fontWeight:700,marginBottom:8}}>✨ {preview.raw.label||foodName}</div>
          <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center"}}>
            <input type="number" value={localAmt} onChange={e=>setLocalAmt(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&recalc()}
              className="inp" style={{flex:1,textAlign:"center",padding:"7px 6px",fontSize:13}}/>
            <select value={localUnit} onChange={e=>setLocalUnit(e.target.value)} className="inp" style={{flex:1,padding:"7px 6px",fontSize:12,cursor:"pointer"}}>
              <option value="g">גר׳</option><option value="ml">מ״ל</option><option value="יח׳">יח׳</option><option value="קוביות">קוביות</option><option value="כף">כף</option><option value="כפית">כפית</option>
            </select>
            <button onClick={recalc} style={{background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"7px 12px",fontSize:16,cursor:"pointer",lineHeight:1}}>🔄</button>
          </div>
          <div className="g3" style={{marginBottom:10}}>
            {[{l:"קק״ל",v:preview.calc.kcal,c:C.accent},{l:"פחמ׳g",v:preview.calc.carbs,c:C.warn},{l:"חלבוןg",v:preview.calc.protein,c:C.blue}].map(({l,v,c})=>(
              <div key={l} className="preview-box"><div className="preview-val" style={{color:c}}>{v}</div><div className="preview-lbl">{l}</div></div>
            ))}
          </div>
          {!savedOk?(
            <>
              <div style={{fontSize:10,color:C.muted,marginBottom:4}}>שם לשמירה במאגר (ניתן לעריכה):</div>
              <input value={saveName} onChange={e=>setSaveName(e.target.value)} className="inp"
                style={{marginBottom:8,fontSize:13,borderColor:saveName?C.accent:C.border}}/>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>addToDay(true)} disabled={!saveName}
                  style={{flex:2,background:saveName?C.accent:"#ddd",border:"none",borderRadius:8,color:saveName?"#fff":"#aaa",padding:"9px 6px",fontSize:12,fontWeight:700,cursor:saveName?"pointer":"default"}}>
                  הוסף + שמור
                </button>
                <button onClick={()=>addToDay(false)}
                  style={{flex:1,background:"#f5f5f7",border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,padding:"9px 6px",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                  הוסף ללא שמירה
                </button>
              </div>
            </>
          ):(
            <button onClick={()=>addToDay(false)} style={{width:"100%",background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ הוסף ליום</button>
          )}
        </div>
      )}
    </div>
  );
}
// ── PhotoMealPanel ─────────────────────────────────────────────────────────────
function PhotoMealPanel({onAdd,onClose,initialPhoto}){
  const [loading,setLoading]=useState(false);
  const [preview,setPreview]=useState(null);
  const [calcVals,setCalcVals]=useState(null);
  const [error,setError]=useState(null);
  const [imgSrc,setImgSrc]=useState(initialPhoto?.src||null);
  const [servings,setServings]=useState(1);
  const [localAmt,setLocalAmt]=useState("1");
  const [qtyUnit,setQtyUnit]=useState("יח׳");
  const [mealWeight,setMealWeight]=useState("");
  const fileRef=useRef(null);

  useEffect(()=>{
    if(initialPhoto?.base64) analyze(initialPhoto.base64,initialPhoto.mediaType);
  },[]);

  const unitToG=(amt,unit)=>{
    if(unit==='כף') return amt*15;
    if(unit==='כפית') return amt*5;
    if(unit==='כוס') return amt*240;
    return amt;
  };

  const getP100g=(p,mealW)=>{
    if(p.per100g) return p.per100g;
    const w=parseFloat(mealW);
    if(w>0) return {
      kcal:Math.round(p.kcal/w*100),
      carbs:parseFloat(((p.carbs||0)/w*100).toFixed(1)),
      protein:parseFloat(((p.protein||0)/w*100).toFixed(1)),
      fat:parseFloat(((p.fat||0)/w*100).toFixed(1))
    };
    return null;
  };

  const computeVals=(p,s,amt,unit,mealW)=>{
    const a=parseFloat(amt)||1;
    if(unit!=='יח׳'&&unit!=='מנות'){
      const pg=getP100g(p,mealW);
      if(pg){
        const g=unitToG(a,unit);
        const factor=g/100/s;
        return {
          kcal:Math.round(pg.kcal*factor),
          carbs:parseFloat(((pg.carbs||0)*factor).toFixed(1)),
          protein:parseFloat(((pg.protein||0)*factor).toFixed(1)),
          fat:parseFloat(((pg.fat||0)*factor).toFixed(1))
        };
      }
      // No weight info at all — show 0 so user knows to enter meal weight
      return {kcal:0,carbs:0,protein:0,fat:0};
    }
    const factor=a/s;
    return {
      kcal:Math.round(p.kcal*factor),
      carbs:parseFloat(((p.carbs||0)*factor).toFixed(1)),
      protein:parseFloat(((p.protein||0)*factor).toFixed(1)),
      fat:parseFloat(((p.fat||0)*factor).toFixed(1))
    };
  };

  const analyze=async(base64,mediaType)=>{
    setLoading(true);setPreview(null);setCalcVals(null);setError(null);
    setServings(1);setLocalAmt("1");setQtyUnit("יח׳");setMealWeight("");
    try{
      const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({imageData:base64,imageMediaType:mediaType})
      });
      if(!res.ok) throw new Error("שגיאת שרת");
      const d=await res.json();
      if(d.error||!d.kcal) throw new Error(d.error||"לא הצלחתי לנתח את התמונה");
      // Derive per100g from totalGrams if server included a sensible weight
      if(!d.per100g && d.totalGrams >= 20){
        d.per100g={
          kcal:Math.round(d.kcal/d.totalGrams*100),
          carbs:parseFloat(((d.carbs||0)/d.totalGrams*100).toFixed(1)),
          protein:parseFloat(((d.protein||0)/d.totalGrams*100).toFixed(1)),
          fat:parseFloat(((d.fat||0)/d.totalGrams*100).toFixed(1))
        };
      }
      const initW=d.totalGrams>=20?String(d.totalGrams):"";
      const initAmt=d.per100g&&d.totalGrams>=20?String(d.totalGrams):"1";
      const initUnit=d.per100g&&d.totalGrams>=20?"g":"יח׳";
      setMealWeight(initW);setLocalAmt(initAmt);setQtyUnit(initUnit);
      setPreview(d);
      setCalcVals(computeVals(d,1,initAmt,initUnit,initW));
    }catch(e){setError(e.message);}
    setLoading(false);
  };

  const recalc=()=>{
    if(!preview)return;
    setCalcVals(computeVals(preview,servings,localAmt,qtyUnit,mealWeight));
  };

  const handleFile=e=>{
    const file=e.target.files[0];
    if(!file)return;
    e.target.value="";
    const reader=new FileReader();
    reader.onload=ev=>{
      const b64=ev.target.result.split(',')[1];
      setImgSrc(ev.target.result);
      setPreview(null);setCalcVals(null);setError(null);
      analyze(b64,file.type||'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const addToDay=()=>{
    if(!preview||!calcVals)return;
    const a=parseFloat(localAmt)||1;
    onAdd({uid:Date.now()+Math.random(),
      label:`📷 ${preview.label}${servings>1?` (1/${servings})`:""}${(a!==1||qtyUnit!=='יח׳')?` ${a}${qtyUnit}`:""}`,
      kcal:calcVals.kcal,carbs:calcVals.carbs,protein:calcVals.protein,fat:calcVals.fat});
    onClose();
  };

  return (
    <div className="panel fade">
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif" onChange={handleFile} style={{display:"none"}}/>
      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>📷 ניתוח תמונה</div>
      {imgSrc?(
        <div style={{position:"relative",marginBottom:10}}>
          <img src={imgSrc} style={{width:"100%",borderRadius:10,maxHeight:180,objectFit:"cover"}}/>
          <button onClick={()=>fileRef.current.click()} style={{position:"absolute",top:6,left:6,background:"rgba(0,0,0,0.55)",border:"none",borderRadius:6,padding:"4px 10px",fontSize:12,color:"#fff",cursor:"pointer"}}>🖼️ החלף</button>
        </div>
      ):(!loading&&!error&&(
        <button onClick={()=>fileRef.current.click()} style={{width:"100%",background:"#f5f5f7",border:`1px solid ${C.border}`,borderRadius:10,padding:"18px 8px",textAlign:"center",cursor:"pointer",fontFamily:"inherit",marginBottom:10}}>
          <div style={{fontSize:26,marginBottom:4}}>📷</div>
          <div style={{fontSize:12,color:C.muted}}>בחרי תמונה</div>
        </button>
      ))}
      {loading&&<div style={{textAlign:"center",padding:"14px 0",color:C.muted,fontSize:13}}><span style={{display:"inline-block",animation:"spin 1s linear infinite",fontSize:22}}>⟳</span><div style={{marginTop:6}}>מנתח תמונה...</div></div>}
      {error&&<div style={{background:"#fff0f0",border:`1px solid ${C.danger}`,borderRadius:8,padding:"8px 12px",fontSize:11,color:C.danger,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span>⚠ {error}</span>
        <button onClick={()=>fileRef.current.click()} style={{background:C.danger,border:"none",borderRadius:6,color:"#fff",padding:"2px 8px",fontSize:11,fontWeight:700,cursor:"pointer"}}>נסי שוב</button>
      </div>}
      {preview&&calcVals&&(
        <div className="green-box fade" style={{marginBottom:8}}>
          <div style={{fontSize:11,color:C.accent,fontWeight:700,marginBottom:4}}>✨ {preview.label}</div>
          {preview.portions&&(
            <div style={{fontSize:10,color:C.muted,background:"#fff",borderRadius:6,padding:"5px 8px",marginBottom:6,lineHeight:1.5}}>
              📐 {preview.portions}
            </div>
          )}
          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8,background:"rgba(255,255,255,0.7)",borderRadius:8,padding:"4px 8px"}}>
            <span style={{fontSize:10,color:C.muted,flex:1}}>משקל הצילום (לחישוב גר׳):</span>
            <input type="number" value={mealWeight} onChange={e=>setMealWeight(e.target.value)}
              placeholder="גר׳" className="inp"
              style={{width:60,padding:"3px 6px",fontSize:12,textAlign:"center",marginBottom:0}}/>
            <span style={{fontSize:10,color:C.muted}}>גר׳</span>
          </div>
          <div className="g3" style={{marginBottom:8}}>
            {[{l:"קק״ל",v:calcVals.kcal,c:C.accent},{l:"פחמ׳g",v:calcVals.carbs,c:C.warn},{l:"חלבוןg",v:calcVals.protein,c:C.blue}].map(({l,v,c})=>(
              <div key={l} className="preview-box"><div className="preview-val" style={{color:c}}>{v}</div><div className="preview-lbl">{l}</div></div>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,background:"rgba(255,255,255,0.7)",borderRadius:8,padding:"5px 10px"}}>
            <span style={{fontSize:11,color:C.muted,flex:1}}>חלק עם:</span>
            <button onClick={()=>setServings(v=>Math.max(1,v-1))} style={{width:24,height:24,border:`1px solid ${C.border}`,borderRadius:6,background:"#f5f5f7",cursor:"pointer",fontSize:13}}>−</button>
            <span style={{fontWeight:700,fontSize:13,color:C.accent,minWidth:16,textAlign:"center"}}>{servings}</span>
            <button onClick={()=>setServings(v=>v+1)} style={{width:24,height:24,border:`1px solid ${C.border}`,borderRadius:6,background:"#f5f5f7",cursor:"pointer",fontSize:13}}>+</button>
            <span style={{fontSize:11,color:C.muted}}>{servings===1?"אנשים (כל הארוחה לי)":"אנשים"}</span>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:8,alignItems:"center"}}>
            <input type="number" value={localAmt} onChange={e=>setLocalAmt(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&recalc()}
              className="inp" style={{flex:1,textAlign:"center",padding:"7px 6px",fontSize:13}}/>
            <select value={qtyUnit} onChange={e=>setQtyUnit(e.target.value)} className="inp" style={{flex:1,padding:"7px 6px",fontSize:12,cursor:"pointer"}}>
              <option value="יח׳">יח׳</option>
              <option value="מנות">מנות</option>
              <option value="g">גר׳</option>
              <option value="ml">מ״ל</option>
              <option value="כף">כף (15מ״ל)</option>
              <option value="כפית">כפית (5מ״ל)</option>
              <option value="כוס">כוס (240מ״ל)</option>
            </select>
            <button onClick={recalc} style={{background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"7px 12px",fontSize:16,cursor:"pointer",lineHeight:1}}>🔄</button>
          </div>
          <button onClick={addToDay} style={{width:"100%",background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ הוסף ליום</button>
        </div>
      )}
      <button onClick={onClose} className="btn-muted" style={{marginTop:4}}>ביטול</button>
    </div>
  );
}

// ── MealPanel ──────────────────────────────────────────────────────────────────
function MealPanel({onAdd,onClose}){
  const [text,setText]=useState("");
  const [servings,setServings]=useState(1);
  const [loading,setLoading]=useState(false);
  const [preview,setPreview]=useState(null);
  const [error,setError]=useState(null);

  const perServing=(v)=>Math.round((v/servings)*10)/10;

  const ask=async()=>{
    if(!text.trim())return;
    setLoading(true);setPreview(null);setError(null);
    try{
      const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({mealDescription:text})
      });
      if(!res.ok) throw new Error("שגיאת שרת "+res.status);
      const d=await res.json();
      if(d.error||!d.kcal) throw new Error(d.error||"תגובה לא תקינה");
      setPreview(d);
    }catch(e){setError(e.message);}
    setLoading(false);
  };

  const [savedToDb,setSavedToDb]=useState(false);
  const [showDbInput,setShowDbInput]=useState(false);
  const [dbName,setDbName]=useState("");

  const addToDay=()=>{
    if(!preview)return;
    const s=Math.max(1,servings);
    onAdd({uid:Date.now()+Math.random(),
      label:`🍽 ${preview.label||text.slice(0,30)}${s>1?` (1/${s})` : ""}`,
      kcal:Math.round(preview.kcal/s),
      carbs:parseFloat(((preview.carbs||0)/s).toFixed(1)),
      protein:parseFloat(((preview.protein||0)/s).toFixed(1)),
      fat:parseFloat(((preview.fat||0)/s).toFixed(1))});
    onClose();
  };

  const openDbSave=()=>{
    if(!preview)return;
    setDbName(preview.label||text.slice(0,40)||"ארוחה");
    setShowDbInput(true);
  };

  const saveToDb=()=>{
    if(!preview)return;
    const s=Math.max(1,servings);
    const name=(dbName.trim()||preview.label||text.slice(0,40)||"ארוחה");
    const entry={names:[name.toLowerCase()],label:`🍽 ${name}`,
      kcal:Math.round(preview.kcal/s),carbs:parseFloat(((preview.carbs||0)/s).toFixed(1)),
      protein:parseFloat(((preview.protein||0)/s).toFixed(1)),fat:parseFloat(((preview.fat||0)/s).toFixed(1)),
      defaultAmt:1,unit:"מנה",serving_size:1};
    const pid=window._activePid||"default";
    const db=loadCustomDB(pid);
    saveCustomDB([...db.filter(f=>f.label!==entry.label),entry],pid);
    setShowDbInput(false);
    setSavedToDb(true);
    setTimeout(()=>setSavedToDb(false),2000);
  };

  return (
    <div className="panel fade">
      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>🍽 ניתוח ארוחה מורכבת</div>
      <textarea value={text} onChange={e=>setText(e.target.value)} rows={4}
        placeholder={"תארי את הארוחה בחופשיות, למשל:\nסלט עם 100g קינואה, גבינת פטה, עגבניות, מלפפון, 15ml שמן זית"}
        className="inp" style={{marginBottom:10,resize:"none",lineHeight:1.6,fontSize:13}}/>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,background:"#f5f5f7",borderRadius:8,padding:"8px 12px"}}>
        <span style={{fontSize:12,color:C.muted,flex:1}}>מספר מנות / אנשים:</span>
        <button onClick={()=>setServings(v=>Math.max(1,v-1))} style={{width:28,height:28,border:`1px solid ${C.border}`,borderRadius:6,background:"#fff",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
        <span style={{fontWeight:900,fontSize:16,color:C.accent,minWidth:20,textAlign:"center"}}>{servings}</span>
        <button onClick={()=>setServings(v=>v+1)} style={{width:28,height:28,border:`1px solid ${C.border}`,borderRadius:6,background:"#fff",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
      </div>
      {!preview&&(
        <button onClick={ask} disabled={!text.trim()||loading}
          style={{width:"100%",background:text.trim()?"linear-gradient(135deg,#5a9e1e,#7bc42e)":"#ddd",border:"none",borderRadius:8,color:text.trim()?"#fff":"#aaa",padding:"10px",fontSize:13,fontWeight:700,cursor:text.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginBottom:8}}>
          {loading?<span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⟳</span>:"✨"}
          {loading?"מנתח ארוחה...":"שאל את Claude"}
        </button>
      )}
      {error&&(
        <div style={{background:"#fff0f0",border:`1px solid ${C.danger}`,borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:8}}>
          <span style={{fontSize:11,color:C.danger}}>⚠ {error}</span>
          <button onClick={ask} style={{background:C.danger,border:"none",borderRadius:6,color:"#fff",padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>נסה שוב</button>
        </div>
      )}
      {preview&&(
        <div className="green-box fade" style={{marginBottom:8}}>
          <div style={{fontSize:11,color:C.accent,fontWeight:700,marginBottom:2}}>✨ {preview.label}</div>
          <div style={{fontSize:10,color:C.muted,marginBottom:8}}>{servings>1?`סה״כ ÷ ${servings} מנות = ערכים למנה אחת`:"ערכים לכל הארוחה"}</div>
          <div className="g3" style={{marginBottom:10}}>
            {[{l:"קק״ל",v:Math.round(preview.kcal/servings),c:C.accent},{l:"פחמ׳g",v:parseFloat(((preview.carbs||0)/servings).toFixed(1)),c:C.warn},{l:"חלבוןg",v:parseFloat(((preview.protein||0)/servings).toFixed(1)),c:C.blue}].map(({l,v,c})=>(
              <div key={l} className="preview-box"><div className="preview-val" style={{color:c}}>{v}</div><div className="preview-lbl">{l}</div></div>
            ))}
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={addToDay} style={{flex:2,background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ הוסף ליום</button>
            <button onClick={openDbSave} style={{flex:1,background:savedToDb?"rgba(13,148,136,.1)":"transparent",border:`1px solid ${savedToDb?C.accent:C.border}`,borderRadius:8,padding:"10px",fontSize:12,fontWeight:600,color:savedToDb?C.accent:C.muted,cursor:"pointer"}}>
              {savedToDb?"✓":"💾"}
            </button>
          </div>
          {showDbInput&&(
            <div className="fade" style={{marginTop:8,display:"flex",gap:6}}>
              <input value={dbName} onChange={e=>setDbName(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&saveToDb()}
                className="inp" style={{flex:1,fontSize:12}} autoFocus/>
              <button onClick={saveToDb} style={{background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"0 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>שמור</button>
              <button onClick={()=>setShowDbInput(false)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,padding:"0 10px",cursor:"pointer",fontSize:12}}>✕</button>
            </div>
          )}
        </div>
      )}
      <button onClick={onClose} className="btn-muted" style={{marginTop:4}}>ביטול</button>
    </div>
  );
}

// ── SmartAddPanel ──────────────────────────────────────────────────────────────
function SmartAddPanel({onAdd,onClose}){
  const [query,setQuery]=useState("");
  const [amount,setAmount]=useState("");
  const [unit,setUnit]=useState("g");
  const [matched,setMatched]=useState(null);
  const [candidates,setCandidates]=useState([]);
  const [kcal,setKcal]=useState("");
  const [carbs,setCarbs]=useState("");
  const [protein,setProtein]=useState("");
  const [fat,setFat]=useState("");
  const [notFound,setNotFound]=useState(false);
  const [savedToDb,setSavedToDb]=useState(false);

  const handleSaveToDb=()=>{
    if(!kcal)return;
    const pid=window._activePid||"default";
    const name=(matched?matched.label:query)||"מאכל";
    const entry=matched
      ?{names:[...new Set([...(matched.names||[]),query.toLowerCase()])].filter(Boolean),label:matched.label,kcal:matched.kcal,carbs:matched.carbs,protein:matched.protein,fat:matched.fat||0,defaultAmt:matched.defaultAmt||100,unit:matched.unit||"g"}
      :{names:[query.toLowerCase()].filter(Boolean),label:query||"מאכל",kcal:parseFloat(kcal)||0,carbs:parseFloat(carbs)||0,protein:parseFloat(protein)||0,fat:parseFloat(fat)||0,defaultAmt:parseFloat(amount)||100,unit:unit||"g"};
    const db=loadCustomDB(pid);
    saveCustomDB([...db.filter(f=>f.label!==entry.label),entry],pid);
    setSavedToDb(true);
    setTimeout(()=>setSavedToDb(false),2000);
  };

  const applyFood=(food,amt,u)=>{
    setMatched(food);setCandidates([]);setNotFound(false);
    const a=parseFloat(amt||amount)||food.defaultAmt;
    setAmount(String(a));
    // Prefer the food's native unit when it's a serving-based unit (not g/ml)
    const ru=food.unit==='מנה'?food.unit:(u||unit||food.unit||'g');
    setUnit(ru);
    const n=calcNutrition(food,a,ru);
    setKcal(String(n.kcal));setCarbs(String(n.carbs));setProtein(String(n.protein));setFat(String(n.fat||0));
  };

  const runSearch=(name,amt,u)=>{
    setMatched(null);setCandidates([]);setNotFound(false);
    setKcal("");setCarbs("");setProtein("");setFat("");
    const results=searchAllFoods(name);
    if(results.length===0){setNotFound(true);}
    else if(results.length===1){applyFood(results[0],amt,u);}
    else{setCandidates(results);}
  };

  const recalc=(amt,u)=>{
    if(!matched)return;
    const a=parseFloat(amt);if(!a)return;
    const n=calcNutrition(matched,a,u||unit);
    setKcal(String(n.kcal));setCarbs(String(n.carbs));setProtein(String(n.protein));setFat(String(n.fat||0));
  };

  const handleAdd=()=>{
    if(!kcal)return;
    const unitLabel=unit==="כף"?"כף":unit==="כפית"?"כפית":unit==="כוס"?"כוס":unit;
    const label=matched?`${matched.label} (${amount}${unitLabel})`:query||"מאכל";
    const entry={uid:Date.now()+Math.random(),label,kcal:parseFloat(kcal)||0,carbs:parseFloat(carbs)||0,protein:parseFloat(protein)||0,fat:parseFloat(fat)||0};
    addToRecentFoods(entry);
    onAdd(entry);
    onClose();
  };

  const numField=(v,s,p,col)=>(
    <div className="num-wrap">
      <input type="number" value={v} onChange={e=>s(e.target.value)} placeholder="0" style={{borderColor:v?col:C.border}}/>
      <div className="num-lbl" style={{color:col}}>{p}</div>
    </div>
  );

  const recent=loadRecentFoods();

  return (
    <div className="panel fade">
      {!query&&recent.length>0&&(
        <div style={{marginBottom:8}}>
          <div style={{fontSize:10,color:C.muted,letterSpacing:1.5,marginBottom:6}}>אחרונים</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {recent.map((f,i)=>(
              <button key={i} className="chip" style={{fontSize:11}} onClick={()=>{onAdd({uid:Date.now()+Math.random(),...f});onClose();}}>
                <span>{f.label}</span>
                <span className="chip-sub">{Math.round(f.kcal)} קק״ל</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <FoodAutocomplete
        value={query}
        onChange={v=>{setQuery(v);setMatched(null);setCandidates([]);setNotFound(false);setKcal("");setCarbs("");setProtein("");}}
        onSelect={name=>runSearch(name,amount,unit)}
        onSelectFood={food=>applyFood(food, food.defaultAmt||amount||"", food.unit||unit)}
        placeholder="שם המאכל..."
      />
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <input type="number" value={amount} placeholder="כמות" onChange={e=>{setAmount(e.target.value);recalc(e.target.value,unit);}} className="inp" style={{flex:1,textAlign:"center",padding:"9px 6px"}}/>
        <select value={unit} onChange={e=>{setUnit(e.target.value);recalc(amount,e.target.value);}} className="inp" style={{flex:1,padding:"9px 6px",cursor:"pointer"}}>
          <option value="g">גר׳</option><option value="ml">מ״ל</option><option value="יח׳">יח׳</option><option value="מנה">מנה</option><option value="קוביות">קוביות</option><option value="כף">כף (15מ״ל)</option><option value="כפית">כפית (5מ״ל)</option><option value="כוס">כוס (240מ״ל)</option>
        </select>
      </div>
      <button className="btn-accent" onClick={()=>runSearch(query,amount,unit)} style={{marginBottom:10}}>✦ חשב ערכים</button>

      {candidates.length>0&&(
        <div className="fade" style={{marginBottom:10,background:"#fff8e1",border:`1px solid ${C.warn}`,borderRadius:10,padding:10}}>
          <div style={{fontSize:11,color:C.warn,fontWeight:700,marginBottom:8}}>בחרי את הפריט המתאים:</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {candidates.map((f,i)=>(
              <button key={i} onClick={()=>applyFood(f,amount,unit)}
                style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",textAlign:"right",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"inherit"}}>
                <span style={{fontSize:13,color:C.text}}>{f.label}</span>
                <span style={{fontSize:10,color:C.muted}}>{f.kcal} קק״ל / 100{f.unit}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {notFound&&(
        <div className="warn-box" style={{marginBottom:10}}>
          <div style={{fontSize:12,color:C.warn,fontWeight:600,marginBottom:6}}>לא נמצא במאגר</div>
          <AskClaude
            foodName={query} amount={amount} unit={unit}
            onAddToDay={food=>{onAdd(food);onClose();}}
            onSaved={()=>runSearch(query,amount,unit)}
          />
        </div>
      )}
      {matched&&<div style={{fontSize:12,color:C.accent,background:"#f0fae8",borderRadius:8,padding:"8px 12px",marginBottom:10}}>✦ {matched.label} — ערכים ל-{amount}{unit}</div>}
      <div className="g3" style={{marginBottom:12}}>
        {numField(kcal,setKcal,"קק״ל",C.accent)}
        {numField(carbs,setCarbs,"פחמ׳ g",C.warn)}
        {numField(protein,setProtein,"חלבון g",C.blue)}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:6}}>
        <button className="btn-muted" onClick={onClose} style={{flex:1}}>ביטול</button>
        <button onClick={handleAdd} disabled={!kcal} style={{flex:2,background:kcal?C.accent:"#ddd",border:"none",borderRadius:8,color:kcal?"#fff":"#aaa",padding:"10px",fontSize:13,fontWeight:700,cursor:kcal?"pointer":"default"}}>+ הוסף פריט</button>
      </div>
      <button onClick={handleSaveToDb} disabled={!kcal} style={{width:"100%",background:savedToDb?"rgba(13,148,136,.1)":"transparent",border:`1px solid ${savedToDb?C.accent:kcal?C.border:"#e0e0e5"}`,borderRadius:8,padding:"8px",fontSize:12,fontWeight:600,color:savedToDb?C.accent:kcal?C.muted:"#ccc",cursor:kcal?"pointer":"default"}}>
        {savedToDb?"✓ נשמר במאגר":"💾 שמור למאגר"}
      </button>
    </div>
  );
}

// ── NewButtonModal ─────────────────────────────────────────────────────────────
function NewButtonModal({onClose,onSave}){
  const [name,setName]=useState("");
  const [desc,setDesc]=useState("");
  const [kcal,setKcal]=useState("");
  const [carbs,setCarbs]=useState("");
  const [protein,setProtein]=useState("");
  const [fat,setFat]=useState("");
  const [amount,setAmount]=useState("");
  const [unit,setUnit]=useState("g");
  const [matched,setMatched]=useState(null);
  const [notFound,setNotFound]=useState(false);

  const runEst=()=>{
    const food=searchFood(name)||searchFood(desc);
    if(!food){setNotFound(true);return;}
    setNotFound(false);setMatched(food);
    const a=parseFloat(amount)||food.defaultAmt;
    setAmount(String(a));setUnit(food.unit);
    const n=calcNutrition(food,a);
    setKcal(String(n.kcal));setCarbs(String(n.carbs));setProtein(String(n.protein));setFat(String(n.fat));
  };

  const recalc=(amt,u)=>{
    if(!matched)return;
    const a=parseFloat(amt);if(!a)return;
    const n=calcNutrition(matched,a);
    setKcal(String(n.kcal));setCarbs(String(n.carbs));setProtein(String(n.protein));setFat(String(n.fat));
  };

  const handleSave=()=>{
    if(!name||!kcal)return;
    onSave({id:"custom_"+Date.now(),label:name,kcal:parseFloat(kcal)||0,carbs:parseFloat(carbs)||0,protein:parseFloat(protein)||0,fat:parseFloat(fat)||0});
    onClose();
  };

  const numField=(v,s,p,col)=>(
    <div className="num-wrap">
      <input type="number" value={v} onChange={e=>s(e.target.value)} placeholder="0" style={{borderColor:v?col:C.border}}/>
      <div className="num-lbl" style={{color:col}}>{p}</div>
    </div>
  );

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:700}}>⭐ כפתור חדש</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>
        <div style={{fontSize:11,color:C.muted,marginBottom:5}}>שם המאכל *</div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="למשל: יוגורט יווני" className="inp" style={{marginBottom:12,borderColor:name?C.accent:C.border}}/>
        <div style={{fontSize:11,color:C.muted,marginBottom:5}}>פירוט רכיבים (אופציונלי)</div>
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="למשל: 150g יוגורט, דבש..." rows={2} className="inp" style={{marginBottom:12,resize:"none"}}/>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <div style={{flex:1}}><div style={{fontSize:11,color:C.muted,marginBottom:5}}>כמות</div>
            <input type="number" value={amount} onChange={e=>{setAmount(e.target.value);recalc(e.target.value,unit);}} placeholder="100" className="inp" style={{textAlign:"center"}}/>
          </div>
          <div style={{flex:1}}><div style={{fontSize:11,color:C.muted,marginBottom:5}}>יחידה</div>
            <select value={unit} onChange={e=>{setUnit(e.target.value);recalc(amount,e.target.value);}} className="inp" style={{cursor:"pointer"}}>
              <option value="g">גר׳</option><option value="ml">מ״ל</option><option value="יח׳">יח׳</option><option value="מנה">מנה</option><option value="קוביות">קוביות</option><option value="כף">כף (15מ״ל)</option><option value="כפית">כפית (5מ״ל)</option><option value="כוס">כוס (240מ״ל)</option>
            </select>
          </div>
        </div>
        <button onClick={runEst} disabled={!name} style={{width:"100%",background:name?C.accent:"#ddd",border:"none",borderRadius:8,color:name?"#fff":"#aaa",padding:"9px",fontSize:13,fontWeight:700,cursor:name?"pointer":"default",marginBottom:10}}>✦ אמוד ערכים אוטומטית</button>
        <PasteFromClaude amount={amount} unit={unit} onParsed={d=>{setKcal(String(d.kcal));setCarbs(String(d.carbs??""));setProtein(String(d.protein??""));setFat(String(d.fat??""));}}/>
        {notFound && <div style={{fontSize:12,color:C.warn,background:"#fff8e1",borderRadius:8,padding:"8px 12px",marginBottom:10}}>לא נמצא במאגר — הכניסי ערכים ידנית</div>}
        {matched && <div style={{fontSize:12,color:C.accent,background:"#f0fae8",borderRadius:8,padding:"8px 12px",marginBottom:10}}>✦ נמצא: {matched.label}</div>}
        <div className="g2" style={{marginBottom:16}}>
          {numField(kcal,setKcal,"קק״ל",C.accent)}
          {numField(carbs,setCarbs,"פחמ׳ g",C.warn)}
          {numField(protein,setProtein,"חלבון g",C.blue)}
          {numField(fat,setFat,"שומן g","#999")}
        </div>
        <button onClick={handleSave} disabled={!name||!kcal} style={{width:"100%",background:name&&kcal?C.accent:"#ddd",border:"none",borderRadius:10,color:name&&kcal?"#fff":"#aaa",padding:"13px",fontSize:14,fontWeight:700,cursor:name&&kcal?"pointer":"default"}}>💾 שמור כפתור</button>
      </div>
    </div>
  );
}

// ── MetricWeekChart ────────────────────────────────────────────────────────────
function MetricWeekChart({journal,metric,color,label,lang}){
  const H=54,W=280,PAD=14;
  const isHe=(lang||localStorage.getItem('nutrition_lang')||'he')!=='en';
  const DAY_LABELS=isHe?['א','ב','ג','ד','ה','ו','ש']:['Su','Mo','Tu','We','Th','Fr','Sa'];
  const xs=Array.from({length:7},(_,i)=>Math.round(PAD+i*(W-2*PAD)/6));
  const ref=useRef(null);
  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth",block:"nearest"});},[]);

  const days=[];
  for(let i=6;i>=0;i--){
    const d=new Date();d.setDate(d.getDate()-i);
    const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const tot=journal[k]?.totals;
    // Only count days with actual food entries (totals > 0)
    const v=(tot&&journal[k]?.entries?.length)?Number(tot[metric]||0):null;
    days.push({k,v,dow:d.getDay()});
  }
  const vals=days.filter(d=>d.v!==null&&d.v>0).map(d=>d.v);
  if(!vals.length) return(
    <div ref={ref} style={{background:"rgba(255,255,255,.68)",border:`1px solid ${color}33`,borderRadius:16,padding:"12px 14px",marginBottom:12,maxWidth:440}}>
      <div style={{fontSize:9,color,letterSpacing:1.4,textTransform:"uppercase",marginBottom:6,fontWeight:700}}>{label}</div>
      <div style={{fontSize:12,color:C.muted,textAlign:"center",padding:"10px 0"}}>{isHe?"אין נתונים שמורים לשבוע זה":"No saved data for this week"}</div>
    </div>
  );

  const minV=Math.min(...vals),maxV=Math.max(...vals);
  const pad=Math.max(maxV-minV,10)*0.2;
  const lo=Math.max(0,minV-pad),hi=maxV+pad,range=hi-lo;
  const toY=v=>Math.max(2,Math.min(H-2,H-(v-lo)/range*H));

  const pts=days.map((d,i)=>d.v!==null&&d.v>0?{x:xs[i],y:toY(d.v),v:d.v}:null);
  const known=pts.filter(Boolean);

  const crPath=ps=>{
    if(ps.length<2)return null;
    const s=[`M ${ps[0].x},${ps[0].y}`];
    for(let i=0;i<ps.length-1;i++){
      const p0=ps[Math.max(0,i-1)],p1=ps[i],p2=ps[i+1],p3=ps[Math.min(ps.length-1,i+2)];
      s.push(`C ${(p1.x+(p2.x-p0.x)/6).toFixed(1)},${(p1.y+(p2.y-p0.y)/6).toFixed(1)} ${(p2.x-(p3.x-p1.x)/6).toFixed(1)},${(p2.y-(p3.y-p1.y)/6).toFixed(1)} ${p2.x},${p2.y}`);
    }
    return s.join(' ');
  };
  const lp=known.length>=2?crPath(known):null;

  return(
    <div ref={ref} style={{background:"rgba(255,255,255,.68)",backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",border:`1px solid ${color}33`,borderRadius:16,padding:"10px 12px 8px",marginBottom:12,boxShadow:"0 3px 14px rgba(80,130,180,.08)",maxWidth:440}}>
      <div style={{fontSize:9,color,letterSpacing:1.4,textTransform:"uppercase",marginBottom:6,fontWeight:700}}>{label} — {isHe?"7 ימים אחרונים":"last 7 days"}</div>
      <div style={{overflow:"hidden",borderRadius:8}}>
        <svg width="100%" viewBox={`0 0 ${W} ${H+14}`} style={{display:"block"}}>
          {lp&&<>
            <path d={`${lp} L ${known[known.length-1].x},${H} L ${known[0].x},${H} Z`} fill={color} fillOpacity={0.1}/>
            <path d={lp} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </>}
          {known.map((p,i)=>(
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3.5" fill="white" stroke={color} strokeWidth="2"/>
              <text x={p.x} y={p.y-7} textAnchor="middle" fontSize="7.5" fill={color} fontWeight="700">
                {metric==='kcal'?Math.round(p.v):Number(p.v).toFixed(1)}
              </text>
            </g>
          ))}
          {days.map((d,i)=>(
            <text key={i} x={xs[i]} y={H+11} textAnchor="middle" fontSize="8" fill="#94a3b8">{DAY_LABELS[d.dow]}</text>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ── SugarWeekChart ─────────────────────────────────────────────────────────────
function SugarWeekChart({journal}){
  // Scale: range 60-140 (80 units) mapped to H=54px
  const H=54, W=280, PAD=14, RANGE=80, MIN_V=60;
  const toY=v=>Math.max(2,Math.min(H-2, H-(Number(v)-MIN_V)/RANGE*H));
  // x positions evenly distributed (LTR: index 0 = oldest = left, index 6 = today = right)
  const xs=Array.from({length:7},(_,i)=>Math.round(PAD+i*(W-2*PAD)/6));
  const y100=H-(100-MIN_V)/RANGE*H; // ≈27
  const y86 =H-(86 -MIN_V)/RANGE*H; // ≈37
  const HE=['א','ב','ג','ד','ה','ו','ש'];

  const days=[];
  for(let i=6;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const v=journal[k]?.bloodSugar?Number(journal[k].bloodSugar):null;
    days.push({k,v,dow:d.getDay()});
  }
  const known=days.map((d,i)=>d.v?{x:xs[i],y:toY(d.v)}:null).filter(Boolean);
  if(!known.length)return null;

  const crPath=ps=>{
    if(ps.length<2)return null;
    const s=[`M ${ps[0].x},${ps[0].y}`];
    for(let i=0;i<ps.length-1;i++){
      const p0=ps[Math.max(0,i-1)],p1=ps[i],p2=ps[i+1],p3=ps[Math.min(ps.length-1,i+2)];
      s.push(`C ${(p1.x+(p2.x-p0.x)/6).toFixed(1)},${(p1.y+(p2.y-p0.y)/6).toFixed(1)} ${(p2.x-(p3.x-p1.x)/6).toFixed(1)},${(p2.y-(p3.y-p1.y)/6).toFixed(1)} ${p2.x},${p2.y}`);
    }
    return s.join(' ');
  };
  const linePath=known.length>=2?crPath(known):null;

  return(
    <div style={{background:"rgba(255,255,255,.68)",backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",border:"1px solid rgba(255,255,255,.88)",borderRadius:18,padding:"12px 14px 10px",marginBottom:16,boxShadow:"0 4px 20px rgba(80,130,180,.1)",maxWidth:440}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div style={{fontSize:9.5,color:"#94a3b8",letterSpacing:1.4,textTransform:"uppercase"}}>🩸 סוכר — שבוע נוכחי</div>
        <div style={{display:"flex",gap:8}}>
          {[["≤85","#0d9488"],["86–99","#f59e0b"],["≥100","#dc2626"]].map(([l,c])=>(
            <span key={l} style={{fontSize:7.5,color:c,display:"inline-flex",alignItems:"center",gap:2}}>
              <span style={{width:6,height:2,borderRadius:1,background:"currentColor",display:"inline-block"}}></span>{l}
            </span>
          ))}
        </div>
      </div>

      {/* SVG — clipped, no overflow */}
      <div style={{overflow:"hidden",borderRadius:8}}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
          <defs>
            {/* Gradient stroke: red (top/high) → orange → green (bottom/low), mapped to y-axis */}
            <linearGradient id="sg-line" x1="0" y1="0" x2="0" y2={H} gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#dc2626"/>
              <stop offset={`${(y100/H*100-8).toFixed(0)}%`} stopColor="#dc2626"/>
              <stop offset={`${(y100/H*100+8).toFixed(0)}%`} stopColor="#f59e0b"/>
              <stop offset={`${(y86/H*100+8).toFixed(0)}%`}  stopColor="#15803d"/>
              <stop offset="100%" stopColor="#15803d"/>
            </linearGradient>
          </defs>
          {/* Subtle threshold lines */}
          <line x1={PAD} y1={y100} x2={W-PAD} y2={y100} stroke="rgba(220,38,38,.15)" strokeWidth="0.7" strokeDasharray="3,3"/>
          <line x1={PAD} y1={y86}  x2={W-PAD} y2={y86}  stroke="rgba(245,158,11,.15)" strokeWidth="0.7" strokeDasharray="3,3"/>
          <text x={W-2} y={y100-1} fontSize="5.5" fill="rgba(220,38,38,.45)" textAnchor="end" fontFamily="Heebo,sans-serif">100</text>
          <text x={W-2} y={y86-1}  fontSize="5.5" fill="rgba(245,158,11,.5)"  textAnchor="end" fontFamily="Heebo,sans-serif">86</text>
          {/* Gradient smooth line */}
          {linePath&&<path d={linePath} fill="none" stroke="url(#sg-line)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>}
          {/* Dots */}
          {days.map((d,i)=>{
            if(!d.v) return <circle key={i} cx={xs[i]} cy={H*0.58} r="2" fill="none" stroke="rgba(148,163,184,.25)" strokeWidth="1"/>;
            const y=toY(d.v),col=sugarColor(d.v);
            return <g key={i}>
              <circle cx={xs[i]} cy={y} r="5.5" fill="rgba(255,255,255,.9)" stroke={col} strokeWidth="1.5"/>
              <circle cx={xs[i]} cy={y} r="2.2" fill={col}/>
            </g>;
          })}
        </svg>
      </div>

      {/* Labels — direction:ltr so index 0 = left = matches SVG x */}
      <div style={{display:"flex",direction:"ltr",marginTop:5}}>
        {days.map((d,i)=>(
          <div key={i} style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:7.5,color:"#94a3b8"}}>{HE[d.dow]}</div>
            {d.v?<div style={{fontSize:8.5,fontWeight:700,color:sugarColor(d.v)}}>{d.v}</div>
                :<div style={{fontSize:8.5,color:"rgba(148,163,184,.4)"}}>—</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── JournalView ────────────────────────────────────────────────────────────────
function JournalView({onClose,onLoadDay,pid,lang}){
  const T=LANG[lang]||LANG.he;
  const [journal,setJournal]=useState(()=>loadJournal(pid||'default'));
  const [selected,setSelected]=useState(null);
  const [detailMode,setDetailMode]=useState("full");
  const [view,setView]=useState("list");
  const [activeChart,setActiveChart]=useState(null);
  const todayKey=getTodayKey();
  const days=Object.keys(journal).sort((a,b)=>b.localeCompare(a));
  const weekDays=days.slice(0,7);
  const wt=weekDays.reduce((acc,k)=>{const d=journal[k];return{kcal:acc.kcal+d.totals.kcal,carbs:acc.carbs+d.totals.carbs,protein:acc.protein+d.totals.protein,n:acc.n+1};},{kcal:0,carbs:0,protein:0,n:0});
  const deleteDay=key=>{const j={...journal};delete j[key];saveJournal(j,pid||'default');setJournal(j);if(selected===key)setSelected(null);};

  return (
    <div className="journal-screen fade">
      <div className="journal-header">
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>📓</span>
          <div><div style={{fontSize:11,color:C.muted,letterSpacing:2}}>{T.journalTitle}</div><div style={{fontSize:13,color:C.accent}}>{days.length} {T.daysSaved}</div></div>
        </div>
        <button onClick={onClose} style={{background:"none",border:"1px solid #e0e0e5",color:C.muted,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12}}>{T.close}</button>
      </div>
      <div className="tab-bar">
        {[[("list"),T.journalTab],[("week"),T.weekTab]].map(([v,l])=>(
          <button key={v} className={`tab${view===v?" active":""}`} onClick={()=>{setView(v);setSelected(null);}}>{l}</button>
        ))}
      </div>
      <div className="journal-body">
        {view==="list" && (
          <div>
            {days.length===0 && <div style={{padding:40,textAlign:"center",color:C.muted,fontSize:13}}>{T.noDays}</div>}
            {days.map(key=>(
              <div key={key}>
                <div onClick={()=>setSelected(selected===key?null:key)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",borderBottom:"1px solid #e0e0e5",cursor:"pointer",background:selected===key?"rgba(90,158,30,0.07)":"transparent"}}>
                  <div><div style={{fontSize:13,color:C.text,fontWeight:600}}>{getDateLabel(key)}</div><div style={{fontSize:11,color:C.muted,marginTop:3}}>{Math.round(journal[key].totals.kcal)} {T.kcal} · {Number(journal[key].totals.carbs).toFixed(1)}g {T.carbs}</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <button onClick={e=>{e.stopPropagation();deleteDay(key);}} style={{background:"none",border:"none",color:C.muted,fontSize:16,cursor:"pointer",padding:4}}>🗑</button>
                    <span style={{color:C.muted,fontSize:16,display:"inline-block",transform:selected===key?"rotate(90deg)":"none",transition:"transform 0.2s"}}>›</span>
                  </div>
                </div>
                {selected===key && (
                  <div style={{background:"rgba(255,255,255,.55)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid rgba(148,163,184,.18)"}} className="fade">
                    <div style={{display:"flex",gap:8,padding:"12px 20px 8px",flexWrap:"wrap",alignItems:"center"}}>
                      {[["full",T.details],["stats",T.statsTab]].map(([m,l])=>(
                        <button key={m} onClick={()=>setDetailMode(m)} style={{background:detailMode===m?C.accent:"transparent",border:`1px solid ${detailMode===m?C.accent:C.border}`,color:detailMode===m?"#fff":C.muted,padding:"5px 12px",borderRadius:16,fontSize:11,cursor:"pointer",fontWeight:detailMode===m?700:400}}>{l}</button>
                      ))}
                      {key===todayKey && (
                        <button onClick={()=>{onLoadDay(journal[key].entries);onClose();}} style={{marginRight:"auto",background:"transparent",border:`1px solid ${C.warn}`,color:C.warn,padding:"5px 12px",borderRadius:16,fontSize:11,cursor:"pointer"}}>{T.loadEdit}</button>
                      )}
                    </div>
                    {detailMode==="full" && (
                      <div style={{padding:"0 20px 12px"}}>
                        {journal[key].entries.map((e,i)=>(
                          <div key={i} style={{padding:"7px 0",borderBottom:"1px solid rgba(0,0,0,0.06)",display:"flex",justifyContent:"space-between"}}>
                            <span style={{fontSize:13,color:C.text}}>{e.label}</span>
                            <span style={{fontSize:12,color:C.muted}}>{Math.round(e.kcal)} {T.kcal} · {Number(e.carbs||0).toFixed(1)}g {T.carbs}</span>
                          </div>
                        ))}
                        {journal[key].bloodSugar&&(
                          <div style={{padding:"6px 0",borderBottom:"1px solid rgba(0,0,0,0.06)",display:"flex",justifyContent:"space-between"}}>
                            <span style={{fontSize:12,color:sugarColor(journal[key].bloodSugar)}}>{T.bloodSugarLabel}</span>
                            <span style={{fontSize:12,fontWeight:700,color:sugarColor(journal[key].bloodSugar)}}>{journal[key].bloodSugar} mg/dL</span>
                          </div>
                        )}
                        <div style={{marginTop:10,padding:"8px 0",borderTop:"1px solid rgba(90,158,30,0.27)",display:"flex",justifyContent:"space-between"}}>
                          <span style={{fontSize:12,fontWeight:700,color:C.accent}}>{T.total}</span>
                          <span style={{fontSize:12,color:C.accent}}>{Math.round(journal[key].totals.kcal)} {T.kcal} · {Number(journal[key].totals.carbs).toFixed(1)}g {T.carbs}</span>
                        </div>
                      </div>
                    )}
                    {detailMode==="stats" && (
                      <div style={{padding:"8px 20px 16px"}} className="g3">
                        {[{l:T.kcal,v:Math.round(journal[key].totals.kcal),c:C.accent},{l:T.carbsFull,v:Number(journal[key].totals.carbs).toFixed(1)+"g",c:C.warn},{l:T.protein,v:Number(journal[key].totals.protein).toFixed(1)+"g",c:C.blue}].map(({l,v,c})=>(
                          <div key={l} style={{background:"rgba(255,255,255,.68)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",borderRadius:12,padding:"10px 8px",textAlign:"center",border:"1px solid rgba(255,255,255,.8)"}}>
                            <div style={{fontSize:20,fontWeight:900,color:c}}>{v}</div>
                            <div style={{fontSize:10,color:C.muted,marginTop:3}}>{l}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {view==="week" && (
          <div style={{padding:20}}>
            {weekDays.length===0 && <div style={{textAlign:"center",color:C.muted,fontSize:13,padding:30}}>{T.noData}</div>}
            {weekDays.length>0 && <>
              <div style={{fontSize:11,color:C.muted,letterSpacing:1.5,marginBottom:12}}>{T.avgDaily} ({weekDays.length} {T.days})</div>
              <div className="g3" style={{marginBottom:12}}>
                {[{l:T.kcal,v:Math.round(wt.kcal/wt.n),c:C.accent,m:"kcal"},{l:T.carbsFull,v:(wt.carbs/wt.n).toFixed(1)+"g",c:C.warn,m:"carbs"},{l:T.protein,v:(wt.protein/wt.n).toFixed(1)+"g",c:C.blue,m:"protein"}].map(({l,v,c,m})=>{
                  const isActive=activeChart===m;
                  return(
                    <div key={l} onClick={()=>setActiveChart(isActive?null:m)}
                      style={{background:"rgba(255,255,255,.68)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",borderRadius:16,padding:"14px 10px",textAlign:"center",border:`${isActive?"2":"1"}px solid ${isActive?c:"rgba(255,255,255,.88)"}`,boxShadow:"0 3px 14px rgba(80,130,180,.08)",cursor:"pointer",transition:"border .15s"}}>
                      <div style={{fontSize:22,fontWeight:900,color:c}}>{v}</div>
                      <div style={{fontSize:10,color:C.muted,marginTop:4}}>{l}</div>
                      <div style={{fontSize:8,color:isActive?c:"#cbd5e1",marginTop:3}}>{isActive?"▲":"▼"}</div>
                    </div>
                  );
                })}
              </div>
              {activeChart&&<MetricWeekChart key={activeChart} journal={journal} metric={activeChart} color={activeChart==="kcal"?C.accent:activeChart==="carbs"?C.warn:C.blue} label={activeChart==="kcal"?T.kcal:activeChart==="carbs"?T.carbsFull:T.protein} lang={lang}/>}
              <SugarWeekChart journal={journal}/>
              <div className="card">
                {weekDays.map((key,i)=>(
                  <div key={key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:i<weekDays.length-1?"1px solid #e0e0e5":"none"}}>
                    <div style={{fontSize:12,color:C.text}}>{getDateLabel(key)}</div>
                    <div style={{fontSize:11,color:C.muted}}>{Math.round(journal[key].totals.kcal)} {T.kcal} · {Number(journal[key].totals.carbs).toFixed(1)}g</div>
                  </div>
                ))}
                <div className="summary-row">
                  <span style={{fontSize:12,fontWeight:700,color:C.accent}}>{T.total} ({weekDays.length} {T.days})</span>
                  <span style={{fontSize:12,color:C.accent}}>{Math.round(wt.kcal)} {T.kcal} · {wt.carbs.toFixed(1)}g {T.carbs}</span>
                </div>
              </div>
            </>}
          </div>
        )}
      </div>
    </div>
  );
}




// ── PantryModal ────────────────────────────────────────────────────────────────
function PantryModal({onClose,lang}){
  const isHe=(lang||'he')!=='en';
  const [pantry,setPantry]=useState(loadPantry);
  const [inputs,setInputs]=useState(()=>Object.fromEntries(FRIDGE_CATS.map(c=>[c.key,{name:"",qty:""}])));
  const [open,setOpen]=useState(()=>Object.fromEntries(FRIDGE_CATS.map(c=>[c.key,true])));
  const [imgLoading,setImgLoading]=useState({});
  const imgRefs=useRef({});

  const update=p=>{setPantry(p);savePantryLS(p);};

  const addItem=(cat)=>{
    const {name,qty}=inputs[cat];
    if(!name.trim())return;
    const items=[...(pantry[cat]||[])];
    const idx=items.findIndex(i=>i.name.toLowerCase()===name.trim().toLowerCase());
    if(idx>=0) items[idx]={...items[idx],qty:qty.trim()||items[idx].qty};
    else items.push({id:Date.now()+Math.random(),name:name.trim(),qty:qty.trim()});
    update({...pantry,[cat]:items});
    setInputs(i=>({...i,[cat]:{name:"",qty:""}}));
  };

  const handlePantryImage=(e,cat)=>{
    const file=e.target.files[0];
    if(!file)return; e.target.value="";
    setImgLoading(l=>({...l,[cat]:true}));
    const reader=new FileReader();
    reader.onload=async ev=>{
      const b64=ev.target.result.split(',')[1];
      try{
        const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({pantryImageData:b64,pantryImageMediaType:file.type||'image/jpeg'})});
        if(!res.ok) throw new Error();
        const d=await res.json();
        if(d.name) setInputs(i=>({...i,[cat]:{name:d.name,qty:d.qty||""}}));
      }catch{}
      setImgLoading(l=>({...l,[cat]:false}));
    };
    reader.readAsDataURL(file);
  };

  const removeItem=(cat,id)=>update({...pantry,[cat]:(pantry[cat]||[]).filter(i=>i.id!==id)});
  const updateQty=(cat,id,qty)=>update({...pantry,[cat]:(pantry[cat]||[]).map(i=>i.id===id?{...i,qty}:i)});

  return(
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide" style={{maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:15,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>
            <img src={isHe?"/Nutrition/pantry-he.png":"/Nutrition/pantry-en.png"} style={{width:44,height:44,objectFit:"contain"}} alt=""/>
            {isHe?"מזווה":"Pantry"}
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>
        <div style={{fontSize:11,color:C.muted,marginBottom:14}}>{isHe?"מה יש בבית? הכנס פריטים עם כמויות:":"What do you have at home? Add items with quantities:"}</div>
        {FRIDGE_CATS.map(cat=>(
          <div key={cat.key} style={{marginBottom:10}}>
            <input ref={el=>imgRefs.current[cat.key]=el} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif"
              style={{display:"none"}} onChange={e=>handlePantryImage(e,cat.key)}/>
            <button onClick={()=>setOpen(o=>({...o,[cat.key]:!o[cat.key]}))}
              style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",background:"none",border:"none",cursor:"pointer",padding:"4px 0",fontFamily:"inherit"}}>
              <span style={{fontSize:12,fontWeight:700,color:C.text}}>{isHe?cat.he:cat.en}
                {(pantry[cat.key]||[]).length>0&&<span style={{marginRight:5,background:C.accent,color:"#fff",borderRadius:10,fontSize:9,padding:"1px 5px"}}>{(pantry[cat.key]||[]).length}</span>}
              </span>
              <span style={{fontSize:10,color:C.muted,transform:open[cat.key]?"rotate(180deg)":"none",transition:"transform .2s",display:"inline-block"}}>▾</span>
            </button>
            {open[cat.key]&&<>
              <div style={{display:"flex",gap:6,marginBottom:6,marginTop:4}}>
                <input value={inputs[cat.key].name} onChange={e=>setInputs(i=>({...i,[cat.key]:{...i[cat.key],name:e.target.value}}))}
                  onKeyDown={e=>e.key==="Enter"&&addItem(cat.key)}
                  placeholder={isHe?"שם מוצר":"Product"} className="inp" style={{flex:2,fontSize:12,padding:"6px 8px"}}/>
                <input value={inputs[cat.key].qty} onChange={e=>setInputs(i=>({...i,[cat.key]:{...i[cat.key],qty:e.target.value}}))}
                  onKeyDown={e=>e.key==="Enter"&&addItem(cat.key)}
                  placeholder={isHe?"כמות":"Qty"} className="inp" style={{flex:1,fontSize:12,padding:"6px 8px"}}/>
                <button onClick={()=>imgRefs.current[cat.key]&&imgRefs.current[cat.key].click()} disabled={imgLoading[cat.key]}
                  style={{background:"#f5f5f7",border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,padding:"0 8px",cursor:"pointer",fontSize:16,minWidth:36}}>
                  {imgLoading[cat.key]?<span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⟳</span>:"📷"}
                </button>
                <button onClick={()=>addItem(cat.key)} style={{background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"0 10px",cursor:"pointer",fontSize:16}}>+</button>
              </div>
              {(pantry[cat.key]||[]).map(item=>(
                <div key={item.id} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",borderBottom:`1px solid ${C.border}`}}>
                  <span style={{flex:1,fontSize:12,color:C.text}}>{item.name}</span>
                  <input value={item.qty} onChange={e=>updateQty(cat.key,item.id,e.target.value)}
                    placeholder="כמות" style={{width:70,border:`1px solid ${C.border}`,borderRadius:6,padding:"3px 6px",fontSize:11,textAlign:"center",fontFamily:"inherit"}}/>
                  <button onClick={()=>removeItem(cat.key,item.id)} style={{background:"none",border:"none",color:C.danger,fontSize:16,cursor:"pointer",padding:"0 3px"}}>×</button>
                </div>
              ))}
            </>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ShoppingListModal ──────────────────────────────────────────────────────────
function ShoppingListModal({onClose,lang,pid}){
  const isHe=(lang||'he')!=='en';
  const [items,setItems]=useState(loadShopping);
  const [loading,setLoading]=useState(false);
  const [newName,setNewName]=useState("");
  const [newQty,setNewQty]=useState("");
  const [error,setError]=useState("");

  const save=list=>{setItems(list);saveShopping(list);};

  const toggle=id=>save(items.map(i=>i.id===id?{...i,checked:!i.checked}:i));
  const remove=id=>save(items.filter(i=>i.id!==id));
  const clearBought=()=>save(items.filter(i=>!i.checked));
  const addManual=()=>{
    if(!newName.trim())return;
    save([...items,{id:Date.now()+Math.random(),name:newName.trim(),qty:newQty.trim(),checked:false,auto:false}]);
    setNewName("");setNewQty("");
  };

  const generate=async()=>{
    setLoading(true);setError("");
    const pantry=loadPantry();
    const recentFoods=getRecentFoodLabels(pid,7);
    const pantryStr=FRIDGE_CATS.flatMap(c=>(pantry[c.key]||[]).map(i=>`${i.name}${i.qty?` (${i.qty})`:""}`)).join(', ')||"ריק";
    try{
      const r=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({shoppingList:{pantry:pantryStr,recentFoods,isHe}})});
      const d=await r.json();
      if(d.error)throw new Error(d.error);
      const newItems=(d.items||[]).map(i=>({id:Date.now()+Math.random(),name:i.name,qty:i.qty||"",checked:false,auto:true}));
      // merge: don't duplicate existing unchecked items
      const existingNames=new Set(items.filter(i=>!i.checked).map(i=>i.name.toLowerCase()));
      const fresh=newItems.filter(i=>!existingNames.has(i.name.toLowerCase()));
      save([...items,...fresh]);
    }catch(e){setError(isHe?"שגיאה בהפקת הרשימה":"Error generating list");}
    setLoading(false);
  };

  const bought=items.filter(i=>i.checked).length;

  return(
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide" style={{maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:15,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>
            <img src="/Nutrition/shopping-cart.png" style={{width:44,height:44,objectFit:"contain"}} alt=""/>
            {isHe?"רשימת קניות":"Shopping List"}
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>

        {/* Generate button */}
        <button onClick={generate} disabled={loading} style={{width:"100%",background:"linear-gradient(135deg,#14b8a6,#059669)",border:"none",borderRadius:10,color:"#fff",padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          {loading?<span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⟳</span>:"✨"}
          {loading?(isHe?"מנתח...":"Analyzing..."):(isHe?"הצע רשימת קניות לפי המזווה והרגלים":"Suggest based on pantry & habits")}
        </button>
        {error&&<div style={{color:C.danger,fontSize:12,marginBottom:8}}>{error}</div>}

        {/* Add manual */}
        <div style={{display:"flex",gap:6,marginBottom:12}}>
          <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addManual()}
            placeholder={isHe?"הוסף פריט...":"Add item..."} className="inp" style={{flex:2,fontSize:12}}/>
          <input value={newQty} onChange={e=>setNewQty(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addManual()}
            placeholder={isHe?"כמות":"Qty"} className="inp" style={{flex:1,fontSize:12}}/>
          <button onClick={addManual} style={{background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"0 10px",cursor:"pointer",fontSize:16}}>+</button>
        </div>

        {/* List */}
        {items.length===0
          ?<div style={{textAlign:"center",color:C.muted,fontSize:13,padding:"20px 0"}}>{isHe?"הרשימה ריקה":"List is empty"}</div>
          :<div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:12}}>
            {items.filter(i=>!i.checked).map(item=>(
              <div key={item.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"rgba(255,255,255,.7)",borderRadius:10,border:`1px solid ${item.auto?"rgba(13,148,136,.2)":C.border}`}}>
                <button onClick={()=>toggle(item.id)} style={{width:20,height:20,borderRadius:6,border:`2px solid ${C.accent}`,background:"transparent",cursor:"pointer",flexShrink:0}}/>
                <span style={{flex:1,fontSize:13,color:C.text}}>{item.name}</span>
                {item.qty&&<span style={{fontSize:11,color:C.muted,fontWeight:600}}>{item.qty}</span>}
                {item.auto&&<span style={{fontSize:9,color:C.accent,background:"rgba(13,148,136,.08)",borderRadius:8,padding:"2px 5px"}}>AI</span>}
                <button onClick={()=>remove(item.id)} style={{background:"none",border:"none",color:C.muted,fontSize:15,cursor:"pointer",padding:"0 2px"}}>×</button>
              </div>
            ))}
            {bought>0&&<>
              <div style={{fontSize:10,color:C.muted,letterSpacing:1.2,textTransform:"uppercase",marginTop:6,marginBottom:4}}>{isHe?"נרכש":"Bought"} ({bought})</div>
              {items.filter(i=>i.checked).map(item=>(
                <div key={item.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"rgba(148,163,184,.06)",borderRadius:10,opacity:.7}}>
                  <button onClick={()=>toggle(item.id)} style={{width:20,height:20,borderRadius:6,border:`2px solid ${C.accent}`,background:C.accent,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11}}>✓</button>
                  <span style={{flex:1,fontSize:13,color:C.muted,textDecoration:"line-through"}}>{item.name}</span>
                  {item.qty&&<span style={{fontSize:11,color:C.muted}}>{item.qty}</span>}
                  <button onClick={()=>remove(item.id)} style={{background:"none",border:"none",color:C.muted,fontSize:15,cursor:"pointer",padding:"0 2px"}}>×</button>
                </div>
              ))}
              <button onClick={clearBought} style={{width:"100%",background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px",fontSize:12,color:C.muted,cursor:"pointer",marginTop:4}}>
                {isHe?"נקה שנרכש":"Clear bought"}
              </button>
            </>}
          </div>
        }
      </div>
    </div>
  );
}

// ── ExportImportModal ──────────────────────────────────────────────────────────
function ExportImportModal({pid, onClose}){
  const [importing,setImporting]=useState(false);
  const [importText,setImportText]=useState("");
  const [msg,setMsg]=useState(null);
  const [filename,setFilename]=useState(`nutrition-backup-${pid}-${new Date().toISOString().slice(0,10)}`);

  const exportData=()=>{
    const data={
      version:4,
      exportDate:new Date().toISOString(),
      pid,
      profiles:loadProfiles(),
      activeProfileId:loadActiveProfileId(),
      journal:loadJournal(pid),
      customBtns:loadCustomBtns(pid),
      customDB:loadCustomDB(pid),
      fridge:loadFridge(),
      pantry:loadPantry(),
      shopping:loadShopping(),
      savedPrefs:JSON.parse(localStorage.getItem("nutrition_saved_prefs")||"[]"),
      quickFoods:loadQuickFoods(pid),
    };
    const json=JSON.stringify(data,null,2);
    const fname=(filename.trim()||`nutrition-backup-${pid}`).replace(/\.json$/,"")+".json";
    const blob=new Blob([json],{type:"application/json"});
    if(navigator.share && navigator.canShare) {
      const file=new File([blob],fname,{type:"application/json"});
      if(navigator.canShare({files:[file]})){
        navigator.share({files:[file],title:"Nutrition Backup"});
        setMsg({type:"success",text:"✓ שתף/שמור את הקובץ"});
        return;
      }
    }
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url; a.download=fname;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMsg({type:"success",text:"✓ הקובץ נשמר בהצלחה"});
  };

  const importData=()=>{
    try{
      const data=JSON.parse(importText.trim());
      if(!data.version||!data.journal) throw new Error("פורמט לא תקין");
      const targetPid=pid;
      if(data.profiles) saveProfiles(data.profiles);
      if(data.activeProfileId) saveActiveProfileId(data.activeProfileId);
      if(data.journal) saveJournal(data.journal,targetPid);
      if(data.customBtns) saveCustomBtns(data.customBtns,targetPid);
      if(data.customDB) saveCustomDB(data.customDB,targetPid);
      if(data.fridge) saveFridgeLS(data.fridge);
      if(data.pantry) savePantryLS(data.pantry);
      if(data.shopping) saveShopping(data.shopping);
      if(data.savedPrefs) localStorage.setItem("nutrition_saved_prefs",JSON.stringify(data.savedPrefs));
      if(data.quickFoods) saveQuickFoods(data.quickFoods,targetPid);
      setMsg({type:"success",text:`✓ יובאו ${Object.keys(data.journal||{}).length} ימים בהצלחה! רענן את הדף.`});
      setImporting(false);
      setImportText("");
    }catch(e){
      setMsg({type:"error",text:"שגיאה: "+e.message});
    }
  };

  const importFromFile=(e)=>{
    const file=e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>setImportText(ev.target.result);
    reader.readAsText(file);
  };

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:700}}>📤 ייצוא / ייבוא נתונים</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>

        {msg && (
          <div style={{background:msg.type==="success"?"#f0fae8":"#fff0f0",border:`1px solid ${msg.type==="success"?C.accent:C.danger}`,borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:13,color:msg.type==="success"?C.accent:C.danger}}>
            {msg.text}
          </div>
        )}

        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>ייצוא נתונים</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:10,lineHeight:1.6}}>
            שומר קובץ JSON עם כל היומן, הכפתורים, המאגר האישי והמזווה שלך.
          </div>
          <div style={{marginBottom:8}}>
            <input
              value={filename}
              onChange={e=>setFilename(e.target.value)}
              style={{width:"100%",boxSizing:"border-box",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",fontSize:12,fontFamily:"inherit",direction:"ltr",textAlign:"left"}}
              placeholder="שם הקובץ"
            />
          </div>
          <button onClick={exportData} style={{width:"100%",background:C.accent,border:"none",borderRadius:10,color:"#fff",padding:"12px",fontSize:13,fontWeight:700,cursor:"pointer"}}>
            💾 שמור קובץ גיבוי
          </button>
        </div>

        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:16}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>ייבוא נתונים</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:10,lineHeight:1.6}}>
            טעינת נתונים מקובץ גיבוי קודם. ⚠️ ידרוס את הנתונים הקיימים בפרופיל הנוכחי.
          </div>
          {!importing ? (
            <button onClick={()=>setImporting(true)} style={{width:"100%",background:"#f5f5f7",border:`1px solid ${C.border}`,borderRadius:10,color:C.muted,padding:"12px",fontSize:13,fontWeight:700,cursor:"pointer"}}>
              📂 ייבא מקובץ
            </button>
          ) : (
            <div className="fade">
              <input type="file" accept=".json" onChange={importFromFile}
                style={{width:"100%",marginBottom:8,fontSize:12}}/>
              {importText && (
                <>
                  <div style={{fontSize:11,color:C.accent,marginBottom:8}}>✓ קובץ נטען — לחצי ייבא</div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>{setImporting(false);setImportText("");}} className="btn-muted" style={{flex:1}}>ביטול</button>
                    <button onClick={importData} style={{flex:2,background:C.warn,border:"none",borderRadius:8,color:"#fff",padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer"}}>ייבא עכשיו</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ── SetupScreen ────────────────────────────────────────────────────────────────
function SetupScreen({onDone}){
  const [name,setName]=useState("");
  const [emoji,setEmoji]=useState("👩");
  const [maxKcal,setMaxKcal]=useState(1800);
  const [maxCarbs,setMaxCarbs]=useState(80);
  const EMOJIS=["👩","👨","👧","👦","👵","👴","🧑","👩‍⚕️","👨‍⚕️","🧑‍🍳","🏃","💪","🧘","🌸","🌟","⭐","🦋","🐱","🐶","🦊","🍎","🥑","🌿","❤️","💙","💚","🔥","✨","🎯","🏅"];
  const create=()=>{
    if(!name.trim())return;
    onDone({id:"profile_"+Date.now(),name:name.trim(),emoji,maxKcal,maxCarbs,maxProtein:120});
  };
  return (
    <div style={{minHeight:"100vh",background:"#f5f5f7",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{fontSize:48,marginBottom:12}}>{emoji}</div>
      <div style={{fontSize:20,fontWeight:900,color:C.accent,marginBottom:4}}>ברוכה הבאה!</div>
      <div style={{fontSize:13,color:C.muted,marginBottom:28,textAlign:"center"}}>צרי פרופיל ראשון כדי להתחיל</div>
      <div style={{background:"#fff",borderRadius:16,padding:20,width:"100%",maxWidth:360,boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
        <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700}}>שם</div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="שם הפרופיל" className="inp" style={{marginBottom:14}}/>
        <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:700}}>אימוג׳י</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
          {EMOJIS.map(em=>(
            <button key={em} onClick={()=>setEmoji(em)} style={{width:38,height:38,border:`2px solid ${em===emoji?C.accent:"#e0e0e5"}`,borderRadius:8,background:em===emoji?"rgba(90,158,30,0.1)":"#fff",fontSize:20,cursor:"pointer"}}>{em}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:12,marginBottom:16}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:700}}>יעד קלוריות</div>
            <input type="number" value={maxKcal} onChange={e=>setMaxKcal(parseInt(e.target.value)||1800)} className="inp"/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:700}}>יעד פחמ׳ (g)</div>
            <input type="number" value={maxCarbs} onChange={e=>setMaxCarbs(parseInt(e.target.value)||80)} className="inp"/>
          </div>
        </div>
        <button onClick={create} disabled={!name.trim()} style={{width:"100%",background:name.trim()?C.accent:"#ddd",border:"none",borderRadius:10,color:name.trim()?"#fff":"#aaa",padding:"13px",fontSize:14,fontWeight:700,cursor:name.trim()?"pointer":"default"}}>
          🚀 התחל לעקוב
        </button>
      </div>
    </div>
  );
}
// ── ProfileModal ───────────────────────────────────────────────────────────────
function ProfileModal({profiles, activeId, onSelect, onClose, onBackup}){
  const [showNew,setShowNew]=useState(false);
  const [newName,setNewName]=useState("");
  const [newEmoji,setNewEmoji]=useState("👤");
  const EMOJIS=["👩","👨","👧","👦","👵","👴","🧑","👩‍⚕️","👨‍⚕️","🧑‍🍳","🏃","💪","🧘","🌸","🌟","⭐","🦋","🐱","🐶","🦊","🍎","🥑","🌿","❤️","💙","💚","🔥","✨","🎯","🏅"];

  const createProfile=()=>{
    if(!newName.trim())return;
    const id="profile_"+Date.now();
    const p={id,name:newName.trim(),emoji:newEmoji,maxKcal:1800,maxCarbs:80,maxProtein:120};
    const updated=[...profiles,p];
    saveProfiles(updated);
    onSelect(p);
  };

  const deleteProfile=(id)=>{
    if(id==="default")return;
    const updated=profiles.filter(p=>p.id!==id);
    saveProfiles(updated);
    if(activeId===id) onSelect(updated[0]);
    else onSelect(profiles.find(p=>p.id===activeId));
  };

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:700}}>👥 פרופילים</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
          {profiles.map(p=>(
            <div key={p.id} onClick={()=>{onSelect(p);onClose();}}
              style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:p.id===activeId?"rgba(90,158,30,0.1)":"#f5f5f7",border:`1px solid ${p.id===activeId?C.accent:C.border}`,borderRadius:10,padding:"12px 14px",cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:22}}>{p.emoji}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:p.id===activeId?700:400,color:p.id===activeId?C.accent:C.text}}>{p.name}</div>
                  <div style={{fontSize:10,color:C.muted}}>{p.maxKcal} קק״ל · {p.maxCarbs}g פחמ׳</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                {p.id===activeId && <span style={{fontSize:10,color:C.accent,fontWeight:700}}>פעיל</span>}
                {p.id!=="default" && <button onClick={e=>{e.stopPropagation();deleteProfile(p.id);}} style={{background:"none",border:"none",color:C.muted,fontSize:16,cursor:"pointer",padding:4}}>🗑</button>}
              </div>
            </div>
          ))}
        </div>
        {!showNew
          ? <><button onClick={()=>setShowNew(true)} style={{width:"100%",background:"transparent",border:`1px dashed ${C.border}`,borderRadius:10,padding:"10px",fontSize:13,color:C.muted,cursor:"pointer",marginBottom:8}}>+ פרופיל חדש</button>
            <button onClick={onBackup} style={{width:"100%",background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px",fontSize:13,color:C.muted,cursor:"pointer"}}>💾 גיבוי וייבוא נתונים</button></>

          : (
            <div className="fade" style={{background:"#f5f5f7",borderRadius:10,padding:12}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:6}}>שם</div>
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="שם הפרופיל" className="inp" style={{marginBottom:10}}/>
              <div style={{fontSize:11,color:C.muted,marginBottom:6}}>אימוג׳י</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                {EMOJIS.map(em=>(
                  <button key={em} onClick={()=>setNewEmoji(em)} style={{width:36,height:36,border:`1px solid ${em===newEmoji?C.accent:C.border}`,borderRadius:8,background:em===newEmoji?"rgba(90,158,30,0.1)":"#fff",fontSize:18,cursor:"pointer"}}>{em}</button>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setShowNew(false)} className="btn-muted" style={{flex:1}}>ביטול</button>
                <button onClick={createProfile} disabled={!newName.trim()} style={{flex:2,background:newName.trim()?C.accent:"#ddd",border:"none",borderRadius:8,color:newName.trim()?"#fff":"#aaa",padding:"10px",fontSize:13,fontWeight:700,cursor:newName.trim()?"pointer":"default"}}>צור פרופיל</button>
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
}
// ── QuickFoodChip ──────────────────────────────────────────────────────────────
function QuickFoodChip({food,onAdd,editMode,onRemove,onEdit}){
  if(editMode) return (
    <div style={{position:"relative"}}>
      <button className="chip" style={{opacity:0.7}}>
        <span>{food.label}</span>
        <span className="chip-sub">{food.kcal} {getT().kcal} · {food.carbs}g {getT().carbs}</span>
      </button>
      <button onClick={()=>onRemove(food.id)} style={{position:"absolute",top:-4,right:-4,background:C.danger,border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>×</button>
      <button onClick={()=>onEdit(food)} style={{position:"absolute",top:-4,left:-4,background:C.warn,border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>✏</button>
    </div>
  );
  return (
    <button className="chip" onClick={()=>onAdd({
        ...food, label:getFoodLabel(food), uid:Date.now()+Math.random(), count:1,
        perUnit:{kcal:food.kcal,carbs:food.carbs,protein:food.protein||0,fat:food.fat||0}
      })}>
      <span>{getFoodLabel(food)}</span>
      <span className="chip-sub">{food.kcal} {getT().kcal} · {food.carbs}g {getT().carbs}</span>
    </button>
  );
}

// ── EditQuickFoodModal ─────────────────────────────────────────────────────────
function EditQuickFoodModal({food,onSave,onClose}){
  const [label,setLabel]=useState(food.label);
  const [desc,setDesc]=useState(food.label);
  const [loading,setLoading]=useState(false);
  const [kcal,setKcal]=useState(String(food.kcal));
  const [carbs,setCarbs]=useState(String(food.carbs));
  const [protein,setProtein]=useState(String(food.protein||0));
  const [fat,setFat]=useState(String(food.fat||0));
  const [error,setError]=useState(null);

  const ask=async()=>{
    if(!desc.trim())return;
    setLoading(true);setError(null);
    try{
      const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({mealDescription:desc})
      });
      if(!res.ok) throw new Error("שגיאת שרת");
      const d=await res.json();
      if(d.error||!d.kcal) throw new Error(d.error||"תגובה לא תקינה");
      setKcal(String(d.kcal));
      setCarbs(String(d.carbs||0));
      setProtein(String(d.protein||0));
      setFat(String(d.fat||0));
      if(d.label) setLabel(d.label);
    }catch(e){setError(e.message);}
    setLoading(false);
  };

  const save=()=>{
    onSave({...food,label,kcal:parseFloat(kcal)||0,carbs:parseFloat(carbs)||0,protein:parseFloat(protein)||0,fat:parseFloat(fat)||0});
  };

  const numField=(v,s,p,col)=>(
    <div className="num-wrap">
      <input type="number" value={v} onChange={e=>s(e.target.value)} style={{borderColor:v?col:C.border}}/>
      <div className="num-lbl" style={{color:col}}>{p}</div>
    </div>
  );

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:700}}>✏️ עריכת כפתור</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>
        <div style={{fontSize:11,color:C.muted,marginBottom:4}}>שם הכפתור</div>
        <input value={label} onChange={e=>setLabel(e.target.value)} className="inp" style={{marginBottom:12,borderColor:label?C.accent:C.border}}/>
        <div style={{fontSize:11,color:C.muted,marginBottom:4}}>תיאור לחישוב ע״י Claude</div>
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3}
          placeholder="תארי בחופשיות, למשל: אצבע גבינה צהובה 20g"
          className="inp" style={{marginBottom:8,resize:"none",lineHeight:1.5,fontSize:13}}/>
        <button onClick={ask} disabled={loading}
          style={{width:"100%",background:"linear-gradient(135deg,#5a9e1e,#7bc42e)",border:"none",borderRadius:8,color:"#fff",padding:"9px",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          {loading?<span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⟳</span>:"✨"}
          {loading?"מחשב...":"חשב עם Claude"}
        </button>
        {error&&<div style={{fontSize:11,color:C.danger,marginBottom:8,textAlign:"center"}}>⚠ {error}</div>}
        <div className="g2" style={{marginBottom:14}}>
          {[["kcal",kcal,setKcal,"קק״ל",C.accent],["carbs",carbs,setCarbs,"פחמ׳ g",C.warn],["protein",protein,setProtein,"חלבון g",C.blue],["fat",fat,setFat,"שומן g","#999"]].map(([k,v,s,p,c])=>(
            <div key={k} className="num-wrap">
              <input type="number" value={v} onChange={e=>s(e.target.value)} style={{borderColor:v?c:C.border}}/>
              <div className="num-lbl" style={{color:c}}>{p}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} className="btn-muted" style={{flex:1}}>ביטול</button>
          <button onClick={save} disabled={!label||!kcal}
            style={{flex:2,background:label&&kcal?C.accent:"#ddd",border:"none",borderRadius:8,color:label&&kcal?"#fff":"#aaa",padding:"10px",fontSize:13,fontWeight:700,cursor:label&&kcal?"pointer":"default"}}>
            💾 שמור
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SplashScreen ───────────────────────────────────────────────────────────────
function SplashScreen({onDone}){
  const wrapRef=useRef(null);
  useEffect(()=>{
    imgUtilsReady.then(()=>{ if(window._loadSplashImages) window._loadSplashImages(); });
    const t1=setTimeout(()=>{ // start exit at 2.5s
      const el=wrapRef.current; if(!el)return;
      // Direct DOM manipulation guarantees animation trigger
      el.style.animation='splashExitContent .95s ease-in forwards';
      const burst=document.createElement('div');
      burst.style.cssText='position:absolute;top:50%;left:50%;width:70px;height:70px;border-radius:50%;background:rgba(170,240,90,.9);pointer-events:none;z-index:10;transform:translate(-50%,-50%) scale(0);animation:splashBurst .95s cubic-bezier(.15,.6,.3,1) forwards;';
      el.appendChild(burst);
    },2500);
    const t2=setTimeout(onDone,3500);
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[]);
  const R=140, DUR=16;
  const icons=[
    {id:'sp-cup',  delay:0},
    {id:'sp-salad',delay:-(DUR/6)},
    {id:'sp-dumb', delay:-(DUR/6*2)},
    {id:'sp-tape', delay:-(DUR/6*3)},
    {id:'sp-leaf', delay:-(DUR/6*4)},
    {id:'sp-heart',delay:-(DUR/6*5)},
  ];
  return (
    <div ref={wrapRef} style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:9999,overflow:'hidden',
      background:'linear-gradient(150deg,#edfad5 0%,#bde890 52%,#92d045 100%)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      {/* bg circles */}
      <div style={{position:'absolute',top:-100,right:-100,width:320,height:320,borderRadius:'50%',
        background:'rgba(255,255,255,.18)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:-80,left:-80,width:280,height:280,borderRadius:'50%',
        background:'rgba(255,255,255,.13)',pointerEvents:'none'}}/>
      {/* Speech bubble */}
      <canvas id="sp-bubble"/>
      {/* Hub */}
      <div style={{position:'relative',width:R*2+80,height:R*2+80,flexShrink:0}}>
        {/* Orbit track */}
        <div style={{position:'absolute',top:'50%',left:'50%',width:R*2,height:R*2,
          marginTop:-R,marginLeft:-R,borderRadius:'50%',
          border:'2px dashed rgba(90,158,30,.35)',
          animation:'splashTrackPulse 2.5s ease-in-out infinite',pointerEvents:'none'}}/>
        {/* Orbit items */}
        {icons.map(({id,delay})=>(
          <div key={id} className="sp-orbit-rot" style={{animationDelay:`${delay}s`}}>
            <div className="sp-orbit-pos"><canvas id={id}/></div>
          </div>
        ))}
        {/* Avocado */}
        <div className="sp-avo-center">
          <div className="sp-avo-anim"><canvas id="sp-avo"/></div>
        </div>
      </div>
      {/* Title */}
      <div style={{fontSize:26,fontWeight:900,color:'#1e4a06',marginTop:16,letterSpacing:-0.5,
        textShadow:'0 2px 10px rgba(255,255,255,.6)',animation:'splashFadeUp .5s ease .65s both'}}>מעקב תזונה</div>
      <div style={{fontSize:12,color:'#4a7a10',letterSpacing:2.5,marginTop:6,
        animation:'splashFadeUp .5s ease .85s both'}}>חכם · מהיר · מדויק</div>
      {/* Dots */}
      <div style={{display:'flex',gap:7,marginTop:20}}>
        {[0.25,0.43,0.61].map(d=>(
          <div key={d} style={{width:8,height:8,borderRadius:'50%',background:'#5a9e1e',
            animation:`splashDot 1.2s ease-in-out ${d}s infinite`}}/>
        ))}
      </div>
    </div>
  );
}

// ── i18n ───────────────────────────────────────────────────────────────────────
const LANG={
  he:{greeting:"שלום",calories:"קלוריות היום",consumed:"נאכל",target:"עד",sugar:"סוכר",left:"נותרו",
      kcal:"קק״ל",mgdl:"mg/dL",goal:"עד",
      carbs:"פחמ׳",carbsFull:"פחמימות",protein:"חלבון",fat:"שומן",noLimit:"ללא הגבלה",
      quickAdd:"הוספה מהירה",edit:"✏️ ערוך",done:"✓ סיום",reset:"↺ אפס",newBtn:"+ חדש",
      todayLog:"יומן היום",items:"פריטים",allLog:"הכל ›",addItem:"הוסף פריט",
      noEntries:"לחצי על מאכל להוספה",total:"סה״כ",
      home:"בית",journal:"יומן",db:"מאגר",backup:"גיבוי",profile:"פרופיל",
      photo:"📷 תמונה",mealBtn:"🍽 ארוחה",whatEat:"🍳 מה אוכלים",
      daySaved:"שמור",yesterday:"📋 אתמול",clear:"נקה",people:"אנשים",
      close:"סגור",cancel:"ביטול",save:"שמור",add:"הוסף",howMuchG:"כמה גרם?",
      yogurtLabel:"🥛 יוגורט 10%",coffeeLabel:"☕ קפה עם חלב 2%",
      journalTitle:"יומן תזונה",daysSaved:"ימים שמורים",days:"ימים",
      journalTab:"📋 יומן",weekTab:"📊 שבועי",
      noDays:"אין ימים שמורים עדיין",noData:"אין נתונים שמורים",
      details:"🍽 פירוט",statsTab:"📊 ערכים",loadEdit:"✏️ טען לעריכה",
      bloodSugarLabel:"🩸 סוכר בוקר",avgDaily:"ממוצע יומי",per100:"ל-100",
      dbTitle:"🗂 מאגר מאכלים אישי",search:"חיפוש...",
      dbEmpty:"המאגר ריק עדיין",noResults:"לא נמצאו תוצאות"},
  en:{greeting:"Hello",calories:"Today's Calories",consumed:"Eaten",target:"Goal",sugar:"Sugar",left:"Left",
      kcal:"kcal",mgdl:"mg/dL",goal:"Goal",
      carbs:"Carbs",carbsFull:"Carbs",protein:"Protein",fat:"Fat",noLimit:"No limit",
      quickAdd:"Quick Add",edit:"✏️ Edit",done:"✓ Done",reset:"↺ Reset",newBtn:"+ New",
      todayLog:"Today's Log",items:"items",allLog:"All ›",addItem:"Add Item",
      noEntries:"Tap a food to add",total:"Total",
      home:"Home",journal:"Journal",db:"Foods",backup:"Backup",profile:"Profile",
      photo:"📷 Photo",mealBtn:"🍽 Meal",whatEat:"🍳 What to eat",
      daySaved:"Saved",yesterday:"📋 Yesterday",clear:"Clear",people:"people",
      close:"Close",cancel:"Cancel",save:"Save",add:"Add",howMuchG:"How much (g)?",
      yogurtLabel:"🥛 Yogurt 10%",coffeeLabel:"☕ Coffee with Milk 2%",
      journalTitle:"Nutrition Journal",daysSaved:"days saved",days:"days",
      journalTab:"📋 Journal",weekTab:"📊 Weekly",
      noDays:"No saved days yet",noData:"No saved data",
      details:"🍽 Details",statsTab:"📊 Stats",loadEdit:"✏️ Load to edit",
      bloodSugarLabel:"🩸 Morning Sugar",avgDaily:"Daily average",per100:"per 100",
      dbTitle:"🗂 Personal Food Database",search:"Search...",
      dbEmpty:"Database is empty",noResults:"No results found"}
};
const getT=()=>LANG[localStorage.getItem('nutrition_lang')||'he']||LANG.he;

// ── InfoModal ──────────────────────────────────────────────────────────────────
function InfoModal({onClose,lang}){
  const T=LANG[lang]||LANG.he;
  const items=lang==='en'?[
    ["📊","Daily tracking","Log calories, carbs, protein & fat for every item"],
    ["🩸","Blood sugar","Enter morning glucose and track your weekly curve"],
    ["⚡","Quick add","Tap any food chip to instantly add to today's log"],
    ["🔍","Smart add","Search by name — Claude calculates the nutrition values"],
    ["📷","Photo analysis","Photograph a meal and Claude identifies & calculates it"],
    ["🍳","What to eat","Get personalized meal suggestions with full recipe"],
    ["📓","Weekly journal","View averages, calorie chart and weekly sugar curve"],
    ["👤","Profiles","Manage multiple profiles with different goals"],
  ]:[
    ["📊","מעקב יומי","רשמי קלוריות, פחמימות, חלבון ושומן לכל מאכל"],
    ["🩸","סוכר בדם","הזיני ערך סוכר בבוקר ועקבי אחר העקומה השבועית"],
    ["⚡","הוספה מהירה","לחצי על מאכל להוספה מיידית ליומן היום"],
    ["🔍","הוספה חכמה","חפשי מאכל לפי שם — Claude יחשב את הערכים"],
    ["📷","ניתוח תמונה","צלמי ארוחה וClaudeיזהה ויחשב את הערכים"],
    ["🍳","מה אוכלים","קבלי הצעות ארוחה עם מתכון מותאם אישית"],
    ["📓","יומן שבועי","צפי בממוצעים, גרף קלוריות וסוכר שבועי"],
    ["👤","פרופילים","ניהול מספר פרופילים עם יעדים שונים"],
  ];
  return(
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:700}}>ℹ️ {lang==='en'?"About the app":"על האפליקציה"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>
        {items.map(([icon,title,desc])=>(
          <div key={title} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontSize:20,flexShrink:0}}>{icon}</span>
            <div><div style={{fontSize:13,fontWeight:700,color:C.text}}>{title}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{desc}</div></div>
          </div>
        ))}
        <button onClick={onClose} className="btn-accent" style={{marginTop:16,borderRadius:12}}>{lang==='en'?"Got it":"הבנתי"}</button>
      </div>
    </div>
  );
}

// ── MealPlannerModal ───────────────────────────────────────────────────────────
const API="https://nutrition-ai.lior0gal.workers.dev";
const FRIDGE_CATS=[
  {key:"cheeses", he:"גבינות",       en:"Cheeses"},
  {key:"veggies", he:"ירקות ופירות", en:"Vegetables & Fruits"},
  {key:"protein", he:"חלבון",        en:"Protein"},
  {key:"carbs",   he:"פחמימה",       en:"Carbs"},
  {key:"nuts",    he:"פיצוחים",      en:"Nuts & Seeds"},
  {key:"other",   he:"אחר",          en:"Other"},
];
const loadFridge=()=>{try{return JSON.parse(localStorage.getItem("nutrition_fridge")||"{}");}catch{return {};}};
const saveFridgeLS=f=>localStorage.setItem("nutrition_fridge",JSON.stringify(f));

function MealPlannerModal({onAdd,onClose,lang}){
  const T=LANG[lang]||LANG.he;
  const isHe=lang!=='en';
  const [step,setStep]=useState(1);
  const [prefs,setPrefs]=useState("");
  const [people,setPeople]=useState(2);
  const [loading,setLoading]=useState(false);
  const [options,setOptions]=useState([]);
  const [selected,setSelected]=useState(null);
  const [recipe,setRecipe]=useState(null);
  const [showRefine,setShowRefine]=useState(false);
  const [refineText,setRefineText]=useState("");
  const [error,setError]=useState("");
  const [fridge,setFridge]=useState(loadFridge);
  const [fridgeIn,setFridgeIn]=useState(()=>Object.fromEntries(FRIDGE_CATS.map(c=>[c.key,""])));
  const [fridgeOpen,setFridgeOpen]=useState(()=>Object.fromEntries(FRIDGE_CATS.map(c=>[c.key,true])));
  const [savedPrefs,setSavedPrefs]=useState(()=>{try{return JSON.parse(localStorage.getItem("nutrition_saved_prefs")||"[]");}catch{return [];}});
  const savePref=()=>{
    const v=prefs.trim();
    if(!v||savedPrefs.includes(v))return;
    const updated=[...savedPrefs,v];
    setSavedPrefs(updated);
    localStorage.setItem("nutrition_saved_prefs",JSON.stringify(updated));
  };
  const removeSavedPref=p=>{
    const updated=savedPrefs.filter(x=>x!==p);
    setSavedPrefs(updated);
    localStorage.setItem("nutrition_saved_prefs",JSON.stringify(updated));
  };

  const updateFridge=f=>{setFridge(f);saveFridgeLS(f);};
  const addFridgeItem=(cat,val)=>{
    const items=val.split(/[,،]/).map(s=>s.trim()).filter(Boolean);
    if(!items.length)return;
    const existing=fridge[cat]||[];
    const updated={...fridge,[cat]:[...existing,...items.filter(v=>!existing.includes(v))]};
    updateFridge(updated);
    setFridgeIn(i=>({...i,[cat]:""}));
  };
  const removeFridgeItem=(cat,val)=>updateFridge({...fridge,[cat]:(fridge[cat]||[]).filter(x=>x!==val)});

  const buildFridgeStr=()=>FRIDGE_CATS
    .filter(c=>(fridge[c.key]||[]).length)
    .map(c=>`${isHe?c.he:c.en}: ${fridge[c.key].join(", ")}`)
    .join(" | ");

  const fetchOptions=async(refine)=>{
    setLoading(true);setError("");
    const fridgeStr=buildFridgeStr();
    const fullPrefs=[prefs,fridgeStr?(isHe?`מה במקרר: ${fridgeStr}`:`Fridge: ${fridgeStr}`):""].filter(Boolean).join("\n");
    try{
      const r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({mealPlan:{preferences:fullPrefs,people,refine:refine||undefined}})});
      const d=await r.json();
      if(d.error)throw new Error(d.error);
      setOptions(d.options||[]);
      setShowRefine(false);setRefineText("");
      setStep(2);
    }catch(e){setError(isHe?"שגיאה, נסי שוב":"Error, please try again");}
    setLoading(false);
  };

  const fetchRecipe=async(optionName)=>{
    setSelected(optionName);
    setLoading(true);setError("");
    try{
      const r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({mealPlan:{selectedMeal:optionName,people}})});
      const d=await r.json();
      if(d.error)throw new Error(d.error);
      const rec=d.recipe||d;
      if(!rec||!rec.name)throw new Error("No recipe returned");
      setRecipe(rec);
      setStep(3);
    }catch(e){
      setError((isHe?"שגיאה: ":"Error: ")+e.message);
    }
    setLoading(false);
  };

  const [showIngEdit,setShowIngEdit]=useState(false);
  const [editIngs,setEditIngs]=useState([]);
  const [editNutr,setEditNutr]=useState({});
  const [recalcLoading,setRecalcLoading]=useState(false);
  const [newIngItem,setNewIngItem]=useState("");
  const [newIngAmt,setNewIngAmt]=useState("");

  const addToDay=(nutr)=>{
    if(!recipe)return;
    const n=nutr||{kcal:recipe.kcalPerPerson||0,carbs:recipe.carbsPerPerson||0,protein:recipe.proteinPerPerson||0,fat:recipe.fatPerPerson||0};
    onAdd({uid:Date.now()+Math.random(),label:recipe.name,kcal:n.kcal,carbs:n.carbs,protein:n.protein,fat:n.fat});
    onClose();
  };

  const openIngEdit=()=>{
    setEditIngs((recipe.ingredients||[]).map((ing,i)=>({...ing,_id:i})));
    setEditNutr({kcal:recipe.kcalPerPerson||0,carbs:recipe.carbsPerPerson||0,protein:recipe.proteinPerPerson||0,fat:recipe.fatPerPerson||0});
    setShowIngEdit(true);
  };

  const [savedToDb,setSavedToDb]=useState(false);
  const saveToDb=(nutr)=>{
    const n=nutr||{kcal:recipe.kcalPerPerson||0,carbs:recipe.carbsPerPerson||0,protein:recipe.proteinPerPerson||0,fat:recipe.fatPerPerson||0};
    const name=recipe.name;
    const entry={names:[name.toLowerCase()],label:`🍳 ${name}`,kcal:n.kcal,carbs:n.carbs,protein:n.protein,fat:n.fat,defaultAmt:1,unit:isHe?"מנה":"serving"};
    const pid=window._activePid||"default";
    const db=loadCustomDB(pid);
    saveCustomDB([...db.filter(f=>f.label!==entry.label),entry],pid);
    setSavedToDb(true);
    setTimeout(()=>setSavedToDb(false),2000);
  };

  const recalculate=async()=>{
    setRecalcLoading(true);
    const mealDesc=editIngs.map(i=>`${i.item} ${i.amount}`).join(', ');
    try{
      const r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({mealDescription:mealDesc})});
      const d=await r.json();
      if(d.kcal!==undefined){
        setEditNutr({kcal:Math.round(d.kcal/people),carbs:parseFloat((d.carbs/people).toFixed(1)),protein:parseFloat((d.protein/people).toFixed(1)),fat:parseFloat(((d.fat||0)/people).toFixed(1))});
      }
    }catch(e){}
    setRecalcLoading(false);
  };

  return(
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide" style={{maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:700}}>🍳 {isHe?"מה אוכלים?":"What to eat?"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>

        {/* Step indicator */}
        <div style={{display:"flex",gap:6,marginBottom:20}}>
          {[isHe?"העדפות":"Preferences",isHe?"אפשרויות":"Options",isHe?"מתכון":"Recipe"].map((s,i)=>(
            <div key={i} style={{flex:1,height:4,borderRadius:2,background:step>i?C.accent:"rgba(148,163,184,.25)"}}/>
          ))}
        </div>

        {/* Step 1 */}
        {step===1&&<>
          <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{isHe?"העדפות תזונה (רשות)":"Dietary preferences (optional)"}</div>
          <div style={{display:"flex",gap:6,marginBottom:6}}>
            <textarea value={prefs} onChange={e=>setPrefs(e.target.value)}
              placeholder={isHe?"ללא גלוטן, טבעוני, דל פחמימות...":"gluten-free, vegan, low carb..."}
              rows={1} className="inp" style={{flex:1,resize:"none"}}/>
            <button onClick={savePref} title={isHe?"שמור העדפה":"Save preference"}
              style={{background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"0 10px",cursor:"pointer",fontSize:14,flexShrink:0}}>💾</button>
          </div>
          {savedPrefs.length>0&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
              {savedPrefs.map(p=>(
                <span key={p} onClick={()=>setPrefs(p)}
                  style={{background:prefs===p?"rgba(13,148,136,.18)":"rgba(148,163,184,.12)",border:`1px solid ${prefs===p?"rgba(13,148,136,.4)":"rgba(148,163,184,.3)"}`,borderRadius:20,padding:"4px 10px",fontSize:11,color:prefs===p?C.accent:C.text,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:5}}>
                  {p}
                  <button onClick={e=>{e.stopPropagation();removeSavedPref(p);}}
                    style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,padding:0,lineHeight:1}}>×</button>
                </span>
              ))}
            </div>
          )}

          {/* Fridge section */}
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>🥗 {isHe?"מה במקרר?":"What's in the fridge?"}</div>
          {FRIDGE_CATS.map(cat=>(
            <div key={cat.key} style={{marginBottom:8}}>
              <button onClick={()=>setFridgeOpen(o=>({...o,[cat.key]:!o[cat.key]}))}
                style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",background:"none",border:"none",cursor:"pointer",padding:"4px 0",fontFamily:"inherit"}}>
                <span style={{fontSize:11,fontWeight:600,color:C.muted}}>{isHe?cat.he:cat.en}{(fridge[cat.key]||[]).length>0&&<span style={{marginRight:4,background:C.accent,color:"#fff",borderRadius:10,fontSize:9,padding:"1px 5px"}}>{(fridge[cat.key]||[]).length}</span>}</span>
                <span style={{fontSize:10,color:C.muted,transform:fridgeOpen[cat.key]?"rotate(180deg)":"none",transition:"transform .2s",display:"inline-block"}}>▾</span>
              </button>
              {fridgeOpen[cat.key]&&<><div style={{display:"flex",gap:6,marginBottom:6}}>
                <input
                  value={fridgeIn[cat.key]}
                  onChange={e=>setFridgeIn(i=>({...i,[cat.key]:e.target.value}))}
                  onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addFridgeItem(cat.key,fridgeIn[cat.key]);}}}
                  placeholder={isHe?"הוסף...":"Add..."}
                  className="inp" style={{flex:1,fontSize:12,padding:"6px 10px"}}/>
                <button onClick={()=>addFridgeItem(cat.key,fridgeIn[cat.key])}
                  style={{background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"0 12px",cursor:"pointer",fontSize:16,fontWeight:700}}>+</button>
              </div>
              {(fridge[cat.key]||[]).length>0&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {(fridge[cat.key]||[]).map(item=>(
                    <span key={item} style={{background:"rgba(13,148,136,.12)",border:"1px solid rgba(13,148,136,.3)",borderRadius:20,padding:"5px 12px 5px 8px",fontSize:12,color:C.accent,display:"inline-flex",alignItems:"center",gap:6,fontWeight:500}}>
                      {item}
                      <button onClick={()=>removeFridgeItem(cat.key,item)}
                        style={{background:"rgba(13,148,136,.2)",border:"none",borderRadius:"50%",color:C.accent,cursor:"pointer",fontSize:11,padding:0,width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,flexShrink:0}}>×</button>
                    </span>
                  ))}
                </div>
              )}</>}
            </div>
          ))}

          <div style={{fontSize:11,color:C.muted,marginBottom:8,marginTop:4}}>{isHe?"מספר סועדים":"Number of people"}</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,background:"rgba(148,163,184,.1)",borderRadius:10,padding:"8px 14px"}}>
            <button onClick={()=>setPeople(v=>Math.max(1,v-1))} style={{width:28,height:28,border:`1px solid ${C.border}`,borderRadius:6,background:"rgba(255,255,255,.7)",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
            <span style={{flex:1,textAlign:"center",fontSize:16,fontWeight:700,color:C.text}}>{people} {isHe?"אנשים":"people"}</span>
            <button onClick={()=>setPeople(v=>v+1)} style={{width:28,height:28,border:`1px solid ${C.border}`,borderRadius:6,background:"rgba(255,255,255,.7)",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
          </div>
          {error&&<div style={{color:C.danger,fontSize:12,marginBottom:8}}>{error}</div>}
          <button onClick={()=>fetchOptions()} disabled={loading} className="btn-accent" style={{borderRadius:12}}>
            {loading?(isHe?"מחפש...":"Searching..."):(isHe?"✨ קבל הצעות":"✨ Get suggestions")}
          </button>
        </>}

        {/* Step 2 — Options */}
        {step===2&&<>
          {error&&<div style={{background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:8,padding:"8px 12px",fontSize:12,color:C.danger,marginBottom:10}}>{error}</div>}
          {options.map((opt,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,.7)",border:`1px solid rgba(148,163,184,.25)`,borderRadius:16,padding:14,marginBottom:10}}>
              <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>{opt.name}</div>
              <div style={{fontSize:12,color:C.muted,marginBottom:10}}>{opt.description}</div>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                {[{l:isHe?"קק״ל":"kcal",v:opt.kcalPerPerson,c:C.accent},
                  {l:isHe?"פחמ׳":"carbs",v:opt.carbsPerPerson,c:C.warn},
                  {l:isHe?"חלבון":"prot",v:opt.proteinPerPerson,c:C.blue}].map(({l,v,c})=>(
                  <div key={l} style={{flex:1,background:`${c}11`,borderRadius:8,padding:"4px 6px",textAlign:"center"}}>
                    <div style={{fontSize:13,fontWeight:700,color:c}}>{Math.round(v||0)}</div>
                    <div style={{fontSize:9,color:C.muted}}>{l}/{isHe?"אדם":"person"}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>fetchRecipe(opt.name)} disabled={loading}
                style={{width:"100%",background:C.accent,border:"none",borderRadius:10,color:"#fff",padding:"9px",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                {loading&&selected===opt.name?(isHe?"טוען...":"Loading..."):(isHe?"בחר":"Select")}
              </button>
            </div>
          ))}
          {/* Refine */}
          <button onClick={()=>setShowRefine(v=>!v)} style={{width:"100%",background:"none",border:`1px solid ${C.border}`,borderRadius:10,padding:"8px",fontSize:12,color:C.muted,cursor:"pointer",marginBottom:showRefine?8:0}}>
            {isHe?"לא מדויק? דייקי":"Not accurate? Refine"} ↕
          </button>
          {showRefine&&<>
            <textarea value={refineText} onChange={e=>setRefineText(e.target.value)}
              placeholder={isHe?"מה לשנות? למשל: משהו קל יותר, ללא בשר...":"What to change? e.g. something lighter, no meat..."}
              rows={2} className="inp" style={{marginBottom:8,resize:"none"}}/>
            <button onClick={()=>fetchOptions(refineText)} disabled={loading} className="btn-accent" style={{borderRadius:10}}>
              {loading?(isHe?"מחפש...":"Searching..."):(isHe?"✨ עדכן הצעות":"✨ Update")}
            </button>
          </>}
          {error&&<div style={{color:C.danger,fontSize:12,marginTop:8}}>{error}</div>}
        </>}

        {/* Step 3 — Recipe */}
        {step===3&&recipe&&<>
          {!showIngEdit ? <>
            <div style={{fontSize:14,fontWeight:900,color:C.text,marginBottom:3}}>{recipe.name}</div>
            <div style={{fontSize:10,color:C.muted,marginBottom:10}}>{isHe?"לאדם":"per person"}: {Math.round(recipe.kcalPerPerson||0)} {isHe?"קק״ל":"kcal"} · {Math.round(recipe.carbsPerPerson||0)}g {isHe?"פחמ׳":"carbs"} · {Math.round(recipe.proteinPerPerson||0)}g {isHe?"חלבון":"prot"}</div>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1.2,marginBottom:6}}>{isHe?"רכיבים (ל-":"Ingredients (for "}{people}{isHe?" אנשים)":")"}</div>
            <div style={{background:"rgba(148,163,184,.08)",borderRadius:10,padding:"8px 12px",marginBottom:10}}>
              {(recipe.ingredients||[]).map((ing,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:i<recipe.ingredients.length-1?`1px solid ${C.border}`:"none"}}>
                  <span style={{fontSize:12,color:C.text}}>{ing.item}</span>
                  <span style={{fontSize:11,color:C.muted,fontWeight:600}}>{ing.amount}</span>
                </div>
              ))}
            </div>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1.2,marginBottom:6}}>{isHe?"הכנה":"Instructions"}</div>
            <ol style={{paddingRight:14,marginBottom:12,marginTop:0}}>
              {(recipe.steps||[]).map((s,i)=><li key={i} style={{fontSize:12,color:C.text,marginBottom:4,lineHeight:1.4}}>{s}</li>)}
            </ol>
            {error&&<div style={{color:C.danger,fontSize:12,marginBottom:8}}>{error}</div>}
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setStep(2);setRecipe(null);}} className="btn-muted" style={{flex:1,borderRadius:10}}>{isHe?"חזרה":"Back"}</button>
                <button onClick={()=>addToDay()} className="btn-accent" style={{flex:2,borderRadius:10}}>{isHe?"+ הוסף ליומן היום":"+ Add to today"}</button>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={openIngEdit} style={{flex:1,background:"none",border:`1px solid ${C.accent}`,color:C.accent,borderRadius:10,padding:"9px",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                  {isHe?"✏️ הוסף עם שינויים":"✏️ Add with changes"}
                </button>
                <button onClick={()=>saveToDb()} style={{flex:1,background:savedToDb?"rgba(13,148,136,.12)":"none",border:`1px solid ${savedToDb?C.accent:C.border}`,color:savedToDb?C.accent:C.muted,borderRadius:10,padding:"9px",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                  {savedToDb?(isHe?"✓ נשמר":"✓ Saved"):(isHe?"💾 שמור למאגר":"💾 Save to DB")}
                </button>
              </div>
            </div>
          </> : <>
            {/* Ingredient editor */}
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>{isHe?"ערוך מרכיבים":"Edit ingredients"}</div>
            <div style={{background:"rgba(148,163,184,.06)",borderRadius:12,padding:"8px 12px",marginBottom:10}}>
              {editIngs.map((ing,i)=>(
                <div key={ing._id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",borderBottom:i<editIngs.length-1?`1px solid ${C.border}`:"none"}}>
                  <span style={{flex:1,fontSize:12,color:C.text}}>{ing.item}</span>
                  <input value={ing.amount} onChange={e=>setEditIngs(prev=>prev.map(x=>x._id===ing._id?{...x,amount:e.target.value}:x))}
                    style={{width:90,border:`1px solid ${C.border}`,borderRadius:6,padding:"3px 6px",fontSize:11,textAlign:"center",fontFamily:"inherit"}}/>
                  <button onClick={()=>setEditIngs(prev=>prev.filter(x=>x._id!==ing._id))}
                    style={{background:"none",border:"none",color:C.danger,fontSize:16,cursor:"pointer",padding:"0 2px",lineHeight:1}}>×</button>
                </div>
              ))}
            </div>
            {/* Add ingredient */}
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              <input value={newIngItem} onChange={e=>setNewIngItem(e.target.value)} placeholder={isHe?"שם מרכיב":"Ingredient"} className="inp" style={{flex:2,fontSize:12}}/>
              <input value={newIngAmt} onChange={e=>setNewIngAmt(e.target.value)} placeholder={isHe?"כמות":"Amount"} className="inp" style={{flex:1,fontSize:12}}/>
              <button onClick={()=>{if(newIngItem.trim()){setEditIngs(p=>[...p,{item:newIngItem,amount:newIngAmt,_id:Date.now()}]);setNewIngItem("");setNewIngAmt("");}}} style={{background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"0 10px",cursor:"pointer",fontSize:16}}>+</button>
            </div>
            {/* Nutrition display */}
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              {[["kcal",editNutr.kcal,C.accent],["carbs",editNutr.carbs,C.warn],["protein",editNutr.protein,C.blue],["fat",editNutr.fat,"#999"]].map(([k,v,c])=>(
                <div key={k} style={{flex:1,background:`${c}11`,borderRadius:8,padding:"6px 4px",textAlign:"center"}}>
                  <div style={{fontSize:14,fontWeight:700,color:c}}>{Math.round(v||0)}</div>
                  <div style={{fontSize:9,color:C.muted}}>{isHe?(k==="kcal"?"קק״ל":k==="carbs"?"פחמ׳":k==="protein"?"חלבון":"שומן"):k}/{isHe?"אדם":"p"}</div>
                </div>
              ))}
            </div>
            <button onClick={recalculate} disabled={recalcLoading} style={{width:"100%",background:"rgba(13,148,136,.08)",border:`1px solid rgba(13,148,136,.3)`,borderRadius:10,padding:"9px",fontSize:13,fontWeight:600,color:C.accent,cursor:"pointer",marginBottom:10}}>
              {recalcLoading?(isHe?"מחשב...":"Calculating..."):(isHe?"🔄 חשב ערכים מחדש":"🔄 Recalculate")}
            </button>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setShowIngEdit(false)} className="btn-muted" style={{flex:1,borderRadius:10}}>{isHe?"חזרה":"Back"}</button>
              <button onClick={()=>addToDay(editNutr)} className="btn-accent" style={{flex:2,borderRadius:10}}>{isHe?"✓ הוסף ליומן":"✓ Add to log"}</button>
              <button onClick={()=>saveToDb(editNutr)} style={{flex:1,background:savedToDb?"rgba(13,148,136,.12)":"none",border:`1px solid ${savedToDb?C.accent:C.border}`,color:savedToDb?C.accent:C.muted,borderRadius:10,padding:"9px",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                {savedToDb?"✓":"💾"}
              </button>
            </div>
          </>}
        </>}
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────
function App(){
  const [profiles,setProfiles]=useState(()=>loadProfiles());
  const [activeProfile,setActiveProfile]=useState(()=>{
    const id=loadActiveProfileId();
    const all=loadProfiles();
    return all.find(p=>p.id===id)||all[0]||null;
  });
  const [showSetup,setShowSetup]=useState(()=>loadProfiles().length===0);
  const [showSplash,setShowSplash]=useState(true);
  const pid=activeProfile?.id||"default";
  window._activePid=pid;
  const MAX_KCAL=activeProfile?.maxKcal||1800;
  const MAX_CARBS=activeProfile?.maxCarbs||80;

  const [entries,setEntries]=useState(()=>{
    const savedPid=loadActiveProfileId()||'default';
    const j=loadJournal(savedPid);
    const today=getTodayKey();
    return j[today]?.entries?.map(e=>({...e,uid:Date.now()+Math.random()}))||[];
  });

  const switchProfile=(p)=>{
    setActiveProfile(p);
    saveActiveProfileId(p?.id);
    const fresh=loadProfiles();
    setProfiles(fresh);
    setEntries([]);
    setCustomBtns(loadCustomBtns(p?.id));
    setActiveDate(getTodayKey());
  };

  const [showSmart,setShowSmart]=useState(false);
  const [showMeal,setShowMeal]=useState(false);
  const [showPhoto,setShowPhoto]=useState(false);
  const [pendingPhoto,setPendingPhoto]=useState(null);
  const photoInputRef=useRef(null);
  const [bloodSugar,setBloodSugar]=useState(()=>{
    const savedPid=loadActiveProfileId()||'default';
    const j=loadJournal(savedPid);
    const today=getTodayKey();
    return j[today]?.bloodSugar?String(j[today].bloodSugar):"";
  });
  const [editingQuickFood,setEditingQuickFood]=useState(null);
  const [showJournal,setShowJournal]=useState(false);
  const [showNewBtn,setShowNewBtn]=useState(false);
  const [showDB,setShowDB]=useState(false);
  const [showProfiles,setShowProfiles]=useState(false);
  const [showExport,setShowExport]=useState(false);
  const [showInfo,setShowInfo]=useState(false);
  const [showPantry,setShowPantry]=useState(false);
  const [showShopping,setShowShopping]=useState(false);
  const [showMealPlanner,setShowMealPlanner]=useState(false);
  const [activeRing,setActiveRing]=useState('kcal');
  const [lang,setLang]=useState(()=>localStorage.getItem('nutrition_lang')||'he');
  const T=LANG[lang]||LANG.he;
  const toggleLang=()=>{const nl=lang==='he'?'en':'he';setLang(nl);localStorage.setItem('nutrition_lang',nl);};
  const [customBtns,setCustomBtns]=useState(()=>loadCustomBtns(pid));
  const [saveFlash,setSaveFlash]=useState(false);
  const [clearConfirm,setClearConfirm]=useState(false);
  const [sugarFlash,setSugarFlash]=useState(false);
  const [activeDate,setActiveDate]=useState(()=>getTodayKey());
  const [showDatePicker,setShowDatePicker]=useState(false);

  // Reset to calorie ring whenever returning to main screen
  useEffect(()=>{
    if(!showSmart&&!showMeal&&!showPhoto&&!showJournal&&!showDB&&!showPantry&&!showShopping&&!showMealPlanner){
      setActiveRing('kcal');
    }
  },[showSmart,showMeal,showPhoto,showJournal,showDB,showPantry,showShopping,showMealPlanner]);

  useEffect(()=>{
    const j=loadJournal(pid);
    setBloodSugar(j[activeDate]?.bloodSugar||"");
  },[activeDate,pid]);

  const saveBloodSugar=(val)=>{
    const j=loadJournal(pid);
    if(!j[activeDate]) j[activeDate]={entries:[],totals:{kcal:0,carbs:0,protein:0}};
    if(val) j[activeDate].bloodSugar=parseFloat(val);
    else delete j[activeDate].bloodSugar;
    saveJournal(j,pid);
    if(val){setSugarFlash(true);setTimeout(()=>setSugarFlash(false),1500);}
  };

  const copyPrevDay=()=>{
    const prev=new Date();prev.setDate(prev.getDate()-1);
    const prevKey=`${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,'0')}-${String(prev.getDate()).padStart(2,'0')}`;
    const j=loadJournal(pid);
    if(j[prevKey]) setEntries(j[prevKey].entries.map(e=>({...e,uid:Date.now()+Math.random()})));
  };

  const isToday = activeDate === getTodayKey();
  const savedToday = !!loadJournal(pid)[activeDate];

  const totals=useMemo(()=>entries.reduce((acc,e)=>({kcal:acc.kcal+e.kcal,carbs:acc.carbs+e.carbs,protein:acc.protein+e.protein,fat:acc.fat+(e.fat||0)}),{kcal:0,carbs:0,protein:0,fat:0}),[entries]);
  const addEntry=food=>setEntries(prev=>[...prev,{...food,uid:food.uid||(Date.now()+Math.random())}]);
  const removeEntry=uid=>setEntries(prev=>prev.filter(e=>e.uid!==uid));
  const updateEntry=(uid,ch)=>setEntries(prev=>prev.map(e=>e.uid===uid?{...e,...ch}:e));
  const clearAll=()=>{
    if(clearConfirm){setEntries([]);setClearConfirm(false);}
    else{setClearConfirm(true);setTimeout(()=>setClearConfirm(false),3000);}
  };

  const saveDay=()=>{
    if(!entries.length&&!bloodSugar)return;
    const j=loadJournal(pid);
    j[activeDate]={entries:entries.map(e=>({label:e.label,kcal:e.kcal,carbs:e.carbs,protein:e.protein,fat:e.fat||0,...(e.count&&{count:e.count}),...(e.perUnit&&{perUnit:e.perUnit})})),totals,...(bloodSugar&&{bloodSugar:parseFloat(bloodSugar)})};
    saveJournal(j,pid);
    setSaveFlash(true);
    setTimeout(()=>setSaveFlash(false),1800);
  };

  // generate last 14 days for picker
  const last14=Array.from({length:14},(_,i)=>{
    const d=new Date();
    d.setDate(d.getDate()-i);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  });

  const selectDate=key=>{
    const j=loadJournal(pid);
    // Auto-save current day before switching (single loadJournal call)
    if(entries.length||bloodSugar){
      j[activeDate]={entries:entries.map(e=>({label:e.label,kcal:e.kcal,carbs:e.carbs,protein:e.protein,fat:e.fat||0,...(e.count&&{count:e.count}),...(e.perUnit&&{perUnit:e.perUnit})})),totals,...(bloodSugar&&{bloodSugar:parseFloat(bloodSugar)})};
      saveJournal(j,pid);
    }
    setEntries(j[key]?j[key].entries.map(e=>({...e,uid:Date.now()+Math.random()})):[]);
    setActiveDate(key);
    setShowDatePicker(false);
  };

  const [quickFoods,setQuickFoods]=useState(()=>loadQuickFoods(pid)||QUICK_FOODS);
  const [showEditQuick,setShowEditQuick]=useState(false);

  const saveNewBtn=btn=>{const u=[...customBtns,btn];setCustomBtns(u);saveCustomBtns(u,pid);};
  const updateCustomBtn=(id,ch)=>{const u=customBtns.map(b=>b.id===id?{...b,...ch}:b);setCustomBtns(u);saveCustomBtns(u,pid);};
  const removeBtn=id=>{const u=customBtns.filter(b=>b.id!==id);setCustomBtns(u);saveCustomBtns(u,pid);};
  const updateQuickFood=(id,changes)=>{const u=quickFoods.map(f=>f.id===id?{...f,...changes}:f);setQuickFoods(u);saveQuickFoods(u,pid);};
  const removeQuickFood=(id)=>{const u=quickFoods.filter(f=>f.id!==id);setQuickFoods(u);saveQuickFoods(u,pid);};
  const resetQuickFoods=()=>{setQuickFoods(QUICK_FOODS);saveQuickFoods(QUICK_FOODS,pid);ls.set("nutrition_hidden_special",[]);ls.set("nutrition_special_edits",{});};
  const kcalLeft=MAX_KCAL-totals.kcal, carbsLeft=MAX_CARBS-totals.carbs;
  const maxProtein=activeProfile?.maxProtein||120;

  if(showSetup||!activeProfile) return (
    <SetupScreen onDone={(p)=>{
      const updated=[p];
      saveProfiles(updated);
      saveActiveProfileId(p.id);
      setProfiles(updated);
      setActiveProfile(p);
      setShowSetup(false);
    }}/>
  );

  return (
    <div>
      {showSplash && <SplashScreen onDone={()=>setShowSplash(false)}/>}
      {showInfo && <InfoModal onClose={()=>setShowInfo(false)} lang={lang}/>}
      {showPantry && <PantryModal onClose={()=>setShowPantry(false)} lang={lang}/>}
      {showShopping && <ShoppingListModal onClose={()=>setShowShopping(false)} lang={lang} pid={pid}/>}
      {showMealPlanner && <MealPlannerModal onAdd={addEntry} onClose={()=>setShowMealPlanner(false)} lang={lang}/>}
      {showProfiles && <ProfileModal profiles={profiles} activeId={pid} onSelect={switchProfile} onClose={()=>setShowProfiles(false)} onBackup={()=>{setShowProfiles(false);setShowExport(true);}}/>}
      {showExport && <ExportImportModal pid={pid} onClose={()=>setShowExport(false)}/>}
      {showJournal && <JournalView pid={pid} lang={lang} onClose={()=>setShowJournal(false)} onLoadDay={saved=>{setEntries(saved.map(e=>({...e,uid:Date.now()+Math.random()})));setShowJournal(false);}}/>}
      {showNewBtn && <NewButtonModal onClose={()=>setShowNewBtn(false)} onSave={saveNewBtn}/>}
      {showDB && <DBManagerModal pid={pid} lang={lang} onClose={()=>setShowDB(false)}/>}
      {editingQuickFood && <EditQuickFoodModal food={editingQuickFood} onSave={f=>{
        if(f._type==='var') saveSpecialEdit(`var_${f._key}`,{kcal:f.kcal,carbs:f.carbs,protein:f.protein,fat:f.fat,label:f.label});
        else if(f._type==='yogurt') saveSpecialEdit('yogurt',{kcal:f.kcal,carbs:f.carbs,protein:f.protein,fat:f.fat,label:f.label});
        else if(f._type==='coffee') saveSpecialEdit('coffee',{kcal:f.kcal,carbs:f.carbs,protein:f.protein,fat:f.fat,label:f.label});
        else if(f._type==='custom') updateCustomBtn(f.id,f);
        else updateQuickFood(f.id,f);
        setEditingQuickFood(null);
      }} onClose={()=>setEditingQuickFood(null)}/>}

      {/* ── TOP BAR ── */}
      <div style={{padding:"50px 20px 0"}}>
        {/* Icon row — above the date, aligned to the left edge */}
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,alignItems:"center",marginBottom:10}}>
          <button onClick={toggleLang} style={{height:22,borderRadius:7,background:"rgba(255,255,255,.75)",border:"1px solid rgba(255,255,255,.9)",backdropFilter:"blur(12px)",cursor:"pointer",fontSize:9,fontWeight:700,color:C.muted,padding:"0 6px"}}>
            {lang==='he'?'EN':'עב'}
          </button>
          <button onClick={()=>setShowPantry(true)} style={{width:26,height:26,borderRadius:8,background:"rgba(255,255,255,.75)",border:"1px solid rgba(255,255,255,.9)",backdropFilter:"blur(12px)",cursor:"pointer",padding:2,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <img src={lang==='he'?"/Nutrition/pantry-he.png":"/Nutrition/pantry-en.png"} style={{width:20,height:20,objectFit:"contain"}} alt="מזווה"/>
          </button>
          <button onClick={()=>setShowShopping(true)} style={{width:26,height:26,borderRadius:8,background:"rgba(255,255,255,.75)",border:"1px solid rgba(255,255,255,.9)",backdropFilter:"blur(12px)",cursor:"pointer",padding:2,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <img src="/Nutrition/shopping-cart.png" style={{width:20,height:20,objectFit:"contain"}} alt="קניות"/>
          </button>
          <button onClick={()=>setShowInfo(true)} style={{width:24,height:24,borderRadius:7,background:"rgba(255,255,255,.75)",border:"1px solid rgba(255,255,255,.9)",backdropFilter:"blur(12px)",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontWeight:700}}>ℹ</button>
          <button onClick={saveDay} style={{width:26,height:26,borderRadius:8,background:"rgba(255,255,255,.75)",border:"1px solid rgba(255,255,255,.9)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s",animation:saveFlash?"pop .35s ease":"none",boxShadow:"0 2px 8px rgba(80,120,160,.1)"}}>💾</button>
          <div style={{width:26,height:26,borderRadius:8,background:"linear-gradient(135deg,#14b8a6,#0d9488)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,boxShadow:"0 2px 8px rgba(13,148,136,.35)",cursor:"pointer"}} onClick={()=>setShowProfiles(true)}>{activeProfile?.emoji}</div>
        </div>
        {/* Date + greeting below the icons */}
        <div>
          <div style={{fontSize:11,color:C.muted,letterSpacing:.3,marginBottom:3}}>{getDateLabel(isToday?undefined:activeDate)}</div>
          <div style={{fontSize:22,fontWeight:900,color:C.text,letterSpacing:"-.5px"}}>{T.greeting}, {activeProfile?.name} {isToday?"👋":""}</div>
        </div>
      </div>

      {/* ── DATE STRIP ── */}
      {(()=>{
        const [ay,am,ad]=activeDate.split('-').map(Number);
        const aD=new Date(ay,am-1,ad);
        const dow=aD.getDay();
        const sun=new Date(aD); sun.setDate(aD.getDate()-dow);
        const DAY_LABELS=lang==='en'
          ?['Su','Mo','Tu','We','Th','Fr','Sa']
          :['א','ב','ג','ד','ה','ו','ש'];
        const week=Array.from({length:7},(_,i)=>{
          const d=new Date(sun); d.setDate(sun.getDate()+i);
          const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          return {k,day:d.getDate(),dow:d.getDay()};
        });
        return (
          <div style={{display:"flex",gap:6,padding:"14px 20px 0",overflowX:"auto",scrollbarWidth:"none"}}>
            {week.map(({k,day,dow:dw})=>{
              const active=k===activeDate;
              return (
                <div key={k} onClick={()=>selectDate(k)} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"7px 11px",borderRadius:12,cursor:"pointer",flexShrink:0,
                  background:active?"rgba(13,148,136,.1)":"transparent",
                  border:active?"1.5px solid rgba(20,184,166,.35)":"1.5px solid transparent"}}>
                  <span style={{fontSize:9,color:active?C.accent:C.muted,fontWeight:active?700:400}}>{DAY_LABELS[dw]}</span>
                  <span style={{fontSize:13,fontWeight:active?900:600,color:active?C.accent:C.muted,marginTop:2}}>{day}</span>
                </div>
              );
            })}
            <div onClick={()=>setShowDatePicker(v=>!v)} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"7px 10px",borderRadius:12,cursor:"pointer",flexShrink:0,border:"1.5px solid transparent"}}>
              <span style={{fontSize:16}}>📅</span>
            </div>
          </div>
        );
      })()}

      {/* Date picker dropdown */}
      {showDatePicker && (
        <div style={{margin:"8px 16px 0",background:"rgba(255,255,255,.85)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderRadius:16,overflow:"hidden",border:"1px solid rgba(255,255,255,.9)",animation:"fadeIn 0.15s ease",boxShadow:"0 8px 32px rgba(80,120,160,.15)"}}>
          {last14.map(key=>{
            const isActive=key===activeDate;
            const hasSaved=!!loadJournal(pid)[key];
            const isT=key===getTodayKey();
            return (
              <div key={key} onClick={()=>{selectDate(key);setShowDatePicker(false);}}
                style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:"1px solid rgba(148,163,184,.16)",cursor:"pointer",background:isActive?"rgba(13,148,136,.08)":"transparent"}}>
                <span style={{fontSize:13,color:isActive?C.accent:C.text,fontWeight:isActive?700:400}}>{isT?"היום — ":""}{getDateLabel(key)}</span>
                {hasSaved && <span style={{fontSize:10,color:C.accent,background:"rgba(13,148,136,.12)",padding:"2px 8px",borderRadius:10}}>שמור</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* ── DYNAMIC RING CARD ── */}
      {(()=>{
        const ringCfg={
          kcal:{label:T.calories,consumed:Math.round(totals.kcal),max:MAX_KCAL,remaining:Math.max(0,Math.round(kcalLeft)),unit:T.kcal,id:"rg"},
          carbs:{label:T.carbsFull,consumed:parseFloat(totals.carbs.toFixed(1)),max:MAX_CARBS,remaining:parseFloat(Math.max(0,MAX_CARBS-totals.carbs).toFixed(1)),unit:"g",id:"rg-c"},
          protein:{label:T.protein,consumed:parseFloat(totals.protein.toFixed(1)),max:maxProtein,remaining:parseFloat(Math.max(0,maxProtein-totals.protein).toFixed(1)),unit:"g",id:"rg-p"},
          fat:{label:T.fat,consumed:parseFloat((totals.fat||0).toFixed(1)),max:null,remaining:null,unit:"g",id:"rg-f"}
        };
        const rc=ringCfg[activeRing];
        const pct=rc.max?Math.min(rc.consumed/rc.max,1):0;
        const rcColor=goalColor(rc.consumed,rc.max);
        const [rcG0,rcG1]=goalGrad(rc.consumed,rc.max);
        return (
          <div className="card" style={{margin:"12px 16px 0",padding:20}}>
            <div style={{display:"flex",alignItems:"center",gap:18}}>
              <div style={{position:"relative",flexShrink:0}}>
                <svg width="112" height="112" viewBox="0 0 112 112" style={{transform:"rotate(-90deg)"}}>
                  <defs>
                    <linearGradient id={rc.id} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={rcG0}/>
                      <stop offset="100%" stopColor={rcG1}/>
                    </linearGradient>
                  </defs>
                  <circle cx="56" cy="56" r="46" fill="none" stroke="rgba(148,163,184,.2)" strokeWidth="9"/>
                  {rc.max&&<circle cx="56" cy="56" r="46" fill="none" stroke={`url(#${rc.id})`} strokeWidth="9" strokeLinecap="round"
                    style={{strokeDasharray:`${pct*289} 289`,transition:"stroke-dasharray .7s cubic-bezier(.4,0,.2,1)"}}/>}
                </svg>
                <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:900,color:rcColor,lineHeight:1}}>{rc.consumed}</div>
                  <div style={{fontSize:8,color:C.muted,letterSpacing:.5,marginTop:1}}>{T.consumed}</div>
                </div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,marginBottom:11}}>{rc.label}</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {rc.remaining!==null&&(
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontSize:12,color:"#475569"}}>{T.left}</span>
                      <span style={{fontSize:14,fontWeight:700,color:rcColor}}>{rc.remaining} <span style={{fontSize:10,fontWeight:400,color:C.muted}}>{rc.unit}</span></span>
                    </div>
                  )}
                  {rc.max&&(
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontSize:12,color:"#475569"}}>{T.target}</span>
                      <span style={{fontSize:14,fontWeight:700,color:C.text}}>{rc.max} <span style={{fontSize:10,fontWeight:400,color:C.muted}}>{rc.unit}</span></span>
                    </div>
                  )}
                  {!rc.max&&(
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontSize:12,color:"#475569"}}>{T.noLimit}</span>
                    </div>
                  )}
                  <div style={{height:1,background:"rgba(148,163,184,.2)"}}></div>
                  {activeRing==='kcal'?(
                    <label style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"text"}}>
                      <span style={{fontSize:12,color:"#475569",flexShrink:0}}>🩸 {T.sugar}{sugarFlash&&<span style={{marginRight:4,fontSize:10,color:C.accent}}> ✓</span>}</span>
                      <input type="number" value={bloodSugar} onChange={e=>setBloodSugar(e.target.value)}
                        onBlur={e=>saveBloodSugar(e.target.value)}
                        placeholder="— mg/dL" style={{flex:1,minWidth:0,background:"transparent",border:"none",textAlign:"right",fontSize:13,fontWeight:700,color:sugarColor(bloodSugar),fontFamily:"inherit",paddingRight:2}}/>
                    </label>
                  ):(
                    <button onClick={()=>setActiveRing('kcal')} style={{background:"none",border:"none",fontSize:10,color:C.muted,cursor:"pointer",textAlign:"start",padding:0,opacity:.75}}>↩ {T.calories}</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── MACRO CARDS ── */}
      {(()=>{
        const allMacros=[
          {lk:"carbs",val:totals.carbs.toFixed(1),max:MAX_CARBS},
          {lk:"protein",val:totals.protein.toFixed(1),max:maxProtein},
          {lk:"fat",val:(totals.fat||0).toFixed(1),max:null},
        ];
        const cards=allMacros.map(m=>m.lk===activeRing?{lk:"kcal_mini"}:m);
        return (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,margin:"10px 16px 0"}}>
            {cards.map(card=>{
              if(card.lk==="kcal_mini"){
                const kColor=goalColor(totals.kcal,MAX_KCAL);
                const [kg0,kg1]=goalGrad(totals.kcal,MAX_KCAL);
                return (
                  <div key="kcal_mini" className="card" style={{padding:"13px 12px",borderRadius:16,cursor:"pointer",border:`1.5px solid ${kColor}40`}} onClick={()=>setActiveRing('kcal')}>
                    <div style={{fontSize:9,letterSpacing:1.2,textTransform:"uppercase",color:C.muted}}>{T.calories}</div>
                    <div style={{fontSize:20,fontWeight:900,color:kColor,marginTop:5,lineHeight:1}}>{Math.round(totals.kcal)}<span style={{fontSize:9,fontWeight:500,color:C.muted}}>{T.kcal}</span></div>
                    <div style={{height:4,borderRadius:3,background:"rgba(148,163,184,.2)",overflow:"hidden",marginTop:7}}>
                      <div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${kg0},${kg1})`,width:`${Math.min(100,totals.kcal/MAX_KCAL*100)}%`}}></div>
                    </div>
                    <div style={{fontSize:9,color:C.muted,marginTop:5}}>{T.goal} {MAX_KCAL}</div>
                  </div>
                );
              }
              const {lk,val,max}=card;
              const mColor=goalColor(parseFloat(val),max);
              const [mg0,mg1]=goalGrad(parseFloat(val),max);
              return (
                <div key={lk} className="card" style={{padding:"13px 12px",borderRadius:16,cursor:"pointer"}} onClick={()=>setActiveRing(lk)}>
                  <div style={{fontSize:9,letterSpacing:1.2,textTransform:"uppercase",color:C.muted}}>{T[lk]}</div>
                  <div style={{fontSize:20,fontWeight:900,color:mColor,marginTop:5,lineHeight:1}}>{val}<span style={{fontSize:10,fontWeight:500,color:C.muted}}>g</span></div>
                  <div style={{height:4,borderRadius:3,background:"rgba(148,163,184,.2)",overflow:"hidden",marginTop:7}}>
                    {max&&<div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${mg0},${mg1})`,width:`${Math.min(100,parseFloat(val)/max*100)}%`}}></div>}
                  </div>
                  <div style={{fontSize:9,color:C.muted,marginTop:5}}>{max?`${T.goal} ${max}g`:T.noLimit}</div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* ── QUICK ADD HEADER ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px 10px"}}>
        <div style={{fontSize:10,letterSpacing:1.5,textTransform:"uppercase",color:C.muted}}>{T.quickAdd}</div>
        <div style={{display:"flex",gap:6}}>
          {showEditQuick&&<button onClick={resetQuickFoods} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:16,padding:"4px 10px",fontSize:11,color:C.muted,cursor:"pointer"}}>{T.reset}</button>}
          <button onClick={()=>setShowEditQuick(v=>!v)} style={{background:showEditQuick?"rgba(217,119,6,.08)":"none",border:`1px solid ${showEditQuick?C.warn:C.border}`,borderRadius:16,padding:"4px 10px",fontSize:11,color:showEditQuick?C.warn:C.muted,cursor:"pointer"}}>{showEditQuick?T.done:T.edit}</button>
          <button onClick={()=>setShowNewBtn(true)} style={{background:"rgba(13,148,136,.08)",border:"1px solid rgba(13,148,136,.25)",borderRadius:16,padding:"4px 10px",fontSize:11,color:C.accent,cursor:"pointer"}}>{T.newBtn}</button>
        </div>
      </div>

      {/* ── QUICK ADD CHIPS — compact wrap grid ── */}
      <div className="qa-wrap" style={{display:"flex",flexWrap:"wrap",gap:6,padding:"0 16px 8px"}}>
        {quickFoods.map(food=>(
          <div key={food.id} style={{flexShrink:0,position:"relative"}}>
            <QuickFoodChip food={food} onAdd={addEntry} editMode={showEditQuick} onRemove={removeQuickFood} onEdit={setEditingQuickFood}/>
          </div>
        ))}
        {!isHiddenSpecial('var_crackers')&&<div style={{flexShrink:0}}><VarButton foodKey="crackers" onAdd={addEntry} editMode={showEditQuick} onEdit={f=>{if(f)setEditingQuickFood(f);}}/></div>}
        {!isHiddenSpecial('var_granola')&&<div style={{flexShrink:0}}><VarButton foodKey="granola" onAdd={addEntry} editMode={showEditQuick} onEdit={f=>{if(f)setEditingQuickFood(f);}}/></div>}
        {!isHiddenSpecial('yogurt')&&<div style={{flexShrink:0}}><YogurtBtn onAdd={addEntry} editMode={showEditQuick} onEdit={f=>{if(f)setEditingQuickFood(f);}}/></div>}
        {!isHiddenSpecial('coffee')&&<div style={{flexShrink:0}}><CoffeeBtn onAdd={addEntry} editMode={showEditQuick} onEdit={f=>{if(f)setEditingQuickFood(f);}}/></div>}
        {customBtns.map(btn=>(
          <div key={btn.id} style={{flexShrink:0,position:"relative"}}>
            <button className="chip chip-yellow" onClick={()=>showEditQuick?null:addEntry(btn)} style={{paddingLeft:26,opacity:showEditQuick?0.7:1}}>
              <span>{btn.label}</span><span className="chip-sub">{btn.kcal} {getT().kcal} · {btn.carbs}g {getT().carbs}</span>
            </button>
            <button onClick={()=>removeBtn(btn.id)} style={{position:"absolute",top:4,left:6,background:"none",border:"none",color:"#ccc",fontSize:13,cursor:"pointer",lineHeight:1,padding:0}}>×</button>
            {showEditQuick&&<button onClick={()=>setEditingQuickFood({...btn,_type:'custom'})} style={{position:"absolute",top:-4,right:-4,background:C.warn,border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✏</button>}
          </div>
        ))}
      </div>
      {/* ── ACTION BUTTONS ROW ── */}
      <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif" style={{display:"none"}}
        onChange={e=>{
          const file=e.target.files[0]; if(!file)return; e.target.value="";
          const reader=new FileReader();
          reader.onload=ev=>{
            setPendingPhoto({base64:ev.target.result.split(',')[1],mediaType:file.type||'image/jpeg',src:ev.target.result});
            setShowPhoto(true); setShowMeal(false); setShowSmart(false); setShowMealPlanner(false);
          };
          reader.readAsDataURL(file);
        }}
      />
      <div style={{display:"flex",gap:8,padding:"0 16px 14px"}}>
        <button onClick={()=>{if(showPhoto){setShowPhoto(false);setPendingPhoto(null);}else{photoInputRef.current.click();}}} style={{flex:1,background:showPhoto?"#1a6b9e":"rgba(255,255,255,.75)",border:`1px solid ${showPhoto?"#1a6b9e":C.border}`,color:showPhoto?"#fff":C.muted,padding:"8px 4px",borderRadius:10,fontSize:11,cursor:"pointer",fontWeight:600}}>{T.photo}</button>
        <button onClick={()=>{setShowMeal(v=>!v);setShowSmart(false);setShowPhoto(false);setPendingPhoto(null);setShowMealPlanner(false);}} style={{flex:1,background:showMeal?"#5a3e8e":"rgba(255,255,255,.75)",border:`1px solid ${showMeal?"#5a3e8e":C.border}`,color:showMeal?"#fff":C.muted,padding:"8px 4px",borderRadius:10,fontSize:11,cursor:"pointer",fontWeight:600}}>{T.mealBtn}</button>
        <button onClick={()=>{setShowSmart(v=>!v);setShowMeal(false);setShowPhoto(false);setPendingPhoto(null);setShowMealPlanner(false);}} style={{flex:1,background:showSmart?"#0d9488":"rgba(255,255,255,.75)",border:`1px solid ${showSmart?"#0d9488":C.border}`,color:showSmart?"#fff":C.muted,padding:"8px 4px",borderRadius:10,fontSize:11,cursor:"pointer",fontWeight:600}}>+ {T.addItem}</button>
      </div>

      {showPhoto&&<PhotoMealPanel onAdd={addEntry} initialPhoto={pendingPhoto} onClose={()=>{setShowPhoto(false);setPendingPhoto(null);}}/>}
      {showMeal&&<MealPanel onAdd={addEntry} onClose={()=>setShowMeal(false)}/>}
      {showSmart&&<SmartAddPanel onAdd={addEntry} onClose={()=>setShowSmart(false)}/>}

      {/* ── LOG CARD ── */}
      <div className="card" style={{margin:"0 16px 14px",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:"1px solid rgba(148,163,184,.16)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:14}}>📋</span>
            <span style={{fontSize:13,fontWeight:700,color:C.text}}>{T.todayLog}</span>
            {entries.length>0&&<span style={{background:"rgba(13,148,136,.08)",color:C.accent,border:"1px solid rgba(13,148,136,.2)",borderRadius:20,fontSize:10,fontWeight:700,padding:"2px 8px"}}>{entries.length} {T.items}</span>}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {isToday&&<button onClick={copyPrevDay} style={{fontSize:11,color:C.muted,cursor:"pointer",fontWeight:600,background:"none",border:"none",fontFamily:"inherit"}}>{T.yesterday}</button>}
            <button onClick={()=>setShowJournal(true)} style={{fontSize:11,color:C.accent,cursor:"pointer",fontWeight:600,background:"none",border:"none",fontFamily:"inherit"}}>{T.allLog}</button>
          </div>
        </div>
        {entries.length===0
          ? <div style={{padding:"30px 20px",textAlign:"center",color:C.muted,fontSize:13}}>{T.noEntries}</div>
          : <>
              {entries.map(e=><EntryRow key={e.uid} entry={e} onRemove={removeEntry} onUpdate={updateEntry} lang={lang}/>)}
              <div className="summary-row">
                <span style={{fontSize:12,fontWeight:700,color:C.accent}}>{T.total}</span>
                <span style={{fontSize:12,color:C.accent}}>{Math.round(totals.kcal)} {T.kcal} · {totals.carbs.toFixed(1)}g {T.carbs} · {totals.protein.toFixed(1)}g {T.protein}</span>
              </div>
            </>
        }
        {isToday&&entries.length>0&&(
          <div style={{display:"flex",gap:8,padding:"10px 14px",borderTop:"1px solid rgba(148,163,184,.12)"}}>
            <button onClick={saveDay} style={{flex:1,background:saveFlash?"rgba(13,148,136,.12)":"rgba(255,255,255,.7)",border:`1px solid ${saveFlash?C.accent:C.border}`,borderRadius:10,padding:"8px",fontSize:12,fontWeight:600,color:saveFlash?C.accent:C.muted,cursor:"pointer",animation:saveFlash?"pop .35s ease":"none"}}>
              💾 {T.daySaved}
            </button>
            {isToday&&<button onClick={copyPrevDay} style={{flex:1,background:"rgba(255,255,255,.7)",border:`1px solid ${C.border}`,borderRadius:10,padding:"8px",fontSize:12,fontWeight:600,color:C.muted,cursor:"pointer"}}>
              {T.yesterday}
            </button>}
            <button onClick={clearAll} style={{flex:1,background:clearConfirm?"rgba(220,38,38,.08)":"rgba(255,255,255,.7)",border:`1px solid ${clearConfirm?C.danger:C.border}`,borderRadius:10,padding:"8px",fontSize:12,fontWeight:600,color:clearConfirm?C.danger:C.muted,cursor:"pointer",transition:"all .2s"}}>
              {clearConfirm?(isToday?"בטוח?":"Sure?"):`🗑 ${T.clear}`}
            </button>
          </div>
        )}
      </div>

      {/* ── FAB ── */}
      <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
        <button onClick={()=>{setShowMealPlanner(v=>!v);setShowMeal(false);setShowPhoto(false);setShowSmart(false);}}
          style={{background:"linear-gradient(135deg,#14b8a6,#0d9488)",border:"none",borderRadius:50,padding:"14px 32px",fontSize:14,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 6px 24px rgba(13,148,136,.35)",display:"flex",alignItems:"center",gap:8}}>
          🍳 {T.whatEat}
        </button>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{position:"sticky",bottom:0,background:"rgba(255,255,255,.92)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderTop:"1px solid rgba(148,163,184,.2)",display:"flex",zIndex:10,paddingBottom:"env(safe-area-inset-bottom)"}}>
        {(()=>{
          const activeTab=showJournal?"journal":showDB?"db":showProfiles?"profile":"home";
          return [{id:"home",icon:"🏠",lk:"home",action:null},
            {id:"journal",icon:"📓",lk:"journal",action:()=>setShowJournal(true)},
            {id:"db",icon:"🗂",lk:"db",action:()=>setShowDB(true)},
            {id:"profile",icon:"👤",lk:"profile",action:()=>setShowProfiles(true)},
          ].map(tab=>{
            const active=activeTab===tab.id;
            return (
              <button key={tab.id} onClick={tab.action} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 0",gap:3,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>
                <span style={{fontSize:20,lineHeight:1}}>{tab.icon}</span>
                <span style={{fontSize:9,letterSpacing:.4,color:active?C.accent:"#94a3b8",fontWeight:active?700:400}}>{T[tab.lk]}</span>
                {active&&<span style={{width:4,height:4,borderRadius:"50%",background:C.accent,marginTop:-1}}/>}
              </button>
            );
          });
        })()}
      </div>
    </div>
  );
}


export default App;
