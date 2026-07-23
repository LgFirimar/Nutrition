import React, { useState } from 'react';
import { C } from '../lib/nutrition.js';

export function SaveFavNameSheet({defaultName,onConfirm,onClose}){
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