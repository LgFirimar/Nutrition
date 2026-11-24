import React, { useState } from 'react';
import { loadCustomDB, saveCustomDB } from '../lib/storage.js';
import { C } from '../lib/nutrition.js';

export function LoadFoodToDB({foodName,amount,unit,onAddToDay,onSaved}){
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