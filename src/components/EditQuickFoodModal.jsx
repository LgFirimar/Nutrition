import React, { useState } from 'react';
import { C } from '../lib/nutrition.js';
import { CalcLoader } from './CalcLoader.jsx';

export function EditQuickFoodModal({food,onSave,onClose}){
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