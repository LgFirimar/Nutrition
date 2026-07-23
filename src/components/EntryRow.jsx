import React, { useState } from 'react';
import { LANG } from '../lib/lang.js';
import { C } from '../lib/nutrition.js';

export function EntryRow({entry,onRemove,onUpdate,lang}){
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