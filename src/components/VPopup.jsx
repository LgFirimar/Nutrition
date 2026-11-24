import React from 'react';
import { C } from '../lib/nutrition.js';
import { getT } from '../lib/lang.js';

export function VPopup({label,value,setValue,step,min,kcal,carbs,onAdd}){
  return (
    <div className="vpopup fade">
      <div style={{fontSize:11,color:C.muted,marginBottom:8}}>{label}</div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <button onClick={()=>setValue(v=>Math.max(min,v-step))} style={{background:"#e8e8ec",border:"none",color:C.text,borderRadius:6,width:28,height:28,cursor:"pointer",fontSize:16}}>−</button>
        <input type="number" value={value} onChange={e=>setValue(Math.max(min,parseInt(e.target.value)||min))}
          style={{flex:1,background:"#f5f5f7",border:"1px solid #e0e0e5",borderRadius:6,color:C.text,padding:"4px 0",fontSize:15,fontWeight:700,textAlign:"center"}}/>
        <button onClick={()=>setValue(v=>v+step)} style={{background:"#e8e8ec",border:"none",color:C.text,borderRadius:6,width:28,height:28,cursor:"pointer",fontSize:16}}>+</button>
      </div>
      <div style={{fontSize:11,color:C.accent,marginBottom:8,textAlign:"center"}}>{kcal} {getT().kcal} · {carbs}g {getT().carbs}</div>
      <button onClick={onAdd} style={{width:"100%",background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"8px",fontSize:13,fontWeight:700,cursor:"pointer"}}>{getT().add}</button>
    </div>
  );
}