import React, { useState, useEffect } from 'react';
import { loadPantry, loadShopping } from '../lib/storage.js';
import { fbState, saveShopping } from '../lib/household.js';
import { C, FRIDGE_CATS, getRecentFoodLabels } from '../lib/nutrition.js';
import { CalcLoader } from './CalcLoader.jsx';

export function ShoppingListModal({onClose,lang,pid,syncTick}){
  const isHe=(lang||'he')!=='en';
  const [items,setItems]=useState(loadShopping);
  const [loading,setLoading]=useState(false);
  const [translating,setTranslating]=useState(false);
  const [newName,setNewName]=useState("");
  const [newQty,setNewQty]=useState("");
  const [error,setError]=useState("");

  useEffect(()=>{if(syncTick>0)setItems(loadShopping());},[syncTick]);

  // Auto-translate Hebrew items when in English mode
  useEffect(()=>{
    if(isHe) return;
    const cur=loadShopping();
    const heItems=cur.filter(i=>/[א-ת]/.test(i.name));
    if(!heItems.length) return;
    setTranslating(true);
    fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({translateItems:heItems.map(i=>i.name)})})
      .then(r=>r.json()).then(d=>{
        if(d.translations?.length){
          const updated=cur.map(item=>{
            const idx=heItems.findIndex(h=>h.id===item.id);
            return idx>=0&&d.translations[idx]?{...item,name:d.translations[idx]}:item;
          });
          saveShopping(updated);setItems(updated);
        }
      }).catch(()=>{}).finally(()=>setTranslating(false));
  },[isHe]);

  const save=list=>{setItems(list);saveShopping(list);};

  const toggle=id=>save(items.map(i=>i.id===id?{...i,checked:!i.checked}:i));
  const remove=id=>save(items.filter(i=>i.id!==id));
  const clearBought=()=>save(items.filter(i=>!i.checked));
  const addManual=()=>{
    if(!newName.trim())return;
    save([...items,{id:Date.now()+Math.random(),name:newName.trim(),qty:newQty.trim(),checked:false,auto:false,addedBy:fbState.memberName||""}]);
    setNewName("");setNewQty("");
  };

  const generate=async()=>{
    setLoading(true);setError("");
    const pantry=loadPantry();
    const recentFoods=getRecentFoodLabels(pid,7);
    const pantryStr=FRIDGE_CATS.flatMap(c=>(pantry[c.key]||[]).map(i=>`${i.name}${i.qty?` (${i.qty})`:""}`)).join(', ')||"ריק";
    try{
      const r=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({shoppingList:{pantry:pantryStr,recentFoods,isHe,lang}})});
      const d=await r.json();
      if(d.error)throw new Error(d.error);
      const newItems=(d.items||[]).map(i=>({id:Date.now()+Math.random(),name:i.name,qty:i.qty||"",checked:false,auto:true,addedBy:fbState.memberName||""}));
      // merge: don't duplicate existing unchecked items
      const existingNames=new Set(items.filter(i=>!i.checked).map(i=>i.name.toLowerCase()));
      const fresh=newItems.filter(i=>!existingNames.has(i.name.toLowerCase()));
      save([...items,...fresh]);
    }catch(e){setError(isHe?"שגיאה בהפקת הרשימה":"Error generating list");}
    setLoading(false);
  };

  const bought=items.filter(i=>i.checked).length;

  return(
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide" style={{maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:15,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>
            <img src="/Nutrition/shopping-cart.png" style={{width:44,height:44,objectFit:"contain"}} alt=""/>
            {isHe?"רשימת קניות":"Shopping List"}
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>

        {/* Generate button */}
        {loading&&<div style={{textAlign:'center',marginBottom:8}}><CalcLoader size={64}/></div>}
        <button onClick={generate} disabled={loading} style={{width:"100%",background:"linear-gradient(135deg,#14b8a6,#059669)",border:"none",borderRadius:10,color:"#fff",padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          {loading?(isHe?"מנתח...":"Analyzing..."):(isHe?"✨ הצע רשימת קניות לפי המזווה והרגלים":"✨ Suggest based on pantry & habits")}
        </button>
        {error&&<div style={{color:C.danger,fontSize:12,marginBottom:8}}>{error}</div>}

        {/* Add manual */}
        <div style={{display:"flex",gap:6,marginBottom:12}}>
          <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addManual()}
            placeholder={isHe?"הוסף פריט...":"Add item..."} className="inp" style={{flex:2,fontSize:12}}/>
          <input value={newQty} onChange={e=>setNewQty(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addManual()}
            placeholder={isHe?"כמות":"Qty"} className="inp" style={{flex:1,fontSize:12}}/>
          <button onClick={addManual} style={{background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"0 10px",cursor:"pointer",fontSize:16}}>+</button>
        </div>

        {/* List */}
        {items.length===0
          ?<div style={{textAlign:"center",color:C.muted,fontSize:13,padding:"20px 0"}}>{isHe?"הרשימה ריקה":"List is empty"}</div>
          :<div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:12}}>
            {items.filter(i=>!i.checked).map(item=>(
              <div key={item.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"rgba(255,255,255,.7)",borderRadius:10,border:`1px solid ${item.auto?"rgba(13,148,136,.2)":C.border}`}}>
                <button onClick={()=>toggle(item.id)} style={{width:20,height:20,borderRadius:6,border:`2px solid ${C.accent}`,background:"transparent",cursor:"pointer",flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <span style={{fontSize:13,color:C.text}}>{item.name}</span>
                  {item.addedBy&&<span style={{display:"block",fontSize:9,color:C.muted,marginTop:1}}>{item.addedBy}</span>}
                </div>
                {item.qty&&<span style={{fontSize:11,color:C.muted,fontWeight:600}}>{item.qty}</span>}
                {item.auto&&<span style={{fontSize:9,color:C.accent,background:"rgba(13,148,136,.08)",borderRadius:8,padding:"2px 5px"}}>AI</span>}
                <button onClick={()=>remove(item.id)} style={{background:"none",border:"none",color:C.muted,fontSize:15,cursor:"pointer",padding:"0 2px"}}>×</button>
              </div>
            ))}
            {bought>0&&<>
              <div style={{fontSize:10,color:C.muted,letterSpacing:1.2,textTransform:"uppercase",marginTop:6,marginBottom:4}}>{isHe?"נרכש":"Bought"} ({bought})</div>
              {items.filter(i=>i.checked).map(item=>(
                <div key={item.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"rgba(148,163,184,.06)",borderRadius:10,opacity:.7}}>
                  <button onClick={()=>toggle(item.id)} style={{width:20,height:20,borderRadius:6,border:`2px solid ${C.accent}`,background:C.accent,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11}}>✓</button>
                  <span style={{flex:1,fontSize:13,color:C.muted,textDecoration:"line-through"}}>{item.name}</span>
                  {item.qty&&<span style={{fontSize:11,color:C.muted}}>{item.qty}</span>}
                  <button onClick={()=>remove(item.id)} style={{background:"none",border:"none",color:C.muted,fontSize:15,cursor:"pointer",padding:"0 2px"}}>×</button>
                </div>
              ))}
              <button onClick={clearBought} style={{width:"100%",background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px",fontSize:12,color:C.muted,cursor:"pointer",marginTop:4}}>
                {isHe?"נקה שנרכש":"Clear bought"}
              </button>
            </>}
          </div>
        }
      </div>
    </div>
  );
}