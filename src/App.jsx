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

// ── Analytics device ping ─────────────────────────────────────────────────────
(()=>{
  try{
    let did=localStorage.getItem('_nutrition_did');
    if(!did){
      did='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{
        const r=crypto.getRandomValues(new Uint8Array(1))[0]%16;
        return(c==='x'?r:(r&0x3|0x8)).toString(16);
      });
      localStorage.setItem('_nutrition_did',did);
    }
    fetch('https://nutrition-ai.lior0gal.workers.dev/ping',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({deviceId:did})}).catch(()=>{});
  }catch(_){}
})();

// ── Pantry & Shopping helpers ─────────────────────────────────────────────────
const loadPantry=()=>{try{return JSON.parse(localStorage.getItem("nutrition_pantry")||"{}");}catch{return {};}};
const loadShopping=()=>{try{return JSON.parse(localStorage.getItem("nutrition_shopping")||"[]");}catch{return [];}};

// ── Household / Firebase ──────────────────────────────────────────────────────
let _fbDb=null,_fbRefFn=null,_fbSet=null,_fbOnValue=null;
let _householdId=null,_memberName="",_lastSyncAt=0;

// Pre-warm Firebase modules if household is already configured (improves first-open speed)
if(ls.get('nutrition_household')){
  Promise.all([import('firebase/app'),import('firebase/database')]).catch(()=>{});
}

// ── Google OAuth + Firebase Management API (auto household setup) ─────────────
const GOOG_CLIENT_ID='265332769587-rdfch8osb3k8f5tn7mf1ra1ods3kte38.apps.googleusercontent.com';

const _loadGIS=()=>new Promise((ok,fail)=>{
  if(window.google?.accounts?.oauth2){ok();return;}
  const s=document.createElement('script');
  s.src='https://accounts.google.com/gsi/client';
  s.onload=ok;s.onerror=fail;document.head.appendChild(s);
});

const _getGToken=()=>new Promise((ok,fail)=>{
  window.google.accounts.oauth2.initTokenClient({
    client_id:GOOG_CLIENT_ID,
    scope:'https://www.googleapis.com/auth/firebase https://www.googleapis.com/auth/cloud-platform',
    callback:r=>r.error?fail(new Error(r.error_description||r.error)):ok(r.access_token),
    error_callback:e=>fail(new Error(e?.type||'auth error')),
  }).requestAccessToken({prompt:''});
});

