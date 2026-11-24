import React, { useState } from 'react';
import { loadCustomDB, saveCustomDB } from '../lib/storage.js';
import { C } from '../lib/nutrition.js';
import { CalcLoader } from './CalcLoader.jsx';

export function AskClaude({foodName, amount, unit, onAddToDay, onSaved}){
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