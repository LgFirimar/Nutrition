import React, { useState } from 'react';
import { getSpecialEdit, toggleHiddenSpecial } from '../lib/storage.js';
import { getT } from '../lib/lang.js';
import { C } from '../lib/nutrition.js';

export function YogurtBtn({onAdd,editMode,onEdit}){
  const ov=getSpecialEdit('yogurt');
  const per100=ov||{kcal:97,carbs:6,protein:9,fat:10};
  const label=(ov&&ov.label)||(getT().yogurtLabel||'🥛 יוגורט 10%');
  const [open,setOpen]=useState(false);
  const [ml,setMl]=useState(30);
  const calc={kcal:Math.round(per100.kcal/100*ml),carbs:parseFloat((per100.carbs/100*ml).toFixed(1)),protein:parseFloat((per100.protein/100*ml).toFixed(1)),fat:parseFloat(((per100.fat||0)/100*ml).toFixed(1))};
  const add=()=>{
    onAdd({uid:Date.now()+Math.random(),label:`${label} (${ml}מ״ל)`,kcal:calc.kcal,carbs:calc.carbs,protein:calc.protein,fat:calc.fat});
    setOpen(false);
  };
  return (
    <div style={{position:"relative"}}>
      <button className="chip" onClick={()=>editMode?null:setOpen(v=>!v)} style={{opacity:editMode?0.7:1}}>
        <span>{label}</span>
        <span className="chip-sub">{calc.kcal} {getT().kcal} · {calc.carbs}g</span>
      </button>
      {open && (
        <div className="vpopup" style={{width:190}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:700}}>יוגורט יווני 10%</div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <button onClick={()=>setMl(v=>Math.max(5,v-5))} style={{width:30,height:30,border:`1px solid ${C.border}`,borderRadius:6,background:"#f5f5f7",cursor:"pointer",fontSize:16}}>−</button>
            <div style={{flex:1,textAlign:"center"}}>
              <input type="number" value={ml} onChange={e=>setMl(Math.max(1,parseInt(e.target.value)||1))}
                style={{width:"100%",border:"none",background:"transparent",textAlign:"center",fontWeight:900,fontSize:16,color:C.accent,fontFamily:"inherit"}}/>
            </div>
            <button onClick={()=>setMl(v=>v+5)} style={{width:30,height:30,border:`1px solid ${C.border}`,borderRadius:6,background:"#f5f5f7",cursor:"pointer",fontSize:16}}>+</button>
          </div>
          <div style={{fontSize:10,color:C.muted,textAlign:"center",marginBottom:4}}>מ״ל</div>
          <div style={{display:"flex",gap:4,marginBottom:10}}>
            {[{l:"כפית",v:5},{l:"כף",v:15},{l:"2 כף",v:30}].map(({l,v})=>(
              <button key={v} onClick={()=>setMl(v)} style={{flex:1,background:ml===v?"rgba(90,158,30,0.1)":"#f5f5f7",border:`1px solid ${ml===v?C.accent:C.border}`,borderRadius:6,padding:"4px 2px",fontSize:9,color:ml===v?C.accent:C.muted,cursor:"pointer"}}>{l}</button>
            ))}
          </div>
          <div style={{fontSize:11,color:C.muted,textAlign:"center",marginBottom:8}}>{calc.kcal} {getT().kcal} · {calc.carbs}g {getT().carbs}</div>
          <button className="btn-accent" onClick={add}>+ {getT().add}</button>
        </div>
      )}
      {editMode&&<><button onClick={()=>onEdit({id:'yogurt',label,kcal:per100.kcal,carbs:per100.carbs,protein:per100.protein,fat:per100.fat||0,_type:'yogurt',_note:'ערכים ל-100מ״ל'})}
        style={{position:"absolute",top:-4,left:-4,background:C.warn,border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✏</button>
      <button onClick={()=>{toggleHiddenSpecial('yogurt');onEdit(null);}}
        style={{position:"absolute",top:-4,right:-4,background:C.danger,border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>×</button></>}
    </div>
  );
}