import React, { useState, useEffect } from 'react';
import { C } from '../lib/nutrition.js';

export function RecipeIdeaSheet({idea, meal, lang, onClose}){
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