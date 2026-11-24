import React, { useState } from 'react';
import { loadCustomDB, loadQuickFoods, saveCustomDB, saveQuickFoods } from '../lib/storage.js';
import { C, addToRecentFoods, calcNutrition, loadRecentFoods, searchAllFoods } from '../lib/nutrition.js';
import { AskClaude } from './AskClaude.jsx';
import { FoodAutocomplete } from './FoodAutocomplete.jsx';
import { SaveFavNameSheet } from './SaveFavNameSheet.jsx';

export function SmartAddPanel({onAdd,onClose,lang}){
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