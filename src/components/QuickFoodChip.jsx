import React, { useState } from 'react';
import { C, getFoodLabel } from '../lib/nutrition.js';
import { getT } from '../lib/lang.js';
import { VPopup } from './VPopup.jsx';

export function QuickFoodChip({food,onAdd,editMode,onRemove,onEdit}){
  const hasVar=!!(food.defaultAmt&&food.unit&&food.kcal);
  const [open,setOpen]=useState(false);
  const [amt,setAmt]=useState(food.defaultAmt||1);
  const step=food.defaultAmt>=100?25:food.defaultAmt>=30?10:5;
  const minAmt=Math.min(step,food.defaultAmt||5);
  const calcVar=(a)=>{const r=a/(food.defaultAmt||1);return{label:`${getFoodLabel(food)} (${a}${food.unit})`,kcal:Math.round(food.kcal*r),carbs:parseFloat((food.carbs*r).toFixed(1)),protein:parseFloat(((food.protein||0)*r).toFixed(1)),fat:parseFloat(((food.fat||0)*r).toFixed(1))};};
  const sub=<span className="chip-sub">{food.defaultAmt&&food.unit?`${food.defaultAmt}${food.unit} · `:""}{food.kcal} {getT().kcal} · {food.carbs}g {getT().carbs}</span>;

  if(editMode) return (
    <div style={{position:"relative"}}>
      <button className="chip" style={{opacity:0.7}}>
        <span>{food.label}</span>
        {sub}
      </button>
      <button onClick={()=>onRemove(food.id)} style={{position:"absolute",top:-4,right:-4,background:C.danger,border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>×</button>
      <button onClick={()=>onEdit(food)} style={{position:"absolute",top:-4,left:-4,background:C.warn,border:"none",borderRadius:"50%",width:18,height:18,color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>✏</button>
    </div>
  );
  if(hasVar){
    const v=calcVar(amt);
    return(
      <div style={{position:"relative"}}>
        <button className="chip" style={{background:open?"rgba(13,148,136,.08)":"#fff",border:`1px solid ${open?C.accent:C.border}`}} onClick={()=>setOpen(o=>!o)}>
          <span>{getFoodLabel(food)}</span>
          {sub}
        </button>
        {open&&<VPopup label={`כמה ${food.unit}?`} value={amt} setValue={setAmt} step={step} min={minAmt}
          kcal={v.kcal} carbs={v.carbs}
          onAdd={()=>{onAdd({...v,uid:Date.now()+Math.random(),count:1,perUnit:{kcal:v.kcal,carbs:v.carbs,protein:v.protein,fat:v.fat}});setOpen(false);setAmt(food.defaultAmt||1);}}/>}
      </div>
    );
  }
  return (
    <button className="chip" onClick={()=>onAdd({
        ...food, label:getFoodLabel(food), uid:Date.now()+Math.random(), count:1,
        perUnit:{kcal:food.kcal,carbs:food.carbs,protein:food.protein||0,fat:food.fat||0}
      })}>
      <span>{getFoodLabel(food)}</span>
      {sub}
    </button>
  );
}