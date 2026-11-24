import React from 'react';
import { C } from '../lib/nutrition.js';

export function RecommendationsInfoModal({recs,onClose}){
  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide" style={{maxHeight:"80vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:700}}>ℹ בסיס ההמלצות</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>
        <div style={{fontSize:13,color:C.text,lineHeight:1.9,marginBottom:16,background:"rgba(90,158,30,.06)",borderRadius:10,padding:"12px 14px"}}>
          {recs.explanation}
        </div>
        {recs.sources&&recs.sources.length>0&&(
          <>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:8,letterSpacing:1.2,textTransform:"uppercase"}}>מקורות</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {recs.sources.map((s,i)=>(
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"#f5f5f7",borderRadius:10,textDecoration:"none",color:C.accent,fontSize:12,fontWeight:600,border:`1px solid ${C.border}`}}>
                  <span style={{flex:1}}>{s.title}</span>
                  <span style={{fontSize:16,flexShrink:0}}>↗</span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}