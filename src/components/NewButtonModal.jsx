import React, { useState } from 'react';
import { C, calcNutrition, searchFood } from '../lib/nutrition.js';
import { PasteFromClaude } from './PasteFromClaude.jsx';

export function NewButtonModal({onClose,onSave}){
  const [name,setName]=useState("");
  const [desc,setDesc]=useState("");
  const [kcal,setKcal]=useState("");
  const [carbs,setCarbs]=useState("");
  const [protein,setProtein]=useState("");
  const [fat,setFat]=useState("");
  const [amount,setAmount]=useState("");
  const [unit,setUnit]=useState("g");
  const [matched,setMatched]=useState(null);
  const [notFound,setNotFound]=useState(false);

  const runEst=()=>{
    const food=searchFood(name)||searchFood(desc);
    if(!food){setNotFound(true);return;}
    setNotFound(false);setMatched(food);
    const a=parseFloat(amount)||food.defaultAmt;
    const u=food.unit||'g';
    setAmount(String(a));setUnit(u);
    const n=calcNutrition(food,a,u);
    setKcal(String(n.kcal));setCarbs(String(n.carbs));setProtein(String(n.protein));setFat(String(n.fat));
  };

  const recalc=(amt,u)=>{
    if(!matched)return;
    const a=parseFloat(amt);if(!a)return;
    const n=calcNutrition(matched,a,u||unit||matched.unit);
    setKcal(String(n.kcal));setCarbs(String(n.carbs));setProtein(String(n.protein));setFat(String(n.fat));
  };

  const handleSave=()=>{
    if(!name||!kcal)return;
    onSave({id:"custom_"+Date.now(),label:name,kcal:parseFloat(kcal)||0,carbs:parseFloat(carbs)||0,protein:parseFloat(protein)||0,fat:parseFloat(fat)||0});
    onClose();
  };

  const numField=(v,s,p,col)=>(
    <div className="num-wrap">
      <input type="number" value={v} onChange={e=>s(e.target.value)} placeholder="0" style={{borderColor:v?col:C.border}}/>
      <div className="num-lbl" style={{color:col}}>{p}</div>
    </div>
  );

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:700}}>⭐ כפתור חדש</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>
        <div style={{fontSize:11,color:C.muted,marginBottom:5}}>שם המאכל *</div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="למשל: יוגורט יווני" className="inp" style={{marginBottom:12,borderColor:name?C.accent:C.border}}/>
        <div style={{fontSize:11,color:C.muted,marginBottom:5}}>פירוט רכיבים (אופציונלי)</div>
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="למשל: 150g יוגורט, דבש..." rows={2} className="inp" style={{marginBottom:12,resize:"none"}}/>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <div style={{flex:1}}><div style={{fontSize:11,color:C.muted,marginBottom:5}}>כמות</div>
            <input type="number" value={amount} onChange={e=>{setAmount(e.target.value);recalc(e.target.value,unit);}} placeholder="100" className="inp" style={{textAlign:"center"}}/>
          </div>
          <div style={{flex:1}}><div style={{fontSize:11,color:C.muted,marginBottom:5}}>יחידה</div>
            <select value={unit} onChange={e=>{setUnit(e.target.value);recalc(amount,e.target.value);}} className="inp" style={{cursor:"pointer"}}>
              <option value="g">גר׳</option><option value="ml">מ״ל</option><option value="יח׳">יח׳</option><option value="מנה">מנה</option><option value="קוביות">קוביות</option><option value="כף">כף (15מ״ל)</option><option value="כפית">כפית (5מ״ל)</option><option value="כוס">כוס (240מ״ל)</option>
            </select>
          </div>
        </div>
        <button onClick={runEst} disabled={!name} style={{width:"100%",background:name?C.accent:"#ddd",border:"none",borderRadius:8,color:name?"#fff":"#aaa",padding:"9px",fontSize:13,fontWeight:700,cursor:name?"pointer":"default",marginBottom:10}}>✦ אמוד ערכים אוטומטית</button>
        <PasteFromClaude amount={amount} unit={unit} onParsed={d=>{setKcal(String(d.kcal));setCarbs(String(d.carbs??""));setProtein(String(d.protein??""));setFat(String(d.fat??""));}}/>
        {notFound && <div style={{fontSize:12,color:C.warn,background:"#fff8e1",borderRadius:8,padding:"8px 12px",marginBottom:10}}>לא נמצא במאגר — הכניסי ערכים ידנית</div>}
        {matched && <div style={{fontSize:12,color:C.accent,background:"#f0fae8",borderRadius:8,padding:"8px 12px",marginBottom:10}}>✦ נמצא: {matched.label}</div>}
        <div className="g2" style={{marginBottom:16}}>
          {numField(kcal,setKcal,"קק״ל",C.accent)}
          {numField(carbs,setCarbs,"פחמ׳ g",C.warn)}
          {numField(protein,setProtein,"חלבון g",C.blue)}
          {numField(fat,setFat,"שומן g","#999")}
        </div>
        <button onClick={handleSave} disabled={!name||!kcal} style={{width:"100%",background:name&&kcal?C.accent:"#ddd",border:"none",borderRadius:10,color:name&&kcal?"#fff":"#aaa",padding:"13px",fontSize:14,fontWeight:700,cursor:name&&kcal?"pointer":"default"}}>💾 שמור כפתור</button>
      </div>
    </div>
  );
}