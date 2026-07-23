import React, { useState } from 'react';
import { loadCustomDB, saveCustomDB } from '../lib/storage.js';
import { C } from '../lib/nutrition.js';

export function PasteFromClaude({onParsed,amount,unit}){
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