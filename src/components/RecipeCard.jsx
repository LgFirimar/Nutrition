import React, { useState } from 'react';
import { C } from '../lib/nutrition.js';

export function RecipeCard({recipe,isHe,onEdit,onDelete,onShare,onEmail,onAddToDay,onSaveToDb,onSaveQuickFood,open,onToggle}){
  const [showPicker,setShowPicker]=useState(false);
  const [qty,setQty]=useState('1');
  const [unit,setUnit]=useState("מנות");
  const [savedQF,setSavedQF]=useState(false);
  const [savedDb,setSavedDb]=useState(false);
  const confirmAdd=()=>{onAddToDay(parseFloat(qty)||1,unit);setShowPicker(false);setQty('1');setUnit("מנות");};
  const handleSaveQF=()=>{const ok=onSaveQuickFood?.();if(ok){setSavedQF(true);setTimeout(()=>setSavedQF(false),2000);}};
  const handleSaveDb=()=>{const ok=onSaveToDb?.();if(ok){setSavedDb(true);setTimeout(()=>setSavedDb(false),2000);}};
  return(
    <div style={{background:"#f5f5f7",borderRadius:12,marginBottom:8,overflow:"hidden"}}>
      {showPicker&&(
        <div onClick={e=>{if(e.target===e.currentTarget)setShowPicker(false);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.35)",zIndex:9999,display:"flex",alignItems:"flex-end"}}>
          <div style={{width:"100%",background:"#fff",borderRadius:"18px 18px 0 0",padding:"20px 20px 34px"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:16}}>📖 {recipe.name}</div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              <input autoFocus type="number" inputMode="decimal" value={qty} onChange={e=>setQty(e.target.value)}
                placeholder="1" style={{flex:1,border:`1.5px solid ${C.border}`,borderRadius:8,padding:"10px 12px",fontSize:16,fontFamily:"inherit",outline:"none"}}/>
              <select value={unit} onChange={e=>setUnit(e.target.value)}
                style={{flex:1,border:`1.5px solid ${C.border}`,borderRadius:8,padding:"10px 8px",fontSize:14,fontFamily:"inherit",background:"#fff"}}>
                <option value="מנות">{isHe?"מנות":"servings"}</option>
                <option value="יח׳">{isHe?"יח׳":"units"}</option>
                <option value="גר׳">{isHe?"גר׳":"g"}</option>
                <option value="מ״ל">{isHe?"מ״ל":"ml"}</option>
              </select>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowPicker(false)} style={{flex:1,background:"none",border:`1px solid ${C.border}`,borderRadius:10,padding:"11px",fontSize:14,cursor:"pointer",color:C.muted}}>{isHe?"ביטול":"Cancel"}</button>
              <button onClick={confirmAdd} style={{flex:2,background:C.accent,border:"none",borderRadius:10,padding:"11px",fontSize:14,fontWeight:700,color:"#fff",cursor:"pointer"}}>+ {isHe?"הוסף":"Add"}</button>
            </div>
          </div>
        </div>
      )}
      <div onClick={onToggle} style={{display:"flex",alignItems:"center",padding:"12px 14px",cursor:"pointer",gap:8}}>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>{recipe.name}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>{Math.round(recipe.kcalPerPerson||0)} kcal · {recipe.servings||1} {isHe?"מנות":"servings"}{recipe.source==='claude'?' · 🤖':''}</div>
        </div>
        <span style={{fontSize:10,color:C.muted,transform:open?"rotate(180deg)":"none",transition:"transform .2s",display:"inline-block"}}>▾</span>
      </div>
      {open&&(
        <div className="fade" style={{padding:"0 14px 12px"}}>
          {recipe.ingredients?.length>0&&(
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:5}}>{isHe?"מצרכים":"INGREDIENTS"}</div>
              {recipe.ingredients.map((ing,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:`1px solid ${C.border}`,fontSize:12}}>
                  <span style={{color:C.text}}>{ing.item}</span>
                  <span style={{color:C.muted}}>{ing.amount}{ing.unit&&ing.unit!=="יח׳"?" "+ing.unit:""}</span>
                </div>
              ))}
            </div>
          )}
          {recipe.steps?.length>0&&(
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:5}}>{isHe?"הכנה":"INSTRUCTIONS"}</div>
              {recipe.steps.map((step,i)=>(
                <div key={i} style={{display:"flex",gap:8,padding:"4px 0",fontSize:12,color:C.text}}>
                  <span style={{color:C.accent,fontWeight:700,flexShrink:0}}>{i+1}.</span>
                  <span style={{flex:1}}>{step}</span>
                </div>
              ))}
            </div>
          )}
          {recipe.kcalPerPerson>0&&(
            <div style={{display:"flex",gap:6,marginBottom:10,background:"rgba(255,255,255,.75)",borderRadius:8,padding:"8px 10px"}}>
              {[{l:"kcal",v:Math.round(recipe.kcalPerPerson),c:C.accent},{l:"carbs g",v:(recipe.carbsPerPerson||0).toFixed(1),c:C.warn},{l:"prot g",v:(recipe.proteinPerPerson||0).toFixed(1),c:C.blue}].map(({l,v,c})=>(
                <div key={l} style={{flex:1,textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div>
                  <div style={{fontSize:9,color:C.muted}}>{l}/{isHe?"מנה":"serving"}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            <button onClick={()=>setShowPicker(true)} style={{flex:2,background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"8px",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ {isHe?"הוסף להיום":"Add to day"}</button>
            <button onClick={handleSaveDb} title={isHe?"שמור למאגר מאכלים":"Save to food DB"} style={{flex:1,background:savedDb?"rgba(13,148,136,.1)":"none",border:`1px solid ${savedDb?C.accent:C.border}`,borderRadius:8,padding:"8px",fontSize:13,cursor:"pointer",color:savedDb?C.accent:C.muted,transition:"all .2s"}}>{savedDb?"✓":"💾"}</button>
            <button onClick={handleSaveQF} title={isHe?"שמור למועדפים":"Save to favorites"} style={{flex:1,background:savedQF?"rgba(245,158,11,.12)":"none",border:`1px solid ${savedQF?"#f59e0b":"rgba(245,158,11,.35)"}`,borderRadius:8,padding:"8px",fontSize:13,cursor:"pointer",color:savedQF?"#f59e0b":C.muted,transition:"all .2s"}}>{savedQF?"✓":"⭐"}</button>
            <button onClick={onEdit} style={{flex:1,background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px",fontSize:13,cursor:"pointer"}}>✏️</button>
            <button onClick={onShare} title="WhatsApp" style={{flex:1,background:"rgba(37,211,102,.1)",border:"1px solid rgba(37,211,102,.3)",borderRadius:8,padding:"8px",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg viewBox="0 0 24 24" width="17" height="17" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></button>
            <button onClick={onEmail} style={{flex:1,background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.2)",borderRadius:8,padding:"8px",fontSize:13,cursor:"pointer"}}>✉️</button>
            <button onClick={onDelete} style={{flex:1,background:"none",border:`1px solid rgba(220,38,38,.2)`,borderRadius:8,padding:"8px",fontSize:13,cursor:"pointer",color:C.danger}}>🗑</button>
          </div>
        </div>
      )}
    </div>
  );
}