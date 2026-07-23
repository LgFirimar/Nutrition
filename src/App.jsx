import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ls, loadProfiles, saveProfiles, loadActiveProfileId, saveActiveProfileId,
  pKey, loadJournal, saveJournal, loadCustomBtns, saveCustomBtns,
  loadCustomDB, saveCustomDB, loadQuickFoods, saveQuickFoods, migrateOldData,
  loadPantry, loadShopping,
  loadSpecialEdits, saveSpecialEdit, getSpecialEdit, loadHiddenSpecial, toggleHiddenSpecial, isHiddenSpecial,
  loadRecipes, saveRecipes, loadFridge, saveFridgeLS,
} from './lib/storage.js';
import {
  FOOD_DB, QUICK_FOODS, VAR_FOODS, MILK, FRIDGE_CATS, API,
  MAX_KCAL, MAX_CARBS, C, sugarColor, goalColor, goalGrad, goalColorInv, goalGradInv,
  DAYS, getDateLabel, getTodayKey, cleanQ, loadRecentFoods, addToRecentFoods,
  getRecentFoodLabels, searchFood, searchAllFoods, unitToG, calcNutrition, getFoodLabel,
} from './lib/nutrition.js';
import { LANG, getT } from './lib/lang.js';
import {
  fbState, fbReset, autoSetupHousehold, _fbInit, savePantryLS, saveShopping,
  prewarmFirebaseIfConfigured,
} from './lib/household.js';

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

// ── Household / Firebase ──────────────────────────────────────────────────────
prewarmFirebaseIfConfigured(ls);
import { CoffeeBtn } from './components/CoffeeBtn.jsx';
import { DBManagerModal } from './components/DBManagerModal.jsx';
import { DailyPlanModal } from './components/DailyPlanModal.jsx';
import { EditQuickFoodModal } from './components/EditQuickFoodModal.jsx';
import { EntryRow } from './components/EntryRow.jsx';
import { ExportImportModal } from './components/ExportImportModal.jsx';
import { HouseholdModal } from './components/HouseholdModal.jsx';
import { HouseholdWelcome } from './components/HouseholdWelcome.jsx';
import { InfoModal } from './components/InfoModal.jsx';
import { JournalView } from './components/JournalView.jsx';
import { MealPanel } from './components/MealPanel.jsx';
import { MealPlannerModal } from './components/MealPlannerModal.jsx';
import { NewButtonModal } from './components/NewButtonModal.jsx';
import { PantryModal } from './components/PantryModal.jsx';
import { PhotoMealPanel } from './components/PhotoMealPanel.jsx';
import { ProfileModal } from './components/ProfileModal.jsx';
import { ProfileSetupWizard } from './components/ProfileSetupWizard.jsx';
import { QuickFoodChip } from './components/QuickFoodChip.jsx';
import { RecipeBookModal } from './components/RecipeBookModal.jsx';
import { SetupScreen } from './components/SetupScreen.jsx';
import { ShoppingListModal } from './components/ShoppingListModal.jsx';
import { SmartAddPanel } from './components/SmartAddPanel.jsx';
import { SplashScreen } from './components/SplashScreen.jsx';
import { VarButton } from './components/VarButton.jsx';
import { YogurtBtn } from './components/YogurtBtn.jsx';

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
      const unsubPantry=fbState.onValue(fbState.refFn(fbState.db,`households/${fbState.householdId}/pantry`),snap=>{
        const data=snap.val();
        if(data&&typeof data==='object'){
          localStorage.setItem("nutrition_pantry",JSON.stringify(data));
          fbState.lastSyncAt=Date.now();
          setSyncTick(t=>t+1);
        }
      });
      const unsubShopping=fbState.onValue(fbState.refFn(fbState.db,`households/${fbState.householdId}/shopping`),snap=>{
        const data=snap.val();
        if(data!==null){
          const arr=Array.isArray(data)?data:Object.values(data||{});
          localStorage.setItem("nutrition_shopping",JSON.stringify(arr.filter(Boolean)));
          fbState.lastSyncAt=Date.now();
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