const _gapi=async(url,tok,method='GET',body=null)=>{
  const r=await fetch(url,{method,headers:{Authorization:`Bearer ${tok}`,'Content-Type':'application/json'},...(body!=null?{body:JSON.stringify(body)}:{})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error?.message||`שגיאה ${r.status}`);
  return d;
};

async function autoSetupHousehold(projectId,onStep){
  await _loadGIS();
  onStep('auth');
  const tok=await _getGToken();

  onStep('project');
  // Get project info — also ensures Firebase is activated on this Cloud project
  let proj;
  try{
    proj=await _gapi(`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}`,tok);
  }catch(e){
    // If not yet a Firebase project, try to add Firebase to the Cloud project
    try{
      const op=await _gapi(`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}:addFirebase`,tok,'POST',{});
      // Poll until done
      let addOp=op;
      for(let i=0;i<15&&!addOp.done;i++){
        await new Promise(r=>setTimeout(r,2000));
        addOp=await _gapi(`https://firebase.googleapis.com/v1beta1/${addOp.name}`,tok);
      }
      proj=await _gapi(`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}`,tok);
    }catch(e2){throw new Error(`פרויקט לא נמצא: ${e2.message}`,{cause:e2});}
  }
  const pNum=proj.projectNumber;
  if(!pNum)throw new Error('לא הצלחנו לאמת את הפרויקט — בדקי את ה-Project ID');

  onStep('database');
  // Try known URL patterns first (avoids management API permission issues)
  const _probeDb=async(url)=>{
    try{const r=await fetch(`${url}/.json?shallow=true`,{headers:{Authorization:`Bearer ${tok}`}});return r.status!==404;}catch(_){return false;}
  };
  const candidates=[
    `https://${projectId}-default-rtdb.firebaseio.com`,
    `https://${projectId}-default-rtdb.europe-west1.firebasedatabase.app`,
    `https://${projectId}.firebaseio.com`,
  ];
  let dbUrl=null;
  for(const url of candidates){if(await _probeDb(url)){dbUrl=url;break;}}
  // If not found by probing, try management API to create
  if(!dbUrl){
    for(const [ref,loc] of[[pNum,'europe-west1'],[pNum,'us-central1'],[projectId,'us-central1']]){
      try{
        const db=await _gapi(`https://firebasedatabase.googleapis.com/v1beta/projects/${ref}/locations/${loc}/instances?databaseId=${projectId}-default-rtdb`,tok,'POST',{type:'USER_DATABASE'});
        dbUrl=db.databaseUrl;break;
      }catch(e){
        if(e.message.toLowerCase().includes('multiple')||e.message.toLowerCase().includes('blaze')||e.message.toLowerCase().includes('already')){
          // DB definitely exists — use standard URL
          dbUrl=candidates[0];break;
        }
      }
    }
  }
  if(!dbUrl)throw new Error('לא הצלחנו למצוא את ה-Realtime Database — צרו אחד ידנית ב-Firebase Console');

  onStep('webapp');
  let appId=null;
  try{
    const al=await _gapi(`https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`,tok);
    if(al.apps?.length)appId=al.apps[0].appId;
  }catch(_){}
  if(!appId){
    let op=await _gapi(`https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`,tok,'POST',{displayName:'Nutrition'});
    for(let i=0;i<20&&!op.done;i++){await new Promise(r=>setTimeout(r,1500));op=await _gapi(`https://firebase.googleapis.com/v1beta1/${op.name}`,tok);}
    if(!op.done)throw new Error('יצירת Web App לקחה יותר מדי זמן');
    appId=op.response?.appId;
  }

  onStep('config');
  const cfg=await _gapi(`https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps/${appId}/config`,tok);
  if(!cfg.databaseURL)cfg.databaseURL=dbUrl;

  // Enable Anonymous Auth so the database can require authentication instead of being world-writable
  try{
    await _gapi(`https://serviceusage.googleapis.com/v1/projects/${pNum}/services/identitytoolkit.googleapis.com:enable`,tok,'POST',{});
  }catch(_){}
  try{
    await _gapi(`https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config?updateMask=signIn.anonymous.enabled`,tok,'PATCH',{signIn:{anonymous:{enabled:true}}});
  }catch(_){}

  // Lock rules down to "must be signed in" + scoped to the households path (was previously wide-open '.read'/'.write': true,
  // which let anyone who ever saw a sharing code or the databaseURL read/write the whole database, forever, with no auth).
  // Best effort: if this fails (e.g. anonymous auth couldn't be enabled above), the client falls back to unauthenticated
  // access in _fbInit so existing/manual setups keep working.
  try{
    await fetch(`${cfg.databaseURL}/.settings/rules.json`,{method:'PUT',headers:{Authorization:`Bearer ${tok}`,'Content-Type':'application/json'},body:JSON.stringify({rules:{
      '.read':false,'.write':false,
      households:{'$hid':{'.read':'auth != null','.write':'auth != null'}},
    }})});
  }catch(_){}
  return cfg;
}

async function _fbInit(cfg){
  if(_fbDb&&_householdId===cfg.householdId)return true;
  try{
    const[appMod,dbMod,authMod]=await Promise.all([import('firebase/app'),import('firebase/database'),import('firebase/auth')]);
    const{initializeApp,getApps,deleteApp}=appMod;
    const{getDatabase,ref,set,onValue}=dbMod;
    const{getAuth,signInAnonymously}=authMod;
    const ANAME='nutrition-household';
    const existing=getApps().find(a=>a.name===ANAME);
    if(existing&&existing.options.projectId!==cfg.firebaseConfig?.projectId){
      await deleteApp(existing);
    }
    const app=getApps().find(a=>a.name===ANAME)||initializeApp(cfg.firebaseConfig,ANAME);
    // New households have rules that require auth ('auth != null'). Sign in anonymously so reads/writes are authorized.
    // Best effort: older/manual households may not have Anonymous Auth enabled on their Firebase project — in that
    // case this fails silently and we fall back to whatever (legacy, possibly open) rules that project already has.
    try{
      const auth=getAuth(app);
      if(!auth.currentUser)await signInAnonymously(auth);
    }catch(e){console.error('Firebase anon auth (continuing without it):',e);}
    _fbDb=getDatabase(app);
    _fbRefFn=ref;_fbSet=set;_fbOnValue=onValue;
    _householdId=cfg.householdId;
    _memberName=cfg.memberName||"";
    return true;
  }catch(e){console.error('Firebase init:',e);return false;}
}

function _fbSyncPantry(p){
  if(!_fbDb||!_householdId)return;
  _fbSet(_fbRefFn(_fbDb,`households/${_householdId}/pantry`),p).catch(()=>{});
}

function _fbSyncShopping(s){
  if(!_fbDb||!_householdId)return;
  // Store as object (Firebase handles arrays inconsistently)
  const obj={};s.forEach(item=>{obj[String(item.id).replace('.','_')]=item;});
  _fbSet(_fbRefFn(_fbDb,`households/${_householdId}/shopping`),obj).catch(()=>{});
}

const savePantryLS=p=>{localStorage.setItem("nutrition_pantry",JSON.stringify(p));_fbSyncPantry(p);};
const saveShopping=s=>{localStorage.setItem("nutrition_shopping",JSON.stringify(s));_fbSyncShopping(s);};
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
  } else if(unit === "מנה" || unit === "serving" || f.unit === "מנה") {
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
  if(p>=0.85) return "#dc2626";
  if(p>=0.6) return "#ea580c";
  if(p>=0.35) return "#ca8a04";
  return "#166534";
};
const goalGrad=(consumed,max)=>{
  if(!max) return ["#166534","#22c55e"];
  const p=consumed/max;
  if(p>=0.85) return ["#dc2626","#f87171"];
  if(p>=0.6) return ["#ea580c","#fb923c"];
  if(p>=0.35) return ["#ca8a04","#fbbf24"];
  return ["#166534","#22c55e"];
};
// Protein: inverted scale — red when low, green when at/near goal
const goalColorInv=(consumed,max)=>{
  if(!max||isNaN(consumed)) return "#dc2626";
  const p=consumed/max;
  if(p>=0.85) return "#166534";
  if(p>=0.6) return "#ca8a04";
  if(p>=0.35) return "#ea580c";
  return "#dc2626";
};
const goalGradInv=(consumed,max)=>{
  if(!max) return ["#dc2626","#f87171"];
  const p=consumed/max;
  if(p>=0.85) return ["#166534","#22c55e"];
  if(p>=0.6) return ["#ca8a04","#fbbf24"];
  if(p>=0.35) return ["#ea580c","#fb923c"];
  return ["#dc2626","#f87171"];
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

// ── CalcLoader ────────────────────────────────────────────────────────────────
function CalcLoader({size=32}){
  const [v]=useState(()=>Math.ceil(Math.random()*3));
  return(
    <div style={{width:size,height:size,borderRadius:'50%',overflow:'hidden',display:'inline-block',verticalAlign:'middle',flexShrink:0,WebkitMaskImage:'-webkit-radial-gradient(circle, white 100%, black 100%)'}}>
      <video src={`/Nutrition/loader${v}.mp4`} autoPlay loop muted playsInline style={{width:'100%',height:'100%',objectFit:'cover',display:'block',transform:'translateZ(0)',willChange:'transform'}}/>
    </div>
  );
}

// ── StatBar ────────────────────────────────────────────────────────────────────
function StatBar({value,max,color}){
  const pct=Math.min(value/max*100,100);
  const col=pct>85?C.danger:pct>60?C.warn:color;
  return <div className="stat-bar-bg"><div className="stat-bar" style={{width:`${pct}%`,background:col}}/></div>;
}

// ── EntryRow ───────────────────────────────────────────────────────────────────
function EntryRow({entry,onRemove,onUpdate,lang}){
  const T=LANG[lang||localStorage.getItem('nutrition_lang')||'he']||LANG.he;
  const [editing,setEditing]=useState(false);
  const [qty,setQty]=useState("");
  const m=entry.label.match(/\((\d+\.?\d*)\s*([^)]*)\)$/);
  const origQty=m?parseFloat(m[1]):null;
  const origUnit=m?m[2].trim():null;

  const applyEdit=()=>{
    const nq=parseFloat(qty);
    if(!nq||!origQty||nq===origQty){setEditing(false);return;}
    const f=nq/origQty;
    onUpdate(entry.uid,{
      label:entry.label.replace(/\(\d+\.?\d*\s*[^)]*\)$/,`(${nq}${origUnit?" "+origUnit:""})`),
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
          <div className="entry-sub" style={(lang||localStorage.getItem('nutrition_lang')||'he')==='en'?{direction:'ltr',textAlign:'left'}:{}}>{Math.round(entry.kcal)} {T.kcal} · {Number(entry.carbs).toFixed(1)}g {T.carbs} · {Number(entry.protein).toFixed(1)}g {T.protein}</div>
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
  const isHe=(lang||'he')!=='en';
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
  // Add new item via text
  const [showAdd,setShowAdd]=useState(false);
  const [addText,setAddText]=useState("");
  const [addQty,setAddQty]=useState(1);
  const [addLoading,setAddLoading]=useState(false);
  const [addData,setAddData]=useState(null);
  const [addError,setAddError]=useState("");
  const addImgRef=useRef(null);
  const addRawRef=useRef(null); // stores raw Claude response for qty recalc

  // Recalc numbers when qty changes and raw data exists (keeps label/unit edits)
  useEffect(()=>{
    const raw=addRawRef.current;
    if(!raw)return;
    const qty=Math.max(1,addQty);
    setAddData(d=>d?{...d,kcal:String(Math.round((raw.kcal||0)/qty)),carbs:String(parseFloat(((raw.carbs||0)/qty).toFixed(1))),protein:String(parseFloat(((raw.protein||0)/qty).toFixed(1))),fat:String(parseFloat(((raw.fat||0)/qty).toFixed(1)))}:d);
  },[addQty]);

  const askClaudeAdd=async(textOrImg)=>{
    setAddLoading(true);setAddData(null);setAddError("");addRawRef.current=null;
    try{
      const body=textOrImg.type==='text'
        ?{dbEditText:textOrImg.val}
        :{dbEditImageData:textOrImg.b64,dbEditImageMediaType:textOrImg.mime,...(textOrImg.hint?{dbEditImageHint:textOrImg.hint}:{})};
      const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const d=await res.json();
      if(!d.kcal)throw new Error();
      addRawRef.current=d;
      const qty=Math.max(1,addQty);
      setAddData({label:d.label||"",kcal:String(Math.round((d.kcal||0)/qty)),carbs:String(parseFloat(((d.carbs||0)/qty).toFixed(1))),protein:String(parseFloat(((d.protein||0)/qty).toFixed(1))),fat:String(parseFloat(((d.fat||0)/qty).toFixed(1))),unit:"g"});
    }catch{setAddError(isHe?"שגיאה בחישוב — נסה שנית":"Calculation error — try again");}
    setAddLoading(false);
  };

  const handleAddImage=e=>{
    const file=e.target.files[0];if(!file)return;e.target.value="";
    const reader=new FileReader();
    reader.onload=ev=>askClaudeAdd({type:'img',b64:ev.target.result.split(',')[1],mime:file.type||'image/jpeg',hint:addText.trim()});
    reader.readAsDataURL(file);
  };

  const saveNewItem=()=>{
    if(!addData)return;
    const label=addData.label||addText.trim()||"פריט חדש";
    const entry={names:[label.toLowerCase().replace(/^[^\w]/,'')],label,kcal:parseFloat(addData.kcal)||0,carbs:parseFloat(addData.carbs)||0,protein:parseFloat(addData.protein)||0,fat:parseFloat(addData.fat)||0,unit:addData.unit||"g",defaultAmt:100,...(addText.trim()?{sourceText:addText.trim()}:{})};
    const apid=window._activePid||pid||'default';
    const updated=[...db.filter(f=>f.label!==label),entry];
    saveCustomDB(updated,apid);setDb(updated);
    setShowAdd(false);setAddText("");setAddData(null);setAddQty(1);
  };

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
    setEditClaudeText(f.sourceText||f.label.replace(/^[^\w֐-׿]+/,'')); setEditQty(1); setEditPreview(null);
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
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={T.search} className="inp" style={{marginBottom:8}}/>

        {/* Add new item */}
        <input ref={addImgRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif" onChange={handleAddImage} style={{display:"none"}}/>
        <button onClick={()=>setShowAdd(v=>!v)} style={{width:"100%",background:"transparent",border:`1px dashed ${C.border}`,borderRadius:10,padding:"8px",fontSize:12,color:C.accent,cursor:"pointer",marginBottom:10,fontWeight:700}}>
          {showAdd?(isHe?"✕ סגור":"✕ Close"):(isHe?"+ הוסף פריט חדש":"+ Add New Item")}
        </button>
        {showAdd&&(
          <div className="fade" style={{background:"#f5f5f7",borderRadius:10,padding:12,marginBottom:12,display:"flex",flexDirection:"column",gap:8}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:2}}>{isHe?"תאר את הפריט ו/או צלם אותו":"Describe the item and/or take a photo"}</div>
            <div style={{display:"flex",gap:6}}>
              <textarea value={addText} onChange={e=>setAddText(e.target.value)}
                placeholder={isHe?"למשל: 100g חזה עוף מבושל, כוס אורז מבושל...":"e.g. 100g cooked chicken breast, 1 cup cooked rice..."}
                className="inp" rows={2} style={{flex:1,fontSize:12,resize:"none"}}/>
              <button onClick={()=>addImgRef.current?.click()} style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:18}}>📷</button>
            </div>
            {addLoading&&<div style={{textAlign:'center',marginBottom:4}}><CalcLoader size={64}/></div>}
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:11,color:C.muted}}>{isHe?"מספר מנות:":"Servings:"}</span>
              <button onClick={()=>setAddQty(v=>Math.max(1,v-1))} style={{width:24,height:24,border:`1px solid ${C.border}`,borderRadius:6,background:"#fff",cursor:"pointer",fontSize:13}}>−</button>
              <input type="number" value={addQty} min="1" onChange={e=>setAddQty(Math.max(1,parseInt(e.target.value)||1))} style={{width:38,textAlign:"center",border:`1px solid ${C.border}`,borderRadius:6,padding:"3px",fontSize:13,fontFamily:"inherit"}}/>
              <button onClick={()=>setAddQty(v=>v+1)} style={{width:24,height:24,border:`1px solid ${C.border}`,borderRadius:6,background:"#fff",cursor:"pointer",fontSize:13}}>+</button>
              <button onClick={()=>askClaudeAdd({type:'text',val:addText})} disabled={!addText.trim()||addLoading}
                style={{flex:1,background:addText.trim()&&!addLoading?C.accent:"#ddd",border:"none",borderRadius:8,color:addText.trim()&&!addLoading?"#fff":"#aaa",padding:"6px 8px",fontSize:12,fontWeight:700,cursor:addText.trim()&&!addLoading?"pointer":"default"}}>
                {addLoading?(isHe?"חושב...":"Thinking..."):`✨ ${isHe?"חשב":"Calculate"}`}
              </button>
            </div>
            {addError&&<div style={{fontSize:11,color:C.danger,background:"rgba(220,38,38,.06)",borderRadius:6,padding:"5px 8px"}}>{addError}</div>}
            {addData&&(
              <div className="fade">
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
                  {[["label",isHe?"שם":"Name","#333"],["kcal",T.kcal,C.accent],["carbs",T.carbs+" g",C.warn],["protein",T.protein+" g",C.blue],["fat",T.fat+" g","#999"]].map(([k,l,c])=>(
                    k==="label"
                      ?<div key={k} style={{gridColumn:"1/-1"}}><input value={addData.label} onChange={e=>setAddData(d=>({...d,label:e.target.value}))} className="inp" style={{fontSize:12}} placeholder={l}/></div>
                      :<div key={k} className="num-wrap">
                        <input type="number" value={addData[k]} onChange={e=>setAddData(d=>({...d,[k]:e.target.value}))} style={{borderColor:c}} className="num-wrap"/>
                        <div className="num-lbl" style={{color:c}}>{l}</div>
                      </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:6}}>
                  <select value={addData.unit} onChange={e=>setAddData(d=>({...d,unit:e.target.value}))} className="inp" style={{flex:1,fontSize:12}}>
                    <option value="g">{isHe?"גר׳":"g"}</option><option value="ml">מ״ל</option><option value="יח׳">יח׳</option><option value="מנה">{isHe?"מנה":"serving"}</option>
                  </select>
                  <button onClick={saveNewItem} style={{flex:2,background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"8px",fontSize:13,fontWeight:700,cursor:"pointer"}}>{isHe?"💾 שמור פריט":"💾 Save Item"}</button>
                </div>
              </div>
            )}
          </div>
        )}
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
                        {editLoading&&<div style={{textAlign:'center',marginBottom:4}}><CalcLoader size={64}/></div>}
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                          <span style={{fontSize:11,color:C.muted}}>מספר מנות:</span>
                          <button onClick={()=>setEditQty(v=>Math.max(1,v-1))} style={{width:24,height:24,border:`1px solid ${C.border}`,borderRadius:6,background:"#f5f5f7",cursor:"pointer",fontSize:13}}>−</button>
                          <input type="number" value={editQty} min="1" onChange={e=>setEditQty(Math.max(1,parseInt(e.target.value)||1))} style={{width:38,textAlign:"center",border:`1px solid ${C.border}`,borderRadius:6,padding:"3px",fontSize:13,fontFamily:"inherit"}}/>
                          <button onClick={()=>setEditQty(v=>v+1)} style={{width:24,height:24,border:`1px solid ${C.border}`,borderRadius:6,background:"#f5f5f7",cursor:"pointer",fontSize:13}}>+</button>
                          <button onClick={askClaudeText} disabled={!editClaudeText.trim()||editLoading}
                            style={{flex:1,background:editClaudeText.trim()&&!editLoading?C.accent:"#ddd",border:"none",borderRadius:8,color:editClaudeText.trim()&&!editLoading?"#fff":"#aaa",padding:"6px 8px",fontSize:12,fontWeight:700,cursor:editClaudeText.trim()&&!editLoading?"pointer":"default"}}>
                            {editLoading?"חושב...":"✨ חשב מחדש"}
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
function FoodAutocomplete({value, onChange, onSelect, onSelectFood, placeholder, recentFoods, onSelectRecent}){
  const [open, setOpen] = useState(false);

  const allFoods = [
    ...loadCustomDB(window._activePid||"default").map(f=>({label:f.label, name:f.names[0], food:f})),
    ...FOOD_DB.map(f=>({label:f.label, name:f.names[0], food:f})),
  ];

  const q = value.trim().toLowerCase();
  const suggestions = q.length >= 1 ? allFoods.filter(f =>
    f.label.toLowerCase().includes(q) ||
    f.name.toLowerCase().includes(q)
  ).slice(0, 6) : [];

  const showRecent = open && q.length === 0 && recentFoods && recentFoods.length > 0;
  const showSuggestions = open && suggestions.length > 0;

  return (
    <div style={{position:"relative", marginBottom:8}}>
      <input
        value={value}
        onChange={e=>{ onChange(e.target.value); setOpen(true); }}
        onKeyDown={e=>{ if(e.key==="Enter"){ setOpen(false); onSelect(value); } if(e.key==="Escape") setOpen(false); }}
        onFocus={()=>setOpen(true)}
        onBlur={()=>setTimeout(()=>setOpen(false),150)}
        placeholder={placeholder}
        className="inp"
        style={{fontSize:15, width:"100%"}}
      />
      {(showRecent || showSuggestions) && (
        <div style={{position:"absolute", top:"calc(100% + 4px)", right:0, left:0, background:"#fff", border:`1px solid ${C.accent}`, borderRadius:10, zIndex:50, overflow:"hidden", boxShadow:"0 6px 20px rgba(0,0,0,0.1)", animation:"fadeIn 0.1s ease"}}>
          {showRecent && <>
            <div style={{padding:"6px 14px 4px", fontSize:9.5, color:C.muted, letterSpacing:1.5, background:"#f8f8fa"}}>אחרונים</div>
            {recentFoods.map((f,i)=>(
              <div key={i} onMouseDown={e=>{ e.preventDefault(); if(onSelectRecent) onSelectRecent(f); setOpen(false); }}
                style={{padding:"9px 14px", fontSize:13, color:C.text, cursor:"pointer", borderBottom:i<recentFoods.length-1?`1px solid ${C.border}`:"none", background:"#fff", display:"flex", justifyContent:"space-between", alignItems:"center"}}
                onMouseEnter={e=>e.currentTarget.style.background="#f0fae8"}
                onMouseLeave={e=>e.currentTarget.style.background="#fff"}
              >
                <span>{f.label}</span>
                <span style={{fontSize:11, color:C.muted}}>{Math.round(f.kcal)} קק״ל</span>
              </div>
            ))}
          </>}
          {showSuggestions && suggestions.map((f,i)=>(
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
        <>
          {loading&&<div style={{textAlign:'center',marginBottom:8}}><CalcLoader size={64}/></div>}
          <button onClick={ask} disabled={loading} style={{width:"100%",background:"linear-gradient(135deg,#5a9e1e,#7bc42e)",border:"none",borderRadius:8,color:"#fff",padding:"10px",fontSize:13,fontWeight:700,cursor:loading?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:loading?0.85:1}}>
            {loading?"מחפש ערכים...":"✨ שאל את Claude"}
          </button>
        </>
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
function PhotoMealPanel({onAdd,onClose,initialPhoto,lang}){
  const isHe=(lang||localStorage.getItem('nutrition_lang')||'he')!=='en';
  const [loading,setLoading]=useState(false);
  const [preview,setPreview]=useState(null);
  const [calcVals,setCalcVals]=useState(null);
  const [error,setError]=useState(null);
  const [imgSrc,setImgSrc]=useState(initialPhoto?.src||null);
  const [servings,setServings]=useState(1);
  const [localAmt,setLocalAmt]=useState("1");
  const [qtyUnit,setQtyUnit]=useState("יח׳");
  const [mealWeight,setMealWeight]=useState("");
  const [totalUnits,setTotalUnits]=useState(0);
  const [savedToDb,setSavedToDb]=useState(false);
  const [showDbInput,setShowDbInput]=useState(false);
  const [dbName,setDbName]=useState("");
  const [savedToFav,setSavedToFav]=useState(false);
  const [pendingFav,setPendingFav]=useState(null);
  const [imgHint,setImgHint]=useState('');
  const [storedB64,setStoredB64]=useState(initialPhoto?.base64||null);
  const [storedMime,setStoredMime]=useState(initialPhoto?.mediaType||'image/jpeg');
  const fileRef=useRef(null);

  useEffect(()=>{
    if(initialPhoto?.base64) analyze(initialPhoto.base64,initialPhoto.mediaType,'');
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

  const computeVals=(p,s,amt,unit,mealW,mealU)=>{
    const a=parseFloat(amt)||1;
    const pg=getP100g(p,mealW);
    if(unit==='יח׳'||unit==='מנות'||unit==='קוביות'){
      // When we know grams-per-unit, use gram path for accuracy
      const uCount=parseFloat(mealU)||0;
      if(pg&&uCount>0&&parseFloat(mealW)>0){
        const gPerUnit=parseFloat(mealW)/uCount;
        const totalG=a*gPerUnit;
        const factor=totalG/100/s;
        return {
          kcal:Math.round(pg.kcal*factor),
          carbs:parseFloat(((pg.carbs||0)*factor).toFixed(1)),
          protein:parseFloat(((pg.protein||0)*factor).toFixed(1)),
          fat:parseFloat(((pg.fat||0)*factor).toFixed(1))
        };
      }
      // Fallback: fraction of whole meal
      const factor=a/s;
      return {
        kcal:Math.round(p.kcal*factor),
        carbs:parseFloat(((p.carbs||0)*factor).toFixed(1)),
        protein:parseFloat(((p.protein||0)*factor).toFixed(1)),
        fat:parseFloat(((p.fat||0)*factor).toFixed(1))
      };
    }
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
    return {kcal:0,carbs:0,protein:0,fat:0};
  };

  const analyze=async(base64,mediaType,hint)=>{
    setLoading(true);setPreview(null);setCalcVals(null);setError(null);
    setServings(1);setLocalAmt("1");setQtyUnit("יח׳");setMealWeight("");setTotalUnits(0);
    try{
      const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({imageData:base64,imageMediaType:mediaType,lang,...(hint?{imageHint:hint}:{})})
      });
      if(!res.ok){const eb=await res.json().catch(()=>({}));throw new Error(eb.error||(isHe?"שגיאת שרת":"Server error"));}
      const d=await res.json();
      if(d.error||!d.kcal) throw new Error(d.error||(isHe?"לא הצלחתי לנתח את התמונה":"Could not analyze the photo"));
      // Derive per100g from totalGrams if server included a sensible weight
      if(!d.per100g && d.totalGrams >= 20){
        d.per100g={
          kcal:Math.round(d.kcal/d.totalGrams*100),
          carbs:parseFloat(((d.carbs||0)/d.totalGrams*100).toFixed(1)),
          protein:parseFloat(((d.protein||0)/d.totalGrams*100).toFixed(1)),
          fat:parseFloat(((d.fat||0)/d.totalGrams*100).toFixed(1))
        };
      }
      // Parse unit/piece count — prefer explicit piecesCount, then portions string
      const parsedU=d.piecesCount>0?d.piecesCount:(d.portions?parseInt((d.portions.match(/(\d+)\s*(יח|piece)/i)||[])[1]||"0"):0);
      const hasGrams=d.totalGrams>=20;
      const initW=hasGrams?String(d.totalGrams):"";
      // Use Claude's suggested amount/unit if provided, otherwise fall back to grams
      const VALID_UNITS=["יח׳","קוביות","מנות","g","ml","כף","כפית","כוס"];
      const initAmt=d.suggestedAmt?String(d.suggestedAmt):(hasGrams?String(d.totalGrams):"1");
      const initUnit=(d.suggestedUnit&&VALID_UNITS.includes(d.suggestedUnit))?d.suggestedUnit:(hasGrams?"g":"יח׳");
      setMealWeight(initW);setTotalUnits(parsedU);setLocalAmt(initAmt);setQtyUnit(initUnit);
      setPreview(d);
      setCalcVals(computeVals(d,1,initAmt,initUnit,initW,parsedU));
    }catch(e){setError(e.message);}
    setLoading(false);
  };

  const recalc=()=>{
    if(!preview)return;
    setCalcVals(computeVals(preview,servings,localAmt,qtyUnit,mealWeight,totalUnits));
  };

  // Auto-recalc whenever any input changes
  useEffect(()=>{ if(preview) recalc(); },[servings,localAmt,qtyUnit,mealWeight,totalUnits]);

  const handleFile=e=>{
    const file=e.target.files[0];
    if(!file)return;
    e.target.value="";
    const reader=new FileReader();
    reader.onload=ev=>{
      const b64=ev.target.result.split(',')[1];
      const mime=file.type||'image/jpeg';
      setImgSrc(ev.target.result);
      setStoredB64(b64);setStoredMime(mime);
      setPreview(null);setCalcVals(null);setError(null);
      analyze(b64,mime,imgHint.trim());
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

  const openDbSave=()=>{
    if(!preview)return;
    setDbName(preview.label||"ארוחה");
    setShowDbInput(true);
  };

  const saveToDb=()=>{
    if(!preview)return;
    const name=(dbName.trim()||preview.label||"ארוחה");
    const tg=parseFloat(mealWeight)||preview.totalGrams||0;
    const p100g=preview.per100g||(tg>=20?{
      kcal:Math.round(preview.kcal/tg*100),
      carbs:parseFloat(((preview.carbs||0)/tg*100).toFixed(1)),
      protein:parseFloat(((preview.protein||0)/tg*100).toFixed(1)),
      fat:parseFloat(((preview.fat||0)/tg*100).toFixed(1))
    }:null);
    const srcText=preview.label+(preview.portions?` — ${preview.portions}`:'');
    const entry=p100g?{
      names:[name.toLowerCase()],label:`📷 ${name}`,
      kcal:p100g.kcal,carbs:p100g.carbs,protein:p100g.protein,fat:p100g.fat,
      defaultAmt:tg||100,unit:"g",sourceText:srcText
    }:{
      names:[name.toLowerCase()],label:`📷 ${name}`,
      kcal:Math.round(preview.kcal),carbs:parseFloat((preview.carbs||0).toFixed(1)),
      protein:parseFloat((preview.protein||0).toFixed(1)),fat:parseFloat((preview.fat||0).toFixed(1)),
      defaultAmt:1,unit:"מנה",serving_size:1,sourceText:srcText
    };
    const pid=window._activePid||"default";
    const db=loadCustomDB(pid);
    saveCustomDB([...db.filter(f=>f.label!==entry.label),entry],pid);
    setShowDbInput(false);setSavedToDb(true);
    setTimeout(()=>setSavedToDb(false),2000);
  };

  const saveToFavorites=()=>{
    if(!preview||!calcVals)return;
    const food={id:`qf_photo_${Date.now()}`,label:`📷 ${preview.label||"ארוחה"}`,
      kcal:calcVals.kcal,carbs:calcVals.carbs,protein:calcVals.protein,fat:calcVals.fat};
    setPendingFav(food);
  };

  return (
    <div className="panel fade">
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif" onChange={handleFile} style={{display:"none"}}/>
      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>📷 {isHe?"ניתוח תמונה":"Photo Analysis"}</div>
      {imgSrc?(
        <div style={{position:"relative",marginBottom:10}}>
          <img src={imgSrc} style={{width:"100%",borderRadius:10,maxHeight:180,objectFit:"cover"}}/>
          <button onClick={()=>fileRef.current.click()} style={{position:"absolute",top:6,left:6,background:"rgba(0,0,0,0.55)",border:"none",borderRadius:6,padding:"4px 10px",fontSize:12,color:"#fff",cursor:"pointer"}}>🖼️ {isHe?"החלף":"Replace"}</button>
        </div>
      ):(!loading&&!error&&(
        <button onClick={()=>fileRef.current.click()} style={{width:"100%",background:"#f5f5f7",border:`1px solid ${C.border}`,borderRadius:10,padding:"18px 8px",textAlign:"center",cursor:"pointer",fontFamily:"inherit",marginBottom:10}}>
          <div style={{fontSize:26,marginBottom:4}}>📷</div>
          <div style={{fontSize:12,color:C.muted}}>{isHe?"בחרי תמונה":"Choose a photo"}</div>
        </button>
      ))}
      {/* Optional description field */}
      <textarea value={imgHint} onChange={e=>setImgHint(e.target.value)}
        placeholder={isHe?"תיאור אופציונלי: כמות, אופן הכנה, מוצר ספציפי...":"Optional: quantity, preparation, specific product..."}
        className="inp" rows={2} style={{fontSize:12,resize:"none",marginBottom:8}}/>
      {storedB64&&imgHint.trim()&&!loading&&(
        <button onClick={()=>analyze(storedB64,storedMime,imgHint.trim())}
          style={{width:"100%",background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"7px",fontSize:12,fontWeight:700,cursor:"pointer",marginBottom:8}}>
          🔄 {isHe?"נתח מחדש עם התיאור":"Re-analyze with description"}
        </button>
      )}
      {loading&&<div style={{textAlign:"center",padding:"14px 0",color:C.muted,fontSize:13}}><CalcLoader size={64}/><div style={{marginTop:6}}>{isHe?"מנתח תמונה...":"Analyzing photo..."}</div></div>}
      {error&&<div style={{background:"#fff0f0",border:`1px solid ${C.danger}`,borderRadius:8,padding:"8px 12px",fontSize:11,color:C.danger,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span>⚠ {error}</span>
        <button onClick={()=>fileRef.current.click()} style={{background:C.danger,border:"none",borderRadius:6,color:"#fff",padding:"2px 8px",fontSize:11,fontWeight:700,cursor:"pointer"}}>{isHe?"נסי שוב":"Retry"}</button>
      </div>}
      {preview&&calcVals&&(
        <div className="green-box fade" style={{marginBottom:8}}>
          <div style={{fontSize:11,color:C.accent,fontWeight:700,marginBottom:4}}>✨ {preview.label}</div>
          {preview.portions&&(
            <div style={{fontSize:10,color:C.muted,background:"#fff",borderRadius:6,padding:"5px 8px",marginBottom:6,lineHeight:1.5}}>
              📐 {preview.portions}
            </div>
          )}
          {/* Serving info — drives all calculations */}
          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8,background:"rgba(255,255,255,0.85)",borderRadius:8,padding:"6px 10px",border:`1px solid ${mealWeight?C.accent:C.border}`}}>
            <span style={{fontSize:10,color:C.muted}}>⚖️ {isHe?"מנה:":"Serving:"}</span>
            <input type="number" value={mealWeight} onChange={e=>setMealWeight(e.target.value)}
              placeholder="g" className="inp"
              style={{width:58,padding:"4px 6px",fontSize:13,textAlign:"center",marginBottom:0,fontWeight:700,borderColor:mealWeight?C.accent:C.border}}/>
            <span style={{fontSize:10,color:C.muted}}>g</span>
            {totalUnits>0&&<span style={{fontSize:10,color:C.muted,marginRight:4}}>/</span>}
            {totalUnits>0&&<input type="number" value={totalUnits} onChange={e=>setTotalUnits(parseFloat(e.target.value)||0)}
              className="inp"
              style={{width:46,padding:"4px 6px",fontSize:13,textAlign:"center",marginBottom:0,fontWeight:700}}/>}
            {totalUnits>0&&<span style={{fontSize:10,color:C.muted}}>pcs</span>}
          </div>
          <div className="g3" style={{marginBottom:8}}>
            {[{l:"kcal",v:calcVals.kcal,c:C.accent},{l:"carbs g",v:calcVals.carbs,c:C.warn},{l:"prot g",v:calcVals.protein,c:C.blue}].map(({l,v,c})=>(
              <div key={l} className="preview-box"><div className="preview-val" style={{color:c}}>{v}</div><div className="preview-lbl">{l}</div></div>
            ))}
          </div>
          {qtyUnit!=='יח׳'&&qtyUnit!=='מנות'&&!mealWeight&&(
            <div style={{fontSize:10,color:C.warn,marginBottom:6,textAlign:"center"}}>⚠ {isHe?`הזן משקל הצילום בגר׳ למעלה כדי לחשב לפי ${qtyUnit}`:`Enter photo weight in g above to calculate by ${qtyUnit}`}</div>
          )}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,background:"rgba(255,255,255,0.7)",borderRadius:8,padding:"5px 10px"}}>
            <span style={{fontSize:11,color:C.muted,flex:1}}>{isHe?"חלק עם:":"Share with:"}</span>
            <button onClick={()=>setServings(v=>Math.max(1,v-1))} style={{width:24,height:24,border:`1px solid ${C.border}`,borderRadius:6,background:"#f5f5f7",cursor:"pointer",fontSize:13}}>−</button>
            <span style={{fontWeight:700,fontSize:13,color:C.accent,minWidth:16,textAlign:"center"}}>{servings}</span>
            <button onClick={()=>setServings(v=>v+1)} style={{width:24,height:24,border:`1px solid ${C.border}`,borderRadius:6,background:"#f5f5f7",cursor:"pointer",fontSize:13}}>+</button>
            <span style={{fontSize:11,color:C.muted}}>{isHe?(servings===1?"אנשים (כל הארוחה לי)":"אנשים"):(servings===1?"people (whole meal)":"people")}</span>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:8,alignItems:"center"}}>
            <input type="number" value={localAmt} onChange={e=>setLocalAmt(e.target.value)}
              className="inp" style={{flex:1,textAlign:"center",padding:"7px 6px",fontSize:13}}/>
            <select value={qtyUnit} onChange={e=>setQtyUnit(e.target.value)} className="inp" style={{flex:1,padding:"7px 6px",fontSize:12,cursor:"pointer"}}>
              <option value="יח׳">{isHe?"יח׳":"pcs"}</option>
              <option value="קוביות">{isHe?"קוביות":"cubes"}</option>
              <option value="מנות">{isHe?"מנות":"servings"}</option>
              <option value="g">{isHe?"גר׳":"g"}</option>
              <option value="ml">{isHe?"מ״ל":"ml"}</option>
              <option value="כף">{isHe?"כף (15מ״ל)":"tbsp (15ml)"}</option>
              <option value="כפית">{isHe?"כפית (5מ״ל)":"tsp (5ml)"}</option>
              <option value="כוס">{isHe?"כוס (240מ״ל)":"cup (240ml)"}</option>
            </select>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={addToDay} style={{flex:2,background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ {isHe?"הוסף ליום":"Add to day"}</button>
            <button onClick={openDbSave} style={{flex:1,background:savedToDb?"rgba(13,148,136,.1)":"transparent",border:`1px solid ${savedToDb?C.accent:C.border}`,borderRadius:8,padding:"10px",fontSize:13,fontWeight:600,color:savedToDb?C.accent:C.muted,cursor:"pointer",transition:"all .2s"}}>
              {savedToDb?"✓":"💾"}
            </button>
            <button onClick={saveToFavorites} style={{flex:1,background:savedToFav?"rgba(245,158,11,.12)":"transparent",border:`1px solid ${savedToFav?"#f59e0b":"rgba(245,158,11,.35)"}`,borderRadius:8,padding:"10px",fontSize:13,fontWeight:600,color:savedToFav?"#f59e0b":C.muted,cursor:"pointer",transition:"all .2s"}}>
              {savedToFav?"✓":"⭐"}
            </button>
          </div>
          {showDbInput&&(
            <div className="fade" style={{marginTop:8,display:"flex",gap:6}}>
              <input value={dbName} onChange={e=>setDbName(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&saveToDb()}
                className="inp" style={{flex:1,fontSize:12}} autoFocus
                placeholder={isHe?"שם לשמירה במאגר":"Name to save"}/>
              <button onClick={saveToDb} style={{background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"0 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>{isHe?"שמור":"Save"}</button>
              <button onClick={()=>setShowDbInput(false)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,padding:"0 10px",cursor:"pointer",fontSize:12}}>✕</button>
            </div>
          )}
        </div>
      )}
      <button onClick={onClose} className="btn-muted" style={{marginTop:4}}>{isHe?"ביטול":"Cancel"}</button>
      {pendingFav&&<SaveFavNameSheet defaultName={pendingFav.label} onConfirm={name=>{const pid=window._activePid||"default";const f={...pendingFav,label:name};const ex=loadQuickFoods(pid)||[];saveQuickFoods([...ex.filter(x=>x.label!==name),f],pid);setPendingFav(null);setSavedToFav(true);setTimeout(()=>setSavedToFav(false),2000);}} onClose={()=>setPendingFav(null)}/>}
    </div>
  );
}

// ── MealPanel ──────────────────────────────────────────────────────────────────
function MealPanel({onAdd,onClose,lang}){
  const isHe=(lang||localStorage.getItem('nutrition_lang')||'he')!=='en';
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
  const [savedToFav,setSavedToFav]=useState(false);
  const [pendingFav,setPendingFav]=useState(null);
  const [showJsonInput,setShowJsonInput]=useState(false);
  const [jsonText,setJsonText]=useState("");
  const [jsonError,setJsonError]=useState("");

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
      defaultAmt:1,unit:"מנה",serving_size:1,sourceText:text.trim()||name};
    const pid=window._activePid||"default";
    const db=loadCustomDB(pid);
    saveCustomDB([...db.filter(f=>f.label!==entry.label),entry],pid);
    setShowDbInput(false);
    setSavedToDb(true);
    setTimeout(()=>setSavedToDb(false),2000);
  };

  const saveToFavorites=()=>{
    if(!preview)return;
    const s=Math.max(1,servings);
    const food={id:`qf_meal_${Date.now()}`,label:`🍽 ${preview.label||text.slice(0,30)}`,
      kcal:Math.round(preview.kcal/s),carbs:parseFloat(((preview.carbs||0)/s).toFixed(1)),
      protein:parseFloat(((preview.protein||0)/s).toFixed(1)),fat:parseFloat(((preview.fat||0)/s).toFixed(1))};
    setPendingFav(food);
  };

  return (
    <div className="panel fade">
      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>🍽 {isHe?"ניתוח ארוחה מורכבת":"Complex Meal Analysis"}</div>
      <textarea value={text} onChange={e=>setText(e.target.value)} rows={4}
        placeholder={isHe?"תארי את הארוחה בחופשיות, למשל:\nסלט עם 100g קינואה, גבינת פטה, עגבניות, מלפפון, 15ml שמן זית":"Describe the meal freely, e.g.:\nSalad with 100g quinoa, feta cheese, tomatoes, cucumber, 15ml olive oil"}
        className="inp" style={{marginBottom:10,resize:"none",lineHeight:1.6,fontSize:13}}/>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,background:"#f5f5f7",borderRadius:8,padding:"8px 12px"}}>
        <span style={{fontSize:12,color:C.muted,flex:1}}>{isHe?"מספר מנות / אנשים:":"Servings / people:"}</span>
        <button onClick={()=>setServings(v=>Math.max(1,v-1))} style={{width:28,height:28,border:`1px solid ${C.border}`,borderRadius:6,background:"#fff",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
        <span style={{fontWeight:900,fontSize:16,color:C.accent,minWidth:20,textAlign:"center"}}>{servings}</span>
        <button onClick={()=>setServings(v=>v+1)} style={{width:28,height:28,border:`1px solid ${C.border}`,borderRadius:6,background:"#fff",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
      </div>
      {!preview&&(
        <>
          {loading&&<div style={{textAlign:'center',marginBottom:8}}><CalcLoader size={64}/></div>}
          <button onClick={ask} disabled={!text.trim()||loading}
            style={{width:"100%",background:text.trim()?"linear-gradient(135deg,#5a9e1e,#7bc42e)":"#ddd",border:"none",borderRadius:8,color:text.trim()?"#fff":"#aaa",padding:"10px",fontSize:13,fontWeight:700,cursor:text.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginBottom:8}}>
            {loading?(isHe?"מנתח ארוחה...":"Analyzing meal..."):(isHe?"✨ שאל את Claude":"✨ Ask Claude")}
          </button>
          <button onClick={()=>{setShowJsonInput(v=>!v);setJsonError("");}}
            style={{background:"none",border:"none",color:C.muted,fontSize:11,cursor:"pointer",padding:0,fontFamily:"inherit",textDecoration:"underline",marginBottom:showJsonInput?4:0}}>
            {isHe?"📋 הדבק JSON מקלוד":"📋 Paste Claude JSON"}
          </button>
          {showJsonInput&&<>
            <textarea value={jsonText} onChange={e=>setJsonText(e.target.value)}
              placeholder='{"label":"...","kcal":0,"carbs":0,"protein":0,"fat":0}'
              rows={3} className="inp" style={{resize:"none",marginTop:4,marginBottom:4,fontSize:11,fontFamily:"monospace"}}/>
            {jsonError&&<div style={{color:C.danger,fontSize:11,marginBottom:4}}>{jsonError}</div>}
            <button onClick={()=>{
              setJsonError("");
              try{
                const d=JSON.parse(jsonText.trim());
                if(!d.kcal)throw new Error(isHe?"חסר שדה kcal":"missing kcal field");
                setPreview(d);setShowJsonInput(false);setJsonText("");
              }catch(e){setJsonError((isHe?"שגיאת JSON: ":"JSON error: ")+e.message);}
            }} className="btn-accent" style={{borderRadius:8,marginBottom:8}}>
              {isHe?"📥 טען":"📥 Load"}
            </button>
          </>}
        </>
      )}
      {error&&(
        <div style={{background:"#fff0f0",border:`1px solid ${C.danger}`,borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:8}}>
          <span style={{fontSize:11,color:C.danger}}>⚠ {error}</span>
          <button onClick={ask} style={{background:C.danger,border:"none",borderRadius:6,color:"#fff",padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>{isHe?"נסה שוב":"Retry"}</button>
        </div>
      )}
      {preview&&(
        <div className="green-box fade" style={{marginBottom:8}}>
          <div style={{fontSize:11,color:C.accent,fontWeight:700,marginBottom:2}}>✨ {preview.label}</div>
          <div style={{fontSize:10,color:C.muted,marginBottom:8}}>{servings>1?(isHe?`סה״כ ÷ ${servings} מנות = ערכים למנה אחת`:`Total ÷ ${servings} servings = per serving`):(isHe?"ערכים לכל הארוחה":"Values for whole meal")}</div>
          <div className="g3" style={{marginBottom:10}}>
            {[{l:"kcal",v:Math.round(preview.kcal/servings),c:C.accent},{l:"carbs g",v:parseFloat(((preview.carbs||0)/servings).toFixed(1)),c:C.warn},{l:"prot g",v:parseFloat(((preview.protein||0)/servings).toFixed(1)),c:C.blue}].map(({l,v,c})=>(
              <div key={l} className="preview-box"><div className="preview-val" style={{color:c}}>{v}</div><div className="preview-lbl">{l}</div></div>
            ))}
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={addToDay} style={{flex:2,background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ {isHe?"הוסף ליום":"Add to day"}</button>
            <button onClick={openDbSave} style={{flex:1,background:savedToDb?"rgba(13,148,136,.1)":"transparent",border:`1px solid ${savedToDb?C.accent:C.border}`,borderRadius:8,padding:"10px",fontSize:12,fontWeight:600,color:savedToDb?C.accent:C.muted,cursor:"pointer"}}>
              {savedToDb?"✓":"💾"}
            </button>
            <button onClick={saveToFavorites} style={{flex:1,background:savedToFav?"rgba(245,158,11,.12)":"transparent",border:`1px solid ${savedToFav?"#f59e0b":"rgba(245,158,11,.35)"}`,borderRadius:8,padding:"10px",fontSize:12,fontWeight:600,color:savedToFav?"#f59e0b":C.muted,cursor:"pointer",transition:"all .2s"}}>
              {savedToFav?"✓":"⭐"}
            </button>
          </div>
          {showDbInput&&(
            <div className="fade" style={{marginTop:8,display:"flex",gap:6}}>
              <input value={dbName} onChange={e=>setDbName(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&saveToDb()}
                className="inp" style={{flex:1,fontSize:12}} autoFocus placeholder={isHe?"שם לשמירה":"Name"}/>
              <button onClick={saveToDb} style={{background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"0 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>{isHe?"שמור":"Save"}</button>
              <button onClick={()=>setShowDbInput(false)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,padding:"0 10px",cursor:"pointer",fontSize:12}}>✕</button>
            </div>
          )}
        </div>
      )}
      <button onClick={onClose} className="btn-muted" style={{marginTop:4}}>{isHe?"ביטול":"Cancel"}</button>
      {pendingFav&&<SaveFavNameSheet defaultName={pendingFav.label} onConfirm={name=>{const pid=window._activePid||"default";const f={...pendingFav,label:name};const ex=loadQuickFoods(pid)||[];saveQuickFoods([...ex.filter(x=>x.label!==name),f],pid);setPendingFav(null);setSavedToFav(true);setTimeout(()=>setSavedToFav(false),2000);}} onClose={()=>setPendingFav(null)}/>}
    </div>
  );
}

// ── SmartAddPanel ──────────────────────────────────────────────────────────────
function SmartAddPanel({onAdd,onClose,lang}){
  const isHe=(lang||localStorage.getItem('nutrition_lang')||'he')!=='en';
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
  const [savedToFav,setSavedToFav]=useState(false);
  const [pendingFav,setPendingFav]=useState(null);
  const [showJsonInput,setShowJsonInput]=useState(false);
  const [jsonText,setJsonText]=useState("");
  const [jsonError,setJsonError]=useState("");

  const handleSaveToFav=()=>{
    if(!kcal)return;
    const label=matched?matched.label:query||"מאכל";
    const food={id:`qf_smart_${Date.now()}`,label,kcal:parseFloat(kcal)||0,carbs:parseFloat(carbs)||0,protein:parseFloat(protein)||0,fat:parseFloat(fat)||0};
    setPendingFav(food);
  };

  const handleSaveToDb=()=>{
    if(!kcal)return;
    const pid=window._activePid||"default";
    const name=(matched?matched.label:query)||"מאכל";
    const entry=matched
      ?{names:[...new Set([...(matched.names||[]),query.toLowerCase()])].filter(Boolean),label:matched.label,kcal:matched.kcal,carbs:matched.carbs,protein:matched.protein,fat:matched.fat||0,defaultAmt:matched.defaultAmt||100,unit:matched.unit||"g"}
      :{names:[query.toLowerCase()].filter(Boolean),label:query||"מאכל",kcal:parseFloat(kcal)||0,carbs:parseFloat(carbs)||0,protein:parseFloat(protein)||0,fat:parseFloat(fat)||0,defaultAmt:parseFloat(amount)||100,unit:unit||"g",sourceText:query||""};
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
      <FoodAutocomplete
        value={query}
        onChange={v=>{setQuery(v);setMatched(null);setCandidates([]);setNotFound(false);setKcal("");setCarbs("");setProtein("");}}
        onSelect={name=>runSearch(name,amount,unit)}
        onSelectFood={food=>applyFood(food, food.defaultAmt||amount||"", food.unit||unit)}
        placeholder={isHe?"שם המאכל...":"Food name..."}
        recentFoods={recent}
        onSelectRecent={f=>{onAdd({uid:Date.now()+Math.random(),...f});onClose();}}
      />
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <input type="number" value={amount} placeholder={isHe?"כמות":"Amount"} onChange={e=>{setAmount(e.target.value);recalc(e.target.value,unit);}} className="inp" style={{flex:1,textAlign:"center",padding:"9px 6px"}}/>
        <select value={unit} onChange={e=>{setUnit(e.target.value);recalc(amount,e.target.value);}} className="inp" style={{flex:1,padding:"9px 6px",cursor:"pointer"}}>
          <option value="g">{isHe?"גר׳":"g"}</option><option value="ml">{isHe?"מ״ל":"ml"}</option><option value="יח׳">{isHe?"יח׳":"pcs"}</option><option value="מנה">{isHe?"מנה":"serving"}</option><option value="קוביות">{isHe?"קוביות":"cubes"}</option><option value="כף">{isHe?"כף (15מ״ל)":"tbsp (15ml)"}</option><option value="כפית">{isHe?"כפית (5מ״ל)":"tsp (5ml)"}</option><option value="כוס">{isHe?"כוס (240מ״ל)":"cup (240ml)"}</option>
        </select>
      </div>
      <button className="btn-accent" onClick={()=>runSearch(query,amount,unit)} style={{marginBottom:8}}>✦ {isHe?"חשב ערכים":"Calculate"}</button>
      <button onClick={()=>{setShowJsonInput(v=>!v);setJsonError("");}}
        style={{background:"none",border:"none",color:C.muted,fontSize:11,cursor:"pointer",padding:0,fontFamily:"inherit",textDecoration:"underline",marginBottom:showJsonInput?4:10}}>
        {isHe?"📋 הדבק JSON מקלוד":"📋 Paste Claude JSON"}
      </button>
      {showJsonInput&&<div style={{marginBottom:10}}>
        <textarea value={jsonText} onChange={e=>setJsonText(e.target.value)}
          placeholder='{"label":"...","kcal":0,"carbs":0,"protein":0,"fat":0}'
          rows={3} className="inp" style={{resize:"none",marginBottom:4,fontSize:11,fontFamily:"monospace"}}/>
        {jsonError&&<div style={{color:C.danger,fontSize:11,marginBottom:4}}>{jsonError}</div>}
        <button onClick={()=>{
          setJsonError("");
          try{
            const d=JSON.parse(jsonText.trim());
            if(!d.kcal)throw new Error(isHe?"חסר שדה kcal":"missing kcal field");
            const amt=parseFloat(amount)||d.defaultAmt||100;
            const divisor=d.cubes_per_bar?d.cubes_per_bar:d.serving_size?d.serving_size:100;
            const isDbFmt=!!(d.names||d.defaultAmt||d.unit);
            const r=isDbFmt?amt/divisor:1;
            setKcal(String(Math.round(d.kcal*r)));
            setCarbs(String(parseFloat(((d.carbs||0)*r).toFixed(1))));
            setProtein(String(parseFloat(((d.protein||0)*r).toFixed(1))));
            setFat(String(parseFloat(((d.fat||0)*r).toFixed(1))));
            if(d.label||d.name)setQuery(d.label||d.name);
            if(isDbFmt)setMatched({...d,names:(d.names||[d.name||''].map(s=>s.toLowerCase())).filter(Boolean)});
            setNotFound(false);setCandidates([]);
            setShowJsonInput(false);setJsonText("");
          }catch(e){setJsonError((isHe?"שגיאת JSON: ":"JSON error: ")+e.message);}
        }} className="btn-accent" style={{borderRadius:8}}>
          {isHe?"📥 טען":"📥 Load"}
        </button>
      </div>}

      {candidates.length>0&&(
        <div className="fade" style={{marginBottom:10,background:"#fff8e1",border:`1px solid ${C.warn}`,borderRadius:10,padding:10}}>
          <div style={{fontSize:11,color:C.warn,fontWeight:700,marginBottom:8}}>{isHe?"בחרי את הפריט המתאים:":"Select the matching item:"}</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {candidates.map((f,i)=>(
              <button key={i} onClick={()=>applyFood(f,amount,unit)}
                style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",textAlign:"right",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"inherit"}}>
                <span style={{fontSize:13,color:C.text}}>{f.label}</span>
                <span style={{fontSize:10,color:C.muted}}>{f.kcal} kcal / 100{f.unit}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {notFound&&(
        <div className="warn-box" style={{marginBottom:10}}>
          <div style={{fontSize:12,color:C.warn,fontWeight:600,marginBottom:6}}>{isHe?"לא נמצא במאגר":"Not found in database"}</div>
          <AskClaude
            foodName={query} amount={amount} unit={unit}
            onAddToDay={food=>{onAdd(food);onClose();}}
            onSaved={()=>runSearch(query,amount,unit)}
          />
        </div>
      )}
      {matched&&<div style={{fontSize:12,color:C.accent,background:"#f0fae8",borderRadius:8,padding:"8px 12px",marginBottom:10}}>✦ {matched.label} — {isHe?`ערכים ל-${amount}${unit}`:`values for ${amount}${unit}`}</div>}
      <div className="g3" style={{marginBottom:12}}>
        {numField(kcal,setKcal,"kcal",C.accent)}
        {numField(carbs,setCarbs,"carbs g",C.warn)}
        {numField(protein,setProtein,"prot g",C.blue)}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:6}}>
        <button className="btn-muted" onClick={onClose} style={{flex:1}}>{isHe?"ביטול":"Cancel"}</button>
        <button onClick={handleAdd} disabled={!kcal} style={{flex:2,background:kcal?C.accent:"#ddd",border:"none",borderRadius:8,color:kcal?"#fff":"#aaa",padding:"10px",fontSize:13,fontWeight:700,cursor:kcal?"pointer":"default"}}>+ {isHe?"הוסף פריט":"Add item"}</button>
      </div>
      <div style={{display:"flex",gap:6}}>
        <button onClick={handleSaveToDb} disabled={!kcal} style={{flex:1,background:savedToDb?"rgba(13,148,136,.1)":"transparent",border:`1px solid ${savedToDb?C.accent:kcal?C.border:"#e0e0e5"}`,borderRadius:8,padding:"8px",fontSize:12,fontWeight:600,color:savedToDb?C.accent:kcal?C.muted:"#ccc",cursor:kcal?"pointer":"default"}}>
          {savedToDb?(isHe?"✓ נשמר":"✓ Saved"):(isHe?"💾 מאגר":"💾 DB")}
        </button>
        <button onClick={handleSaveToFav} disabled={!kcal} style={{flex:1,background:savedToFav?"rgba(245,158,11,.1)":"transparent",border:`1px solid ${savedToFav?"#f59e0b":kcal?C.border:"#e0e0e5"}`,borderRadius:8,padding:"8px",fontSize:12,fontWeight:600,color:savedToFav?"#f59e0b":kcal?C.muted:"#ccc",cursor:kcal?"pointer":"default"}}>
          {savedToFav?(isHe?"✓ נשמר":"✓ Saved"):(isHe?"⭐ קבועים":"⭐ Favorites")}
        </button>
      </div>
      {pendingFav&&<SaveFavNameSheet defaultName={pendingFav.label} onConfirm={name=>{const pid=window._activePid||"default";const f={...pendingFav,label:name};const ex=loadQuickFoods(pid)||[];saveQuickFoods([...ex.filter(x=>x.label!==name),f],pid);setPendingFav(null);setSavedToFav(true);setTimeout(()=>setSavedToFav(false),2000);}} onClose={()=>setPendingFav(null)}/>}
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
    const u=food.unit||'g';
    setAmount(String(a));setUnit(u);
    const n=calcNutrition(food,a,u);
    setKcal(String(n.kcal));setCarbs(String(n.carbs));setProtein(String(n.protein));setFat(String(n.fat));
  };

  const recalc=(amt,u)=>{
    if(!matched)return;
    const a=parseFloat(amt);if(!a)return;
    const n=calcNutrition(matched,a,u||unit||matched.unit);
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
function MetricWeekChart({journal,metric,color,label,lang,range,setRange,goal,goalDir}){
  const H=54,W=280,PAD=14,TOP=20;
  const isHe=(lang||localStorage.getItem('nutrition_lang')||'he')!=='en';
  const goalColor=v=>{
    if(!goal||!v) return color;
    if(goalDir==='min') return v>=goal?'#15803d':v>=goal*0.75?'#f59e0b':'#dc2626';
    return v<=goal?'#15803d':v<=goal*1.2?'#f59e0b':'#dc2626';
  };
  const DAY_LABELS=isHe?['א','ב','ג','ד','ה','ו','ש']:['Su','Mo','Tu','We','Th','Fr','Sa'];
  const xs=Array.from({length:range},(_,i)=>Math.round(PAD+i*(W-2*PAD)/Math.max(range-1,1)));
  const ref=useRef(null);
  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth",block:"nearest"});},[]);

  const now=new Date();
  const fmtKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const days=[];
  for(let i=range-1;i>=0;i--){
    const d=new Date(now);d.setDate(d.getDate()-i);
    const k=fmtKey(d);
    const tot=journal[k]?.totals;
    const v=(tot&&journal[k]?.entries?.length)?Number(tot[metric]||0):null;
    days.push({k,v,dow:d.getDay(),date:new Date(d)});
  }
  const vals=days.filter(d=>d.v!==null&&d.v>0).map(d=>d.v);
  if(!vals.length) return(
    <div ref={ref} style={{background:"rgba(255,255,255,.68)",border:`1px solid ${color}33`,borderRadius:16,padding:"12px 14px",marginBottom:12,maxWidth:440}}>
      <div style={{fontSize:9,color,letterSpacing:1.4,textTransform:"uppercase",marginBottom:6,fontWeight:700}}>{label}</div>
      <div style={{fontSize:12,color:C.muted,textAlign:"center",padding:"10px 0"}}>{isHe?"אין נתונים שמורים":"No saved data"}</div>
    </div>
  );

  const minV=Math.min(...vals),maxV=Math.max(...vals);
  const vpad=Math.max(maxV-minV,10)*0.2;
  const lo=Math.max(0,minV-vpad),hi=maxV+vpad,vrange=hi-lo;
  const toY=v=>Math.max(TOP+2,Math.min(TOP+H-2,TOP+H-(v-lo)/vrange*H));

  const pts=days.map((d,i)=>d.v!=null&&d.v>0?{x:xs[i],y:toY(d.v),v:d.v}:null);
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

  const svgLabels=[];
  if(range===7){
    days.forEach((d,i)=>svgLabels.push({x:xs[i],txt:DAY_LABELS[d.dow]}));
  } else if(range===30){
    days.forEach((d,i)=>{if(i%7===0)svgLabels.push({x:xs[i],txt:`${d.date.getDate()}/${d.date.getMonth()+1}`});});
  } else {
    const mNames=isHe?['ינו','פבר','מרץ','אפר','מאי','יוני','יולי','אוג','ספט','אוק','נוב','דצמ']:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let lastM=-1;
    days.forEach((d,i)=>{const m=d.date.getMonth();if(m!==lastM){lastM=m;svgLabels.push({x:xs[i],txt:mNames[m]});}});
  }
  const svgH=TOP+H+(range===7?14:16);
  const rangeLabel=range===7?(isHe?"7 ימים":"7 days"):range===30?(isHe?"חודש":"Month"):(isHe?"3 חודשים":"3 Months");

  return(
    <div ref={ref} style={{background:"rgba(255,255,255,.68)",backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",border:`1px solid ${color}33`,borderRadius:16,padding:"10px 12px 8px",marginBottom:12,boxShadow:"0 3px 14px rgba(80,130,180,.08)",maxWidth:440}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
        <div style={{fontSize:9.5,color,letterSpacing:1.4,textTransform:"uppercase",fontWeight:700}}>{label}</div>
        <div style={{display:"flex",gap:3}}>
          {[[7,isHe?"שבוע":"Week"],[30,isHe?"חודש":"Month"],[90,isHe?"3ח":"3M"]].map(([r,l])=>(
            <button key={r} onClick={()=>setRange(r)} style={{background:range===r?"rgba(148,163,184,.25)":"transparent",border:`1px solid ${range===r?"rgba(148,163,184,.5)":"rgba(148,163,184,.2)"}`,color:range===r?"#475569":"#94a3b8",borderRadius:5,padding:"2px 5px",fontSize:8,cursor:"pointer",fontFamily:"inherit",fontWeight:range===r?700:400}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{overflow:"hidden",borderRadius:8}}>
        <svg width="100%" viewBox={`0 0 ${W} ${svgH}`} style={{display:"block"}}>
          {goal&&known.length>=2&&<defs>
            <linearGradient id={`mg-${metric}`} x1={PAD} y1="0" x2={W-PAD} y2="0" gradientUnits="userSpaceOnUse">
              {known.map((p,i)=><stop key={i} offset={`${((p.x-PAD)/(W-2*PAD)*100).toFixed(1)}%`} stopColor={goalColor(p.v)}/>)}
            </linearGradient>
            <linearGradient id={`mg-${metric}-a`} x1={PAD} y1="0" x2={W-PAD} y2="0" gradientUnits="userSpaceOnUse">
              {known.map((p,i)=><stop key={i} offset={`${((p.x-PAD)/(W-2*PAD)*100).toFixed(1)}%`} stopColor={goalColor(p.v)} stopOpacity="0.13"/>)}
            </linearGradient>
          </defs>}
          {[minV,(minV+maxV)/2,maxV].map((v,i)=>{
            const ry=toY(v);
            const rl=metric==='kcal'?Math.round(v):v.toFixed(1);
            return(<g key={i}>
              <line x1={PAD} y1={ry} x2={W-PAD-18} y2={ry} stroke={color} strokeWidth="0.6" strokeDasharray="3,3" opacity="0.22"/>
              <text x={W-1} y={ry+(i===2?-2:3)} textAnchor="end" fontSize="6" fill={color} opacity="0.65" fontWeight="700">{rl}</text>
            </g>);
          })}
          {goal&&lo<=goal&&goal<=hi&&(()=>{const gy=toY(goal);return(<><line x1={PAD} y1={gy} x2={W-PAD} y2={gy} stroke="#0d9488" strokeWidth="0.8" strokeDasharray="4,3" opacity="0.45"/><text x={W-2} y={gy-1.5} fontSize="5.5" fill="#0d9488" opacity="0.7" textAnchor="end" fontFamily="Heebo,sans-serif">{goal}</text></>);})()}
          {lp&&<>
            <path d={`${lp} L ${known[known.length-1].x},${TOP+H} L ${known[0].x},${TOP+H} Z`}
                  fill={goal?`url(#mg-${metric}-a)`:color} fillOpacity={goal?1:0.07}/>
            <path d={lp} fill="none" stroke={goal?`url(#mg-${metric})`:color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </>}
          {(()=>{
            const step=range===7?1:range===30?5:13;
            return known.map((p,i)=>{
              const showLabel=i%step===0||i===known.length-1;
              const dc=goalColor(p.v);
              return(
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={showLabel?3.5:1.8} fill="white" stroke={dc} strokeWidth={showLabel?2:1.2}/>
                  {showLabel&&<text x={p.x} y={p.y-7} textAnchor="middle" fontSize={range===7?"7.5":"7"} fill={dc} fontWeight="700">
                    {metric==='kcal'?Math.round(p.v):Number(p.v).toFixed(1)}
                  </text>}
                </g>
              );
            });
          })()}
          {svgLabels.map((lbl,i)=>(
            <text key={i} x={lbl.x} y={svgH-2} textAnchor="middle" fontSize="8" fill="#94a3b8">{lbl.txt}</text>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ── SugarWeekChart ─────────────────────────────────────────────────────────────
function SugarWeekChart({journal,lang}){
  const isHe=(lang||localStorage.getItem('nutrition_lang')||'he')!=='en'?true:false;
  const [range,setRange]=useState(7);
  const H=54, W=280, PAD=14, SUGAR_RANGE=80, MIN_V=60;
  const toY=v=>Math.max(2,Math.min(H-2, H-(Number(v)-MIN_V)/SUGAR_RANGE*H));
  const y100=H-(100-MIN_V)/SUGAR_RANGE*H;
  const y86 =H-(86 -MIN_V)/SUGAR_RANGE*H;
  const HE=['א','ב','ג','ד','ה','ו','ש'];
  const EN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const now=new Date();
  const todayKey=getTodayKey();
  const fmtKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  const days=[];
  for(let i=range-1;i>=0;i--){
    const d=new Date(now); d.setDate(d.getDate()-i);
    const k=fmtKey(d);
    const v=journal[k]?.bloodSugar?Number(journal[k].bloodSugar):null;
    days.push({k,v,dow:d.getDay(),date:new Date(d)});
  }
  const xs=Array.from({length:range},(_,i)=>Math.round(PAD+i*(W-2*PAD)/Math.max(range-1,1)));

  // Average for a given window: include today if it has a value, else start from yesterday
  const todayVal=journal[todayKey]?.bloodSugar?Number(journal[todayKey].bloodSugar):null;
  const calcAvg=nDays=>{
    const startOff=todayVal!=null?0:1;
    const vals=[];
    for(let i=startOff;i<startOff+nDays;i++){
      const d=new Date(now); d.setDate(d.getDate()-i);
      const v=journal[fmtKey(d)]?.bloodSugar?Number(journal[fmtKey(d)].bloodSugar):null;
      if(v!=null) vals.push(v);
    }
    return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):null;
  };
  const avg7=calcAvg(7);
  const avgRange=calcAvg(range);
  const avgY=avgRange!=null?toY(avgRange):null;

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

  // X-axis labels for longer ranges (inside SVG)
  const svgLabels=[];
  if(range===30){
    days.forEach((d,i)=>{if(i%7===0)svgLabels.push({x:xs[i],txt:`${d.date.getDate()}/${d.date.getMonth()+1}`});});
  } else if(range===90){
    const mNames=['ינו','פבר','מרץ','אפר','מאי','יוני','יולי','אוג','ספט','אוק','נוב','דצמ'];
    let lastM=-1;
    days.forEach((d,i)=>{const m=d.date.getMonth();if(m!==lastM){lastM=m;svgLabels.push({x:xs[i],txt:mNames[m]});}});
  }
  const svgH=range===7?H:H+12;

  return(
    <div style={{background:"rgba(255,255,255,.68)",backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",border:"1px solid rgba(255,255,255,.88)",borderRadius:18,padding:"12px 14px 10px",marginBottom:16,boxShadow:"0 4px 20px rgba(80,130,180,.1)",maxWidth:440}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{fontSize:9.5,color:"#94a3b8",letterSpacing:1.4,textTransform:"uppercase"}}>🩸 {isHe?"סוכר":"Sugar"}</div>
          {avg7!=null&&<span style={{fontSize:8.5,color:sugarColor(avg7),background:sugarColor(avg7)+'18',borderRadius:8,padding:"1px 6px",fontWeight:700}}>{isHe?"ממוצע שבוע":"Week avg"}: {avg7}</span>}
        </div>
        <div style={{display:"flex",gap:3}}>
          {[[7,isHe?"שבוע":"Week"],[30,isHe?"חודש":"Month"],[90,isHe?"3ח":"3M"]].map(([r,l])=>(
            <button key={r} onClick={()=>setRange(r)} style={{background:range===r?"rgba(148,163,184,.25)":"transparent",border:`1px solid ${range===r?"rgba(148,163,184,.5)":"rgba(148,163,184,.2)"}`,color:range===r?"#475569":"#94a3b8",borderRadius:5,padding:"2px 5px",fontSize:8,cursor:"pointer",fontFamily:"inherit",fontWeight:range===r?700:400}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
        <div style={{display:"flex",gap:8}}>
          {[["≤85","#0d9488"],["86–99","#f59e0b"],["≥100","#dc2626"]].map(([l,c])=>(
            <span key={l} style={{fontSize:7.5,color:c,display:"inline-flex",alignItems:"center",gap:2}}>
              <span style={{width:6,height:2,borderRadius:1,background:"currentColor",display:"inline-block"}}></span>{l}
            </span>
          ))}
        </div>
        {avgRange!=null&&<span style={{fontSize:8,color:"#6366f1",fontWeight:700,background:"#6366f115",borderRadius:6,padding:"1px 7px"}}>⌀ {isHe?"ממוצע":"avg"} {range}{isHe?"י":"d"}: {avgRange}</span>}
      </div>

      <div style={{overflow:"hidden",borderRadius:8}}>
        <svg width="100%" viewBox={`0 0 ${W} ${svgH}`} style={{display:"block"}}>
          <defs>
            <linearGradient id="sg-line" x1="0" y1="0" x2="0" y2={H} gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#dc2626"/>
              <stop offset={`${(y100/H*100-8).toFixed(0)}%`} stopColor="#dc2626"/>
              <stop offset={`${(y100/H*100+8).toFixed(0)}%`} stopColor="#f59e0b"/>
              <stop offset={`${(y86/H*100+8).toFixed(0)}%`}  stopColor="#15803d"/>
              <stop offset="100%" stopColor="#15803d"/>
            </linearGradient>
            <linearGradient id="sg-area" x1={PAD} y1="0" x2={W-PAD} y2="0" gradientUnits="userSpaceOnUse">
              {known.map((p,i)=>{const di=xs.indexOf(p.x);const v=di>=0?days[di]?.v||0:0;return <stop key={i} offset={`${((p.x-PAD)/(W-2*PAD)*100).toFixed(1)}%`} stopColor={sugarColor(v)} stopOpacity="0.13"/>;})}
            </linearGradient>
          </defs>
          <line x1={PAD} y1={y100} x2={W-PAD} y2={y100} stroke="rgba(220,38,38,.15)" strokeWidth="0.7" strokeDasharray="3,3"/>
          <line x1={PAD} y1={y86}  x2={W-PAD} y2={y86}  stroke="rgba(245,158,11,.15)" strokeWidth="0.7" strokeDasharray="3,3"/>
          <text x={W-2} y={y100-1} fontSize="5.5" fill="rgba(220,38,38,.45)" textAnchor="end" fontFamily="Heebo,sans-serif">100</text>
          <text x={W-2} y={y86-1}  fontSize="5.5" fill="rgba(245,158,11,.5)"  textAnchor="end" fontFamily="Heebo,sans-serif">86</text>
          {avgY!=null&&<line x1={PAD} y1={avgY} x2={W-PAD} y2={avgY} stroke="#6366f1" strokeWidth="1.2" strokeDasharray="4,3" opacity="0.6"/>}
          {linePath&&known.length>=2&&<path d={`${linePath} L ${known[known.length-1].x},${H} L ${known[0].x},${H} Z`} fill="url(#sg-area)"/>}
          {linePath&&<path d={linePath} fill="none" stroke="url(#sg-line)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>}
          {range===7&&days.map((d,i)=>{
            if(!d.v) return <circle key={i} cx={xs[i]} cy={H*0.58} r="2" fill="none" stroke="rgba(148,163,184,.25)" strokeWidth="1"/>;
            const y=toY(d.v),col=sugarColor(d.v);
            return <g key={i}>
              <circle cx={xs[i]} cy={y} r="5.5" fill="rgba(255,255,255,.9)" stroke={col} strokeWidth="1.5"/>
              <circle cx={xs[i]} cy={y} r="2.2" fill={col}/>
            </g>;
          })}
          {range>7&&svgLabels.map((lbl,i)=>(
            <text key={i} x={lbl.x} y={svgH-1} textAnchor="middle" fontSize="7" fill="#94a3b8" fontFamily="Heebo,sans-serif">{lbl.txt}</text>
          ))}
        </svg>
      </div>

      {range===7&&(
        <div style={{display:"flex",direction:"ltr",marginTop:5}}>
          {days.map((d,i)=>(
            <div key={i} style={{flex:1,textAlign:"center"}}>
              <div style={{fontSize:7.5,color:"#94a3b8"}}>{isHe?HE[d.dow]:EN[d.dow]}</div>
              {d.v?<div style={{fontSize:8.5,fontWeight:700,color:sugarColor(d.v)}}>{d.v}</div>
                  :<div style={{fontSize:8.5,color:"rgba(148,163,184,.4)"}}>—</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── JournalView ────────────────────────────────────────────────────────────────
function JournalView({onClose,onLoadDay,pid,lang,profile}){
  const T=LANG[lang]||LANG.he;
  const [journal,setJournal]=useState(()=>loadJournal(pid||'default'));
  const [selected,setSelected]=useState(null);
  const [detailMode,setDetailMode]=useState("full");
  const [view,setView]=useState("list");
  const [activeChart,setActiveChart]=useState("kcal");
  const [metricRanges,setMetricRanges]=useState({kcal:7,carbs:7,protein:7});
  const isHe=(lang||'he')!=='en';
  const todayKey=getTodayKey();
  const days=Object.keys(journal).sort((a,b)=>b.localeCompare(a));
  const weekDays=days.filter(k=>k!==todayKey).slice(0,7);
  const wt=weekDays.reduce((acc,k)=>{const d=journal[k];return{kcal:acc.kcal+d.totals.kcal,carbs:acc.carbs+d.totals.carbs,protein:acc.protein+d.totals.protein,n:acc.n+1};},{kcal:0,carbs:0,protein:0,n:0});
  const now=new Date();
  const fmtK=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const calcAvgMetric=(metric,nDays)=>{let sum=0,cnt=0;for(let i=nDays-1;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i);const k=fmtK(d);if(journal[k]&&k!==todayKey){sum+=journal[k].totals[metric];cnt++;}}return cnt?sum/cnt:0;};
  const setMR=(m,r)=>setMetricRanges(prev=>({...prev,[m]:r}));
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
              <div style={{fontSize:11,color:C.muted,letterSpacing:1.5,marginBottom:10}}>{T.avgDaily}</div>
              <div className="g3" style={{marginBottom:12}}>
                {[{l:T.kcal,vFn:()=>Math.round(calcAvgMetric('kcal',metricRanges.kcal)),c:C.accent,m:"kcal"},{l:T.carbsFull,vFn:()=>calcAvgMetric('carbs',metricRanges.carbs).toFixed(1)+"g",c:C.warn,m:"carbs"},{l:T.protein,vFn:()=>calcAvgMetric('protein',metricRanges.protein).toFixed(1)+"g",c:C.blue,m:"protein"}].map(({l,vFn,c,m})=>{
                  const isActive=activeChart===m;
                  return(
                    <div key={l} onClick={()=>setActiveChart(isActive?null:m)}
                      style={{background:"rgba(255,255,255,.68)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",borderRadius:16,padding:"14px 10px",textAlign:"center",border:`${isActive?"2":"1"}px solid ${isActive?c:"rgba(255,255,255,.88)"}`,boxShadow:"0 3px 14px rgba(80,130,180,.08)",cursor:"pointer",transition:"border .15s"}}>
                      <div style={{fontSize:22,fontWeight:900,color:c}}>{vFn()}</div>
                      <div style={{fontSize:10,color:C.muted,marginTop:4}}>{l}</div>
                      <div style={{fontSize:8,color:isActive?c:"#cbd5e1",marginTop:3}}>{isActive?"▲":"▼"}</div>
                    </div>
                  );
                })}
              </div>
              {activeChart&&<MetricWeekChart key={activeChart} journal={journal} metric={activeChart} color={activeChart==="kcal"?C.accent:activeChart==="carbs"?C.warn:C.blue} label={activeChart==="kcal"?T.kcal:activeChart==="carbs"?T.carbsFull:T.protein} lang={lang} range={metricRanges[activeChart]} setRange={r=>setMR(activeChart,r)} goal={activeChart==="kcal"?profile?.maxKcal||1800:activeChart==="carbs"?profile?.maxCarbs||80:profile?.maxProtein||120} goalDir={activeChart==="protein"?"min":"max"}/>}
              <SugarWeekChart journal={journal} lang={lang}/>
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
function PantryModal({onClose,lang,syncTick}){
  const isHe=(lang||'he')!=='en';
  const [pantry,setPantry]=useState(loadPantry);
  const [inputs,setInputs]=useState(()=>Object.fromEntries(FRIDGE_CATS.map(c=>[c.key,{name:"",qty:"",unit:""}])));
  const [open,setOpen]=useState(()=>Object.fromEntries(FRIDGE_CATS.map(c=>[c.key,false])));
  const [imgLoading,setImgLoading]=useState({});
  const [scanLoading,setScanLoading]=useState(false);
  const [scanResults,setScanResults]=useState(null);
  const imgRefs=useRef({});
  const bulkInputRef=useRef(null);

  useEffect(()=>{if(syncTick>0)setPantry(loadPantry());},[syncTick]);

  const update=p=>{setPantry(p);savePantryLS(p);};

  const handleBulkScan=e=>{
    const file=e.target.files[0]; if(!file)return; e.target.value="";
    setScanLoading(true);
    const reader=new FileReader();
    reader.onload=async ev=>{
      const b64=ev.target.result.split(',')[1];
      try{
        const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({pantryBulkData:b64,pantryBulkMediaType:file.type||'image/jpeg'})});
        if(!res.ok)throw new Error();
        const d=await res.json();
        if(d.items?.length) setScanResults(d.items.map((item,i)=>({...item,_id:i,checked:true})));
      }catch{}
      setScanLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // Find existing pantry item by name across all categories
  const findExistingPantryItem=(name)=>{
    for(const c of FRIDGE_CATS){
      const arr=pantry[c.key]||[];
      const idx=arr.findIndex(e=>e.name.toLowerCase()===name.toLowerCase());
      if(idx>=0) return {cat:c.key,idx,item:arr[idx]};
    }
    return null;
  };

  const confirmScan=()=>{
    const newPantry={...pantry};
    const newOpen={...open};
    scanResults.filter(i=>i.checked).forEach(item=>{
      const suggestedCat=FRIDGE_CATS.find(c=>c.key===item.cat)?item.cat:'other';
      const itemUnit=item.unit||"";
      const found=findExistingPantryItem(item.name);
      if(found){
        const {cat:foundCat,idx:foundIdx,item:existing}=found;
        const existUnit=existing.unit||"";
        newOpen[foundCat]=true;
        if(existUnit===itemUnit){
          // Same unit — add quantities numerically
          const eq=parseFloat(existing.qty)||0;
          const nq=parseFloat(item.qty)||0;
          const merged=eq>0&&nq>0?String(eq+nq):(item.qty||existing.qty||"");
          newPantry[foundCat]=[...newPantry[foundCat]];
          newPantry[foundCat][foundIdx]={...existing,qty:merged};
        }else{
          // Different units — add as separate item in suggested category
          if(!newPantry[suggestedCat])newPantry[suggestedCat]=[];
          newPantry[suggestedCat]=[...newPantry[suggestedCat],{id:Date.now()+Math.random(),name:item.name,qty:item.qty||"",unit:itemUnit}];
          newOpen[suggestedCat]=true;
        }
      }else{
        if(!newPantry[suggestedCat])newPantry[suggestedCat]=[];
        newPantry[suggestedCat]=[...newPantry[suggestedCat],{id:Date.now()+Math.random(),name:item.name,qty:item.qty||"",unit:itemUnit}];
        newOpen[suggestedCat]=true;
      }
    });
    update(newPantry);
    setOpen(newOpen);
    setScanResults(null);
  };

  const addItem=(cat)=>{
    const {name,qty,unit}=inputs[cat];
    if(!name.trim())return;
    const items=[...(pantry[cat]||[])];
    const idx=items.findIndex(i=>i.name.toLowerCase()===name.trim().toLowerCase());
    if(idx>=0) items[idx]={...items[idx],qty:qty.trim()||items[idx].qty,unit:unit||items[idx].unit||""};
    else items.push({id:Date.now()+Math.random(),name:name.trim(),qty:qty.trim(),unit:unit||""});
    update({...pantry,[cat]:items});
    setInputs(i=>({...i,[cat]:{name:"",qty:"",unit:""}}));
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
  const updateUnit=(cat,id,unit)=>update({...pantry,[cat]:(pantry[cat]||[]).map(i=>i.id===id?{...i,unit}:i)});

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
        {/* Bulk scan button */}
        <input ref={bulkInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif" style={{display:"none"}} onChange={handleBulkScan}/>
        <button onClick={()=>bulkInputRef.current?.click()} disabled={scanLoading}
          style={{width:"100%",background:"rgba(99,102,241,.07)",border:"1px solid rgba(99,102,241,.25)",borderRadius:10,color:"#6366f1",padding:"10px",fontSize:12,fontWeight:700,cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          {scanLoading?<CalcLoader/>:"📸"} {isHe?"סרוק חשבונית / מדפי מזווה":"Scan receipt / pantry shelf"}
        </button>
        <div style={{fontSize:11,color:C.muted,marginBottom:14}}>{isHe?"מה יש בבית? הכנס פריטים עם כמויות:":"What do you have at home? Add items with quantities:"}</div>
        {/* Scan confirmation overlay */}
        {scanResults&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:300,display:"flex",alignItems:"flex-end"}}>
            <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%",maxHeight:"70vh",overflowY:"auto",boxSizing:"border-box"}}>
              <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>{isHe?`נמצאו ${scanResults.length} פריטים`:`Found ${scanResults.length} items`}</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:12}}>{isHe?"סמן את הפריטים להוספה למזווה:":"Select items to add to pantry:"}</div>
              {scanResults.map((item,i)=>{
                const found=findExistingPantryItem(item.name);
                const sameUnit=found&&(found.item.unit||"")===(item.unit||"");
                const diffUnit=found&&!sameUnit;
                const eq=found?parseFloat(found.item.qty)||0:0;
                const nq=parseFloat(item.qty)||0;
                const mergedQty=sameUnit&&eq>0&&nq>0?eq+nq:null;
                return(
                <div key={item._id} style={{padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                    <input type="checkbox" checked={item.checked} onChange={()=>setScanResults(r=>r.map((x,j)=>j===i?{...x,checked:!x.checked}:x))} style={{width:16,height:16,cursor:"pointer",flexShrink:0}}/>
                    <span style={{flex:1,fontSize:13,color:C.text,fontWeight:500}}>{item.name}</span>
                    {sameUnit&&mergedQty!=null&&<span style={{fontSize:9.5,color:"#16a34a",background:"#f0fae8",borderRadius:6,padding:"2px 7px",flexShrink:0,fontWeight:600}}>
                      {found.item.qty}→{mergedQty}
                    </span>}
                    {sameUnit&&mergedQty==null&&found&&<span style={{fontSize:9.5,color:"#16a34a",background:"#f0fae8",borderRadius:6,padding:"2px 7px",flexShrink:0}}>{isHe?"יתחבר":"merge"}</span>}
                    {diffUnit&&<span style={{fontSize:9.5,color:"#b45309",background:"#fff8e1",borderRadius:6,padding:"2px 7px",flexShrink:0}}>{isHe?"פריט נפרד":"separate"}</span>}
                  </div>
                  <div style={{display:"flex",gap:6,paddingRight:24}}>
                    <input value={item.qty||""} onChange={e=>setScanResults(r=>r.map((x,j)=>j===i?{...x,qty:e.target.value}:x))}
                      placeholder={isHe?"כמות":"Qty"}
                      style={{width:68,border:`1px solid ${C.border}`,borderRadius:7,padding:"4px 6px",fontSize:12,textAlign:"center",fontFamily:"inherit"}}/>
                    <select value={item.cat||"other"} onChange={e=>setScanResults(r=>r.map((x,j)=>j===i?{...x,cat:e.target.value}:x))}
                      style={{flex:1,border:`1px solid ${C.border}`,borderRadius:7,padding:"4px 6px",fontSize:11,fontFamily:"inherit",background:"#fff",cursor:"pointer"}}>
                      {FRIDGE_CATS.map(c=><option key={c.key} value={c.key}>{isHe?c.he:c.en}</option>)}
                    </select>
                  </div>
                </div>
                );
              })}
              <div style={{display:"flex",gap:8,marginTop:16}}>
                <button onClick={()=>setScanResults(null)} style={{flex:1,background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{isHe?"ביטול":"Cancel"}</button>
                <button onClick={confirmScan} disabled={!scanResults.some(i=>i.checked)}
                  style={{flex:2,background:scanResults.some(i=>i.checked)?C.accent:"#ddd",border:"none",borderRadius:10,color:"#fff",padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                  {isHe?`הוסף ${scanResults.filter(i=>i.checked).length} פריטים`:`Add ${scanResults.filter(i=>i.checked).length} items`}
                </button>
              </div>
            </div>
          </div>
        )}
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
                  placeholder={isHe?"כמות":"Qty"} className="inp" style={{width:52,fontSize:12,padding:"6px 6px",flexShrink:0}}/>
                <select value={inputs[cat.key].unit} onChange={e=>setInputs(i=>({...i,[cat.key]:{...i[cat.key],unit:e.target.value}}))}
                  className="inp" style={{width:60,fontSize:11,padding:"6px 4px",flexShrink:0,cursor:"pointer"}}>
                  <option value="">יח׳</option>
                  <option value="מ״ל">מ״ל</option>
                  <option value="מ״ג">מ״ג</option>
                  <option value="ג׳">ג׳</option>
                  <option value="ק״ג">ק״ג</option>
                </select>
                <button onClick={()=>imgRefs.current[cat.key]&&imgRefs.current[cat.key].click()} disabled={imgLoading[cat.key]}
                  style={{background:"#f5f5f7",border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,padding:"0 8px",cursor:"pointer",fontSize:16,minWidth:36}}>
                  {imgLoading[cat.key]?<CalcLoader/>:"📷"}
                </button>
                <button onClick={()=>addItem(cat.key)} style={{background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"0 10px",cursor:"pointer",fontSize:16}}>+</button>
              </div>
              {(pantry[cat.key]||[]).map(item=>(
                <div key={item.id} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",borderBottom:`1px solid ${C.border}`}}>
                  <span style={{flex:1,fontSize:12,color:C.text}}>{item.name}</span>
                  <input value={item.qty} onChange={e=>updateQty(cat.key,item.id,e.target.value)}
                    placeholder={isHe?"כמות":"Qty"} style={{width:48,border:`1px solid ${C.border}`,borderRadius:6,padding:"3px 6px",fontSize:11,textAlign:"center",fontFamily:"inherit"}}/>
                  <select value={item.unit||""} onChange={e=>updateUnit(cat.key,item.id,e.target.value)}
                    style={{width:58,border:`1px solid ${C.border}`,borderRadius:6,padding:"3px 4px",fontSize:11,fontFamily:"inherit",background:"#fff",cursor:"pointer"}}>
                    <option value="">יח׳</option>
                    <option value="מ״ל">מ״ל</option>
                    <option value="מ״ג">מ״ג</option>
                    <option value="ג׳">ג׳</option>
                    <option value="ק״ג">ק״ג</option>
                  </select>
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
function ShoppingListModal({onClose,lang,pid,syncTick}){
  const isHe=(lang||'he')!=='en';
  const [items,setItems]=useState(loadShopping);
  const [loading,setLoading]=useState(false);
  const [translating,setTranslating]=useState(false);
  const [newName,setNewName]=useState("");
  const [newQty,setNewQty]=useState("");
  const [error,setError]=useState("");

  useEffect(()=>{if(syncTick>0)setItems(loadShopping());},[syncTick]);

  // Auto-translate Hebrew items when in English mode
  useEffect(()=>{
    if(isHe) return;
    const cur=loadShopping();
    const heItems=cur.filter(i=>/[א-ת]/.test(i.name));
    if(!heItems.length) return;
    setTranslating(true);
    fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({translateItems:heItems.map(i=>i.name)})})
      .then(r=>r.json()).then(d=>{
        if(d.translations?.length){
          const updated=cur.map(item=>{
            const idx=heItems.findIndex(h=>h.id===item.id);
            return idx>=0&&d.translations[idx]?{...item,name:d.translations[idx]}:item;
          });
          saveShopping(updated);setItems(updated);
        }
      }).catch(()=>{}).finally(()=>setTranslating(false));
  },[isHe]);

  const save=list=>{setItems(list);saveShopping(list);};

  const toggle=id=>save(items.map(i=>i.id===id?{...i,checked:!i.checked}:i));
  const remove=id=>save(items.filter(i=>i.id!==id));
  const clearBought=()=>save(items.filter(i=>!i.checked));
  const addManual=()=>{
    if(!newName.trim())return;
    save([...items,{id:Date.now()+Math.random(),name:newName.trim(),qty:newQty.trim(),checked:false,auto:false,addedBy:_memberName||""}]);
    setNewName("");setNewQty("");
  };

  const generate=async()=>{
    setLoading(true);setError("");
    const pantry=loadPantry();
    const recentFoods=getRecentFoodLabels(pid,7);
    const pantryStr=FRIDGE_CATS.flatMap(c=>(pantry[c.key]||[]).map(i=>`${i.name}${i.qty?` (${i.qty})`:""}`)).join(', ')||"ריק";
    try{
      const r=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({shoppingList:{pantry:pantryStr,recentFoods,isHe,lang}})});
      const d=await r.json();
      if(d.error)throw new Error(d.error);
      const newItems=(d.items||[]).map(i=>({id:Date.now()+Math.random(),name:i.name,qty:i.qty||"",checked:false,auto:true,addedBy:_memberName||""}));
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
        {loading&&<div style={{textAlign:'center',marginBottom:8}}><CalcLoader size={64}/></div>}
        <button onClick={generate} disabled={loading} style={{width:"100%",background:"linear-gradient(135deg,#14b8a6,#059669)",border:"none",borderRadius:10,color:"#fff",padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          {loading?(isHe?"מנתח...":"Analyzing..."):(isHe?"✨ הצע רשימת קניות לפי המזווה והרגלים":"✨ Suggest based on pantry & habits")}
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
                <div style={{flex:1,minWidth:0}}>
                  <span style={{fontSize:13,color:C.text}}>{item.name}</span>
                  {item.addedBy&&<span style={{display:"block",fontSize:9,color:C.muted,marginTop:1}}>{item.addedBy}</span>}
                </div>
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
function ExportImportModal({pid, onClose, lang, todayEntries, todayDate, todayBloodSugar, todayTotals}){
  const isHe=(lang||'he')!=='en';
  const [importing,setImporting]=useState(false);
  const [importText,setImportText]=useState("");
  const [msg,setMsg]=useState(null);
  const [filename,setFilename]=useState(`nutrition-backup-${pid}-${new Date().toISOString().slice(0,10)}`);
  const fileInputRef=useRef(null);

  const exportData=()=>{
    // Build today's live data directly from props (don't rely on LS round-trip)
    const todayKey=todayDate||getTodayKey();
    const todayLive=(todayEntries?.length||todayBloodSugar)?{
      entries:(todayEntries||[]).map(e=>({label:e.label,kcal:e.kcal,carbs:e.carbs,protein:e.protein,fat:e.fat||0,...(e.count&&{count:e.count}),...(e.perUnit&&{perUnit:e.perUnit})})),
      totals:todayTotals||{kcal:0,carbs:0,protein:0,fat:0},
      ...(todayBloodSugar?{bloodSugar:parseFloat(todayBloodSugar)}:{}),
    }:null;
    // Current profile's journal: merge LS data + today's live state
    const currentJournal={...loadJournal(pid),...(todayLive?{[todayKey]:todayLive}:{})};
    // Collect data for ALL profiles
    const allProfiles=loadProfiles();
    const profilesData={};
    allProfiles.forEach(p=>{
      profilesData[p.id]={
        journal:p.id===pid?currentJournal:loadJournal(p.id),
        customBtns:loadCustomBtns(p.id),
        customDB:loadCustomDB(p.id),
        quickFoods:loadQuickFoods(p.id),
        recipes:loadRecipes(p.id),
      };
    });
    // Always include the active profile even if profiles array was empty
    if(!profilesData[pid]){
      profilesData[pid]={
        journal:currentJournal,
        customBtns:loadCustomBtns(pid),
        customDB:loadCustomDB(pid),
        quickFoods:loadQuickFoods(pid),
        recipes:loadRecipes(pid),
      };
    }
    const data={
      version:5,
      exportDate:new Date().toISOString(),
      pid,
      profiles:allProfiles,
      activeProfileId:loadActiveProfileId(),
      profilesData,
      // v4 compat keys for current pid
      journal:currentJournal,
      customBtns:loadCustomBtns(pid),
      customDB:loadCustomDB(pid),
      fridge:loadFridge(),
      pantry:loadPantry(),
      shopping:loadShopping(),
      savedPrefs:JSON.parse(localStorage.getItem("nutrition_saved_prefs")||"[]"),
      quickFoods:loadQuickFoods(pid),
      recipes:loadRecipes(pid),
    };
    const json=JSON.stringify(data,null,2);
    const fname=(filename.trim()||`nutrition-backup-${pid}`).replace(/\.json$/,"")+".json";
    const blob=new Blob([json],{type:"application/json"});
    // Try navigator.share first (iOS Files app), fallback to download link
    if(navigator.share&&navigator.canShare&&navigator.canShare({files:[new File([blob],fname,{type:"application/json"})]})){
      navigator.share({files:[new File([blob],fname,{type:"application/json"})],title:fname})
        .then(()=>{ setMsg({type:"success",text:isHe?"✓ הקובץ נשמר":"✓ Saved"}); setTimeout(onClose,1200); })
        .catch(()=>{});
    } else {
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url; a.download=fname;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMsg({type:"success",text:isHe?"✓ הקובץ נשמר בהצלחה":"✓ File saved"});
      setTimeout(onClose,1200);
    }
  };

  const importData=()=>{
    try{
      const data=JSON.parse(importText.trim());
      if(!data.version) throw new Error(isHe?"פורמט לא תקין":"Invalid format");
      if(data.profiles) saveProfiles(data.profiles);
      if(data.activeProfileId) saveActiveProfileId(data.activeProfileId);
      // v5: restore all profiles' data
      if(data.profilesData){
        Object.entries(data.profilesData).forEach(([profileId,pd])=>{
          if(pd.journal){const ex=loadJournal(profileId);saveJournal({...ex,...pd.journal},profileId);}
          if(pd.customBtns) saveCustomBtns(pd.customBtns,profileId);
          if(pd.customDB) saveCustomDB(pd.customDB,profileId);
          if(pd.quickFoods) saveQuickFoods(pd.quickFoods,profileId);
          if(pd.recipes) saveRecipes(pd.recipes,profileId);
        });
        // Restore top-level keys if the active profile wasn't covered by profilesData
        const targetPid=data.pid||pid;
        if(!data.profilesData[targetPid]){
          if(data.journal){const ex=loadJournal(targetPid);saveJournal({...ex,...data.journal},targetPid);}
          if(data.customBtns) saveCustomBtns(data.customBtns,targetPid);
          if(data.customDB) saveCustomDB(data.customDB,targetPid);
          if(data.quickFoods) saveQuickFoods(data.quickFoods,targetPid);
          if(data.recipes) saveRecipes(data.recipes,targetPid);
        }
      } else if(data.journal) {
        // v4 fallback: single profile
        const targetPid=data.pid||pid;
        const existing=loadJournal(targetPid);
        saveJournal({...existing,...data.journal},targetPid);
        if(data.customBtns) saveCustomBtns(data.customBtns,targetPid);
        if(data.customDB) saveCustomDB(data.customDB,targetPid);
        if(data.quickFoods) saveQuickFoods(data.quickFoods,targetPid);
        if(data.recipes) saveRecipes(data.recipes,targetPid);
      }
      if(data.fridge) saveFridgeLS(data.fridge);
      if(data.pantry) savePantryLS(data.pantry);
      if(data.shopping) saveShopping(data.shopping);
      if(data.savedPrefs) localStorage.setItem("nutrition_saved_prefs",JSON.stringify(data.savedPrefs));
      const days=Object.keys((data.profilesData?Object.values(data.profilesData)[0]?.journal:data.journal)||{}).length;
      setMsg({type:"success",text:isHe?`✓ יובאו ${days} ימים בהצלחה! טוען מחדש...`:`✓ Imported ${days} days. Reloading...`});
      setImporting(false);
      setImportText("");
      setTimeout(()=>window.location.reload(),1500);
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
          <div style={{fontSize:15,fontWeight:700}}>{isHe?"📤 ייצוא / ייבוא נתונים":"📤 Export / Import"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>

        {msg && (
          <div style={{background:msg.type==="success"?"#f0fae8":"#fff0f0",border:`1px solid ${msg.type==="success"?C.accent:C.danger}`,borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:13,color:msg.type==="success"?C.accent:C.danger}}>
            {msg.text}
          </div>
        )}

        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>{isHe?"ייצוא נתונים":"Export Data"}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:10,lineHeight:1.6}}>
            {isHe?"שומר קובץ JSON עם כל היומן, הכפתורים, המאגר האישי והמזווה שלך.":"Saves a JSON file with your journal, buttons, personal database and pantry."}
          </div>
          <div style={{marginBottom:8}}>
            <input
              value={filename}
              onChange={e=>setFilename(e.target.value)}
              style={{width:"100%",boxSizing:"border-box",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",fontSize:12,fontFamily:"inherit",direction:"ltr",textAlign:"left"}}
              placeholder={isHe?"שם הקובץ":"File name"}
            />
          </div>
          <button onClick={exportData} style={{width:"100%",background:C.accent,border:"none",borderRadius:10,color:"#fff",padding:"12px",fontSize:13,fontWeight:700,cursor:"pointer"}}>
            {isHe?"💾 שמור קובץ גיבוי":"💾 Save Backup File"}
          </button>
        </div>

        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:16}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>{isHe?"ייבוא נתונים":"Import Data"}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:10,lineHeight:1.6}}>
            {isHe?"טעינת נתונים מקובץ גיבוי קודם. ⚠️ ידרוס את הנתונים הקיימים בפרופיל הנוכחי.":"Load data from a previous backup. ⚠️ Will overwrite current profile data."}
          </div>
          <input ref={fileInputRef} type="file" accept=".json" onChange={importFromFile} style={{display:"none"}}/>
          {!importText ? (
            <button onClick={()=>fileInputRef.current?.click()} style={{width:"100%",background:"#f5f5f7",border:`1px solid ${C.border}`,borderRadius:10,color:C.muted,padding:"12px",fontSize:13,fontWeight:700,cursor:"pointer"}}>
              {isHe?"📂 ייבא מקובץ":"📂 Import from File"}
            </button>
          ) : (
            <div className="fade">
              <div style={{fontSize:11,color:C.accent,marginBottom:8}}>{isHe?"✓ קובץ נטען — לחצי ייבא":"✓ File loaded — tap Import"}</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setImportText("")} className="btn-muted" style={{flex:1}}>{isHe?"ביטול":"Cancel"}</button>
                <button onClick={importData} style={{flex:2,background:C.warn,border:"none",borderRadius:8,color:"#fff",padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer"}}>{isHe?"ייבא עכשיו":"Import Now"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ── RecommendationsInfoModal ───────────────────────────────────────────────────
function RecommendationsInfoModal({recs,onClose}){
  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide" style={{maxHeight:"80vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:700}}>ℹ בסיס ההמלצות</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>
        <div style={{fontSize:13,color:C.text,lineHeight:1.9,marginBottom:16,background:"rgba(90,158,30,.06)",borderRadius:10,padding:"12px 14px"}}>
          {recs.explanation}
        </div>
        {recs.sources&&recs.sources.length>0&&(
          <>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:8,letterSpacing:1.2,textTransform:"uppercase"}}>מקורות</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {recs.sources.map((s,i)=>(
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"#f5f5f7",borderRadius:10,textDecoration:"none",color:C.accent,fontSize:12,fontWeight:600,border:`1px solid ${C.border}`}}>
                  <span style={{flex:1}}>{s.title}</span>
                  <span style={{fontSize:16,flexShrink:0}}>↗</span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── ProfileSetupWizard ─────────────────────────────────────────────────────────
function ProfileSetupWizard({profile,onSave,onSkip,lang,onToggleLang}){
  const isHe=(lang||'he')!=='en';
  const [step,setStep]=useState(0);
  const [age,setAge]=useState(profile?.age||"");
  const [gender,setGender]=useState(profile?.gender||"female");
  const [height,setHeight]=useState(profile?.height||"");
  const [weight,setWeight]=useState(profile?.weight||"");
  const [conditions,setConditions]=useState(profile?.conditions||[]);
  const [condText,setCondText]=useState(profile?.conditionText||"");
  const [dietPrefs,setDietPrefs]=useState(profile?.dietPrefs||[]);
  const [dietText,setDietText]=useState(profile?.dietText||"");
  const [activity,setActivity]=useState(profile?.activity||"moderate");
  const [activityText,setActivityText]=useState(profile?.activityText||"");
  const [goals,setGoals]=useState(profile?.goals||[]);
  const [goalText,setGoalText]=useState(profile?.goalText||"");
  const [loading,setLoading]=useState(false);
  const [recs,setRecs]=useState(null);
  const [editVals,setEditVals]=useState({kcal:1800,carbs:130,protein:90,fat:60});
  const [error,setError]=useState(null);
  const [showRecsInfo,setShowRecsInfo]=useState(false);

  const CONDS=[
    {id:"t2d",he:"סוכרת סוג 2",en:"Type 2 Diabetes"},{id:"t1d",he:"סוכרת סוג 1",en:"Type 1 Diabetes"},
    {id:"prediab",he:"טרום סכרת",en:"Pre-diabetes"},
    {id:"menopause",he:"גיל המעבר",en:"Menopause"},{id:"hyper",he:"יתר לחץ דם",en:"High Blood Pressure"},
    {id:"chol",he:"כולסטרול גבוה",en:"High Cholesterol"},{id:"meta",he:"תסמונת מטבולית",en:"Metabolic Syndrome"},
    {id:"kidney",he:"מחלת כליות",en:"Kidney Disease"},{id:"heart",he:"מחלת לב",en:"Heart Disease"},
  ];
  const DIETS=[
    {id:"veg",he:"צמחוני",en:"Vegetarian"},{id:"vegan",he:"טבעוני",en:"Vegan"},
    {id:"gf",he:"ללא גלוטן",en:"Gluten-Free"},{id:"lf",he:"ללא לקטוז",en:"Lactose-Free"},
    {id:"kosher",he:"כשר",en:"Kosher"},{id:"lowsodium",he:"דל נתרן",en:"Low Sodium"},
    {id:"keto",he:"קטוגני",en:"Keto"},
  ];
  const ACTIVITIES=[
    {id:"sedentary",he:"יושבני",en:"Sedentary",sub:isHe?"ללא פעילות גופנית":"No physical activity"},
    {id:"light",he:"קל",en:"Light",sub:isHe?"1-2 פעמים בשבוע":"1-2 times/week"},
    {id:"moderate",he:"מתון",en:"Moderate",sub:isHe?"3-4 פעמים בשבוע":"3-4 times/week"},
    {id:"active",he:"פעיל",en:"Active",sub:isHe?"5+ פעמים בשבוע":"5+ times/week"},
    {id:"very_active",he:"ספורטאי",en:"Athlete",sub:isHe?"אימונים יומיים אינטנסיביים":"Intense daily training"},
  ];
  const GOALS=[
    {id:"weight_loss",he:"ירידה במשקל",en:"Weight Loss"},{id:"maintain",he:"שמירה על משקל",en:"Maintain Weight"},
    {id:"gain",he:"עלייה במסת שריר",en:"Build Muscle"},{id:"sugar",he:"איזון סוכר בדם",en:"Blood Sugar Balance"},
    {id:"heart",he:"שיפור בריאות לב",en:"Heart Health"},{id:"energy",he:"שיפור אנרגיה",en:"Improve Energy"},
  ];

  const toggle=(arr,setArr,id)=>setArr(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);

  const askClaude=async()=>{
    setLoading(true);setError(null);
    try{
      const allConds=[...conditions,...(condText.trim()?[condText.trim()]:[])]
      const allDiets=[...dietPrefs,...(dietText.trim()?[dietText.trim()]:[])]
      const allGoals=[...goals,...(goalText.trim()?[goalText.trim()]:[])]
      const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({profileData:{age,gender,height,weight,conditions:allConds,dietPrefs:allDiets,activity,activityText,goals:allGoals}})
      });
      if(!res.ok) throw new Error("שגיאת שרת");
      const d=await res.json();
      if(d.error) throw new Error(d.error);
      setRecs(d);
      setEditVals({kcal:d.kcal||1800,carbs:d.carbs||130,protein:d.protein||90,fat:d.fat||60});
      setStep(6);
    }catch(e){setError(e.message);setLoading(false);return;}
    setLoading(false);
  };

  const handleNext=()=>{
    if(step===4){setStep(5);askClaude();}
    else setStep(s=>s+1);
  };

  const handleSave=()=>{
    const updated={
      ...profile,
      maxKcal:parseInt(editVals.kcal)||profile.maxKcal||1800,
      maxCarbs:parseInt(editVals.carbs)||profile.maxCarbs||130,
      maxProtein:parseInt(editVals.protein)||profile.maxProtein||90,
      age:parseFloat(age)||undefined,gender,
      height:parseFloat(height)||undefined,weight:parseFloat(weight)||undefined,
      conditions,conditionText:condText,dietPrefs,dietText,activity,activityText,goals,goalText,
      recommendations:{explanation:recs?.explanation||"",sources:recs?.sources||[]}
    };
    const all=loadProfiles();
    saveProfiles(all.map(p=>p.id===updated.id?updated:p));
    onSave(updated);
  };

  const stepTitles=isHe?["📋 פרטים בסיסיים","🏥 בעיות רפואיות","🥗 העדפות תזונה","🏃 פעילות גופנית","🎯 יעדים"]:["📋 Basic Info","🏥 Medical","🥗 Diet Prefs","🏃 Activity","🎯 Goals"];
  const chipStyle=(active)=>({padding:"8px 14px",borderRadius:20,border:`1px solid ${active?C.accent:C.border}`,background:active?"rgba(90,158,30,0.1)":"#fff",color:active?C.accent:C.text,fontSize:12,fontWeight:active?700:400,cursor:"pointer"});

  return (
    <div style={{position:"fixed",inset:0,background:"#f5f5f7",zIndex:1000,display:"flex",flexDirection:"column",overflowY:"auto"}}>
      {/* Header */}
      <div style={{padding:"52px 20px 12px",background:"rgba(255,255,255,.95)",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:15,fontWeight:700,color:C.text}}>🎯 {isHe?"כוון יעדים תזונתיים":"Set Nutrition Goals"}</div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            {onToggleLang&&<button onClick={onToggleLang} style={{height:24,borderRadius:7,background:"rgba(255,255,255,.85)",border:"1px solid rgba(200,200,200,.6)",cursor:"pointer",fontSize:9,fontWeight:700,color:"#666",padding:"0 8px"}}>{isHe?'EN':'עב'}</button>}
            <button onClick={onSkip} style={{background:"none",border:"none",color:C.muted,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{isHe?"דלג ›":"Skip ›"}</button>
          </div>
        </div>
        {step<5&&(
          <div style={{display:"flex",gap:4}}>
            {stepTitles.map((_,i)=>(
              <div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=step?C.accent:"#e0e0e5",transition:"background .3s"}}/>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{flex:1,padding:20,overflowY:"auto"}}>
        {step===0&&(
          <div >
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:16}}>{stepTitles[0]}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              <div>
                <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:700}}>{isHe?"גיל":"Age"}</div>
                <input type="number" value={age} onChange={e=>setAge(e.target.value)} className="inp" placeholder="35"/>
              </div>
              <div>
                <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700}}>{isHe?"מין":"Gender"}</div>
                <div style={{display:"flex",gap:4}}>
                  {[{id:"female",he:"נקבה",en:"Female"},{id:"male",he:"זכר",en:"Male"},{id:"other",he:"אחר",en:"Other"}].map(g=>(
                    <button key={g.id} onClick={()=>setGender(g.id)} style={{flex:1,padding:"8px 2px",borderRadius:8,border:`1px solid ${gender===g.id?C.accent:C.border}`,background:gender===g.id?"rgba(90,158,30,0.08)":"#fff",fontSize:11,fontWeight:gender===g.id?700:400,color:gender===g.id?C.accent:C.muted,cursor:"pointer",fontFamily:"inherit"}}>{isHe?g.he:g.en}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div>
                <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:700}}>{isHe?"גובה (ס״מ)":"Height (cm)"}</div>
                <input type="number" value={height} onChange={e=>setHeight(e.target.value)} className="inp" placeholder="165"/>
              </div>
              <div>
                <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:700}}>{isHe?"משקל (ק״ג)":"Weight (kg)"}</div>
                <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} className="inp" placeholder="70"/>
              </div>
            </div>
          </div>
        )}
        {step===1&&(
          <div >
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>{stepTitles[1]}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:14}}>{isHe?"בחרי את כל מה שרלוונטי, או השאירי ריק":"Select all that apply, or leave empty"}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
              {CONDS.map(c=><button key={c.id} onClick={()=>toggle(conditions,setConditions,c.id)} style={chipStyle(conditions.includes(c.id))}>{isHe?c.he:c.en}</button>)}
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:700}}>{isHe?"מצב רפואי נוסף":"Other medical condition"}</div>
            <input value={condText} onChange={e=>setCondText(e.target.value)} className="inp" placeholder={isHe?"לדוגמה: תת פעילות בלוטת התריס":"e.g. hypothyroidism"}/>
          </div>
        )}
        {step===2&&(
          <div >
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>{stepTitles[2]}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:14}}>{isHe?"בחרי את ההעדפות שלך":"Select your preferences"}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
              {DIETS.map(d=><button key={d.id} onClick={()=>toggle(dietPrefs,setDietPrefs,d.id)} style={chipStyle(dietPrefs.includes(d.id))}>{isHe?d.he:d.en}</button>)}
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:700}}>{isHe?"העדפה נוספת":"Other preference"}</div>
            <input value={dietText} onChange={e=>setDietText(e.target.value)} className="inp" placeholder={isHe?"לדוגמה: אלרגיה לאגוזים":"e.g. nut allergy"}/>
          </div>
        )}
        {step===3&&(
          <div >
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:14}}>{stepTitles[3]}</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {ACTIVITIES.map(a=>(
                <button key={a.id} onClick={()=>setActivity(a.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,border:`2px solid ${activity===a.id?C.accent:C.border}`,background:activity===a.id?"rgba(90,158,30,0.07)":"#fff",textAlign:"right",cursor:"pointer",width:"100%",fontFamily:"inherit",transition:"border .2s"}}>
                  <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${activity===a.id?C.accent:C.border}`,background:activity===a.id?C.accent:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {activity===a.id&&<div style={{width:8,height:8,borderRadius:"50%",background:"#fff"}}/>}
                  </div>
                  <div style={{flex:1,textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:700,color:activity===a.id?C.accent:C.text}}>{isHe?a.he:a.en}</div>
                    <div style={{fontSize:11,color:C.muted}}>{a.sub}</div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:700,marginTop:14}}>{isHe?"רוצה לספר לי על זה? (פירוט פעילות - אופציונלי)":"Want to tell me more? (activity details - optional)"}</div>
            <input value={activityText} onChange={e=>setActivityText(e.target.value)} className="inp" placeholder={isHe?"סוג פעילות, משך ותדירות — לדוגמה: ריצה 40 דקות 3×/שבוע, אימוני כוח שעה 2×/שבוע":"type, duration & frequency — e.g. 40min run 3×/week, 1hr strength 2×/week"}/>
          </div>
        )}
        {step===4&&(
          <div >
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>{stepTitles[4]}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:14}}>{isHe?"מה חשוב לך להשיג?":"What would you like to achieve?"}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
              {GOALS.map(g=><button key={g.id} onClick={()=>toggle(goals,setGoals,g.id)} style={chipStyle(goals.includes(g.id))}>{isHe?g.he:g.en}</button>)}
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:700}}>{isHe?"יעד נוסף":"Other goal"}</div>
            <input value={goalText} onChange={e=>setGoalText(e.target.value)} className="inp" placeholder={isHe?"לדוגמה: הפחתת דלקות":"e.g. reduce inflammation"}/>
          </div>
        )}
        {step===5&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:280,gap:12}}>
            <CalcLoader size={80}/>
            <div style={{fontSize:15,fontWeight:700,color:C.text}}>{isHe?"Claude מנתח את הפרופיל שלך":"Claude is analyzing your profile"}</div>
            <div style={{fontSize:12,color:C.muted,textAlign:"center",lineHeight:1.7}}>
              {isHe?"בודק המלצות האיגודים הרפואיים...":"Checking medical guidelines..."}<br/>{isHe?"מחשב יעדים מותאמים אישית...":"Calculating personalized goals..."}
            </div>
            {error&&<div style={{background:"#fff0f0",border:`1px solid ${C.danger}`,borderRadius:10,padding:"12px 16px",fontSize:12,color:C.danger,textAlign:"center",width:"100%"}}>
              ⚠ {error}
              <br/><button onClick={()=>{setError(null);askClaude();}} style={{marginTop:8,background:C.danger,border:"none",borderRadius:6,color:"#fff",padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>{isHe?"נסה שוב":"Try again"}</button>
            </div>}
          </div>
        )}
        {step===6&&(
          <div >
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>{recs?(isHe?"✨ ההמלצות שלך":"✨ Your recommendations"):(isHe?"✏️ קבעי יעדים ידנית":"✏️ Set goals manually")}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:16}}>{isHe?"תוכלי לשנות את הערכים לפני השמירה":"You can adjust the values before saving"}</div>
            <div style={{background:"rgba(255,255,255,.9)",borderRadius:14,padding:"16px",marginBottom:10,boxShadow:"0 2px 10px rgba(0,0,0,.06)"}}>
              {[
                {label:isHe?"קלוריות יומיות":"Daily calories",key:"kcal",unit:"kcal",color:C.accent},
                {label:isHe?"פחמימות":"Carbs",key:"carbs",unit:"g",color:C.warn},
                {label:isHe?"חלבון":"Protein",key:"protein",unit:"g",color:C.blue},
                {label:isHe?"שומן":"Fat",key:"fat",unit:"g",color:"#94a3b8"},
              ].map(({label,key,unit,color})=>(
                <div key={key} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{fontSize:11,color:C.muted,width:100,flexShrink:0}}>{label}</div>
                  <input type="number" value={editVals[key]} onChange={e=>setEditVals(v=>({...v,[key]:e.target.value}))}
                    className="inp" style={{flex:1,fontWeight:700,fontSize:16,color,textAlign:"center",marginBottom:0,padding:"8px 4px"}}/>
                  <div style={{fontSize:11,color:C.muted,width:32,flexShrink:0}}>{unit}</div>
                </div>
              ))}
            </div>
            {recs&&<button onClick={()=>setShowRecsInfo(true)} style={{width:"100%",background:"none",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px",fontSize:12,color:C.muted,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontFamily:"inherit",marginBottom:4}}>
              ℹ {isHe?"על בסיס מה ניתנו ההמלצות?":"What are the recommendations based on?"}
            </button>}
            {showRecsInfo&&recs&&<RecommendationsInfoModal recs={recs} onClose={()=>setShowRecsInfo(false)}/>}
          </div>
        )}
      </div>

      {/* Footer */}
      {step!==5&&(
        <div style={{padding:"12px 20px 34px",background:"rgba(255,255,255,.97)",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
          {step===6?(
            <button onClick={handleSave} style={{width:"100%",background:C.accent,border:"none",borderRadius:12,color:"#fff",padding:"14px",fontSize:15,fontWeight:700,cursor:"pointer"}}>
              ✓ {isHe?"אשרי ושמרי יעדים":"Confirm & save goals"}
            </button>
          ):(
            <>
            <div style={{display:"flex",gap:8}}>
              {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,background:"none",border:`1px solid ${C.border}`,borderRadius:12,padding:"13px",fontSize:14,fontWeight:600,color:C.muted,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>{isHe?<><span>→</span><span>חזרה</span></>:"← Back"}</button>}
              <button onClick={handleNext} style={{flex:2,background:C.accent,border:"none",borderRadius:12,color:"#fff",padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                {step===4?(isHe?"קבלי המלצות מ-Claude 🔍 ←":"Get Claude's recommendations 🔍 →"):(isHe?"הבא ←":"Next →")}
              </button>
            </div>
            {step===4&&(
              <button onClick={()=>setStep(6)} style={{width:"100%",marginTop:8,background:"none",border:"none",color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",padding:"6px"}}>
                ✏️ {isHe?"קבע ידנית במקום":"Set manually instead"}
              </button>
            )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── SetupScreen ────────────────────────────────────────────────────────────────
function SetupScreen({onDone,lang,onToggleLang,onRestored}){
  const isHe=(lang||'he')!=='en';
  const [name,setName]=useState("");
  const [emoji,setEmoji]=useState("👩");
  const [restoreErr,setRestoreErr]=useState("");
  const restoreRef=useRef(null);
  const setupCvRef=useRef(null);
  const setupVidRef=useRef(null);
  useEffect(()=>{
    const vid=setupVidRef.current, cv=setupCvRef.current;
    if(!vid||!cv) return;
    const dpr=Math.min(window.devicePixelRatio||1,3);
    const SIZE=120;
    cv.width=SIZE*dpr; cv.height=SIZE*dpr;
    const ctx=cv.getContext('2d',{willReadFrequently:true});
    let raf;
    vid.play().catch(()=>{});
    const draw=()=>{
      raf=requestAnimationFrame(draw);
      if(!vid.videoWidth||vid.readyState<2) return;
      ctx.clearRect(0,0,cv.width,cv.height);
      ctx.drawImage(vid,0,0,cv.width,cv.height);
      try{
        const id=ctx.getImageData(0,0,cv.width,cv.height),d=id.data;
        for(let i=0;i<d.length;i+=4){const mn=Math.min(d[i],d[i+1],d[i+2]);if(mn>230)d[i+3]=0;else if(mn>180)d[i+3]=Math.round(255*(1-(mn-180)/50));}
        ctx.putImageData(id,0,0);
      }catch(_){}
    };
    raf=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(raf);
  },[]);
  const EMOJIS=["👩","👨","👧","👦","👵","👴","🧑","👩‍⚕️","👨‍⚕️","🧑‍🍳","🏃","💪","🧘","🌸","🌟","⭐","🦋","🐱","🐶","🦊","🍎","🥑","🌿","❤️","💙","💚","🔥","✨","🎯","🏅"];
  const create=()=>{
    if(!name.trim())return;
    onDone({id:"profile_"+Date.now(),name:name.trim(),emoji,maxKcal:1800,maxCarbs:80,maxProtein:120});
  };
  const restoreFromFile=e=>{
    const file=e.target.files[0]; if(!file)return; e.target.value="";
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const data=JSON.parse(ev.target.result);
        if(!data.profiles?.length) throw new Error(isHe?"קובץ לא תקין — חסרים פרופילים":"Invalid file — no profiles found");
        saveProfiles(data.profiles);
        if(data.activeProfileId) saveActiveProfileId(data.activeProfileId);
        if(data.profilesData){
          Object.entries(data.profilesData).forEach(([pid,pd])=>{
            if(pd.journal) saveJournal(pd.journal,pid);
            if(pd.customBtns) saveCustomBtns(pd.customBtns,pid);
            if(pd.customDB) saveCustomDB(pd.customDB,pid);
            if(pd.quickFoods) saveQuickFoods(pd.quickFoods,pid);
          });
        } else if(data.journal){
          const tpid=data.pid||data.profiles[0]?.id;
          if(tpid){saveJournal(data.journal,tpid);if(data.customBtns)saveCustomBtns(data.customBtns,tpid);if(data.customDB)saveCustomDB(data.customDB,tpid);if(data.quickFoods)saveQuickFoods(data.quickFoods,tpid);}
        }
        if(data.fridge) saveFridgeLS(data.fridge);
        if(data.pantry) savePantryLS(data.pantry);
        if(data.shopping) saveShopping(data.shopping);
        if(data.savedPrefs) localStorage.setItem("nutrition_saved_prefs",JSON.stringify(data.savedPrefs));
        onRestored&&onRestored();
      }catch(err){setRestoreErr(err.message);}
    };
    reader.readAsText(file);
  };
  return (
    <div style={{minHeight:"100vh",background:"#f5f5f7",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative"}}>
      {onToggleLang&&<button onClick={onToggleLang} style={{position:"fixed",top:18,right:20,zIndex:10,height:26,borderRadius:7,background:"rgba(255,255,255,.85)",border:"1px solid rgba(200,200,200,.7)",cursor:"pointer",fontSize:10,fontWeight:700,color:"#666",padding:"0 10px",boxShadow:"0 1px 4px rgba(0,0,0,.08)"}}>{isHe?'EN':'עב'}</button>}
      <div style={{position:"relative",width:120,height:120,marginBottom:8}}>
        <video ref={setupVidRef} src="/Nutrition/avo-animation.mp4" autoPlay loop muted playsInline crossOrigin="anonymous"
          style={{position:"absolute",inset:0,width:120,height:120,opacity:0}}/>
        <canvas ref={setupCvRef} style={{position:"absolute",inset:0,width:120,height:120,display:"block"}}/>
      </div>
      <div style={{fontSize:22,fontWeight:900,color:C.accent,marginBottom:4}}>{isHe?"ברוכים הבאים!":"Welcome!"}</div>
      <div style={{fontSize:13,color:C.muted,marginBottom:28,textAlign:"center"}}>{isHe?"בואו ניצור פרופיל":"Create your first profile to get started"}</div>
      <div style={{background:"#fff",borderRadius:16,padding:20,width:"100%",maxWidth:360,boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
        <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700}}>{isHe?"שם":"Name"}</div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder={isHe?"שם הפרופיל":"Profile name"} className="inp" style={{marginBottom:14}}/>
        <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:700}}>{isHe?"אימוג׳י":"Emoji"}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
          {EMOJIS.map(em=>(
            <button key={em} onClick={()=>setEmoji(em)} style={{width:38,height:38,border:`2px solid ${em===emoji?C.accent:"#e0e0e5"}`,borderRadius:8,background:em===emoji?"rgba(90,158,30,0.1)":"#fff",fontSize:20,cursor:"pointer"}}>{em}</button>
          ))}
        </div>
        <button onClick={create} disabled={!name.trim()} style={{width:"100%",background:name.trim()?C.accent:"#ddd",border:"none",borderRadius:10,color:name.trim()?"#fff":"#aaa",padding:"13px",fontSize:14,fontWeight:700,cursor:name.trim()?"pointer":"default"}}>
          {isHe?"מתחילים":"Let's go"}
        </button>
        <div style={{display:"flex",alignItems:"center",gap:8,margin:"16px 0 12px"}}>
          <div style={{flex:1,height:1,background:C.border}}/>
          <span style={{fontSize:11,color:C.muted}}>{isHe?"או":"or"}</span>
          <div style={{flex:1,height:1,background:C.border}}/>
        </div>
        <input ref={restoreRef} type="file" accept=".json" onChange={restoreFromFile} style={{display:"none"}}/>
        <button onClick={()=>restoreRef.current?.click()} style={{width:"100%",background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,color:C.muted,padding:"12px",fontSize:13,fontWeight:700,cursor:"pointer"}}>
          📂 {isHe?"טען מגיבוי קיים":"Restore from Backup"}
        </button>
        {restoreErr&&<div style={{fontSize:11,color:C.danger,marginTop:8,textAlign:"center"}}>{restoreErr}</div>}
      </div>
    </div>
  );
}
// ── ProfileModal ───────────────────────────────────────────────────────────────
function ProfileModal({profiles, activeId, onSelect, onClose, onBackup, onSetupProfile, lang}){
  const isHe=(lang||'he')!=='en';
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
    onSetupProfile&&onSetupProfile(p);
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
          <div style={{fontSize:15,fontWeight:700}}>{isHe?"👥 פרופילים":"👥 Profiles"}</div>
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
                  <div style={{fontSize:10,color:C.muted}}>{p.maxKcal} {isHe?"קק״ל":"kcal"} · {p.maxCarbs}g {isHe?"פחמ׳":"carbs"}</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                {p.id===activeId && <span style={{fontSize:10,color:C.accent,fontWeight:700}}>{isHe?"פעיל":"Active"}</span>}
                {p.recommendations && <span style={{fontSize:10,color:C.muted}} title={isHe?"יש המלצות":"Has recommendations"}>ℹ</span>}
                <button onClick={e=>{e.stopPropagation();onSetupProfile&&onSetupProfile(p);}} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:6,color:C.accent,fontSize:11,fontWeight:700,cursor:"pointer",padding:"3px 7px",fontFamily:"inherit"}}>🎯</button>
                {p.id!=="default" && <button onClick={e=>{e.stopPropagation();deleteProfile(p.id);}} style={{background:"none",border:"none",color:C.muted,fontSize:16,cursor:"pointer",padding:4}}>🗑</button>}
              </div>
            </div>
          ))}
        </div>
        {!showNew
          ? <><button onClick={()=>setShowNew(true)} style={{width:"100%",background:"transparent",border:`1px dashed ${C.border}`,borderRadius:10,padding:"10px",fontSize:13,color:C.muted,cursor:"pointer",marginBottom:8}}>{isHe?"+ פרופיל חדש":"+ New Profile"}</button>
            <button onClick={onBackup} style={{width:"100%",background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px",fontSize:13,color:C.muted,cursor:"pointer"}}>{isHe?"💾 גיבוי וייבוא נתונים":"💾 Backup & Import"}</button></>

          : (
            <div className="fade" style={{background:"#f5f5f7",borderRadius:10,padding:12}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{isHe?"שם":"Name"}</div>
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder={isHe?"שם הפרופיל":"Profile name"} className="inp" style={{marginBottom:10}}/>
              <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{isHe?"אימוג׳י":"Emoji"}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                {EMOJIS.map(em=>(
                  <button key={em} onClick={()=>setNewEmoji(em)} style={{width:36,height:36,border:`1px solid ${em===newEmoji?C.accent:C.border}`,borderRadius:8,background:em===newEmoji?"rgba(90,158,30,0.1)":"#fff",fontSize:18,cursor:"pointer"}}>{em}</button>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setShowNew(false)} className="btn-muted" style={{flex:1}}>{isHe?"ביטול":"Cancel"}</button>
                <button onClick={createProfile} disabled={!newName.trim()} style={{flex:2,background:newName.trim()?C.accent:"#ddd",border:"none",borderRadius:8,color:newName.trim()?"#fff":"#aaa",padding:"10px",fontSize:13,fontWeight:700,cursor:newName.trim()?"pointer":"default"}}>{isHe?"צור פרופיל":"Create Profile"}</button>
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
  const hasVar=!!(food.defaultAmt&&food.unit&&food.kcal);
  const [open,setOpen]=useState(false);
  const [amt,setAmt]=useState(food.defaultAmt||1);
  const step=food.defaultAmt>=100?25:food.defaultAmt>=30?10:5;
  const minAmt=Math.min(step,food.defaultAmt||5);
  const calcVar=(a)=>{const r=a/(food.defaultAmt||1);return{label:`${getFoodLabel(food)} (${a}${food.unit})`,kcal:Math.round(food.kcal*r),carbs:parseFloat((food.carbs*r).toFixed(1)),protein:parseFloat(((food.protein||0)*r).toFixed(1)),fat:parseFloat(((food.fat||0)*r).toFixed(1))};};
  const sub=<span className="chip-sub">{food.defaultAmt&&food.unit?`${food.defaultAmt}${food.unit} · `:""}{food.kcal} {getT().kcal} · {food.carbs}g {getT().carbs}</span>;

  if(editMode) return (
    <div style={{position:"relative"}}>
      <button className="chip" style={{opacity:0.7}}>
        <span>{food.label}</span>
        {sub}
      </button>
      <button onClick={()=>onRemove(food.id)} style={{position:"absolute",top:-4,right:-4,background:C.danger,border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>×</button>
      <button onClick={()=>onEdit(food)} style={{position:"absolute",top:-4,left:-4,background:C.warn,border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>✏</button>
    </div>
  );
  if(hasVar){
    const v=calcVar(amt);
    return(
      <div style={{position:"relative"}}>
        <button className="chip" style={{background:open?"rgba(13,148,136,.08)":"#fff",border:`1px solid ${open?C.accent:C.border}`}} onClick={()=>setOpen(o=>!o)}>
          <span>{getFoodLabel(food)}</span>
          {sub}
        </button>
        {open&&<VPopup label={`כמה ${food.unit}?`} value={amt} setValue={setAmt} step={step} min={minAmt}
          kcal={v.kcal} carbs={v.carbs}
          onAdd={()=>{onAdd({...v,uid:Date.now()+Math.random(),count:1,perUnit:{kcal:v.kcal,carbs:v.carbs,protein:v.protein,fat:v.fat}});setOpen(false);setAmt(food.defaultAmt||1);}}/>}
      </div>
    );
  }
  return (
    <button className="chip" onClick={()=>onAdd({
        ...food, label:getFoodLabel(food), uid:Date.now()+Math.random(), count:1,
        perUnit:{kcal:food.kcal,carbs:food.carbs,protein:food.protein||0,fat:food.fat||0}
      })}>
      <span>{getFoodLabel(food)}</span>
      {sub}
    </button>
  );
}

// ── SaveFavNameSheet ────────────────────────────────────────────────────────────
function SaveFavNameSheet({defaultName,onConfirm,onClose}){
  const [name,setName]=useState(defaultName||"");
  return(
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide" style={{paddingBottom:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:700}}>⭐ שמירה למועדפים</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>
        <div style={{fontSize:11,color:C.muted,marginBottom:4}}>שם הפריט</div>
        <input value={name} onChange={e=>setName(e.target.value)} className="inp" style={{marginBottom:16}} autoFocus
          onKeyDown={e=>e.key==="Enter"&&name.trim()&&onConfirm(name.trim())}/>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} className="btn-muted" style={{flex:1}}>ביטול</button>
          <button onClick={()=>name.trim()&&onConfirm(name.trim())} disabled={!name.trim()}
            style={{flex:2,background:name.trim()?"#f59e0b":"#ddd",border:"none",borderRadius:8,color:name.trim()?"#fff":"#aaa",padding:"10px",fontSize:13,fontWeight:700,cursor:name.trim()?"pointer":"default"}}>
            ⭐ שמור
          </button>
        </div>
      </div>
    </div>
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
  const [unit,setUnit]=useState(food.unit||"");
  const [defaultAmt,setDefaultAmt]=useState(String(food.defaultAmt||""));

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
    const obj={...food,label,kcal:parseFloat(kcal)||0,carbs:parseFloat(carbs)||0,protein:parseFloat(protein)||0,fat:parseFloat(fat)||0};
    if(unit.trim())obj.unit=unit.trim();
    const da=parseFloat(defaultAmt);if(da>0)obj.defaultAmt=da;
    onSave(obj);
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
        <input value={label} onChange={e=>setLabel(e.target.value)} className="inp" style={{marginBottom:10,borderColor:label?C.accent:C.border}}/>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4}}>יחידה (אופציונלי)</div>
            <input value={unit} onChange={e=>setUnit(e.target.value)} className="inp" style={{marginBottom:0}} placeholder="גרם, מ״ל, מנה..."/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4}}>כמות ברירת מחדל</div>
            <input type="number" value={defaultAmt} onChange={e=>setDefaultAmt(e.target.value)} className="inp" style={{marginBottom:0}} placeholder="100"/>
          </div>
        </div>
        <div style={{fontSize:11,color:C.muted,marginBottom:4}}>תיאור לחישוב ע״י Claude</div>
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3}
          placeholder="תארי בחופשיות, למשל: אצבע גבינה צהובה 20g"
          className="inp" style={{marginBottom:8,resize:"none",lineHeight:1.5,fontSize:13}}/>
        {loading&&<div style={{textAlign:'center',marginBottom:8}}><CalcLoader size={64}/></div>}
        <button onClick={ask} disabled={loading}
          style={{width:"100%",background:"linear-gradient(135deg,#5a9e1e,#7bc42e)",border:"none",borderRadius:8,color:"#fff",padding:"9px",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          {loading?"מחשב...":"✨ חשב עם Claude"}
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
function SplashScreen({onDone,lang}){
  const isHe=(lang||localStorage.getItem('nutrition_lang')||'he')!=='en';
  const wrapRef=useRef(null);
  const cvRef=useRef(null);
  const vidRef=useRef(null);
  const skipRef=useRef(false);

  const doSkip=()=>{
    if(skipRef.current)return;
    skipRef.current=true;
    const el=wrapRef.current; if(!el)return;
    el.style.animation='splashExitContent .4s ease-in forwards';
    const burst=document.createElement('div');
    burst.style.cssText='position:absolute;top:50%;left:50%;width:70px;height:70px;border-radius:50%;background:rgba(170,240,90,.9);pointer-events:none;z-index:10;transform:translate(-50%,-50%) scale(0);animation:splashBurst .4s cubic-bezier(.15,.6,.3,1) forwards;';
    el.appendChild(burst);
    setTimeout(onDone,400);
  };

  useEffect(()=>{
    imgUtilsReady.then(()=>{ if(window._loadSplashImages) window._loadSplashImages(); });
    const t1=setTimeout(()=>{
      if(skipRef.current)return;
      const el=wrapRef.current; if(!el)return;
      el.style.animation='splashExitContent .95s ease-in forwards';
      const burst=document.createElement('div');
      burst.style.cssText='position:absolute;top:50%;left:50%;width:70px;height:70px;border-radius:50%;background:rgba(170,240,90,.9);pointer-events:none;z-index:10;transform:translate(-50%,-50%) scale(0);animation:splashBurst .95s cubic-bezier(.15,.6,.3,1) forwards;';
      el.appendChild(burst);
    },2500);
    const t2=setTimeout(()=>{if(!skipRef.current)onDone();},3500);
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[]);
  // Canvas-based white-background removal for the animation video
  useEffect(()=>{
    const vid=vidRef.current, cv=cvRef.current;
    if(!vid||!cv) return;
    // Scale canvas to device pixel ratio for crisp rendering on retina screens
    const dpr=Math.min(window.devicePixelRatio||1,3);
    const SIZE=200;
    cv.width=SIZE*dpr;
    cv.height=SIZE*dpr;
    const ctx=cv.getContext('2d',{willReadFrequently:true});
    let raf;
    vid.play().catch(()=>{});
    const draw=()=>{
      raf=requestAnimationFrame(draw);
      if(!vid.videoWidth || vid.readyState<2) return;
      const w=cv.width, h=cv.height;
      ctx.clearRect(0,0,w,h);
      ctx.drawImage(vid,0,0,w,h);
      try{
        const id=ctx.getImageData(0,0,w,h), d=id.data;
        for(let i=0;i<d.length;i+=4){
          const mn=Math.min(d[i],d[i+1],d[i+2]);
          if(mn>230) d[i+3]=0;
          else if(mn>180) d[i+3]=Math.round(255*(1-(mn-180)/50));
        }
        ctx.putImageData(id,0,0);
      }catch(_){}
    };
    raf=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(raf);
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
    <div ref={wrapRef} onClick={doSkip} style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:9999,overflow:'hidden',cursor:'pointer',
      background:'linear-gradient(150deg,#edfad5 0%,#bde890 52%,#92d045 100%)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      {/* bg circles */}
      <div style={{position:'absolute',top:-100,right:-100,width:320,height:320,borderRadius:'50%',
        background:'rgba(255,255,255,.18)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:-80,left:-80,width:280,height:280,borderRadius:'50%',
        background:'rgba(255,255,255,.13)',pointerEvents:'none'}}/>
      {/* Speech bubble */}
      {isHe
        ? <canvas id="sp-bubble"/>
        : <img src="/Nutrition/bubble-en.png" id="sp-bubble" alt="Nourish your life"/>}
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
        {/* Center animation */}
        <div className="sp-avo-center">
          <div className="sp-avo-anim" style={{position:"relative",width:200,height:200}}>
            <video ref={vidRef} src="/Nutrition/avo-animation.mp4" autoPlay loop muted playsInline crossOrigin="anonymous"
              style={{position:"absolute",inset:0,width:200,height:200,opacity:0}}/>
            <canvas ref={cvRef}
              style={{position:"absolute",inset:0,width:200,height:200,display:"block",filter:"drop-shadow(0 6px 22px rgba(35,90,5,.3))"}}/>
          </div>
        </div>
      </div>
      {/* Title */}
      {isHe&&<div style={{fontSize:26,fontWeight:900,color:'#1e4a06',marginTop:16,letterSpacing:-0.5,
        textShadow:'0 2px 10px rgba(255,255,255,.6)',animation:'splashFadeUp .5s ease .65s both'}}>מעקב תזונה</div>}
      <div style={{fontSize:12,color:'#4a7a10',letterSpacing:2.5,marginTop:isHe?6:20,
        animation:'splashFadeUp .5s ease .85s both'}}>{isHe?'חכם · מהיר · מדויק':'Smart · Fast · Accurate'}</div>
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
      kcal:"קק״ל",mgdl:"mg/dL",goal:"עד",goalLabel:"יעד",
      carbs:"פחמ׳",carbsFull:"פחמימות",protein:"חלבון",fat:"שומן",noLimit:"ללא הגבלה",
      quickAdd:"הוספה מהירה",edit:"✏️ ערוך",done:"✓ סיום",reset:"↺ אפס",newBtn:"+ חדש",presets:"⭐ קבועים",
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
      kcal:"kcal",mgdl:"mg/dL",goal:"Limit",goalLabel:"Goal",
      carbs:"Carbs",carbsFull:"Carbs",protein:"Protein",fat:"Fat",noLimit:"No limit",
      quickAdd:"Quick Add",edit:"✏️ Edit",done:"✓ Done",reset:"↺ Reset",newBtn:"+ New",presets:"⭐ Presets",
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
    ["🍳","Meal planner","Get personalized meal suggestions using what's in your pantry"],
    ["📓","Weekly journal","View calorie chart, weight, sugar curve and weekly averages"],
    ["🫙","Pantry","Track what you have at home by category"],
    ["🛒","Shopping list","Manage your shopping list, synced across the household"],
    ["🏠","Household sync","Share pantry & shopping list in real time with family"],
    ["💾","Personal food DB","Save your own meals and foods with custom nutrition values"],
    ["👤","Profiles","Multiple profiles with separate goals, journal and food history"],
    ["📤","Backup & export","Export your data as JSON or text and restore it any time"],
  ]:[
    ["📊","מעקב יומי","רשמי קלוריות, פחמימות, חלבון ושומן לכל מאכל"],
    ["🩸","סוכר בדם","הזיני ערך סוכר בבוקר ועקבי אחר עקומה שבועית"],
    ["⚡","הוספה מהירה","לחצי על מאכל להוספה מיידית ליומן היום"],
    ["🔍","הוספה חכמה","חפשי מאכל לפי שם — Claude יחשב את הערכים"],
    ["📷","ניתוח תמונה","צלמי ארוחה ו-Claude יזהה ויחשב את הערכים"],
    ["🍳","מתכנן ארוחות","קבלי הצעות ארוחה עם מתכון מלא לפי מה שיש במזווה"],
    ["📓","יומן שבועי","גרף קלוריות, משקל, עקומת סוכר וממוצעים שבועיים"],
    ["🫙","מזווה","עקבי אחר מה שיש בבית לפי קטגוריות"],
    ["🛒","רשימת קניות","נהלי רשימת קניות — מסתנכרנת עם כל הבית"],
    ["🏠","סנכרון בית","שיתוף מזווה ורשימת קניות בזמן אמת עם בני הבית"],
    ["💾","מאגר אישי","שמרי מאכלים ומנות עם ערכים תזונתיים מותאמים אישית"],
    ["👤","פרופילים","מספר פרופילים עם יעדים, יומן והיסטוריה נפרדת לכל אחד"],
    ["📤","גיבוי וייצוא","ייצאי את הנתונים כ-JSON או טקסט ושחזרי בכל עת"],
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
        <div style={{fontSize:10,color:C.muted,textAlign:"center",marginTop:14,opacity:.5}}>v1.5.0</div>
        <button onClick={onClose} className="btn-accent" style={{marginTop:8,borderRadius:12}}>{lang==='en'?"Got it":"הבנתי"}</button>
      </div>
    </div>
  );
}

// ── Recipe Book ───────────────────────────────────────────────────────────────
const loadRecipes=pid=>ls.get(`nutrition_recipes_${pid||'default'}`) || [];
const saveRecipes=(r,pid)=>ls.set(`nutrition_recipes_${pid||'default'}`,r);

function formatRecipeShare(recipe,isHe){
  const lines=[`📖 ${recipe.name}`,''];
  if(recipe.ingredients?.length){
    lines.push(isHe?'🧂 מצרכים:':'🧂 Ingredients:');
    recipe.ingredients.forEach(i=>lines.push(`• ${i.amount} ${i.unit} ${i.item}`));
    lines.push('');
  }
  if(recipe.steps?.length){
    lines.push(isHe?'👨‍🍳 הכנה:':'👨‍🍳 Instructions:');
    recipe.steps.forEach((s,i)=>lines.push(`${i+1}. ${s}`));
    lines.push('');
  }
  if(recipe.kcalPerPerson) lines.push(`📊 ${isHe?'לכל מנה':'Per serving'}: ${Math.round(recipe.kcalPerPerson)} kcal · ${(recipe.carbsPerPerson||0).toFixed(1)}g carbs · ${(recipe.proteinPerPerson||0).toFixed(1)}g prot`);
  return lines.join('\n');
}

function RecipeCard({recipe,isHe,onEdit,onDelete,onShare,onEmail,onAddToDay,onSaveToDb,onSaveQuickFood,open,onToggle}){
  const [showPicker,setShowPicker]=useState(false);
  const [qty,setQty]=useState('1');
  const [unit,setUnit]=useState("מנות");
  const [savedQF,setSavedQF]=useState(false);
  const [savedDb,setSavedDb]=useState(false);
  const confirmAdd=()=>{onAddToDay(parseFloat(qty)||1,unit);setShowPicker(false);setQty('1');setUnit("מנות");};
  const handleSaveQF=()=>{const ok=onSaveQuickFood?.();if(ok){setSavedQF(true);setTimeout(()=>setSavedQF(false),2000);}};
  const handleSaveDb=()=>{const ok=onSaveToDb?.();if(ok){setSavedDb(true);setTimeout(()=>setSavedDb(false),2000);}};
  return(
    <div style={{background:"#f5f5f7",borderRadius:12,marginBottom:8,overflow:"hidden"}}>
      {showPicker&&(
        <div onClick={e=>{if(e.target===e.currentTarget)setShowPicker(false);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.35)",zIndex:9999,display:"flex",alignItems:"flex-end"}}>
          <div style={{width:"100%",background:"#fff",borderRadius:"18px 18px 0 0",padding:"20px 20px 34px"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:16}}>📖 {recipe.name}</div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              <input autoFocus type="number" inputMode="decimal" value={qty} onChange={e=>setQty(e.target.value)}
                placeholder="1" style={{flex:1,border:`1.5px solid ${C.border}`,borderRadius:8,padding:"10px 12px",fontSize:16,fontFamily:"inherit",outline:"none"}}/>
              <select value={unit} onChange={e=>setUnit(e.target.value)}
                style={{flex:1,border:`1.5px solid ${C.border}`,borderRadius:8,padding:"10px 8px",fontSize:14,fontFamily:"inherit",background:"#fff"}}>
                <option value="מנות">{isHe?"מנות":"servings"}</option>
                <option value="יח׳">{isHe?"יח׳":"units"}</option>
                <option value="גר׳">{isHe?"גר׳":"g"}</option>
                <option value="מ״ל">{isHe?"מ״ל":"ml"}</option>
              </select>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowPicker(false)} style={{flex:1,background:"none",border:`1px solid ${C.border}`,borderRadius:10,padding:"11px",fontSize:14,cursor:"pointer",color:C.muted}}>{isHe?"ביטול":"Cancel"}</button>
              <button onClick={confirmAdd} style={{flex:2,background:C.accent,border:"none",borderRadius:10,padding:"11px",fontSize:14,fontWeight:700,color:"#fff",cursor:"pointer"}}>+ {isHe?"הוסף":"Add"}</button>
            </div>
          </div>
        </div>
      )}
      <div onClick={onToggle} style={{display:"flex",alignItems:"center",padding:"12px 14px",cursor:"pointer",gap:8}}>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>{recipe.name}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>{Math.round(recipe.kcalPerPerson||0)} kcal · {recipe.servings||1} {isHe?"מנות":"servings"}{recipe.source==='claude'?' · 🤖':''}</div>
        </div>
        <span style={{fontSize:10,color:C.muted,transform:open?"rotate(180deg)":"none",transition:"transform .2s",display:"inline-block"}}>▾</span>
      </div>
      {open&&(
        <div className="fade" style={{padding:"0 14px 12px"}}>
          {recipe.ingredients?.length>0&&(
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:5}}>{isHe?"מצרכים":"INGREDIENTS"}</div>
              {recipe.ingredients.map((ing,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:`1px solid ${C.border}`,fontSize:12}}>
                  <span style={{color:C.text}}>{ing.item}</span>
                  <span style={{color:C.muted}}>{ing.amount}{ing.unit&&ing.unit!=="יח׳"?" "+ing.unit:""}</span>
                </div>
              ))}
            </div>
          )}
          {recipe.steps?.length>0&&(
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:5}}>{isHe?"הכנה":"INSTRUCTIONS"}</div>
              {recipe.steps.map((step,i)=>(
                <div key={i} style={{display:"flex",gap:8,padding:"4px 0",fontSize:12,color:C.text}}>
                  <span style={{color:C.accent,fontWeight:700,flexShrink:0}}>{i+1}.</span>
                  <span style={{flex:1}}>{step}</span>
                </div>
              ))}
            </div>
          )}
          {recipe.kcalPerPerson>0&&(
            <div style={{display:"flex",gap:6,marginBottom:10,background:"rgba(255,255,255,.75)",borderRadius:8,padding:"8px 10px"}}>
              {[{l:"kcal",v:Math.round(recipe.kcalPerPerson),c:C.accent},{l:"carbs g",v:(recipe.carbsPerPerson||0).toFixed(1),c:C.warn},{l:"prot g",v:(recipe.proteinPerPerson||0).toFixed(1),c:C.blue}].map(({l,v,c})=>(
                <div key={l} style={{flex:1,textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div>
                  <div style={{fontSize:9,color:C.muted}}>{l}/{isHe?"מנה":"serving"}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            <button onClick={()=>setShowPicker(true)} style={{flex:2,background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"8px",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ {isHe?"הוסף להיום":"Add to day"}</button>
            <button onClick={handleSaveDb} title={isHe?"שמור למאגר מאכלים":"Save to food DB"} style={{flex:1,background:savedDb?"rgba(13,148,136,.1)":"none",border:`1px solid ${savedDb?C.accent:C.border}`,borderRadius:8,padding:"8px",fontSize:13,cursor:"pointer",color:savedDb?C.accent:C.muted,transition:"all .2s"}}>{savedDb?"✓":"💾"}</button>
            <button onClick={handleSaveQF} title={isHe?"שמור למועדפים":"Save to favorites"} style={{flex:1,background:savedQF?"rgba(245,158,11,.12)":"none",border:`1px solid ${savedQF?"#f59e0b":"rgba(245,158,11,.35)"}`,borderRadius:8,padding:"8px",fontSize:13,cursor:"pointer",color:savedQF?"#f59e0b":C.muted,transition:"all .2s"}}>{savedQF?"✓":"⭐"}</button>
            <button onClick={onEdit} style={{flex:1,background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px",fontSize:13,cursor:"pointer"}}>✏️</button>
            <button onClick={onShare} title="WhatsApp" style={{flex:1,background:"rgba(37,211,102,.1)",border:"1px solid rgba(37,211,102,.3)",borderRadius:8,padding:"8px",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg viewBox="0 0 24 24" width="17" height="17" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></button>
            <button onClick={onEmail} style={{flex:1,background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.2)",borderRadius:8,padding:"8px",fontSize:13,cursor:"pointer"}}>✉️</button>
            <button onClick={onDelete} style={{flex:1,background:"none",border:`1px solid rgba(220,38,38,.2)`,borderRadius:8,padding:"8px",fontSize:13,cursor:"pointer",color:C.danger}}>🗑</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddEditRecipeModal({recipe,onSave,onClose,lang,onAddToDay}){
  const isHe=(lang||'he')!=='en';
  const [name,setName]=useState(recipe?.name||'');
  const [servings,setServings]=useState(recipe?.servings||2);
  const [ingText,setIngText]=useState(()=>{
    if(!recipe?.ingredients?.length) return '';
    return recipe.ingredients.map(i=>[i.amount,i.unit&&i.unit!=='יח׳'&&i.unit!=="יח'"?i.unit:null,i.item].filter(Boolean).join(' ')).join(', ');
  });
  const [steps,setSteps]=useState(recipe?.steps?.length?recipe.steps:['']);
  const [nutrition,setNutrition]=useState(recipe?.kcalPerPerson?{kcal:recipe.kcalPerPerson,carbs:recipe.carbsPerPerson,protein:recipe.proteinPerPerson,fat:recipe.fatPerPerson}:null);
  const [loading,setLoading]=useState(false);
  const [loadingRecipe,setLoadingRecipe]=useState(false);
  const [loadingFile,setLoadingFile]=useState(false);
  const [error,setError]=useState('');
  const stepRefs=useRef([]);
  const recipeFileRef=useRef(null);

  const parseIngText=text=>text.split(',').map(s=>s.trim()).filter(Boolean).map(part=>{
    const m=part.match(/^(\d+(?:[.,]\d+)?)\s*(g|ml|kg|ק"ג|ק״ג|כף|כפות|כפית|כפיות|כוס|כוסות|יח׳|יח'|יחידות?)?\s+(.+)$/i);
    if(m) return{amount:m[1],unit:m[2]||'g',item:m[3].trim()};
    const m2=part.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(g|ml|kg|ק"ג|ק״ג|כף|כפות|כפית|כפיות|כוס|כוסות|יח׳|יח'|יחידות?)?$/i);
    if(m2) return{amount:m2[2],unit:m2[3]||'g',item:m2[1].trim()};
    return{item:part,amount:'',unit:"יח׳"};
  });

  const parsedIngredients=parseIngText(ingText);

  const handleStepKey=(e,i)=>{
    if(e.key==='Enter'){e.preventDefault();const s=[...steps];s.splice(i+1,0,'');setSteps(s);setTimeout(()=>stepRefs.current[i+1]?.focus(),40);}
    if(e.key==='Backspace'&&steps[i]===''&&steps.length>1){e.preventDefault();setSteps(v=>v.filter((_,j)=>j!==i));setTimeout(()=>stepRefs.current[Math.max(0,i-1)]?.focus(),40);}
  };

  const loadFromClaude=async()=>{
    if(!name.trim()) return;
    setLoadingRecipe(true);setError('');
    try{
      const r=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({mealPlan:{selectedMeal:name,people:servings,lang}})});
      const d=await r.json();
      if(!r.ok){setError(d.error||`Server error ${r.status}`);setLoadingRecipe(false);return;}
      if(d.recipe) applyRecipe(d.recipe);
      else setError(isHe?'לא הצלחתי לטעון מתכון':'Could not load recipe');
    }catch{setError(isHe?'שגיאה':'Error');}
    setLoadingRecipe(false);
  };

  const applyRecipe=rec=>{
    if(rec.name&&!name.trim()) setName(rec.name);
    if(rec.servings) setServings(rec.servings);
    if(rec.ingredients?.length) setIngText(rec.ingredients.map(i=>i.amount?`${i.amount} ${i.item}`:i.item).join(', '));
    if(rec.steps?.length) setSteps(rec.steps.filter(Boolean));
    if(rec.kcalPerPerson) setNutrition({kcal:Math.round(rec.kcalPerPerson),carbs:parseFloat((rec.carbsPerPerson||0).toFixed(1)),protein:parseFloat((rec.proteinPerPerson||0).toFixed(1)),fat:parseFloat((rec.fatPerPerson||0).toFixed(1))});
  };

  const loadFromFile=e=>{
    const file=e.target.files[0];if(!file)return;
    setLoadingFile(true);setError('');
    const reader=new FileReader();
    reader.onload=async ev=>{
      e.target.value='';
      const raw=ev.target.result||'';
      // Detect binary content (null bytes = not plain text)
      if(raw.includes('\x00')){
        setError(isHe?'הקובץ אינו טקסט רגיל — שמרי אותו כ-.txt ונסי שוב':'File is not plain text — save as .txt and try again');
        setLoadingFile(false);return;
      }
      const text=raw.trim();
      if(!text){setError(isHe?'הקובץ ריק':'File is empty');setLoadingFile(false);return;}
      try{
        const r=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({recipeText:text.slice(0,8000),lang})});
        if(!r.ok){const eb=await r.json().catch(()=>({}));setError(eb.error||`Server error ${r.status}`);setLoadingFile(false);return;}
        const d=await r.json();
        if(d.recipe) applyRecipe(d.recipe);
        else if(d.error) setError(d.error);
        else setError(isHe?'לא הצלחתי לפרסר את המתכון':'Could not parse recipe');
      }catch(err){setError(`Error: ${err.message||'unknown'}`);}
      setLoadingFile(false);
    };
    reader.onerror=()=>{setError(isHe?'שגיאה בקריאת הקובץ':'File read error');setLoadingFile(false);};
    reader.readAsText(file);
  };

  const askClaude=async()=>{
    if(!parsedIngredients.length) return;
    const desc=parsedIngredients.map(i=>[i.amount,i.unit,i.item].filter(Boolean).join(' ')).join(', ');
    setLoading(true);setError('');
    try{
      const r=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({mealDescription:`${isHe?'מתכון':'Recipe'} ${isHe?'ל':'for'}-${servings} ${isHe?'מנות':'servings'}:\n${desc}`})});
      const d=await r.json();
      if(d.kcal) setNutrition({kcal:Math.round(d.kcal/servings),carbs:parseFloat(((d.carbs||0)/servings).toFixed(1)),protein:parseFloat(((d.protein||0)/servings).toFixed(1)),fat:parseFloat(((d.fat||0)/servings).toFixed(1))});
      else setError(isHe?'לא הצלחתי לחשב':'Could not calculate');
    }catch{setError(isHe?'שגיאה':'Error');}
    setLoading(false);
  };

  const handleSave=()=>{
    onSave({id:recipe?.id||`recipe_${Date.now()}`,name:name.trim()||(isHe?'מתכון חדש':'New Recipe'),servings,source:recipe?.source||'manual',
      ingredients:parsedIngredients,steps:steps.filter(s=>s.trim()),
      kcalPerPerson:nutrition?.kcal||0,carbsPerPerson:nutrition?.carbs||0,proteinPerPerson:nutrition?.protein||0,fatPerPerson:nutrition?.fat||0,
      savedAt:recipe?.savedAt||new Date().toISOString()});
  };

  const handleAddToDay=()=>{
    if(!nutrition) return;
    onAddToDay({uid:Date.now()+Math.random(),label:`📖 ${name||'מתכון'} (${isHe?'מנה':'serving'})`,
      kcal:nutrition.kcal||0,carbs:parseFloat((nutrition.carbs||0).toFixed(1)),
      protein:parseFloat((nutrition.protein||0).toFixed(1)),fat:parseFloat((nutrition.fat||0).toFixed(1))});
    onClose();
  };

  const UNITS=['g','ml','יח׳','כף','כפית','כוס','ק״ג'];

  return(
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide" style={{maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:15,fontWeight:700}}>📝 {recipe?(isHe?"עריכת מתכון":"Edit Recipe"):(isHe?"מתכון חדש":"New Recipe")}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>

        {/* Name */}
        <input value={name} onChange={e=>setName(e.target.value)} placeholder={isHe?"שם המתכון":"Recipe name"} className="inp" style={{marginBottom:8,fontWeight:600}}/>

        {/* Load from Claude */}
        <button onClick={loadFromClaude} disabled={loadingRecipe||loadingFile||!name.trim()}
          style={{width:"100%",background:name.trim()&&!loadingRecipe&&!loadingFile?"linear-gradient(135deg,#6366f1,#8b5cf6)":"#ddd",border:"none",borderRadius:10,color:name.trim()&&!loadingRecipe&&!loadingFile?"#fff":"#aaa",padding:"9px",fontSize:13,fontWeight:700,cursor:name.trim()&&!loadingRecipe&&!loadingFile?"pointer":"default",marginBottom:6}}>
          {loadingRecipe?"...":`🤖 ${isHe?"טען מתכון מלא מ-Claude":"Load full recipe from Claude"}`}
        </button>

        {/* Load from file */}
        <input ref={recipeFileRef} type="file" style={{display:"none"}} onChange={loadFromFile}/>
        <button onClick={()=>recipeFileRef.current?.click()} disabled={loadingFile||loadingRecipe}
          style={{width:"100%",background:!loadingFile&&!loadingRecipe?"#f0f4ff":"#ddd",border:`1px solid ${!loadingFile&&!loadingRecipe?"#c7d2fe":"#e0e0e5"}`,borderRadius:10,color:!loadingFile&&!loadingRecipe?"#4f46e5":"#aaa",padding:"9px",fontSize:13,fontWeight:700,cursor:!loadingFile&&!loadingRecipe?"pointer":"default",marginBottom:12}}>
          {loadingFile?"...":`📄 ${isHe?"טען מתכון מקובץ":"Load recipe from file"}`}
        </button>
        {error&&!loadingFile&&<div style={{fontSize:11,color:C.danger,textAlign:"center",marginTop:-8,marginBottom:8,padding:"4px 8px",background:"rgba(220,38,38,.07)",borderRadius:6}}>{error}</div>}

        {/* Servings */}
        <div style={{display:"flex",alignItems:"center",gap:10,background:"#f5f5f7",borderRadius:10,padding:"8px 12px",marginBottom:14}}>
          <span style={{fontSize:12,color:C.muted,flex:1}}>{isHe?"מספר מנות:":"Servings:"}</span>
          <button onClick={()=>setServings(v=>Math.max(1,v-1))} style={{width:26,height:26,border:`1px solid ${C.border}`,borderRadius:6,background:"#fff",cursor:"pointer",fontSize:14}}>−</button>
          <span style={{fontWeight:700,fontSize:14,color:C.accent,minWidth:20,textAlign:"center"}}>{servings}</span>
          <button onClick={()=>setServings(v=>v+1)} style={{width:26,height:26,border:`1px solid ${C.border}`,borderRadius:6,background:"#fff",cursor:"pointer",fontSize:14}}>+</button>
        </div>

        {/* Ingredients — free text */}
        <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:4}}>{isHe?"מצרכים":"INGREDIENTS"}</div>
        <div style={{fontSize:10,color:C.muted,marginBottom:6}}>{isHe?"הפרד בין מצרכים עם פסיק — לדוגמה: 200g עוף, 3 בצלים, כף שמן":"Separate with commas — e.g.: 200g chicken, 3 onions, 1 tbsp oil"}</div>
        <textarea value={ingText} onChange={e=>setIngText(e.target.value)}
          placeholder={isHe?"200g עוף, בצל, כף שמן זית, 100g גבינה...":"200g chicken, onion, 1 tbsp olive oil, 100g cheese..."}
          className="inp" rows={3} style={{marginBottom:6,fontSize:12,resize:"vertical",lineHeight:1.5}}/>
        {parsedIngredients.length>0&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
            {parsedIngredients.map((ing,i)=>(
              <span key={i} style={{background:"rgba(90,158,30,.1)",border:"1px solid rgba(90,158,30,.25)",borderRadius:20,padding:"3px 10px",fontSize:11,color:"#166534",display:"inline-flex",alignItems:"center",gap:5}}>
                {[ing.amount,ing.unit&&ing.unit!=="יח׳"?ing.unit:null,ing.item].filter(Boolean).join(' ')}
                <button onClick={()=>{const arr=[...ingText.split(',')];arr.splice(i,1);setIngText(arr.map(s=>s.trim()).filter(Boolean).join(', '));}} style={{background:"none",border:"none",color:"#166534",cursor:"pointer",padding:0,fontSize:12,lineHeight:1}}>×</button>
              </span>
            ))}
          </div>
        )}

        {/* Steps */}
        <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:4}}>{isHe?"שלבי הכנה":"INSTRUCTIONS"}</div>
        <div style={{fontSize:10,color:C.muted,marginBottom:8}}>{isHe?"Enter = שלב חדש":"Enter = new step"}</div>
        {steps.map((step,i)=>(
          <div key={i} style={{display:"flex",gap:6,marginBottom:6,alignItems:"flex-start"}}>
            <span style={{color:C.accent,fontWeight:700,fontSize:12,marginTop:8,flexShrink:0,minWidth:16}}>{i+1}.</span>
            <textarea ref={el=>stepRefs.current[i]=el} id={`step-${i}`} value={step}
              onChange={e=>setSteps(s=>s.map((x,j)=>j===i?e.target.value:x))}
              onKeyDown={e=>handleStepKey(e,i)}
              rows={1} className="inp" style={{flex:1,fontSize:12,resize:"none",padding:"6px 8px",lineHeight:1.4}}/>
            {steps.length>1&&<button onClick={()=>setSteps(s=>s.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:C.danger,fontSize:16,cursor:"pointer",padding:"6px 4px",flexShrink:0}}>×</button>}
          </div>
        ))}
        <button onClick={()=>setSteps(s=>[...s,''])} style={{width:"100%",background:"transparent",border:`1px dashed ${C.border}`,borderRadius:8,padding:"6px",fontSize:12,color:C.accent,cursor:"pointer",marginBottom:14}}>+ {isHe?"הוסף שלב":"Add step"}</button>

        {/* Claude nutrition */}
        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,marginBottom:8}}>
          {loading&&<div style={{textAlign:"center",marginBottom:8}}><CalcLoader size={56}/></div>}
          {nutrition&&(
            <div className="fade" style={{display:"flex",gap:6,marginBottom:10,background:"#f0fae8",borderRadius:8,padding:"8px 10px"}}>
              {[{l:"kcal",v:Math.round(nutrition.kcal),c:C.accent},{l:"carbs g",v:(nutrition.carbs||0).toFixed(1),c:C.warn},{l:"prot g",v:(nutrition.protein||0).toFixed(1),c:C.blue}].map(({l,v,c})=>(
                <div key={l} style={{flex:1,textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div>
                  <div style={{fontSize:9,color:C.muted}}>{l}/{isHe?"מנה":"serving"}</div>
                </div>
              ))}
            </div>
          )}
          {error&&<div style={{fontSize:11,color:C.danger,marginBottom:8,textAlign:"center"}}>{error}</div>}
          <button onClick={askClaude} disabled={loading||!parsedIngredients.length}
            style={{width:"100%",background:parsedIngredients.length&&!loading?"linear-gradient(135deg,#5a9e1e,#7bc42e)":"#ddd",border:"none",borderRadius:10,color:parsedIngredients.length&&!loading?"#fff":"#aaa",padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:10}}>
            {loading?"...":`✨ ${isHe?"שאל את Claude לחישוב ערכים":"Ask Claude to calculate"}`}
          </button>
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:6}}>
          <button onClick={onClose} className="btn-muted" style={{flex:1}}>{isHe?"ביטול":"Cancel"}</button>
          <button onClick={handleAddToDay} disabled={!nutrition} style={{flex:1,background:nutrition?C.accent:"#ddd",border:"none",borderRadius:10,color:nutrition?"#fff":"#aaa",padding:"10px",fontSize:12,fontWeight:700,cursor:nutrition?"pointer":"default"}}>+ {isHe?"להיום":"Today"}</button>
          <button onClick={handleSave} style={{flex:2,background:C.accent,border:"none",borderRadius:10,color:"#fff",padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer"}}>💾 {isHe?"שמור":"Save"}</button>
        </div>
      </div>
    </div>
  );
}

function RecipeBookModal({onClose,lang,pid,onAddToDay,onSaveQuickFood,initialEdit}){
  const isHe=(lang||'he')!=='en';
  const activePid=pid||window._activePid||'default';
  const [recipes,setRecipes]=useState(()=>loadRecipes(activePid));
  const [openId,setOpenId]=useState(null);
  const [search,setSearch]=useState('');
  const [showAdd,setShowAdd]=useState(false);
  const [editRecipe,setEditRecipe]=useState(initialEdit||null);
  const [pendingFav,setPendingFav]=useState(null);

  const save=r=>{setRecipes(r);saveRecipes(r,activePid);};
  const remove=id=>save(recipes.filter(r=>r.id!==id));

  const saveAsQuickFood=recipe=>{
    if(!recipe.kcalPerPerson) return false;
    const pid=window._activePid||activePid;
    const entry={names:[recipe.name.toLowerCase()],label:`📖 ${recipe.name}`,
      kcal:Math.round(recipe.kcalPerPerson||0),carbs:parseFloat((recipe.carbsPerPerson||0).toFixed(1)),
      protein:parseFloat((recipe.proteinPerPerson||0).toFixed(1)),fat:parseFloat((recipe.fatPerPerson||0).toFixed(1)),
      defaultAmt:1,unit:"מנה",source:'recipe'};
    const db=loadCustomDB(pid);
    saveCustomDB([...db.filter(f=>f.label!==entry.label),entry],pid);
    return true;
  };

  const saveToQuickFoods=recipe=>{
    if(!recipe.kcalPerPerson) return false;
    const food={id:`qf_recipe_${Date.now()}`,label:`📖 ${recipe.name}`,
      kcal:Math.round(recipe.kcalPerPerson||0),carbs:parseFloat((recipe.carbsPerPerson||0).toFixed(1)),
      protein:parseFloat((recipe.proteinPerPerson||0).toFixed(1)),fat:parseFloat((recipe.fatPerPerson||0).toFixed(1))};
    setPendingFav(food);
    return true;
  };

  const share=recipe=>{const msg=formatRecipeShare(recipe,isHe);window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank');};
  const email=recipe=>{const msg=formatRecipeShare(recipe,isHe);window.open(`mailto:?subject=${encodeURIComponent(recipe.name)}&body=${encodeURIComponent(msg)}`,'_blank');};

  const handleAddToDay=(recipe,qty=1,unit="מנות")=>{
    const isByServing=unit==="מנות"||unit==="יח׳";
    const factor=isByServing?qty:qty/100;
    const unitLabel=isByServing?(qty===1?(isHe?"מנה":"serving"):`${qty} ${unit}`):`${qty}${unit}`;
    onAddToDay({uid:Date.now()+Math.random(),label:`📖 ${recipe.name} (${unitLabel})`,
      kcal:Math.round((recipe.kcalPerPerson||0)*factor),
      carbs:parseFloat(((recipe.carbsPerPerson||0)*factor).toFixed(1)),
      protein:parseFloat(((recipe.proteinPerPerson||0)*factor).toFixed(1)),
      fat:parseFloat(((recipe.fatPerPerson||0)*factor).toFixed(1))});
    onClose();
  };

  const filtered=search.trim()?recipes.filter(r=>r.name.toLowerCase().includes(search.toLowerCase())):recipes;

  if(showAdd||editRecipe){
    return <AddEditRecipeModal recipe={editRecipe} lang={lang} onAddToDay={e=>{onAddToDay(e);onClose();}}
      onClose={()=>{setShowAdd(false);setEditRecipe(null);}}
      onSave={r=>{const updated=editRecipe?recipes.map(x=>x.id===r.id?r:x):[r,...recipes];save(updated);setShowAdd(false);setEditRecipe(null);}}/>;
  }

  return(
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide" style={{maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:15,fontWeight:700}}>📖 {isHe?"ספר מתכונים":"My Recipes"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={isHe?"חפש מתכון...":"Search recipes..."} className="inp" style={{marginBottom:10}}/>
        <button onClick={()=>setShowAdd(true)} style={{width:"100%",background:"transparent",border:`1px dashed ${C.border}`,borderRadius:10,padding:10,fontSize:12,color:C.accent,cursor:"pointer",marginBottom:12,fontWeight:700}}>
          + {isHe?"הוסף מתכון":"Add Recipe"}
        </button>
        {filtered.length===0
          ?<div style={{textAlign:"center",color:C.muted,padding:30,fontSize:13}}>{isHe?"אין עדיין מתכונים":"No recipes yet"}</div>
          :filtered.map(recipe=>(
            <RecipeCard key={recipe.id} recipe={recipe} isHe={isHe}
              open={openId===recipe.id} onToggle={()=>setOpenId(openId===recipe.id?null:recipe.id)}
              onEdit={()=>setEditRecipe(recipe)} onDelete={()=>remove(recipe.id)}
              onShare={()=>share(recipe)} onEmail={()=>email(recipe)}
              onAddToDay={(qty,unit)=>handleAddToDay(recipe,qty,unit)}
              onSaveToDb={()=>saveAsQuickFood(recipe)}
              onSaveQuickFood={()=>saveToQuickFoods(recipe)}/>
          ))
        }
      </div>
      {pendingFav&&<SaveFavNameSheet defaultName={pendingFav.label} onConfirm={name=>{onSaveQuickFood?.({...pendingFav,label:name});setPendingFav(null);}} onClose={()=>setPendingFav(null)}/>}
    </div>
  );
}

// ── MealPlannerModal ───────────────────────────────────────────────────────────
const API="https://nutrition-ai.lior0gal.workers.dev";
const FRIDGE_CATS=[
  {key:"cheeses", he:"גבינות",       en:"Cheeses"},
  {key:"veggies", he:"ירקות ופירות", en:"Vegetables & Fruits"},
  {key:"protein", he:"חלבון",        en:"Protein"},
  {key:"legumes", he:"קטניות",       en:"Legumes"},
  {key:"carbs",   he:"פחמימה",       en:"Carbs"},
  {key:"nuts",    he:"פיצוחים",      en:"Nuts & Seeds"},
  {key:"spices",  he:"תבלינים",      en:"Spices"},
  {key:"other",   he:"אחר",          en:"Other"},
];
const loadFridge=()=>{try{return JSON.parse(localStorage.getItem("nutrition_fridge")||"{}");}catch{return {};}};
const saveFridgeLS=f=>localStorage.setItem("nutrition_fridge",JSON.stringify(f));

function MealPlannerModal({onAdd,onClose,lang,profile,onSaveRecipe}){
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
  const [notes,setNotes]=useState("");
  const [showJsonInput,setShowJsonInput]=useState(false);
  const [jsonText,setJsonText]=useState("");
  const [jsonError,setJsonError]=useState("");
  const [error,setError]=useState("");
  const syncFridgeFromPantry=(base)=>{
    const p=loadPantry();
    const merged={...base};
    FRIDGE_CATS.forEach(c=>{
      const pNames=(p[c.key]||[]).map(i=>i.name);
      const existing=base[c.key]||[];
      const combined=[...existing,...pNames.filter(n=>!existing.includes(n))];
      if(combined.length) merged[c.key]=combined;
    });
    return merged;
  };
  const [fridge,setFridge]=useState(()=>syncFridgeFromPantry(loadFridge()));
  const [fridgeIn,setFridgeIn]=useState(()=>Object.fromEntries(FRIDGE_CATS.map(c=>[c.key,""])));
  const [fridgeOpen,setFridgeOpen]=useState(()=>Object.fromEntries(FRIDGE_CATS.map(c=>[c.key,false])));
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
  const resyncFromPantry=()=>{const synced=syncFridgeFromPantry(fridge);setFridge(synced);saveFridgeLS(synced);};
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

  const BASE_INGS=['שמן','מלח','פלפל שחור','סוכר','אבקת אפייה','סודה לשתייה','מים','חומץ'];
  const fridgeFlat=FRIDGE_CATS.flatMap(c=>(fridge[c.key]||[]).map(s=>s.toLowerCase()));
  const isMissing=name=>{
    const n=name.toLowerCase();
    if(BASE_INGS.some(b=>n===b||n.startsWith(b+' ')))return false;
    // Build search list: Hebrew originals + English translations when available
    const enValues=Object.values(fridgeTrans).map(s=>s.toLowerCase());
    const searchList=[...fridgeFlat,...enValues];
    return!searchList.some(f=>f.includes(n)||n.includes(f));
  };
  const getMissing=opt=>(opt.ingredients||[]).filter(isMissing);
  const [cartMsg,setCartMsg]=useState("");
  const [fridgeTrans,setFridgeTrans]=useState({});
  const addMissingToCart=missing=>{
    if(!missing||!missing.length)return;
    const current=loadShopping();
    const toAdd=missing.filter(m=>!current.some(c=>c.name.toLowerCase()===m.toLowerCase()));
    if(!toAdd.length){setCartMsg(isHe?"✓ כבר ברשימה":"✓ Already in list");setTimeout(()=>setCartMsg(""),2000);return;}
    saveShopping([...current,...toAdd.map(m=>({id:Date.now()+Math.random(),name:m,qty:'',checked:false,auto:false,addedBy:''}))]);
    setCartMsg(isHe?`✓ ${toAdd.length} פריטים נוספו לעגלה`:`✓ ${toAdd.length} item${toAdd.length>1?'s':''} added`);
    setTimeout(()=>setCartMsg(""),2500);
  };
  const fetchOptions=async(refine, exclude=[])=>{
    setLoading(true);setError("");
    const fridgeStr=buildFridgeStr();
    const fullPrefs=[prefs,notes?(isHe?`הערות: ${notes}`:`Notes: ${notes}`):"",fridgeStr?(isHe?`מה במקרר: ${fridgeStr}`:`Fridge: ${fridgeStr}`):""].filter(Boolean).join("\n");
    try{
      const r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({mealPlan:{preferences:fullPrefs,people,refine:refine||undefined,exclude:exclude.length?exclude:undefined,lang}})});
      const d=await r.json();
      if(d.error)throw new Error(d.error);
      setOptions(d.options||[]);
      if(d.translatedFridge) setFridgeTrans(d.translatedFridge);
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
        body:JSON.stringify({mealPlan:{selectedMeal:optionName,people,lang}})});
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
        {cartMsg&&<div style={{background:"#f0fae8",border:`1px solid ${C.accent}`,borderRadius:8,padding:"7px 12px",fontSize:12,color:C.accent,fontWeight:600,marginBottom:10,textAlign:"center"}}>{cartMsg}</div>}

        {/* Step indicator */}
        <div style={{display:"flex",gap:6,marginBottom:20}}>
          {[isHe?"העדפות":"Preferences",isHe?"אפשרויות":"Options",isHe?"מתכון":"Recipe"].map((s,i)=>(
            <div key={i} style={{flex:1,height:4,borderRadius:2,background:step>i?C.accent:"rgba(148,163,184,.25)"}}/>
          ))}
        </div>

        {/* Step 1 */}
        {step===1&&(()=>{
          const COND_MAP={t2d:"סוכרת סוג 2",t1d:"סוכרת סוג 1",prediab:"טרום סכרת",menopause:"גיל המעבר",hyper:"יתר לחץ דם",chol:"כולסטרול גבוה",meta:"תסמונת מטבולית",kidney:"מחלת כליות",heart:"מחלת לב"};
          const DIET_MAP={veg:"צמחוני",vegan:"טבעוני",gf:"ללא גלוטן",lf:"ללא לקטוז",kosher:"כשר",lowsodium:"דל נתרן",keto:"קטוגני"};
          const profileChips=[
            ...(profile?.conditions||[]).map(c=>COND_MAP[c]||c),
            ...(profile?.dietPrefs||[]).map(d=>DIET_MAP[d]||d),
            ...(profile?.dietText?[profile.dietText]:[]),
          ];
          const toggleChip=chip=>{
            const current=prefs.split(',').map(s=>s.trim()).filter(Boolean);
            const idx=current.indexOf(chip);
            if(idx>=0) setPrefs(current.filter((_,i)=>i!==idx).join(', '));
            else setPrefs([...current,chip].join(', '));
          };
          const activePrefs=prefs.split(',').map(s=>s.trim()).filter(Boolean);
          return(<>
          <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{isHe?"העדפות תזונה (רשות)":"Dietary preferences (optional)"}</div>
          <div style={{display:"flex",gap:6,marginBottom:profileChips.length?6:12}}>
            <textarea value={prefs} onChange={e=>setPrefs(e.target.value)}
              placeholder={isHe?"ללא גלוטן, טבעוני, דל פחמימות...":"gluten-free, vegan, low carb..."}
              rows={1} className="inp" style={{flex:1,resize:"none"}}/>
            <button onClick={savePref} title={isHe?"שמור העדפה":"Save preference"}
              style={{background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"0 10px",cursor:"pointer",fontSize:14,flexShrink:0}}>💾</button>
          </div>
          {profileChips.length>0&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
              {profileChips.map(chip=>{
                const active=activePrefs.includes(chip);
                return(
                  <button key={chip} onClick={()=>toggleChip(chip)}
                    style={{background:active?"rgba(13,148,136,.18)":"rgba(148,163,184,.1)",border:`1px solid ${active?"rgba(13,148,136,.45)":"rgba(148,163,184,.3)"}`,borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:600,color:active?C.accent:C.muted,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
                    {active?"✓ ":""}{chip}
                  </button>
                );
              })}
            </div>
          )}
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
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>🥗 {isHe?"מה במקרר?":"What's in the fridge?"}</div>
            <button onClick={resyncFromPantry} style={{background:'none',border:`1px solid ${C.accent}`,borderRadius:8,color:C.accent,fontSize:11,fontWeight:600,padding:'4px 10px',cursor:'pointer',fontFamily:'inherit'}}>🔄 {isHe?'עדכן ממזווה':'Sync pantry'}</button>
          </div>
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
                      {!isHe&&fridgeTrans[item]?fridgeTrans[item]:item}
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
          {/* Notes field */}
          <div style={{fontSize:11,color:C.muted,marginBottom:4,marginTop:4}}>{isHe?"הערות והארות לקלוד (רשות)":"Notes for Claude (optional)"}</div>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)}
            placeholder={isHe?"למשל: לא יכולה לאכול בשר היום, משהו קל וקצר הכנה...":"e.g. no meat today, something quick to prepare..."}
            rows={2} className="inp" style={{resize:"none",marginBottom:16,fontSize:12}}/>

          {error&&<div style={{color:C.danger,fontSize:12,marginBottom:8}}>{error}</div>}
          {loading&&<div style={{textAlign:'center',marginBottom:8}}><CalcLoader size={64}/></div>}
          <button onClick={()=>fetchOptions()} disabled={loading} className="btn-accent" style={{borderRadius:12}}>
            {loading?(isHe?"מחפש...":"Searching..."):(isHe?"✨ קבל הצעות":"✨ Get suggestions")}
          </button>

          {/* Manual JSON input */}
          <button onClick={()=>{setShowJsonInput(v=>!v);setJsonError("");}}
            style={{background:"none",border:"none",color:C.muted,fontSize:11,cursor:"pointer",marginTop:10,padding:0,fontFamily:"inherit",textDecoration:"underline"}}>
            {isHe?"📋 הזן JSON ידנית מקלוד":"📋 Paste Claude JSON manually"}
          </button>
          {showJsonInput&&<>
            <textarea value={jsonText} onChange={e=>setJsonText(e.target.value)}
              placeholder={isHe?'הדבק כאן JSON מקלוד\n{"options":[...]} או {"recipe":{...}}':'Paste Claude JSON here\n{"options":[...]} or {"recipe":{...}}'}
              rows={5} className="inp" style={{resize:"vertical",marginTop:6,fontSize:11,fontFamily:"monospace"}}/>
            {jsonError&&<div style={{color:C.danger,fontSize:11,marginTop:4}}>{jsonError}</div>}
            <button onClick={()=>{
              setJsonError("");
              try{
                const d=JSON.parse(jsonText.trim());
                if(d.options&&Array.isArray(d.options)){
                  setOptions(d.options);
                  if(d.translatedFridge) setFridgeTrans(d.translatedFridge);
                  setStep(2);setShowJsonInput(false);
                }else if(d.recipe){
                  setRecipe(d.recipe);
                  setStep(3);setShowJsonInput(false);
                }else{
                  setJsonError(isHe?"JSON לא תקין — צפוי {options:[...]} או {recipe:{...}}":"Invalid JSON — expected {options:[...]} or {recipe:{...}}");
                }
              }catch(e){setJsonError((isHe?"שגיאת JSON: ":"JSON error: ")+e.message);}
            }} className="btn-accent" style={{borderRadius:12,marginTop:6}}>
              {isHe?"📥 טען":"📥 Load"}
            </button>
          </>}
        </>);})()}

        {/* Step 2 — Options */}
        {step===2&&<>
          {error&&<div style={{background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:8,padding:"8px 12px",fontSize:12,color:C.danger,marginBottom:10}}>{error}</div>}
          {options.map((opt,i)=>{
            const missing=getMissing(opt);
            return(
            <div key={i} style={{background:"rgba(255,255,255,.7)",border:`1px solid rgba(148,163,184,.25)`,borderRadius:16,padding:14,marginBottom:10,position:'relative'}}>
              {/* Cart icon — top-left, always visible */}
              <button onClick={()=>addMissingToCart(missing)} title={isHe?'הוסף חסרים לעגלה':'Add missing to cart'}
                style={{position:'absolute',top:10,left:10,background:'none',border:'none',cursor:'pointer',padding:0,lineHeight:1,opacity:missing.length?1:0.35}}>
                <img src="/Nutrition/shopping-cart.png" style={{width:20,height:20,objectFit:'contain'}} alt=""/>
              </button>
              <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4,paddingRight:4,paddingLeft:30}}>{opt.name}</div>
              <div style={{fontSize:12,color:C.muted,marginBottom:8}}>{opt.description}</div>
              <div style={{display:"flex",gap:8,marginBottom:6}}>
                {[{l:isHe?"קק״ל":"kcal",v:opt.kcalPerPerson,c:C.accent},
                  {l:isHe?"פחמ׳":"carbs",v:opt.carbsPerPerson,c:C.warn},
                  {l:isHe?"חלבון":"prot",v:opt.proteinPerPerson,c:C.blue}].map(({l,v,c})=>(
                  <div key={l} style={{flex:1,background:`${c}11`,borderRadius:8,padding:"4px 6px",textAlign:"center"}}>
                    <div style={{fontSize:13,fontWeight:700,color:c}}>{Math.round(v||0)}</div>
                    <div style={{fontSize:9,color:C.muted}}>{l}/{isHe?"אדם":"person"}</div>
                  </div>
                ))}
              </div>
              {(opt.ingredients||[]).length>0&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
                  {(opt.ingredients||[]).map(ing=>{
                    const m=isMissing(ing);
                    return(
                      <span key={ing} style={{fontSize:11,padding:"3px 8px",borderRadius:12,
                        background:m?"rgba(153,27,27,.08)":"rgba(13,148,136,.08)",
                        color:m?"#991b1b":C.accent,
                        border:`1px solid ${m?"rgba(153,27,27,.25)":"rgba(13,148,136,.25)"}`,
                        fontWeight:m?700:400}}>
                        {m?"✗ ":"✓ "}{ing}
                      </span>
                    );
                  })}
                </div>
              )}
              <button onClick={()=>fetchRecipe(opt.name)} disabled={loading}
                style={{width:"100%",background:C.accent,border:"none",borderRadius:10,color:"#fff",padding:"9px",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                {loading&&selected===opt.name?(isHe?"טוען...":"Loading..."):(isHe?"בחר":"Select")}
              </button>
            </div>
            );
          })}
          {/* More ideas + Refine */}
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <button onClick={()=>fetchOptions(undefined,options.map(o=>o.name))} disabled={loading}
              style={{flex:1,background:"rgba(13,148,136,.08)",border:`1px solid rgba(13,148,136,.3)`,borderRadius:10,padding:"8px",fontSize:12,color:C.accent,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
              {loading?(isHe?"מחפש...":"Searching..."):(isHe?"💡 עוד רעיונות":"💡 More ideas")}
            </button>
            <button onClick={()=>setShowRefine(v=>!v)}
              style={{flex:1,background:showRefine?"rgba(148,163,184,.1)":"none",border:`1px solid ${C.border}`,borderRadius:10,padding:"8px",fontSize:12,color:C.muted,cursor:"pointer",fontFamily:"inherit"}}>
              {isHe?"🔍 דייקי":"🔍 Refine"} {showRefine?"↑":"↓"}
            </button>
          </div>
          {showRefine&&<>
            <textarea value={refineText} onChange={e=>setRefineText(e.target.value)}
              placeholder={isHe?"מה לשנות? למשל: משהו קל יותר, ללא בשר...":"What to change? e.g. something lighter, no meat..."}
              rows={2} className="inp" style={{marginBottom:8,resize:"none"}}/>
            {loading&&<div style={{textAlign:'center',marginBottom:8}}><CalcLoader size={64}/></div>}
            <button onClick={()=>fetchOptions(refineText,options.map(o=>o.name))} disabled={loading} className="btn-accent" style={{borderRadius:10}}>
              {loading?(isHe?"מחפש...":"Searching..."):(isHe?"✨ עדכן הצעות":"✨ Update")}
            </button>
          </>}
          {error&&<div style={{color:C.danger,fontSize:12,marginTop:8}}>{error}</div>}
        </>}

        {/* Step 3 — Recipe */}
        {step===3&&recipe&&<>
          {!showIngEdit ? <>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3}}>
              <div style={{fontSize:14,fontWeight:900,color:C.text,flex:1}}>{recipe.name}</div>
              {(()=>{const m=(recipe.ingredients||[]).filter(ing=>isMissing(ing.item)).map(ing=>ing.item);return<button onClick={()=>addMissingToCart(m)} title={isHe?'הוסף חסרים לעגלה':'Add missing to cart'} style={{background:'none',border:'none',cursor:'pointer',padding:'0 4px',flexShrink:0,lineHeight:1,opacity:m.length?1:0.35}}><img src="/Nutrition/shopping-cart.png" style={{width:22,height:22,objectFit:'contain'}} alt=""/></button>})()}
            </div>
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
                <button onClick={()=>{setStep(2);setRecipe(null);}} className="btn-muted" style={{flex:1,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>{isHe?<><span>→</span><span>חזרה</span></>:"← Back"}</button>
                <button onClick={()=>addToDay()} className="btn-accent" style={{flex:2,borderRadius:10}}>{isHe?"+ הוסף ליומן היום":"+ Add to today"}</button>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={openIngEdit} style={{flex:1,background:"none",border:`1px solid ${C.accent}`,color:C.accent,borderRadius:10,padding:"9px",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                  {isHe?"✏️ עם שינויים":"✏️ Modify"}
                </button>
                <button onClick={()=>saveToDb()} style={{flex:1,background:savedToDb?"rgba(13,148,136,.12)":"none",border:`1px solid ${savedToDb?C.accent:C.border}`,color:savedToDb?C.accent:C.muted,borderRadius:10,padding:"9px",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                  {savedToDb?(isHe?"✓ נשמר":"✓ Saved"):(isHe?"💾 מאגר":"💾 DB")}
                </button>
                <button onClick={()=>{
                  const r={id:`recipe_${Date.now()}`,name:recipe.name,servings:people,source:'claude',
                    ingredients:(recipe.ingredients||[]).map(i=>({item:i.item,amount:i.amount,unit:''})),
                    steps:recipe.steps||[],kcalPerPerson:recipe.kcalPerPerson||0,
                    carbsPerPerson:recipe.carbsPerPerson||0,proteinPerPerson:recipe.proteinPerPerson||0,
                    fatPerPerson:recipe.fatPerPerson||0,savedAt:new Date().toISOString()};
                  onSaveRecipe&&onSaveRecipe(r);
                }} style={{flex:1,background:"rgba(99,102,241,.08)",border:"1px solid rgba(99,102,241,.3)",color:"#6366f1",borderRadius:10,padding:"9px",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                  📖 {isHe?"ספר":"Book"}
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
              <button onClick={()=>setShowIngEdit(false)} className="btn-muted" style={{flex:1,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>{isHe?<><span>→</span><span>חזרה</span></>:"← Back"}</button>
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

// ── HouseholdWelcome ──────────────────────────────────────────────────────────
function HouseholdWelcome({householdName,cfg,onDone,lang}){
  const isHe=(lang||'he')!=='en';
  return(
    <div style={{position:'fixed',top:0,right:0,bottom:0,left:0,zIndex:9999,background:'linear-gradient(150deg,#edfad5 0%,#bde890 52%,#92d045 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
      {/* bg circles */}
      <div style={{position:'absolute',top:-100,right:-100,width:320,height:320,borderRadius:'50%',background:'rgba(255,255,255,.18)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:-80,left:-80,width:280,height:280,borderRadius:'50%',background:'rgba(255,255,255,.13)',pointerEvents:'none'}}/>
      {/* content */}
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <div style={{fontSize:48,fontWeight:900,color:'#1e4a06',animation:'welcomeUp 0.5s ease 0.1s both',marginBottom:4,letterSpacing:'-0.5px',textShadow:'0 2px 12px rgba(255,255,255,.6)'}}>
          {isHe?'ברוכים הבאים!':'Welcome!'}
        </div>
        <div style={{position:'relative',width:260,height:260,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 0 -8px'}}>
          {[0,.8,1.6].map((d,i)=>(
            <div key={i} style={{position:'absolute',width:220,height:220,borderRadius:'50%',border:'2px solid rgba(90,158,30,.28)',animation:`ringOut 2.4s ${d}s ease-out infinite`,pointerEvents:'none'}}/>
          ))}
          <div style={{animation:'avoBounceIn 0.9s cubic-bezier(0.34,1.56,0.64,1) both',position:'relative',zIndex:2}}>
            <div style={{animation:'avoBob 3.2s ease-in-out 1s infinite',filter:'drop-shadow(0 10px 28px rgba(80,160,10,.4))'}}>
              <div style={{width:240,height:240,borderRadius:'50%',background:'#c8e89a',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <video src="/Nutrition/avo-cart.mp4" autoPlay loop muted playsInline
                  style={{width:260,height:260,objectFit:'contain',mixBlendMode:'multiply',display:'block'}}/>
              </div>
            </div>
          </div>
        </div>
        <div style={{fontSize:26,fontWeight:900,color:'#1e4a06',letterSpacing:'-0.5px',textShadow:'0 2px 10px rgba(255,255,255,.6)',animation:'welcomeUp 0.6s ease 0.8s both',textAlign:'center',padding:'0 20px',marginBottom:10}}>
          {isHe?`בית ${householdName}`:householdName}
        </div>
        <div style={{fontSize:13,color:'#4a7a10',animation:'welcomeUp 0.5s ease 1.2s both',display:'flex',alignItems:'center',gap:8}}>
          <span style={{width:8,height:8,borderRadius:'50%',background:'#5a9e1e',boxShadow:'0 0 8px rgba(90,158,30,.6)',display:'inline-block',animation:'glowPulse 1.4s ease-in-out infinite'}}/>
          {isHe?'משק הבית שלכם מוכן!':'Your household is ready!'}
        </div>
      </div>
      {/* bottom button */}
      <div style={{width:'100%',padding:'0 24px',paddingBottom:'calc(32px + env(safe-area-inset-bottom))',flexShrink:0}}>
        <button onClick={()=>onDone(cfg)} style={{width:'100%',background:'linear-gradient(135deg,#5a9e1e,#3d7a0a)',border:'none',borderRadius:16,color:'#fff',padding:'16px',fontSize:17,fontWeight:800,cursor:'pointer',fontFamily:'inherit',letterSpacing:0.3,boxShadow:'0 4px 20px rgba(30,74,6,.35)'}}>
          {isHe?'מתחילים':'Let\'s go'}
        </button>
      </div>
    </div>
  );
}
// ── HouseholdModal ────────────────────────────────────────────────────────────
function HouseholdModal({householdCfg,onConnect,onHouseholdReady,onLeave,onClose,onWelcome,lang}){
  const isHe=(lang||'he')!=='en';
  const connected=!!householdCfg;
  const[tab,setTab]=useState(connected?'connected':'create');
  const[memberName,setMemberName]=useState(householdCfg?.memberName||'');
  const[householdName,setHouseholdName]=useState(householdCfg?.householdName||'');
  const[configText,setConfigText]=useState('');
  const[joinCode,setJoinCode]=useState('');
  const[createStep,setCreateStep]=useState(1);
  const[showScreenshot,setShowScreenshot]=useState(null);
  const[projectIdInput,setProjectIdInput]=useState('');
  const[autoProgress,setAutoProgress]=useState(null);
  const[autoError,setAutoError]=useState('');
  const[useManual,setUseManual]=useState(false);
  const autoSuccessCfgRef=useRef(null);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState('');
  const[copied,setCopied]=useState(false);
  const[members,setMembers]=useState({});
  const[confirmLeave,setConfirmLeave]=useState(false);
  const[showQR,setShowQR]=useState(false);
  const[qrSvg,setQrSvg]=useState('');
  const[syncLabel,setSyncLabel]=useState('');

  useEffect(()=>{
    if(!householdCfg||!_fbDb||!_fbOnValue||!_fbRefFn)return;
    const unsub=_fbOnValue(_fbRefFn(_fbDb,`households/${_householdId}/members`),snap=>{
      setMembers(snap.val()||{});
    });
    return()=>unsub();
  },[householdCfg]);

  // Last sync label — updates every 15s
  useEffect(()=>{
    if(!householdCfg)return;
    const update=()=>{
      if(!_lastSyncAt){setSyncLabel('');return;}
      const s=Math.round((Date.now()-_lastSyncAt)/1000);
      if(s<60)setSyncLabel(isHe?`סונכרן לפני ${s} שניות`:`Synced ${s}s ago`);
      else setSyncLabel(isHe?`סונכרן לפני ${Math.round(s/60)} דקות`:`Synced ${Math.round(s/60)}m ago`);
    };
    update();
    const id=setInterval(update,15000);
    return()=>clearInterval(id);
  },[householdCfg,isHe]);

  const genId=()=>{
    const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({length:8},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
  };

  const getDeviceId=()=>{
    let id=ls.get('nutrition_device_id');
    if(!id){id=Date.now().toString(36)+Math.random().toString(36).slice(2);ls.set('nutrition_device_id',id);}
    return id;
  };

  const registerMember=async(hid,name)=>{
    if(!_fbDb)return;
    const did=getDeviceId();
    await _fbSet(_fbRefFn(_fbDb,`households/${hid}/members/${did}`),{name,joinedAt:Date.now()}).catch(()=>{});
  };

  const parseConfig=text=>{
    // Normalize JS object literal → JSON (handle unquoted keys and single quotes)
    let s=text.trim();
    if(!s.startsWith('{'))s='{'+s;
    if(!s.endsWith('}'))s=s+'}';
    s=s.replace(/([{,]\s*)([a-zA-Z_]\w*)\s*:/g,'$1"$2":').replace(/'/g,'"');
    return JSON.parse(s);
  };

  const handleCreate=async()=>{
    if(!memberName.trim()){setError(isHe?'נא להזין שם':'Please enter your name');return;}
    let cfg;
    try{cfg=parseConfig(configText);}catch{setError(isHe?'הגדרות Firebase לא תקינות':'Invalid Firebase config');return;}
    if(!cfg.apiKey||!cfg.databaseURL){setError(isHe?'חסרים שדות: apiKey ו-databaseURL':'Missing: apiKey and databaseURL');return;}
    setLoading(true);setError('');
    const hid=genId();
    const newCfg={firebaseConfig:cfg,householdId:hid,memberName:memberName.trim(),householdName:householdName.trim()||memberName.trim()};
    const ok=await _fbInit(newCfg);
    if(!ok){setError(isHe?'שגיאה בחיבור ל-Firebase':'Firebase connection error');setLoading(false);return;}
    registerMember(hid,memberName.trim()).catch(()=>{});
    ls.set('nutrition_household',newCfg);
    const sc=btoa(unescape(encodeURIComponent(JSON.stringify({firebaseConfig:cfg,householdId:hid,householdName:newCfg.householdName}))));
    onWelcome?.({householdName:newCfg.householdName,sharingCode:sc,cfg:newCfg});
    setLoading(false);
  };

  const AUTO_STEPS=[
    {key:'auth',   he:'מתחבר לחשבון Google',      en:'Signing into Google'},
    {key:'project',he:'מאמת פרויקט Firebase',      en:'Verifying Firebase project'},
    {key:'database',he:'יוצר Realtime Database',   en:'Creating Realtime Database'},
    {key:'webapp', he:'יוצר Web App',              en:'Creating Web App'},
    {key:'config', he:'מקבל הגדרות Firebase',      en:'Getting Firebase config'},
  ];

  const handleAutoSetup=async()=>{
    if(!memberName.trim()){setError(isHe?'נא להזין שם':'Enter your name');return;}
    if(!projectIdInput.trim()){setError(isHe?'נא להזין Project ID':'Enter Project ID');return;}
    setError('');setAutoError('');
    const completed=[];
    setAutoProgress({current:'auth',completed});
    try{
      const cfg=await autoSetupHousehold(projectIdInput.trim(),(step)=>{
        completed.push(step==='auth'?null:AUTO_STEPS[AUTO_STEPS.findIndex(s=>s.key===step)-1]?.key);
        setAutoProgress({current:step,completed:[...completed].filter(Boolean)});
      });
      const hid=genId();
      const newCfg={firebaseConfig:cfg,householdId:hid,memberName:memberName.trim(),householdName:householdName.trim()||memberName.trim()};
      ls.set('nutrition_household',newCfg);
      autoSuccessCfgRef.current=newCfg;
      const sc=btoa(unescape(encodeURIComponent(JSON.stringify({firebaseConfig:cfg,householdId:hid,householdName:newCfg.householdName}))));
      setAutoProgress(null);
      onWelcome?.({householdName:newCfg.householdName,sharingCode:sc,cfg:newCfg});
      // Init Firebase + register member in background (non-blocking)
      _fbInit(newCfg).then(ok=>{if(ok)registerMember(hid,memberName.trim());}).catch(()=>{});
    }catch(e){
      setAutoError(e.message||(isHe?'שגיאה בהגדרה האוטומטית':'Auto setup failed'));
      setAutoProgress(null);
    }
  };

  const handleJoin=async()=>{
    if(!memberName.trim()){setError(isHe?'נא להזין שם':'Please enter your name');return;}
    if(!joinCode.trim()){setError(isHe?'נא להזין קוד הצטרפות':'Please enter join code');return;}
    let decoded;
    const rawCode=joinCode.trim().replace(/\s/g,'');
    try{
      try{decoded=JSON.parse(decodeURIComponent(escape(atob(rawCode))));}
      catch{decoded=JSON.parse(decodeURIComponent(atob(rawCode).split('').map(c=>'%'+c.charCodeAt(0).toString(16).padStart(2,'0')).join('')));}
    }catch{setError(isHe?'קוד הצטרפות לא תקין':'Invalid join code');return;}
    setLoading(true);setError('');
    try{
      const newCfg={...decoded,memberName:memberName.trim()};
      const ok=await _fbInit(newCfg);
      if(!ok){setError(isHe?'שגיאה בחיבור':'Connection error');setLoading(false);return;}
      registerMember(newCfg.householdId,memberName.trim()).catch(()=>{});
      ls.set('nutrition_household',newCfg);
      autoSuccessCfgRef.current=newCfg;
      const sc=btoa(unescape(encodeURIComponent(JSON.stringify({firebaseConfig:decoded.firebaseConfig,householdId:decoded.householdId,householdName:decoded.householdName}))));
      onWelcome?.({householdName:decoded.householdName||memberName.trim(),sharingCode:sc,cfg:newCfg});
    }catch(e){
      setError(isHe?'שגיאה בהצטרפות':'Join failed');
    }finally{
      setLoading(false);
    }
  };

  const getSharingCode=()=>{
    if(!householdCfg)return'';
    const{memberName:_mn,...shareData}=householdCfg;
    return btoa(unescape(encodeURIComponent(JSON.stringify(shareData))));
  };

  const copyCode=()=>{
    navigator.clipboard.writeText(getSharingCode()).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}).catch(()=>{});
  };

  const handleLeave=()=>{
    if(!confirmLeave){setConfirmLeave(true);setTimeout(()=>setConfirmLeave(false),3000);return;}
    ls.set('nutrition_household',null);
    _fbDb=null;_fbRefFn=null;_fbSet=null;_fbOnValue=null;_householdId=null;_memberName="";_lastSyncAt=0;
    onLeave();
  };

  const handleShowQR=async()=>{
    if(showQR){setShowQR(false);return;}
    try{
      const mod=await import('qrcode-svg');
      const QRCodeSVG=mod.default||mod;
      const svg=new QRCodeSVG({content:getSharingCode(),container:'svg-viewbox',width:200,height:200,color:'#0d9488',background:'#fff'}).svg();
      setQrSvg(svg);setShowQR(true);
    }catch(e){console.error(e);}
  };

  const btnStyle={flex:1,padding:"8px 0",fontSize:12,fontWeight:700,borderRadius:8,cursor:"pointer",border:"none",transition:"all .2s"};
  const inputStyle={width:"100%",boxSizing:"border-box",padding:"9px 10px",borderRadius:10,border:"1px solid rgba(148,163,184,.3)",fontSize:12,fontFamily:"inherit",background:"rgba(255,255,255,.8)",marginBottom:8};

  return(
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide" style={{maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:22}}>👥</span>
            {isHe?"משק בית משותף":"Shared Household"}
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#94a3b8"}}>×</button>
        </div>

        {!connected?(
          <>
            {/* Tabs */}
            <div style={{display:"flex",gap:6,marginBottom:16,background:"rgba(148,163,184,.1)",borderRadius:10,padding:4}}>
              {['create','join'].map(t=>(
                <button key={t} onClick={()=>{setTab(t);setError('');}}
                  style={{...btnStyle,flex:1,background:tab===t?"#fff":"transparent",color:tab===t?"#0d9488":"#94a3b8",boxShadow:tab===t?"0 1px 4px rgba(0,0,0,.08)":"none"}}>
                  {t==='create'?(isHe?'צור משק בית':'Create'):(isHe?'הצטרף':'Join')}
                </button>
              ))}
            </div>

            {tab==='create'?(()=>{
              const linkBtn={width:"100%",background:"rgba(13,148,136,.06)",border:"1px solid rgba(13,148,136,.2)",borderRadius:8,color:"#0d9488",padding:"9px 12px",fontSize:12,fontWeight:700,cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontFamily:"inherit"};
              const infoBtn={background:"rgba(13,148,136,.08)",border:"1px solid rgba(13,148,136,.2)",borderRadius:"50%",width:20,height:20,fontSize:11,color:"#0d9488",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit",flexShrink:0};
              const backBtn={...btnStyle,flex:1,background:"rgba(148,163,184,.1)",color:"#64748b",border:"1px solid rgba(148,163,184,.2)",padding:"9px"};
              const nextBtn={...btnStyle,flex:3,background:"linear-gradient(135deg,#14b8a6,#059669)",color:"#fff",padding:"9px"};
              return(<>
                {/* Progress bar */}
                <div style={{display:"flex",gap:4,marginBottom:14}}>
                  {[1,2].map(s=><div key={s} style={{flex:1,height:3,borderRadius:2,background:createStep>=s?"#0d9488":"rgba(148,163,184,.2)"}}/>)}
                </div>

                {/* Step 1: Create project */}
                {createStep===1&&<div className="fade">
                  <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>{isHe?"שלב 1 — צרו פרויקט Firebase":"Step 1 — Create a Firebase project"}</div>
                  <button onClick={()=>window.open('https://console.firebase.google.com','_blank')} style={linkBtn}>
                    🔗 {isHe?"פתחו את Firebase Console":"Open Firebase Console"}
                  </button>
                  <ol style={{fontSize:12,color:"#475569",lineHeight:2.2,margin:"4px 0 10px",paddingRight:18,paddingLeft:0}}>
                    <li>{isHe?'לחצו "Add project"':'Click "Add project"'}</li>
                    <li>{isHe?"תנו שם כלשהו לפרויקט":"Give your project any name"}</li>
                    <li>{isHe?"לחצו Continue עד הסוף":"Click Continue until done"}</li>
                  </ol>
                  <div style={{background:"rgba(13,148,136,.06)",border:"1px solid rgba(13,148,136,.2)",borderRadius:8,padding:"8px 12px",fontSize:11,color:"#0d9488",marginBottom:14}}>
                    📝 {isHe?"זכרו את ה-Project ID (למשל: my-project-abc123) — תצטרכו אותו בשלב הבא":"Remember your Project ID (e.g. my-project-abc123) — you'll need it in the next step"}
                  </div>
                  <button onClick={()=>setCreateStep(2)} style={{...nextBtn,flex:"unset",width:"100%",padding:"10px"}}>
                    {isHe?"✓ יצרתי פרויקט →":"✓ I created a project →"}
                  </button>
                </div>}

                {/* Step 2: Auto Setup */}
                {createStep===2&&<div className="fade">
                  <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>
                    {isHe?"שלב 2 — הגדרה אוטומטית":"Step 2 — Auto Setup"}
                  </div>

                  {!autoProgress&&!useManual&&<>
                    <input value={memberName} onChange={e=>setMemberName(e.target.value)}
                      placeholder={isHe?"השם שלך (יוצג בעגלה)":"Your name (shown in cart)"} style={inputStyle}/>
                    <input value={householdName} onChange={e=>setHouseholdName(e.target.value)}
                      placeholder={isHe?"שם משק הבית (למשל: משפחת לוי)":"Household name"} style={inputStyle}/>
                    <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>
                      {isHe?"Project ID של הפרויקט שיצרתם:":"Project ID of your Firebase project:"}
                    </div>
                    <input value={projectIdInput} onChange={e=>setProjectIdInput(e.target.value)}
                      placeholder="my-project-abc123"
                      style={{...inputStyle,fontFamily:"monospace",direction:"ltr",textAlign:"left"}}/>
                    <div style={{fontSize:10,color:C.muted,marginBottom:10}}>
                      {isHe?"נמצא ב-Firebase Console ← שם הפרויקט ← Project settings":"Found in Firebase Console → your project → Project settings"}
                    </div>
                    {error&&<div style={{color:"#dc2626",fontSize:11,marginBottom:8}}>{error}</div>}
                    <div style={{display:"flex",gap:8,marginBottom:8}}>
                      <button onClick={()=>setCreateStep(1)} style={backBtn}>←</button>
                      <button onClick={handleAutoSetup} style={{...nextBtn,background:"linear-gradient(135deg,#4f46e5,#0d9488)"}}>
                        🚀 {isHe?"Sign in with Google & הגדר":"Sign in with Google & Setup"}
                      </button>
                    </div>
                    <button onClick={()=>setUseManual(true)} style={{background:"none",border:"none",fontSize:11,color:C.muted,cursor:"pointer",textDecoration:"underline",width:"100%",textAlign:"center"}}>
                      {isHe?"הגדרה ידנית במקום":"Manual setup instead"}
                    </button>
                  </>}

                  {/* Auto progress display */}
                  {autoProgress&&<div style={{display:"flex",flexDirection:"column",gap:10,padding:"8px 0"}}>
                    {AUTO_STEPS.map(({key,he,en})=>{
                      const done=autoProgress.completed?.includes(key);
                      const active=autoProgress.current===key;
                      return(
                        <div key={key} style={{display:"flex",alignItems:"center",gap:10,opacity:(!done&&!active)?.4:1}}>
                          <span style={{width:22,height:22,borderRadius:"50%",background:done?"#0d9488":active?"rgba(13,148,136,.15)":"rgba(148,163,184,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>
                            {done?"✓":active?<span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⟳</span>:"○"}
                          </span>
                          <span style={{fontSize:12,color:done?C.accent:active?C.text:C.muted,fontWeight:done||active?600:400}}>{isHe?he:en}</span>
                        </div>
                      );
                    })}
                    {autoProgress.current===null&&<div style={{marginTop:6,fontSize:13,fontWeight:700,color:C.accent}}>✅ {isHe?"הכל מוכן!":"All done!"}</div>}
                  </div>}

                  {autoError&&<>
                    <div style={{color:"#dc2626",fontSize:11,background:"rgba(220,38,38,.06)",borderRadius:8,padding:"8px 10px",marginBottom:10}}>{autoError}</div>
                    <button onClick={()=>{setAutoError('');setAutoProgress(null);}} style={{...backBtn,width:"100%",marginBottom:6}}>{isHe?"נסה שוב":"Try again"}</button>
                    <button onClick={()=>setUseManual(true)} style={{background:"none",border:"none",fontSize:11,color:C.muted,cursor:"pointer",textDecoration:"underline",width:"100%",textAlign:"center"}}>{isHe?"הגדרה ידנית במקום":"Switch to manual setup"}</button>
                  </>}

                  {/* Welcome screen after successful setup */}

                  {/* Manual fallback */}
                  {useManual&&<>
                    <div style={{fontSize:11,color:C.muted,marginBottom:8,background:"rgba(13,148,136,.04)",borderRadius:8,padding:"8px 10px"}}>
                      {isHe?"הגדרה ידנית: עקבו אחרי השלבים ב-Firebase Console והדביקו את הconfig למטה":"Manual setup: follow the steps in Firebase Console and paste the config below"}
                    </div>
                    <input value={memberName} onChange={e=>setMemberName(e.target.value)} placeholder={isHe?"השם שלך":"Your name"} style={inputStyle}/>
                    <input value={householdName} onChange={e=>setHouseholdName(e.target.value)} placeholder={isHe?"שם משק הבית":"Household name"} style={inputStyle}/>
                    <div style={{fontFamily:"monospace",fontSize:11,color:"#64748b",background:"#f5f5f7",borderRadius:"8px 8px 0 0",padding:"6px 10px",border:"1px solid rgba(148,163,184,.25)",borderBottom:"none"}}>const firebaseConfig = {'{'}</div>
                    <textarea value={configText} onChange={e=>setConfigText(e.target.value)}
                      placeholder={"  apiKey: \"AIza...\",\n  authDomain: \"...\",\n  databaseURL: \"https://...\",\n  projectId: \"...\",\n  storageBucket: \"...\",\n  messagingSenderId: \"...\",\n  appId: \"...\""}
                      style={{...inputStyle,height:100,resize:"vertical",fontFamily:"monospace",fontSize:11,borderRadius:0,borderTop:"none",borderBottom:"none",marginBottom:0}}/>
                    <div style={{fontFamily:"monospace",fontSize:11,color:"#64748b",background:"#f5f5f7",borderRadius:"0 0 8px 8px",padding:"6px 10px",border:"1px solid rgba(148,163,184,.25)",borderTop:"none",marginBottom:4}}>{'};'}</div>
                    <div style={{fontSize:10,color:C.muted,marginBottom:8}}>{isHe?"העתיקו רק את השורות שבפנים — ללא { }":"Copy only inner lines — without { }"}</div>
                    {error&&<div style={{color:"#dc2626",fontSize:11,marginBottom:8}}>{error}</div>}
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>setUseManual(false)} style={backBtn}>←</button>
                      <button onClick={handleCreate} disabled={loading} style={nextBtn}>
                        {loading?(isHe?"מתחבר...":"Connecting..."):(isHe?"צור משק בית":"Create Household")}
                      </button>
                    </div>
                  </>}
                </div>}

                {/* Screenshot overlay */}
                {showScreenshot&&<div onClick={()=>setShowScreenshot(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
                  <div style={{position:"relative",maxWidth:300,width:"100%"}}>
                    <img src={showScreenshot==='step1'?"/Nutrition/fb-step1.png":"/Nutrition/fb-step2.png"} style={{width:"100%",borderRadius:12,display:"block"}} alt=""/>
                    {showScreenshot==='step1'&&<>
                      {/* White cover over "Lior" */}
                      <div style={{position:"absolute",background:"white",top:"37%",left:"44%",width:"30%",height:"7%",borderRadius:2}}/>
                      {/* Cover pink arrow + replace with teal styled arrow */}
                      <div style={{position:"absolute",background:"white",top:"11%",left:"5%",width:"48%",height:"9%"}}/>
                      <svg style={{position:"absolute",top:"11%",left:"5%",width:"48%",height:"9%"}} viewBox="0 0 110 24" fill="none">
                        <defs><marker id="a1" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto"><polygon points="8 0,0 3,8 6" fill="#0d9488"/></marker></defs>
                        <path d="M 100 12 C 80 5, 55 18, 15 12" stroke="#0d9488" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#a1)"/>
                      </svg>
                    </>}
                    {showScreenshot==='step2'&&<>
                      {/* Arrow pointing to Realtime Database from right */}
                      <svg style={{position:"absolute",top:"53%",right:"3%",width:"28%",height:"7%"}} viewBox="0 0 80 20" fill="none">
                        <defs><marker id="a2" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto"><polygon points="8 0,0 3,8 6" fill="#0d9488"/></marker></defs>
                        <path d="M 75 10 L 10 10" stroke="#0d9488" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#a2)"/>
                      </svg>
                    </>}
                    <div style={{textAlign:"center",color:"rgba(255,255,255,.7)",fontSize:11,marginTop:10}}>{isHe?"לחצו לסגירה":"Tap to close"}</div>
                  </div>
                </div>}
              </>);
            })():(
              <>
                <input value={memberName} onChange={e=>setMemberName(e.target.value)}
                  placeholder={isHe?"השם שלך (יוצג בעגלה)":"Your name (shown in cart)"}
                  style={inputStyle}/>
                <textarea value={joinCode} onChange={e=>setJoinCode(e.target.value)}
                  placeholder={isHe?"הדבק כאן את קוד ההצטרפות":"Paste the join code here"}
                  style={{...inputStyle,height:80,resize:"vertical",fontFamily:"monospace",fontSize:11}}/>
                {error&&<div style={{color:"#dc2626",fontSize:11,marginBottom:8}}>{error}</div>}
                <button onClick={handleJoin} disabled={loading}
                  style={{...btnStyle,width:"100%",background:"linear-gradient(135deg,#14b8a6,#059669)",color:"#fff",padding:"10px"}}>
                  {loading?(isHe?"מתחבר...":"Connecting..."):(isHe?"הצטרף למשק בית":"Join Household")}
                </button>
              </>
            )}
          </>
        ):(
          <>
            {/* Sharing code box */}
            <div style={{background:"rgba(13,148,136,.06)",borderRadius:12,padding:"12px 14px",marginBottom:14,border:"1px solid rgba(13,148,136,.15)"}}>
              <div style={{fontSize:11,color:"#64748b",marginBottom:8}}>{isHe?"קוד הצטרפות לשיתוף:":"Join code to share:"}</div>
              {householdCfg?.householdName&&<div style={{fontSize:13,fontWeight:700,color:"#0d9488",marginBottom:6}}>🏠 {householdCfg.householdName}</div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                <button onClick={copyCode}
                  style={{...btnStyle,background:copied?"rgba(13,148,136,.12)":"rgba(255,255,255,.9)",color:copied?"#0d9488":"#475569",border:"1px solid rgba(148,163,184,.3)",padding:"7px 8px",fontSize:11}}>
                  {copied?(isHe?"✓ הועתק!":"✓ Copied!"):(isHe?"📋 העתק קוד":"📋 Copy code")}
                </button>
                <button onClick={handleShowQR}
                  style={{...btnStyle,background:showQR?"rgba(13,148,136,.12)":"rgba(255,255,255,.9)",color:showQR?"#0d9488":"#475569",border:"1px solid rgba(148,163,184,.3)",padding:"7px 8px",fontSize:11}}>
                  {isHe?(showQR?"✕ סגור QR":"📷 QR"):(showQR?"✕ Close":"📷 QR")}
                </button>
                <button onClick={()=>{const msg=encodeURIComponent((isHe?"קוד הצטרפות למשק הבית":"Household join code")+": "+getSharingCode());window.open(`https://wa.me/?text=${msg}`,'_blank');}}
                  style={{...btnStyle,background:"rgba(37,211,102,.1)",color:"#128c7e",border:"1px solid rgba(37,211,102,.3)",padding:"7px 8px",fontSize:11}}>
                  💬 WhatsApp
                </button>
                <button onClick={()=>{const sub=encodeURIComponent(isHe?"הצטרפות למשק הבית":"Join Household");const body=encodeURIComponent((isHe?"קוד ההצטרפות שלך:":"Your join code:")+"\n\n"+getSharingCode());window.open(`mailto:?subject=${sub}&body=${body}`,'_blank');}}
                  style={{...btnStyle,background:"rgba(59,130,246,.08)",color:"#2563eb",border:"1px solid rgba(59,130,246,.2)",padding:"7px 8px",fontSize:11}}>
                  ✉️ {isHe?"מייל":"Email"}
                </button>
              </div>
              {showQR&&qrSvg&&(
                <div style={{display:"flex",justifyContent:"center",padding:"8px 0"}}>
                  <div dangerouslySetInnerHTML={{__html:qrSvg}} style={{width:200,height:200}}/>
                </div>
              )}
            </div>

            {/* Members */}
            {Object.keys(members).length>0&&(
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,color:"#64748b",marginBottom:8,fontWeight:600}}>{isHe?"חברי המשק:":"Household members:"}</div>
                {Object.values(members).map((m,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"rgba(255,255,255,.6)",borderRadius:8,marginBottom:4}}>
                    <span style={{fontSize:16}}>👤</span>
                    <span style={{fontSize:13,fontWeight:600}}>{m.name}</span>
                    {m.name===householdCfg.memberName&&<span style={{fontSize:10,color:"#0d9488",background:"rgba(13,148,136,.08)",borderRadius:8,padding:"1px 6px"}}>{isHe?"אני":"me"}</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Sync status */}
            <div style={{fontSize:11,color:"#64748b",marginBottom:14,display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",display:"inline-block",flexShrink:0}}/>
              <span>{isHe?"מזווה ועגלה מסונכרנים":"Pantry & cart synced"}{syncLabel?` · ${syncLabel}`:""}</span>
            </div>

            {/* Back to main */}
            <button onClick={onClose}
              style={{...btnStyle,width:"100%",background:"linear-gradient(135deg,#14b8a6,#059669)",color:"#fff",border:"none",padding:"12px",fontSize:14,fontWeight:800,marginBottom:8,boxShadow:"0 4px 14px rgba(13,148,136,.3)"}}>
              {isHe?"→ חזרה לדף הראשי":"→ Go to Main Screen"}
            </button>

            {/* Leave */}
            <button onClick={handleLeave}
              style={{...btnStyle,width:"100%",background:confirmLeave?"rgba(220,38,38,.12)":"rgba(220,38,38,.06)",color:"#dc2626",border:`1px solid ${confirmLeave?"rgba(220,38,38,.4)":"rgba(220,38,38,.2)"}`,padding:"9px",transition:"all .2s"}}>
              {confirmLeave?(isHe?"בטוח? לחץ שוב לאישור":"Sure? Tap again to confirm"):(isHe?"עזוב משק בית":"Leave Household")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── RecipeIdeaSheet ────────────────────────────────────────────────────────────
function RecipeIdeaSheet({idea, meal, lang, onClose}){
  const isHe=(lang||'he')!=='en';
  const [loading,setLoading]=useState(true);
  const [recipe,setRecipe]=useState(null);
  const [err,setErr]=useState(null);
  useEffect(()=>{
    const ctrl=new AbortController();
    const t=setTimeout(()=>ctrl.abort(),30000);
    (async()=>{
      try{
        const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({recipeIdea:{idea,targetKcal:meal.targetKcal,targetCarbs:meal.targetCarbs,targetProtein:meal.targetProtein,targetFat:meal.targetFat,lang}}),signal:ctrl.signal});
        const txt=await res.text();
        if(!res.ok){let d='';try{d=JSON.parse(txt).error||'';}catch(_){}throw new Error(d||'server');}
        const m=txt.match(/\{[\s\S]*\}/);if(!m)throw new Error('parse');
        const p=JSON.parse(m[0]);if(p.error)throw new Error(p.error);
        setRecipe(p);
      }catch(e){setErr(e?.name==='AbortError'?(isHe?'פג זמן הטעינה':'Timed out'):e.message||'error');}
      finally{clearTimeout(t);setLoading(false);}
    })();
    return()=>{ctrl.abort();clearTimeout(t);};
  },[]);
  return(
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{zIndex:1100}}>
      <div className="modal-sheet slide" style={{paddingBottom:28,maxHeight:'92vh',overflowY:'auto'}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div style={{flex:1,paddingLeft:8}}>
            <div style={{fontSize:13,fontWeight:800,color:C.text}}>🍽 {isHe?"מתכון":"Recipe"}</div>
            <div style={{fontSize:11.5,color:C.muted,marginTop:2,lineHeight:1.4}}>{idea}</div>
          </div>
          <button onClick={onClose} style={{width:28,height:28,borderRadius:"50%",background:"rgba(148,163,184,.18)",border:"none",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,flexShrink:0}}>✕</button>
        </div>
        <div style={{display:"flex",gap:5,marginBottom:14}}>
          {[{lbl:isHe?"קק״ל":"kcal",val:meal.targetKcal,c:"#0d9488"},{lbl:isHe?"פחמ׳":"carbs",val:(meal.targetCarbs||0)+"g",c:"#f59e0b"},{lbl:isHe?"חלבון":"prot",val:(meal.targetProtein||0)+"g",c:"#6366f1"},{lbl:isHe?"שומן":"fat",val:(meal.targetFat||0)+"g",c:"#f97316"}].map(({lbl,val,c})=>(
            <div key={lbl} style={{flex:1,background:"rgba(255,255,255,.8)",borderRadius:9,padding:"6px 3px",textAlign:"center",border:"1px solid rgba(148,163,184,.18)"}}>
              <div style={{fontSize:11,fontWeight:800,color:c}}>{val}</div>
              <div style={{fontSize:8.5,color:C.muted,marginTop:1}}>{lbl}</div>
            </div>
          ))}
        </div>
        {loading&&<div style={{textAlign:"center",padding:"36px 0"}}>
          <img src="/Nutrition/recipe-loader.webp?v=3" alt="" style={{width:150,height:150,objectFit:"contain",display:"block",margin:"0 auto 4px"}}/>
          <div style={{fontSize:12,color:C.muted}}>{isHe?"מכין מתכון...":"Preparing recipe..."}</div>
        </div>}
        {err&&!loading&&<div style={{textAlign:"center",padding:"20px 0",color:C.danger,fontSize:12}}>{err}</div>}
        {recipe&&!loading&&(<>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:8}}>🛒 {isHe?"מצרכים":"Ingredients"}</div>
            {(recipe.ingredients||[]).map((ing,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid rgba(148,163,184,.1)",fontSize:12}}>
                <span style={{color:C.text}}>{ing.item}</span>
                <span style={{color:C.muted,fontWeight:600,fontSize:11}}>{ing.amount}</span>
              </div>
            ))}
          </div>
          {(recipe.steps||[]).length>0&&(
            <div>
              <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:8}}>📝 {isHe?"הכנה":"Preparation"}</div>
              {recipe.steps.map((step,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:9,alignItems:"flex-start"}}>
                  <span style={{background:C.accent,color:"#fff",borderRadius:"50%",minWidth:18,height:18,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{i+1}</span>
                  <span style={{fontSize:12,color:C.text,lineHeight:1.5}}>{step}</span>
                </div>
              ))}
            </div>
          )}
        </>)}
      </div>
    </div>
  );
}

// ── DailyPlanModal ─────────────────────────────────────────────────────────────
function DailyPlanModal({onClose, pid, lang, profile, onSaveRules}){
  const isHe=(lang||'he')!=='en';
  const [plan,setPlan]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [recipeTarget,setRecipeTarget]=useState(null);
  const [animErr,setAnimErr]=useState(false);
  const [showNotes,setShowNotes]=useState(false);
  const [newRulesText,setNewRulesText]=useState('');
  const [showPrevRules,setShowPrevRules]=useState(false);
  const [editRulesMode,setEditRulesMode]=useState(false);
  const [editedRules,setEditedRules]=useState([]);

  const buildHistory=()=>{
    const journal=loadJournal(pid);
    const days30=[];
    const today=new Date();
    for(let i=0;i<30;i++){
      const d=new Date(today);d.setDate(today.getDate()-i);
      const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      if(journal[k])days30.push(journal[k]);
    }
    const foodCounts={};
    let tKcal=0,tCarbs=0,tProtein=0,tFat=0;
    const sugarVals=[];
    days30.forEach(day=>{
      (day.entries||[]).forEach(e=>{
        const nm=(e.label||'').replace(/^[\u{1F300}-\u{1FFFF}☀-⟿\s]+/u,'').trim();
        if(nm)foodCounts[nm]=(foodCounts[nm]||0)+1;
      });
      tKcal+=day.totals?.kcal||0;tCarbs+=day.totals?.carbs||0;
      tProtein+=day.totals?.protein||0;tFat+=day.totals?.fat||0;
      if(day.bloodSugar)sugarVals.push(parseFloat(day.bloodSugar));
    });
    const n=days30.length||1;
    const topFoods=Object.entries(foodCounts).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([food,count])=>({food,count}));
    return{topFoods,avgKcal:Math.round(tKcal/n),avgCarbs:parseFloat((tCarbs/n).toFixed(1)),
      avgProtein:parseFloat((tProtein/n).toFixed(1)),avgFat:parseFloat((tFat/n).toFixed(1)),
      sugarAvg:sugarVals.length?Math.round(sugarVals.reduce((a,b)=>a+b,0)/sugarVals.length):null,
      sugarMin:sugarVals.length?Math.min(...sugarVals):null,sugarMax:sugarVals.length?Math.max(...sugarVals):null,
      days:days30.length};
  };

  const fetchPlan=async()=>{
    setLoading(true);setError(null);
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),28000);
    try{
      const history=buildHistory();
      const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({dailyPlan:{profile,history,lang}}),signal:ctrl.signal});
      const txt=await res.text();
      if(!res.ok){
        let detail='';try{detail=JSON.parse(txt).error||'';}catch(_){}
        throw new Error(detail||'server '+res.status);
      }
      const m=txt.match(/\{[\s\S]*\}/);
      if(!m)throw new Error("parse");
      const parsed=JSON.parse(m[0]);
      if(parsed.error)throw new Error(parsed.error);
      // Reconstruct full plan from compact worker response
      const prof=profile||{};
      const tK=prof.maxKcal||1800,tC=prof.maxCarbs||130,tP=prof.maxProtein||90;
      const tF=Math.round(tK*0.28/9);
      const dinnerMain=!!(prof.planRules&&/ערב.*(מרכז|עיקרי|פחמ|גדול|יותר|ראשי)|מרכז.*ערב|עיקר.*ערב|פחמ.*ערב|dinner.*(main|most|heavy|primary)/i.test(prof.planRules));
      const mK=dinnerMain?[Math.round(tK*.19),Math.round(tK*.07),Math.round(tK*.24),Math.round(tK*.08),Math.round(tK*.42)]:[Math.round(tK*.25),Math.round(tK*.08),Math.round(tK*.35),Math.round(tK*.08),Math.round(tK*.24)];
      const mC=dinnerMain?[Math.round(tC*.14),Math.round(tC*.07),Math.round(tC*.19),Math.round(tC*.07),Math.round(tC*.53)]:[Math.round(tC*.22),Math.round(tC*.09),Math.round(tC*.35),Math.round(tC*.09),Math.round(tC*.25)];
      const mP=dinnerMain?[Math.round(tP*.20),Math.round(tP*.08),Math.round(tP*.27),Math.round(tP*.08),Math.round(tP*.37)]:[Math.round(tP*.22),Math.round(tP*.09),Math.round(tP*.35),Math.round(tP*.09),Math.round(tP*.25)];
      const mFt=dinnerMain?[Math.round(tF*.20),Math.round(tF*.07),Math.round(tF*.25),Math.round(tF*.08),Math.round(tF*.40)]:[Math.round(tF*.22),Math.round(tF*.09),Math.round(tF*.35),Math.round(tF*.09),Math.round(tF*.25)];
      const META=isHe
        ?[{type:'breakfast',label:'ארוחת בוקר',time:'07:00-09:00'},{type:'morning_snack',label:'ביניים בוקר',time:'10:30'},{type:'lunch',label:'ארוחת צהריים',time:'12:30-14:00'},{type:'afternoon_snack',label:'ביניים',time:'16:00'},{type:'dinner',label:'ארוחת ערב',time:'19:00-20:30'}]
        :[{type:'breakfast',label:'Breakfast',time:'7:00-9:00'},{type:'morning_snack',label:'Morning Snack',time:'10:30'},{type:'lunch',label:'Lunch',time:'12:30-2:00'},{type:'afternoon_snack',label:'Afternoon Snack',time:'4:00-5:00'},{type:'dinner',label:'Dinner',time:'7:00-8:30'}];
      setPlan({
        meals:META.map((mt,i)=>({...mt,targetKcal:mK[i],targetCarbs:mC[i],targetProtein:mP[i],targetFat:mFt[i],ideas:(parsed.ideas||[])[i]||[],note:(parsed.notes||[])[i]||''})),
        insight:parsed.insight||'',totalKcal:tK,totalCarbs:tC,totalProtein:tP,totalFat:tF
      });
    }catch(e){
      const msg=e?.name==='AbortError'?(isHe?"פג זמן הטעינה. נסי שוב.":"Timed out. Try again."):e?.message||'';
      setError((isHe?"שגיאה בטעינה. ":"Error loading. ")+msg);
    }finally{clearTimeout(timer);setLoading(false);}
  };

  useEffect(()=>{fetchPlan();},[]);

  const mealIcon=t=>({breakfast:"🌅",morning_snack:"☕",lunch:"☀️",afternoon_snack:"🍵",dinner:"🌙"}[t]||"🍽");

  return(<>
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.55)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#f8fafc",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,maxHeight:"92vh",overflowY:"auto",padding:"20px 16px",boxShadow:"0 -8px 40px rgba(15,23,42,.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={{fontSize:17,fontWeight:900,color:C.text}}>{isHe?"תכנון יומי":"Daily Plan"}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{isHe?"המלצות מותאמות אישית על בסיס הפרופיל שלך":"Personalized recommendations based on your profile"}</div>
          </div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:"50%",background:"rgba(148,163,184,.18)",border:"none",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.muted}}>✕</button>
        </div>

        {loading&&(
          <div style={{textAlign:"center",padding:"32px 0"}}>
            {animErr
              ?<div style={{width:80,height:80,margin:"0 auto 8px",borderRadius:"50%",border:`6px solid rgba(13,148,136,.15)`,borderTop:`6px solid ${C.accent}`,animation:"spin 1s linear infinite"}}/>
              :<img src="/Nutrition/loader-plan.webp?v=5" alt="" onError={()=>setAnimErr(true)}
                  style={{width:160,height:160,objectFit:"contain",display:"block",margin:"0 auto 8px"}}/>}
            <div style={{fontSize:14,fontWeight:700,color:C.text}}>{isHe?"מכין תפריט יומי...":"Building your daily menu..."}</div>
          </div>
        )}

        {error&&!loading&&(
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:13,color:C.danger,marginBottom:12}}>{error}</div>
            <button onClick={fetchPlan} style={{background:C.accent,color:"#fff",border:"none",borderRadius:10,padding:"10px 24px",fontSize:13,fontWeight:700,cursor:"pointer"}}>{isHe?"נסה שוב":"Try Again"}</button>
          </div>
        )}

        {plan&&!loading&&(<>
          {plan.insight&&(
            <div style={{background:"linear-gradient(135deg,rgba(13,148,136,.08),rgba(20,184,166,.04))",border:"1px solid rgba(13,148,136,.18)",borderRadius:14,padding:"11px 13px",marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:C.accent,marginBottom:3}}>{isHe?"💡 תובנה":"💡 Insight"}</div>
              <div style={{fontSize:12.5,color:C.text,lineHeight:1.55}}>{plan.insight}</div>
            </div>
          )}
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            {[{lbl:isHe?"קק״ל":"kcal",val:plan.totalKcal,c:"#0d9488"},{lbl:isHe?"פחמ׳":"carbs",val:(plan.totalCarbs||0)+"g",c:"#f59e0b"},{lbl:isHe?"חלבון":"protein",val:(plan.totalProtein||0)+"g",c:"#6366f1"},{lbl:isHe?"שומן":"fat",val:(plan.totalFat||0)+"g",c:"#f97316"}].map(({lbl,val,c})=>(
              <div key={lbl} style={{flex:1,background:"rgba(255,255,255,.8)",borderRadius:10,padding:"7px 4px",textAlign:"center",border:"1px solid rgba(148,163,184,.18)"}}>
                <div style={{fontSize:12,fontWeight:800,color:c}}>{val}</div>
                <div style={{fontSize:9,color:C.muted,marginTop:1}}>{lbl}</div>
              </div>
            ))}
          </div>
          {(plan.meals||[]).map((meal,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,.88)",borderRadius:14,padding:12,marginBottom:8,border:"1px solid rgba(148,163,184,.15)",boxShadow:"0 1px 6px rgba(15,23,42,.05)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:20,lineHeight:1}}>{mealIcon(meal.type)}</span>
                  <div>
                    <div style={{fontSize:12.5,fontWeight:800,color:C.text}}>{meal.label}</div>
                    <div style={{fontSize:10,color:C.muted}}>{meal.time}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:3}}>
                  {[{v:meal.targetKcal,u:isHe?"קק״ל":"kcal",c:"#0d9488"},{v:meal.targetCarbs,u:"g פחמ׳",c:"#f59e0b"},{v:meal.targetProtein,u:"g חל׳",c:"#6366f1"}].map(({v,u,c},j)=>(
                    <div key={j} style={{background:"rgba(255,255,255,.9)",borderRadius:6,padding:"3px 5px",textAlign:"center",minWidth:30,border:`1px solid ${c}22`}}>
                      <div style={{fontSize:10,fontWeight:800,color:c}}>{v}</div>
                      <div style={{fontSize:8,color:C.muted}}>{u}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:0}}>
                {(meal.ideas||[]).map((idea,j)=>(
                  <div key={j} onClick={()=>setRecipeTarget({idea,meal})}
                    style={{display:"flex",alignItems:"center",gap:6,padding:"7px 0",borderBottom:j<meal.ideas.length-1?"1px solid rgba(148,163,184,.1)":"none",cursor:"pointer"}}>
                    <span style={{color:C.accent,fontSize:11,flexShrink:0}}>•</span>
                    <span style={{fontSize:12,color:"#1e293b",lineHeight:1.45,flex:1}}>{idea}</span>
                    <span style={{color:C.muted,fontSize:14,flexShrink:0}}>›</span>
                  </div>
                ))}
              </div>
              {meal.note&&<div style={{marginTop:7,fontSize:11,color:C.muted,fontStyle:"italic",borderTop:"1px solid rgba(148,163,184,.1)",paddingTop:6}}>💬 {meal.note}</div>}
            </div>
          ))}
          {(plan.substitutions||[]).length>0&&(
            <div style={{background:"rgba(255,255,255,.88)",borderRadius:14,padding:12,marginBottom:8,border:"1px solid rgba(245,158,11,.2)"}}>
              <div style={{fontSize:12,fontWeight:800,color:"#b45309",marginBottom:8}}>{isHe?"🔄 תחליפים מומלצים":"🔄 Recommended Substitutions"}</div>
              {plan.substitutions.map((s,i)=>(
                <div key={i} style={{padding:"6px 0",borderBottom:i<plan.substitutions.length-1?"1px solid rgba(148,163,184,.1)":"none"}}>
                  <div style={{fontSize:11.5,color:C.text}}><span style={{textDecoration:"line-through",color:C.muted}}>{s.original}</span> <span style={{color:C.accent}}>→</span> <span style={{fontWeight:700,color:C.accent}}>{s.suggested}</span></div>
                  {s.reason&&<div style={{fontSize:10.5,color:C.muted,marginTop:2,lineHeight:1.4}}>{s.reason}</div>}
                </div>
              ))}
            </div>
          )}
          <button onClick={fetchPlan} style={{width:"100%",background:"rgba(13,148,136,.08)",color:C.accent,border:"1px solid rgba(13,148,136,.22)",borderRadius:12,padding:"11px",fontSize:13,fontWeight:700,cursor:"pointer",marginTop:2,marginBottom:6}}>
            🔄 {isHe?"רענן תכנון":"Refresh Plan"}
          </button>
          <button onClick={()=>{setShowNotes(v=>!v);setEditRulesMode(false);setShowPrevRules(false);}} style={{width:"100%",background:showNotes?"rgba(37,99,235,.08)":"rgba(148,163,184,.08)",color:showNotes?C.blue:C.muted,border:`1px solid ${showNotes?"rgba(37,99,235,.22)":"rgba(148,163,184,.2)"}`,borderRadius:12,padding:"10px",fontSize:12.5,fontWeight:700,cursor:"pointer",marginBottom:8}}>
            📝 {isHe?"הערות לתכנון הבא":"Notes for Next Plan"}{profile?.planRules?` ✓`:''}
          </button>
          {showNotes&&(()=>{
            const freshProfiles=JSON.parse(localStorage.getItem('nutrition_profiles')||'[]');
            const freshRules=(freshProfiles.find(x=>x.id===pid)||{}).planRules||ls.get('nutrition_plan_rules_'+pid)||'';
            const savedLines=freshRules.split('\n').filter(l=>l.trim());
            return(
            <div style={{background:"rgba(37,99,235,.04)",border:"1px solid rgba(37,99,235,.15)",borderRadius:12,padding:12,marginBottom:10}}>
              {editRulesMode?(
                <>
                  <div style={{fontSize:12,fontWeight:700,color:"#334155",marginBottom:8,borderBottom:"1px solid rgba(15,23,42,.1)",paddingBottom:6}}>{isHe?"עריכת העדפות שמורות":"Edit saved preferences"}</div>
                  {editedRules.map((rule,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                      <input value={rule} onChange={e=>{const r=[...editedRules];r[i]=e.target.value;setEditedRules(r);}}
                        style={{flex:1,borderRadius:7,border:"1px solid rgba(37,99,235,.2)",padding:"7px 10px",fontSize:12,outline:"none",fontFamily:"inherit",direction:isHe?"rtl":"ltr",background:"rgba(255,255,255,.9)"}}/>
                      <button onClick={()=>setEditedRules(editedRules.filter((_,j)=>j!==i))}
                        style={{width:28,height:28,borderRadius:"50%",border:"none",background:"rgba(220,38,38,.08)",color:C.danger,fontSize:14,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                    </div>
                  ))}
                  <button onClick={()=>{const joined=editedRules.map(r=>r.trim()).filter(Boolean).join('\n');onSaveRules&&onSaveRules(joined);if(joined)ls.set('nutrition_plan_rules_'+pid,joined);setEditRulesMode(false);setShowNotes(false);setShowPrevRules(false);}}
                    style={{marginTop:4,width:"100%",background:C.blue,color:"#fff",border:"none",borderRadius:9,padding:"9px",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                    {isHe?"שמירה":"Save"}
                  </button>
                </>
              ):(
                <>
                  <textarea value={newRulesText} onChange={e=>setNewRulesText(e.target.value)}
                    placeholder={isHe?"הנחיות חדשות לתכנון...":"New instructions for the plan..."}
                    style={{width:"100%",minHeight:64,borderRadius:8,border:"1px solid rgba(37,99,235,.2)",padding:"8px 10px",fontSize:12,lineHeight:1.5,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit",direction:isHe?"rtl":"ltr",background:"rgba(255,255,255,.9)"}}/>
                  {savedLines.length>0&&(
                    <div style={{marginTop:8}}>
                      <button onClick={()=>setShowPrevRules(v=>!v)}
                        style={{width:"100%",background:"none",border:"none",textAlign:isHe?"right":"left",padding:"6px 2px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,borderBottom:"1px solid rgba(15,23,42,.12)",paddingBottom:6}}>
                        <span style={{fontSize:10,color:C.muted}}>{showPrevRules?"▼":"▶"}</span>
                        <span style={{fontSize:13,fontWeight:600,color:"#334155"}}>{isHe?"העדפות אישיות שמורות":"Saved preferences"}</span>
                      </button>
                      {showPrevRules&&(
                        <div style={{background:"rgba(148,163,184,.08)",borderRadius:8,padding:"8px 10px",marginTop:6,direction:isHe?"rtl":"ltr"}}>
                          {savedLines.map((line,i)=>(
                            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:i<savedLines.length-1?5:0}}>
                              <span style={{color:C.muted,fontSize:12,flexShrink:0,marginTop:1}}>•</span>
                              <span style={{fontSize:11.5,color:C.muted,lineHeight:1.5}}>{line.trim()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{display:"flex",gap:8,marginTop:8}}>
                    <button onClick={()=>{if(newRulesText.trim()){const combined=[freshRules,newRulesText.trim()].filter(Boolean).join('\n');onSaveRules&&onSaveRules(combined);if(combined)ls.set('nutrition_plan_rules_'+pid,combined);}setNewRulesText('');setShowNotes(false);setShowPrevRules(false);}}
                      style={{flex:1,background:C.blue,color:"#fff",border:"none",borderRadius:9,padding:"9px",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                      {isHe?"שמירה":"Save"}
                    </button>
                    {savedLines.length>0&&<button onClick={()=>{setEditedRules(savedLines);setEditRulesMode(true);setShowPrevRules(false);}}
                      style={{background:"rgba(37,99,235,.08)",color:C.blue,border:"1px solid rgba(37,99,235,.2)",borderRadius:9,padding:"9px 14px",fontSize:15,fontWeight:700,cursor:"pointer"}}>
                      ✏️
                    </button>}
                  </div>
                </>
              )}
            </div>
          );})()}
        </>)}
      </div>
    </div>
    {recipeTarget&&<RecipeIdeaSheet idea={recipeTarget.idea} meal={recipeTarget.meal} lang={lang} onClose={()=>setRecipeTarget(null)}/>}
  </>);
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
    setBloodSugar("");
    setCustomBtns(loadCustomBtns(p?.id));
    setQuickFoods(loadQuickFoods(p?.id)||QUICK_FOODS);
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
  const [showWizard,setShowWizard]=useState(false);
  const [wizardProfile,setWizardProfile]=useState(null);
  const [showExport,setShowExport]=useState(false);
  const [showInfo,setShowInfo]=useState(false);
  const [showPantry,setShowPantry]=useState(false);
  const [showShopping,setShowShopping]=useState(false);
  const [showMealPlanner,setShowMealPlanner]=useState(false);
  const [showRecipeBook,setShowRecipeBook]=useState(false);
  const [showDailyPlan,setShowDailyPlan]=useState(false);
  const [showHousehold,setShowHousehold]=useState(false);
  const [hhWelcome,setHhWelcome]=useState(null);
  const [householdCfg,setHouseholdCfg]=useState(()=>ls.get('nutrition_household'));
  const [hhSynced,setHhSynced]=useState(false);
  const [syncTick,setSyncTick]=useState(0);
  const hhUnsubRef=useRef([]);
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

  // Firebase household sync
  useEffect(()=>{
    hhUnsubRef.current.forEach(u=>u?.());
    hhUnsubRef.current=[];
    setHhSynced(false);
    if(!householdCfg)return;
    _fbInit(householdCfg).then(ok=>{
      if(!ok)return;
      setHhSynced(true);
      const unsubPantry=_fbOnValue(_fbRefFn(_fbDb,`households/${_householdId}/pantry`),snap=>{
        const data=snap.val();
        if(data&&typeof data==='object'){
          localStorage.setItem("nutrition_pantry",JSON.stringify(data));
          _lastSyncAt=Date.now();
          setSyncTick(t=>t+1);
        }
      });
      const unsubShopping=_fbOnValue(_fbRefFn(_fbDb,`households/${_householdId}/shopping`),snap=>{
        const data=snap.val();
        if(data!==null){
          const arr=Array.isArray(data)?data:Object.values(data||{});
          localStorage.setItem("nutrition_shopping",JSON.stringify(arr.filter(Boolean)));
          _lastSyncAt=Date.now();
          setSyncTick(t=>t+1);
        }
      });
      hhUnsubRef.current=[unsubPantry,unsubShopping];
    });
    return()=>{hhUnsubRef.current.forEach(u=>u?.());};
  },[householdCfg]);

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

  // Auto-save on every change so reopening the app restores the current day
  useEffect(()=>{
    const j=loadJournal(pid);
    if(entries.length||bloodSugar){
      j[activeDate]={
        entries:entries.map(e=>({label:e.label,kcal:e.kcal,carbs:e.carbs,protein:e.protein,fat:e.fat||0,...(e.count&&{count:e.count}),...(e.perUnit&&{perUnit:e.perUnit})})),
        totals,
        ...(bloodSugar&&{bloodSugar:parseFloat(bloodSugar)})
      };
      saveJournal(j,pid);
    }
  },[entries,bloodSugar,activeDate,pid]);

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
  const [showPresets,setShowPresets]=useState(false);

  const saveNewBtn=btn=>{const u=[...customBtns,btn];setCustomBtns(u);saveCustomBtns(u,pid);};
  const updateCustomBtn=(id,ch)=>{const u=customBtns.map(b=>b.id===id?{...b,...ch}:b);setCustomBtns(u);saveCustomBtns(u,pid);};
  const removeBtn=id=>{const u=customBtns.filter(b=>b.id!==id);setCustomBtns(u);saveCustomBtns(u,pid);};
  const updateQuickFood=(id,changes)=>{const u=quickFoods.map(f=>f.id===id?{...f,...changes}:f);setQuickFoods(u);saveQuickFoods(u,pid);};
  const removeQuickFood=(id)=>{const u=quickFoods.filter(f=>f.id!==id);setQuickFoods(u);saveQuickFoods(u,pid);};
  const addQuickFood=food=>{const u=[...quickFoods.filter(f=>f.id!==food.id),food];setQuickFoods(u);saveQuickFoods(u,pid);};
  const resetQuickFoods=()=>{setQuickFoods(QUICK_FOODS);saveQuickFoods(QUICK_FOODS,pid);ls.set("nutrition_hidden_special",[]);ls.set("nutrition_special_edits",{});};
  const kcalLeft=MAX_KCAL-totals.kcal, carbsLeft=MAX_CARBS-totals.carbs;
  const maxProtein=activeProfile?.maxProtein||120;

  if(showSetup||!activeProfile) return (
    <SetupScreen lang={lang} onToggleLang={toggleLang} onDone={(p)=>{
      const updated=[p];
      saveProfiles(updated);
      saveActiveProfileId(p.id);
      setProfiles(updated);
      setActiveProfile(p);
      setShowSetup(false);
      setWizardProfile(p);
      setShowWizard(true);
    }} onRestored={()=>{
      const ps=loadProfiles();
      const activeId=loadActiveProfileId();
      const active=ps.find(p=>p.id===activeId)||ps[0];
      if(!active)return;
      setProfiles(ps);
      setActiveProfile(active);
      setShowSetup(false);
    }}/>
  );

  return (
    <div>
      {showSplash && <SplashScreen lang={lang} onDone={()=>setShowSplash(false)}/>}
      {hhWelcome && <HouseholdWelcome householdName={hhWelcome.householdName} cfg={hhWelcome.cfg} onDone={cfg=>{setHhWelcome(null);setHouseholdCfg(cfg);setShowHousehold(false);setShowPantry(true);}} lang={lang}/>}
      {showInfo && <InfoModal onClose={()=>setShowInfo(false)} lang={lang}/>}
      {showPantry && <PantryModal onClose={()=>setShowPantry(false)} lang={lang} syncTick={syncTick}/>}
      {showShopping && <ShoppingListModal onClose={()=>setShowShopping(false)} lang={lang} pid={pid} syncTick={syncTick}/>}
      {showHousehold && <HouseholdModal householdCfg={householdCfg} onConnect={cfg=>{setHouseholdCfg(cfg);setShowHousehold(false);}} onHouseholdReady={cfg=>setHouseholdCfg(cfg)} onLeave={()=>{setHouseholdCfg(null);setHhSynced(false);setShowHousehold(false);}} onClose={()=>setShowHousehold(false)} onWelcome={data=>{setHouseholdCfg(data.cfg);setHhWelcome(data);setShowHousehold(false);}} lang={lang}/>}
      {showMealPlanner && <MealPlannerModal onAdd={addEntry} onClose={()=>setShowMealPlanner(false)} lang={lang} profile={activeProfile}
        onSaveRecipe={r=>{const pid2=window._activePid||'default';saveRecipes([r,...loadRecipes(pid2)],pid2);}}/>}
      {showRecipeBook && <RecipeBookModal onClose={()=>setShowRecipeBook(false)} lang={lang} pid={pid} onAddToDay={addEntry} onSaveQuickFood={addQuickFood}/>}
      {showDailyPlan && <DailyPlanModal onClose={()=>setShowDailyPlan(false)} lang={lang} pid={pid} profile={activeProfile} onSaveRules={rules=>{const updated={...activeProfile,planRules:rules};const fresh=loadProfiles();saveProfiles(fresh.map(x=>x.id===pid?updated:x));if(rules)ls.set('nutrition_plan_rules_'+pid,rules);setActiveProfile(updated);}}/>}
      {showProfiles && <ProfileModal profiles={profiles} activeId={pid} onSelect={switchProfile} onClose={()=>setShowProfiles(false)} onBackup={()=>{setShowProfiles(false);setShowExport(true);}} onSetupProfile={p=>{setShowProfiles(false);setWizardProfile(p);setShowWizard(true);}} lang={lang}/>}
      {showWizard && <ProfileSetupWizard lang={lang} onToggleLang={toggleLang} profile={wizardProfile} onSave={p=>{const fresh=loadProfiles();saveProfiles(fresh.map(x=>x.id===p.id?p:x));setActiveProfile(p.id===pid?p:activeProfile);setProfiles(loadProfiles());setWizardProfile(null);setShowWizard(false);}} onSkip={()=>{setWizardProfile(null);setShowWizard(false);}}/>}
      {showExport && <ExportImportModal pid={pid} onClose={()=>setShowExport(false)} lang={lang} todayEntries={entries} todayDate={activeDate} todayBloodSugar={bloodSugar} todayTotals={totals}/>}
      {showJournal && <JournalView pid={pid} lang={lang} profile={activeProfile} onClose={()=>setShowJournal(false)} onLoadDay={saved=>{setEntries(saved.map(e=>({...e,uid:Date.now()+Math.random()})));setShowJournal(false);}}/>}
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
        {/* Icon row — lang+share left, main icons right */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={toggleLang} style={{height:24,borderRadius:7,background:"rgba(255,255,255,.75)",border:"1px solid rgba(255,255,255,.9)",backdropFilter:"blur(12px)",cursor:"pointer",fontSize:9,fontWeight:700,color:C.muted,padding:"0 8px"}}>
              {lang==='he'?'EN':'עב'}
            </button>
            <button onClick={()=>{const url='https://lgfirimar.github.io/Nutrition/';const msg=lang==='en'?`🥗 Smart nutrition tracker — calories, blood sugar, meal planning & pantry!\n${url}`:`🥗 אפליקציית מעקב תזונה חכמה — קלוריות, סוכר, תכנון ארוחות ומזווה!\n${url}`;window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank');}}
              style={{width:24,height:24,borderRadius:7,background:"rgba(37,211,102,.15)",border:"1px solid rgba(37,211,102,.4)",backdropFilter:"blur(12px)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>📤</button>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={()=>setShowPantry(true)} style={{width:26,height:26,borderRadius:8,background:"rgba(255,255,255,.75)",border:"1px solid rgba(255,255,255,.9)",backdropFilter:"blur(12px)",cursor:"pointer",padding:2,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <img src={lang==='he'?"/Nutrition/pantry-he.png":"/Nutrition/pantry-en.png"} style={{width:20,height:20,objectFit:"contain"}} alt="מזווה"/>
            </button>
            <button onClick={()=>setShowShopping(true)} style={{width:26,height:26,borderRadius:8,background:"rgba(255,255,255,.75)",border:"1px solid rgba(255,255,255,.9)",backdropFilter:"blur(12px)",cursor:"pointer",padding:2,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <img src="/Nutrition/shopping-cart.png" style={{width:20,height:20,objectFit:"contain"}} alt="קניות"/>
            </button>
            <button onClick={()=>setShowRecipeBook(true)} style={{width:26,height:26,borderRadius:8,background:"rgba(255,255,255,.75)",border:"1px solid rgba(255,255,255,.9)",backdropFilter:"blur(12px)",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>📖</button>
            <button onClick={()=>setShowInfo(true)} style={{width:24,height:24,borderRadius:7,background:"rgba(255,255,255,.75)",border:"1px solid rgba(255,255,255,.9)",backdropFilter:"blur(12px)",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontWeight:700}}>ℹ</button>
            <button onClick={saveDay} style={{width:26,height:26,borderRadius:8,background:"rgba(255,255,255,.75)",border:"1px solid rgba(255,255,255,.9)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s",animation:saveFlash?"pop .35s ease":"none",boxShadow:"0 2px 8px rgba(80,120,160,.1)"}}>💾</button>
            <button onClick={()=>setShowHousehold(true)} style={{width:26,height:26,borderRadius:8,background:"rgba(255,255,255,.75)",border:"1px solid rgba(255,255,255,.9)",backdropFilter:"blur(12px)",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              👥
              {householdCfg&&<span style={{position:"absolute",top:-1,right:-1,width:7,height:7,borderRadius:"50%",background:hhSynced?"#22c55e":"#f59e0b",border:"1.5px solid white"}}/>}
            </button>
            <div style={{width:26,height:26,borderRadius:8,background:"linear-gradient(135deg,#14b8a6,#0d9488)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,boxShadow:"0 2px 8px rgba(13,148,136,.35)",cursor:"pointer"}} onClick={()=>setShowProfiles(true)}>{activeProfile?.emoji}</div>
          </div>
        </div>
        {/* Date + greeting below the icons */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:C.muted,letterSpacing:.3,marginBottom:3}}>{getDateLabel(isToday?undefined:activeDate)}</div>
            <div style={{fontSize:22,fontWeight:900,color:C.text,letterSpacing:"-.5px"}}>{T.greeting}, {activeProfile?.name} {isToday?"👋":""}</div>
          </div>
          {householdCfg?.householdName&&(
            <div onClick={()=>setShowHousehold(true)} style={{display:"flex",alignItems:"center",gap:4,background:"rgba(13,148,136,.08)",borderRadius:20,padding:"3px 10px 3px 6px",border:"1px solid rgba(13,148,136,.2)",cursor:"pointer",marginTop:4,flexShrink:0}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:hhSynced?"#22c55e":"#f59e0b",display:"inline-block",flexShrink:0}}/>
              <span style={{fontSize:11,fontWeight:600,color:C.accent}}>בית {householdCfg.householdName}</span>
            </div>
          )}
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
        const rcColor=activeRing==='protein'?goalColorInv(rc.consumed,rc.max):goalColor(rc.consumed,rc.max);
        const [rcG0,rcG1]=activeRing==='protein'?goalGradInv(rc.consumed,rc.max):goalGrad(rc.consumed,rc.max);
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
                      <span style={{fontSize:12,color:"#475569"}}>{activeRing==='protein'?T.goalLabel:T.goal}</span>
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
              const mColor=lk==='protein'?goalColorInv(parseFloat(val),max):goalColor(parseFloat(val),max);
              const [mg0,mg1]=lk==='protein'?goalGradInv(parseFloat(val),max):goalGrad(parseFloat(val),max);
              return (
                <div key={lk} className="card" style={{padding:"13px 12px",borderRadius:16,cursor:"pointer"}} onClick={()=>setActiveRing(lk)}>
                  <div style={{fontSize:9,letterSpacing:1.2,textTransform:"uppercase",color:C.muted}}>{T[lk]}</div>
                  <div style={{fontSize:20,fontWeight:900,color:mColor,marginTop:5,lineHeight:1}}>{val}<span style={{fontSize:10,fontWeight:500,color:C.muted}}>g</span></div>
                  <div style={{height:4,borderRadius:3,background:"rgba(148,163,184,.2)",overflow:"hidden",marginTop:7}}>
                    {max&&<div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${mg0},${mg1})`,width:`${Math.min(100,parseFloat(val)/max*100)}%`}}></div>}
                  </div>
                  <div style={{fontSize:9,color:C.muted,marginTop:5}}>{max?`${lk==="protein"?T.goalLabel:T.goal} ${max}g`:T.noLimit}</div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* ── ACTION BUTTONS ROW ── */}
      <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif" style={{display:"none"}}
        onChange={e=>{
          const file=e.target.files[0]; if(!file)return; e.target.value="";
          const reader=new FileReader();
          reader.onload=ev=>{
            setPendingPhoto({base64:ev.target.result.split(',')[1],mediaType:file.type||'image/jpeg',src:ev.target.result});
            setShowPhoto(true); setShowMeal(false); setShowSmart(false); setShowMealPlanner(false); setShowPresets(false);
          };
          reader.readAsDataURL(file);
        }}
      />
      <div style={{display:"flex",gap:8,padding:"14px 16px 14px"}}>
        <button onClick={()=>{if(showPhoto){setShowPhoto(false);setPendingPhoto(null);}else{setShowPresets(false);photoInputRef.current.click();}}} style={{flex:1,background:showPhoto?"#1a6b9e":"rgba(255,255,255,.75)",border:`1px solid ${showPhoto?"#1a6b9e":C.border}`,color:showPhoto?"#fff":C.muted,padding:"8px 4px",borderRadius:10,fontSize:11,cursor:"pointer",fontWeight:600}}>{T.photo}</button>
        <button onClick={()=>{setShowMeal(v=>!v);setShowSmart(false);setShowPhoto(false);setPendingPhoto(null);setShowMealPlanner(false);setShowPresets(false);}} style={{flex:1,background:showMeal?"#5a3e8e":"rgba(255,255,255,.75)",border:`1px solid ${showMeal?"#5a3e8e":C.border}`,color:showMeal?"#fff":C.muted,padding:"8px 4px",borderRadius:10,fontSize:11,cursor:"pointer",fontWeight:600}}>{T.mealBtn}</button>
        <button onClick={()=>{setShowSmart(v=>!v);setShowMeal(false);setShowPhoto(false);setPendingPhoto(null);setShowMealPlanner(false);setShowPresets(false);}} style={{flex:1,background:showSmart?"#0d9488":"rgba(255,255,255,.75)",border:`1px solid ${showSmart?"#0d9488":C.border}`,color:showSmart?"#fff":C.muted,padding:"8px 4px",borderRadius:10,fontSize:11,cursor:"pointer",fontWeight:600}}>+ {T.addItem}</button>
        <button onClick={()=>{setShowPresets(v=>!v);setShowMeal(false);setShowPhoto(false);setPendingPhoto(null);setShowSmart(false);setShowMealPlanner(false);}} style={{flex:1,background:showPresets?"#b45309":"rgba(255,255,255,.75)",border:`1px solid ${showPresets?"#b45309":C.border}`,color:showPresets?"#fff":C.muted,padding:"8px 4px",borderRadius:10,fontSize:11,cursor:"pointer",fontWeight:600}}>{T.presets}</button>
      </div>

      {showPhoto&&<PhotoMealPanel lang={lang} onAdd={addEntry} initialPhoto={pendingPhoto} onClose={()=>{setShowPhoto(false);setPendingPhoto(null);}}/>}
      {showMeal&&<MealPanel lang={lang} onAdd={addEntry} onClose={()=>setShowMeal(false)}/>}
      {showSmart&&<SmartAddPanel lang={lang} onAdd={addEntry} onClose={()=>setShowSmart(false)}/>}

      {/* ── PRESETS PANEL ── */}
      {showPresets&&(
        <div style={{margin:"0 0 8px",background:"rgba(255,255,255,.6)",borderTop:"1px solid rgba(148,163,184,.15)",borderBottom:"1px solid rgba(148,163,184,.15)",paddingBottom:8}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 20px 8px"}}>
            <div style={{fontSize:10,letterSpacing:1.5,textTransform:"uppercase",color:C.muted}}>{T.quickAdd}</div>
            <div style={{display:"flex",gap:6}}>
              {showEditQuick&&<button onClick={resetQuickFoods} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:16,padding:"4px 10px",fontSize:11,color:C.muted,cursor:"pointer"}}>{T.reset}</button>}
              <button onClick={()=>setShowEditQuick(v=>!v)} style={{background:showEditQuick?"rgba(217,119,6,.08)":"none",border:`1px solid ${showEditQuick?C.warn:C.border}`,borderRadius:16,padding:"4px 10px",fontSize:11,color:showEditQuick?C.warn:C.muted,cursor:"pointer"}}>{showEditQuick?T.done:T.edit}</button>
              <button onClick={()=>setShowNewBtn(true)} style={{background:"rgba(13,148,136,.08)",border:"1px solid rgba(13,148,136,.25)",borderRadius:16,padding:"4px 10px",fontSize:11,color:C.accent,cursor:"pointer"}}>{T.newBtn}</button>
            </div>
          </div>
          <div className="qa-wrap" style={{display:"flex",flexWrap:"wrap",gap:6,padding:"0 16px 4px"}}>
            {quickFoods.map(food=>(
              <div key={food.id} style={{flexShrink:0,position:"relative"}}>
                <QuickFoodChip food={food} onAdd={e=>{addEntry(e);setShowPresets(false);}} editMode={showEditQuick} onRemove={removeQuickFood} onEdit={setEditingQuickFood}/>
              </div>
            ))}
            {!isHiddenSpecial('var_crackers')&&<div style={{flexShrink:0}}><VarButton foodKey="crackers" onAdd={e=>{addEntry(e);setShowPresets(false);}} editMode={showEditQuick} onEdit={f=>{if(f)setEditingQuickFood(f);}}/></div>}
            {!isHiddenSpecial('var_granola')&&<div style={{flexShrink:0}}><VarButton foodKey="granola" onAdd={e=>{addEntry(e);setShowPresets(false);}} editMode={showEditQuick} onEdit={f=>{if(f)setEditingQuickFood(f);}}/></div>}
            {!isHiddenSpecial('yogurt')&&<div style={{flexShrink:0}}><YogurtBtn onAdd={e=>{addEntry(e);setShowPresets(false);}} editMode={showEditQuick} onEdit={f=>{if(f)setEditingQuickFood(f);}}/></div>}
            {!isHiddenSpecial('coffee')&&<div style={{flexShrink:0}}><CoffeeBtn onAdd={e=>{addEntry(e);setShowPresets(false);}} editMode={showEditQuick} onEdit={f=>{if(f)setEditingQuickFood(f);}}/></div>}
            {customBtns.map(btn=>(
              <div key={btn.id} style={{flexShrink:0,position:"relative"}}>
                <button className="chip" onClick={()=>{if(!showEditQuick){addEntry(btn);setShowPresets(false);}}} style={{paddingLeft:26,opacity:showEditQuick?0.7:1}}>
                  <span>{btn.label}</span><span className="chip-sub">{btn.kcal} {getT().kcal} · {btn.carbs}g {getT().carbs}</span>
                </button>
                <button onClick={()=>removeBtn(btn.id)} style={{position:"absolute",top:4,left:6,background:"none",border:"none",color:"#ccc",fontSize:13,cursor:"pointer",lineHeight:1,padding:0}}>×</button>
                {showEditQuick&&<button onClick={()=>setEditingQuickFood({...btn,_type:'custom'})} style={{position:"absolute",top:-4,right:-4,background:C.warn,border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✏</button>}
              </div>
            ))}
          </div>
        </div>
      )}

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
      <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:24,padding:"0 16px"}}>
        <button onClick={()=>{setShowMealPlanner(v=>!v);setShowMeal(false);setShowPhoto(false);setShowSmart(false);}}
          style={{flex:1,background:"linear-gradient(135deg,#14b8a6,#0d9488)",border:"none",borderRadius:50,padding:"12px 16px",fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 5px 18px rgba(13,148,136,.35)",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <span style={{fontSize:26,lineHeight:1,flexShrink:0}}>{T.whatEat.split(' ')[0]}</span>
          <span style={{fontSize:13}}>{T.whatEat.split(' ').slice(1).join(' ')}</span>
        </button>
        <button onClick={()=>setShowDailyPlan(true)}
          style={{flex:1,background:"linear-gradient(135deg,#6366f1,#4f46e5)",border:"none",borderRadius:50,padding:"12px 16px",fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 5px 18px rgba(99,102,241,.35)",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <img src="/Nutrition/food-pyramid.png?v=3" alt="" style={{width:28,height:28,objectFit:"contain",flexShrink:0}}/>
          <span style={{fontSize:13}}>{lang==='he'?"תפריט יומי":"Daily Menu"}</span>
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
