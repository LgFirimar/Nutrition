import React, { useState } from 'react';
import { loadCustomDB, loadQuickFoods, saveCustomDB, saveQuickFoods } from '../lib/storage.js';
import { C } from '../lib/nutrition.js';
import { CalcLoader } from './CalcLoader.jsx';
import { SaveFavNameSheet } from './SaveFavNameSheet.jsx';

export function MealPanel({onAdd,onClose,lang}){
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