import React, { useState } from 'react';
import { getSpecialEdit, toggleHiddenSpecial } from '../lib/storage.js';
import { getT } from '../lib/lang.js';
import { C } from '../lib/nutrition.js';
import { VPopup } from './VPopup.jsx';

export function CoffeeBtn({onAdd,editMode,onEdit}){
  const ov=getSpecialEdit('coffee');
  const per100=ov||{kcal:50,carbs:4.7,protein:3.4,fat:2};
  const coffeeLabel=(ov&&ov.label)||(getT().coffeeLabel||'☕ קפה עם חלב 2%');
  const [ml,setMl]=useState(75);
  const [open,setOpen]=useState(false);
  const milk={kcal:per100.kcal/100,carbs:per100.carbs/100,protein:per100.protein/100,fat:per100.fat/100};
  const calc=m=>({label:`${coffeeLabel} (${m} מ״ל)`,kcal:Math.round(milk.kcal*m),carbs:parseFloat((milk.carbs*m).toFixed(1)),protein:parseFloat((milk.protein*m).toFixed(1)),fat:parseFloat((milk.fat*m).toFixed(1))});
  return (
    <div style={{position:"relative"}}>
      <button className="chip" style={{background:open&&!editMode?"rgba(90,158,30,0.08)":"#fff",border:`1px solid ${open&&!editMode?C.accent:C.border}`,opacity:editMode?0.7:1}} onClick={()=>editMode?null:setOpen(v=>!v)}>
        <span>{coffeeLabel}</span>
        <span className="chip-sub">{Math.round(milk.kcal*ml)} {getT().kcal} ({ml}ml)</span>
      </button>
      {!editMode&&open && <VPopup label="כמה מ״ל חלב?" value={ml} setValue={setMl} step={10} min={10}
        kcal={Math.round(milk.kcal*ml)} carbs={(milk.carbs*ml).toFixed(1)}
        onAdd={()=>{const c=calc(ml);onAdd({...c,uid:Date.now()+Math.random(),count:1,perUnit:{kcal:c.kcal,carbs:c.carbs,protein:c.protein,fat:c.fat||0}});setOpen(false);setMl(75);}}/>}
      {editMode&&<><button onClick={()=>onEdit({id:'coffee',label:coffeeLabel,kcal:per100.kcal,carbs:per100.carbs,protein:per100.protein,fat:per100.fat,_type:'coffee',_note:'ערכים ל-100מ״ל חלב'})}
        style={{position:"absolute",top:-4,left:-4,background:C.warn,border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✏</button>
      <button onClick={()=>{toggleHiddenSpecial('coffee');onEdit(null);}}
        style={{position:"absolute",top:-4,right:-4,background:C.danger,border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>×</button></>}
    </div>
  );
}