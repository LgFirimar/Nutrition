import React, { useState } from 'react';
import { C, VAR_FOODS, getFoodLabel } from '../lib/nutrition.js';
import { getSpecialEdit, toggleHiddenSpecial } from '../lib/storage.js';
import { getT } from '../lib/lang.js';
import { CalcLoader, VPopup } from './Shared.jsx';

// Quick-add food buttons/chips (variable-amount foods, yogurt, coffee, presets).

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

export function EditQuickFoodModal({food,onSave,onClose}){
  const [label,setLabel]=useState(food.label);
  const [desc,setDesc]=useState(food.label);
  const [loading,setLoading]=useState(false);
  const [kcal,setKcal]=useState(String(food.kcal));
  const [carbs,setCarbs]=useState(String(food.carbs));
  const [protein,setProtein]=useState(String(food.protein||0));
  const [fat,setFat]=useState(String(food.fat||0));
  const [error,setError]=useState(null);
  const [unit,setUnit]=useState(food.unit||"");
  const [defaultAmt,setDefaultAmt]=useState(String(food.defaultAmt||""));

  const ask=async()=>{
    if(!desc.trim())return;
    setLoading(true);setError(null);
    try{
      const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({mealDescription:desc})
      });
      if(!res.ok) throw new Error("שגיאת שרת");
      const d=await res.json();
      if(d.error||!d.kcal) throw new Error(d.error||"תגובה לא תקינה");
      setKcal(String(d.kcal));
      setCarbs(String(d.carbs||0));
      setProtein(String(d.protein||0));
      setFat(String(d.fat||0));
      if(d.label) setLabel(d.label);
    }catch(e){setError(e.message);}
    setLoading(false);
  };

  const save=()=>{
    const obj={...food,label,kcal:parseFloat(kcal)||0,carbs:parseFloat(carbs)||0,protein:parseFloat(protein)||0,fat:parseFloat(fat)||0};
    if(unit.trim())obj.unit=unit.trim();
    const da=parseFloat(defaultAmt);if(da>0)obj.defaultAmt=da;
    onSave(obj);
  };

  const numField=(v,s,p,col)=>(
    <div className="num-wrap">
      <input type="number" value={v} onChange={e=>s(e.target.value)} style={{borderColor:v?col:C.border}}/>
      <div className="num-lbl" style={{color:col}}>{p}</div>
    </div>
  );

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:700}}>✏️ עריכת כפתור</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>
        <div style={{fontSize:11,color:C.muted,marginBottom:4}}>שם הכפתור</div>
        <input value={label} onChange={e=>setLabel(e.target.value)} className="inp" style={{marginBottom:10,borderColor:label?C.accent:C.border}}/>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4}}>יחידה (אופציונלי)</div>
            <input value={unit} onChange={e=>setUnit(e.target.value)} className="inp" style={{marginBottom:0}} placeholder="גרם, מ״ל, מנה..."/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4}}>כמות ברירת מחדל</div>
            <input type="number" value={defaultAmt} onChange={e=>setDefaultAmt(e.target.value)} className="inp" style={{marginBottom:0}} placeholder="100"/>
          </div>
        </div>
        <div style={{fontSize:11,color:C.muted,marginBottom:4}}>תיאור לחישוב ע״י Claude</div>
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3}
          placeholder="תארי בחופשיות, למשל: אצבע גבינה צהובה 20g"
          className="inp" style={{marginBottom:8,resize:"none",lineHeight:1.5,fontSize:13}}/>
        {loading&&<div style={{textAlign:'center',marginBottom:8}}><CalcLoader size={64}/></div>}
        <button onClick={ask} disabled={loading}
          style={{width:"100%",background:"linear-gradient(135deg,#5a9e1e,#7bc42e)",border:"none",borderRadius:8,color:"#fff",padding:"9px",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          {loading?"מחשב...":"✨ חשב עם Claude"}
        </button>
        {error&&<div style={{fontSize:11,color:C.danger,marginBottom:8,textAlign:"center"}}>⚠ {error}</div>}
        <div className="g2" style={{marginBottom:14}}>
          {[["kcal",kcal,setKcal,"קק״ל",C.accent],["carbs",carbs,setCarbs,"פחמ׳ g",C.warn],["protein",protein,setProtein,"חלבון g",C.blue],["fat",fat,setFat,"שומן g","#999"]].map(([k,v,s,p,c])=>(
            <div key={k} className="num-wrap">
              <input type="number" value={v} onChange={e=>s(e.target.value)} style={{borderColor:v?c:C.border}}/>
              <div className="num-lbl" style={{color:c}}>{p}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} className="btn-muted" style={{flex:1}}>ביטול</button>
          <button onClick={save} disabled={!label||!kcal}
            style={{flex:2,background:label&&kcal?C.accent:"#ddd",border:"none",borderRadius:8,color:label&&kcal?"#fff":"#aaa",padding:"10px",fontSize:13,fontWeight:700,cursor:label&&kcal?"pointer":"default"}}>
            💾 שמור
          </button>
        </div>
      </div>
    </div>
  );
}
