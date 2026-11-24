import React, { useState } from 'react';
import { C, VAR_FOODS, getFoodLabel } from '../lib/nutrition.js';
import { getSpecialEdit, toggleHiddenSpecial } from '../lib/storage.js';
import { getT } from '../lib/lang.js';
import { VPopup } from './VPopup.jsx';

export function VarButton({foodKey,onAdd,editMode,onEdit}){
  const base=VAR_FOODS[foodKey];
  const ov=getSpecialEdit(`var_${foodKey}`);
  const food=ov?{...base,kcalPer100:ov.kcal,carbsPer100:ov.carbs,protPer100:ov.protein,fatPer100:ov.fat,label:ov.label||base.label}:base;
  const [g,setG]=useState(food.def);
  const [open,setOpen]=useState(false);
  const displayLabel=getFoodLabel(food);
  const calc=v=>({label:`${displayLabel} (${v}g)`,kcal:food.kcalPer100*v/100,carbs:food.carbsPer100*v/100,protein:food.protPer100*v/100,fat:food.fatPer100*v/100});
  return (
    <div style={{position:"relative"}}>
      <button className="chip" style={{background:open&&!editMode?"rgba(90,158,30,0.08)":"#fff",border:`1px solid ${open&&!editMode?C.accent:C.border}`,opacity:editMode?0.7:1}} onClick={()=>editMode?null:setOpen(v=>!v)}>
        <span>{displayLabel}</span>
        <span className="chip-sub">{Math.round(food.kcalPer100*g/100)} {getT().kcal} ({g}g)</span>
      </button>
      {!editMode&&open && <VPopup label={getT().howMuchG||"g?"} value={g} setValue={setG} step={5} min={5}
        kcal={Math.round(food.kcalPer100*g/100)} carbs={(food.carbsPer100*g/100).toFixed(1)}
        onAdd={()=>{onAdd(calc(g));setOpen(false);setG(food.def);}}/>}
      {editMode&&<><button onClick={()=>onEdit({id:`var_${foodKey}`,label:food.label,kcal:food.kcalPer100,carbs:food.carbsPer100,protein:food.protPer100,fat:food.fatPer100,_type:'var',_key:foodKey})}
        style={{position:"absolute",top:-4,left:-4,background:C.warn,border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✏</button>
      <button onClick={()=>{toggleHiddenSpecial(`var_${foodKey}`);onEdit(null);}}
        style={{position:"absolute",top:-4,right:-4,background:C.danger,border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>×</button></>}
    </div>
  );
}