import React, { useState, useRef } from 'react';
import { C } from '../lib/nutrition.js';
import { loadCustomDB, loadRecipes, saveCustomDB, saveRecipes } from '../lib/storage.js';
import { CalcLoader } from './Shared.jsx';
import { SaveFavNameSheet } from './QuickFoodButtons.jsx';

// Recipe book: cards, add/edit modal, and the book itself.

function formatRecipeShare(recipe,isHe){
  const lines=[`📖 ${recipe.name}`,''];
  if(recipe.ingredients?.length){
    lines.push(isHe?'🧂 מצרכים:':'🧂 Ingredients:');
    recipe.ingredients.forEach(i=>lines.push(`• ${i.amount} ${i.unit} ${i.item}`));
    lines.push('');
  }
  if(recipe.steps?.length){
    lines.push(isHe?'👨‍🍳 הכנה:':'👨‍🍳 Instructions:');
    recipe.steps.forEach((s,i)=>lines.push(`${i+1}. ${s}`));
    lines.push('');
  }
  if(recipe.kcalPerPerson) lines.push(`📊 ${isHe?'לכל מנה':'Per serving'}: ${Math.round(recipe.kcalPerPerson)} kcal · ${(recipe.carbsPerPerson||0).toFixed(1)}g carbs · ${(recipe.proteinPerPerson||0).toFixed(1)}g prot`);
  return lines.join('\n');
}

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

export function AddEditRecipeModal({recipe,onSave,onClose,lang,onAddToDay}){
  const isHe=(lang||'he')!=='en';
  const [name,setName]=useState(recipe?.name||'');
  const [servings,setServings]=useState(recipe?.servings||2);
  const [ingText,setIngText]=useState(()=>{
    if(!recipe?.ingredients?.length) return '';
    return recipe.ingredients.map(i=>[i.amount,i.unit&&i.unit!=='יח׳'&&i.unit!=="יח'"?i.unit:null,i.item].filter(Boolean).join(' ')).join(', ');
  });
  const [steps,setSteps]=useState(recipe?.steps?.length?recipe.steps:['']);
  const [nutrition,setNutrition]=useState(recipe?.kcalPerPerson?{kcal:recipe.kcalPerPerson,carbs:recipe.carbsPerPerson,protein:recipe.proteinPerPerson,fat:recipe.fatPerPerson}:null);
  const [loading,setLoading]=useState(false);
  const [loadingRecipe,setLoadingRecipe]=useState(false);
  const [loadingFile,setLoadingFile]=useState(false);
  const [error,setError]=useState('');
  const stepRefs=useRef([]);
  const recipeFileRef=useRef(null);

  const parseIngText=text=>text.split(',').map(s=>s.trim()).filter(Boolean).map(part=>{
    const m=part.match(/^(\d+(?:[.,]\d+)?)\s*(g|ml|kg|ק"ג|ק״ג|כף|כפות|כפית|כפיות|כוס|כוסות|יח׳|יח'|יחידות?)?\s+(.+)$/i);
    if(m) return{amount:m[1],unit:m[2]||'g',item:m[3].trim()};
    const m2=part.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(g|ml|kg|ק"ג|ק״ג|כף|כפות|כפית|כפיות|כוס|כוסות|יח׳|יח'|יחידות?)?$/i);
    if(m2) return{amount:m2[2],unit:m2[3]||'g',item:m2[1].trim()};
    return{item:part,amount:'',unit:"יח׳"};
  });

  const parsedIngredients=parseIngText(ingText);

  const handleStepKey=(e,i)=>{
    if(e.key==='Enter'){e.preventDefault();const s=[...steps];s.splice(i+1,0,'');setSteps(s);setTimeout(()=>stepRefs.current[i+1]?.focus(),40);}
    if(e.key==='Backspace'&&steps[i]===''&&steps.length>1){e.preventDefault();setSteps(v=>v.filter((_,j)=>j!==i));setTimeout(()=>stepRefs.current[Math.max(0,i-1)]?.focus(),40);}
  };

  const loadFromClaude=async()=>{
    if(!name.trim()) return;
    setLoadingRecipe(true);setError('');
    try{
      const r=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({mealPlan:{selectedMeal:name,people:servings,lang}})});
      const d=await r.json();
      if(!r.ok){setError(d.error||`Server error ${r.status}`);setLoadingRecipe(false);return;}
      if(d.recipe) applyRecipe(d.recipe);
      else setError(isHe?'לא הצלחתי לטעון מתכון':'Could not load recipe');
    }catch{setError(isHe?'שגיאה':'Error');}
    setLoadingRecipe(false);
  };

  const applyRecipe=rec=>{
    if(rec.name&&!name.trim()) setName(rec.name);
    if(rec.servings) setServings(rec.servings);
    if(rec.ingredients?.length) setIngText(rec.ingredients.map(i=>i.amount?`${i.amount} ${i.item}`:i.item).join(', '));
    if(rec.steps?.length) setSteps(rec.steps.filter(Boolean));
    if(rec.kcalPerPerson) setNutrition({kcal:Math.round(rec.kcalPerPerson),carbs:parseFloat((rec.carbsPerPerson||0).toFixed(1)),protein:parseFloat((rec.proteinPerPerson||0).toFixed(1)),fat:parseFloat((rec.fatPerPerson||0).toFixed(1))});
  };

  const loadFromFile=e=>{
    const file=e.target.files[0];if(!file)return;
    setLoadingFile(true);setError('');
    const reader=new FileReader();
    reader.onload=async ev=>{
      e.target.value='';
      const raw=ev.target.result||'';
      // Detect binary content (null bytes = not plain text)
      if(raw.includes('\x00')){
        setError(isHe?'הקובץ אינו טקסט רגיל — שמרי אותו כ-.txt ונסי שוב':'File is not plain text — save as .txt and try again');
        setLoadingFile(false);return;
      }
      const text=raw.trim();
      if(!text){setError(isHe?'הקובץ ריק':'File is empty');setLoadingFile(false);return;}
      try{
        const r=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({recipeText:text.slice(0,8000),lang})});
        if(!r.ok){const eb=await r.json().catch(()=>({}));setError(eb.error||`Server error ${r.status}`);setLoadingFile(false);return;}
        const d=await r.json();
        if(d.recipe) applyRecipe(d.recipe);
        else if(d.error) setError(d.error);
        else setError(isHe?'לא הצלחתי לפרסר את המתכון':'Could not parse recipe');
      }catch(err){setError(`Error: ${err.message||'unknown'}`);}
      setLoadingFile(false);
    };
    reader.onerror=()=>{setError(isHe?'שגיאה בקריאת הקובץ':'File read error');setLoadingFile(false);};
    reader.readAsText(file);
  };

  const askClaude=async()=>{
    if(!parsedIngredients.length) return;
    const desc=parsedIngredients.map(i=>[i.amount,i.unit,i.item].filter(Boolean).join(' ')).join(', ');
    setLoading(true);setError('');
    try{
      const r=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({mealDescription:`${isHe?'מתכון':'Recipe'} ${isHe?'ל':'for'}-${servings} ${isHe?'מנות':'servings'}:\n${desc}`})});
      const d=await r.json();
      if(d.kcal) setNutrition({kcal:Math.round(d.kcal/servings),carbs:parseFloat(((d.carbs||0)/servings).toFixed(1)),protein:parseFloat(((d.protein||0)/servings).toFixed(1)),fat:parseFloat(((d.fat||0)/servings).toFixed(1))});
      else setError(isHe?'לא הצלחתי לחשב':'Could not calculate');
    }catch{setError(isHe?'שגיאה':'Error');}
    setLoading(false);
  };

  const handleSave=()=>{
    onSave({id:recipe?.id||`recipe_${Date.now()}`,name:name.trim()||(isHe?'מתכון חדש':'New Recipe'),servings,source:recipe?.source||'manual',
      ingredients:parsedIngredients,steps:steps.filter(s=>s.trim()),
      kcalPerPerson:nutrition?.kcal||0,carbsPerPerson:nutrition?.carbs||0,proteinPerPerson:nutrition?.protein||0,fatPerPerson:nutrition?.fat||0,
      savedAt:recipe?.savedAt||new Date().toISOString()});
  };

  const handleAddToDay=()=>{
    if(!nutrition) return;
    onAddToDay({uid:Date.now()+Math.random(),label:`📖 ${name||'מתכון'} (${isHe?'מנה':'serving'})`,
      kcal:nutrition.kcal||0,carbs:parseFloat((nutrition.carbs||0).toFixed(1)),
      protein:parseFloat((nutrition.protein||0).toFixed(1)),fat:parseFloat((nutrition.fat||0).toFixed(1))});
    onClose();
  };

  const UNITS=['g','ml','יח׳','כף','כפית','כוס','ק״ג'];

  return(
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide" style={{maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:15,fontWeight:700}}>📝 {recipe?(isHe?"עריכת מתכון":"Edit Recipe"):(isHe?"מתכון חדש":"New Recipe")}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>

        {/* Name */}
        <input value={name} onChange={e=>setName(e.target.value)} placeholder={isHe?"שם המתכון":"Recipe name"} className="inp" style={{marginBottom:8,fontWeight:600}}/>

        {/* Load from Claude */}
        <button onClick={loadFromClaude} disabled={loadingRecipe||loadingFile||!name.trim()}
          style={{width:"100%",background:name.trim()&&!loadingRecipe&&!loadingFile?"linear-gradient(135deg,#6366f1,#8b5cf6)":"#ddd",border:"none",borderRadius:10,color:name.trim()&&!loadingRecipe&&!loadingFile?"#fff":"#aaa",padding:"9px",fontSize:13,fontWeight:700,cursor:name.trim()&&!loadingRecipe&&!loadingFile?"pointer":"default",marginBottom:6}}>
          {loadingRecipe?"...":`🤖 ${isHe?"טען מתכון מלא מ-Claude":"Load full recipe from Claude"}`}
        </button>

        {/* Load from file */}
        <input ref={recipeFileRef} type="file" style={{display:"none"}} onChange={loadFromFile}/>
        <button onClick={()=>recipeFileRef.current?.click()} disabled={loadingFile||loadingRecipe}
          style={{width:"100%",background:!loadingFile&&!loadingRecipe?"#f0f4ff":"#ddd",border:`1px solid ${!loadingFile&&!loadingRecipe?"#c7d2fe":"#e0e0e5"}`,borderRadius:10,color:!loadingFile&&!loadingRecipe?"#4f46e5":"#aaa",padding:"9px",fontSize:13,fontWeight:700,cursor:!loadingFile&&!loadingRecipe?"pointer":"default",marginBottom:12}}>
          {loadingFile?"...":`📄 ${isHe?"טען מתכון מקובץ":"Load recipe from file"}`}
        </button>
        {error&&!loadingFile&&<div style={{fontSize:11,color:C.danger,textAlign:"center",marginTop:-8,marginBottom:8,padding:"4px 8px",background:"rgba(220,38,38,.07)",borderRadius:6}}>{error}</div>}

        {/* Servings */}
        <div style={{display:"flex",alignItems:"center",gap:10,background:"#f5f5f7",borderRadius:10,padding:"8px 12px",marginBottom:14}}>
          <span style={{fontSize:12,color:C.muted,flex:1}}>{isHe?"מספר מנות:":"Servings:"}</span>
          <button onClick={()=>setServings(v=>Math.max(1,v-1))} style={{width:26,height:26,border:`1px solid ${C.border}`,borderRadius:6,background:"#fff",cursor:"pointer",fontSize:14}}>−</button>
          <span style={{fontWeight:700,fontSize:14,color:C.accent,minWidth:20,textAlign:"center"}}>{servings}</span>
          <button onClick={()=>setServings(v=>v+1)} style={{width:26,height:26,border:`1px solid ${C.border}`,borderRadius:6,background:"#fff",cursor:"pointer",fontSize:14}}>+</button>
        </div>

        {/* Ingredients — free text */}
        <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:4}}>{isHe?"מצרכים":"INGREDIENTS"}</div>
        <div style={{fontSize:10,color:C.muted,marginBottom:6}}>{isHe?"הפרד בין מצרכים עם פסיק — לדוגמה: 200g עוף, 3 בצלים, כף שמן":"Separate with commas — e.g.: 200g chicken, 3 onions, 1 tbsp oil"}</div>
        <textarea value={ingText} onChange={e=>setIngText(e.target.value)}
          placeholder={isHe?"200g עוף, בצל, כף שמן זית, 100g גבינה...":"200g chicken, onion, 1 tbsp olive oil, 100g cheese..."}
          className="inp" rows={3} style={{marginBottom:6,fontSize:12,resize:"vertical",lineHeight:1.5}}/>
        {parsedIngredients.length>0&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
            {parsedIngredients.map((ing,i)=>(
              <span key={i} style={{background:"rgba(90,158,30,.1)",border:"1px solid rgba(90,158,30,.25)",borderRadius:20,padding:"3px 10px",fontSize:11,color:"#166534",display:"inline-flex",alignItems:"center",gap:5}}>
                {[ing.amount,ing.unit&&ing.unit!=="יח׳"?ing.unit:null,ing.item].filter(Boolean).join(' ')}
                <button onClick={()=>{const arr=[...ingText.split(',')];arr.splice(i,1);setIngText(arr.map(s=>s.trim()).filter(Boolean).join(', '));}} style={{background:"none",border:"none",color:"#166534",cursor:"pointer",padding:0,fontSize:12,lineHeight:1}}>×</button>
              </span>
            ))}
          </div>
        )}

        {/* Steps */}
        <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:4}}>{isHe?"שלבי הכנה":"INSTRUCTIONS"}</div>
        <div style={{fontSize:10,color:C.muted,marginBottom:8}}>{isHe?"Enter = שלב חדש":"Enter = new step"}</div>
        {steps.map((step,i)=>(
          <div key={i} style={{display:"flex",gap:6,marginBottom:6,alignItems:"flex-start"}}>
            <span style={{color:C.accent,fontWeight:700,fontSize:12,marginTop:8,flexShrink:0,minWidth:16}}>{i+1}.</span>
            <textarea ref={el=>stepRefs.current[i]=el} id={`step-${i}`} value={step}
              onChange={e=>setSteps(s=>s.map((x,j)=>j===i?e.target.value:x))}
              onKeyDown={e=>handleStepKey(e,i)}
              rows={1} className="inp" style={{flex:1,fontSize:12,resize:"none",padding:"6px 8px",lineHeight:1.4}}/>
            {steps.length>1&&<button onClick={()=>setSteps(s=>s.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:C.danger,fontSize:16,cursor:"pointer",padding:"6px 4px",flexShrink:0}}>×</button>}
          </div>
        ))}
        <button onClick={()=>setSteps(s=>[...s,''])} style={{width:"100%",background:"transparent",border:`1px dashed ${C.border}`,borderRadius:8,padding:"6px",fontSize:12,color:C.accent,cursor:"pointer",marginBottom:14}}>+ {isHe?"הוסף שלב":"Add step"}</button>

        {/* Claude nutrition */}
        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,marginBottom:8}}>
          {loading&&<div style={{textAlign:"center",marginBottom:8}}><CalcLoader size={56}/></div>}
          {nutrition&&(
            <div className="fade" style={{display:"flex",gap:6,marginBottom:10,background:"#f0fae8",borderRadius:8,padding:"8px 10px"}}>
              {[{l:"kcal",v:Math.round(nutrition.kcal),c:C.accent},{l:"carbs g",v:(nutrition.carbs||0).toFixed(1),c:C.warn},{l:"prot g",v:(nutrition.protein||0).toFixed(1),c:C.blue}].map(({l,v,c})=>(
                <div key={l} style={{flex:1,textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div>
                  <div style={{fontSize:9,color:C.muted}}>{l}/{isHe?"מנה":"serving"}</div>
                </div>
              ))}
            </div>
          )}
          {error&&<div style={{fontSize:11,color:C.danger,marginBottom:8,textAlign:"center"}}>{error}</div>}
          <button onClick={askClaude} disabled={loading||!parsedIngredients.length}
            style={{width:"100%",background:parsedIngredients.length&&!loading?"linear-gradient(135deg,#5a9e1e,#7bc42e)":"#ddd",border:"none",borderRadius:10,color:parsedIngredients.length&&!loading?"#fff":"#aaa",padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:10}}>
            {loading?"...":`✨ ${isHe?"שאל את Claude לחישוב ערכים":"Ask Claude to calculate"}`}
          </button>
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:6}}>
          <button onClick={onClose} className="btn-muted" style={{flex:1}}>{isHe?"ביטול":"Cancel"}</button>
          <button onClick={handleAddToDay} disabled={!nutrition} style={{flex:1,background:nutrition?C.accent:"#ddd",border:"none",borderRadius:10,color:nutrition?"#fff":"#aaa",padding:"10px",fontSize:12,fontWeight:700,cursor:nutrition?"pointer":"default"}}>+ {isHe?"להיום":"Today"}</button>
          <button onClick={handleSave} style={{flex:2,background:C.accent,border:"none",borderRadius:10,color:"#fff",padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer"}}>💾 {isHe?"שמור":"Save"}</button>
        </div>
      </div>
    </div>
  );
}

export function RecipeBookModal({onClose,lang,pid,onAddToDay,onSaveQuickFood,initialEdit}){
  const isHe=(lang||'he')!=='en';
  const activePid=pid||window._activePid||'default';
  const [recipes,setRecipes]=useState(()=>loadRecipes(activePid));
  const [openId,setOpenId]=useState(null);
  const [search,setSearch]=useState('');
  const [showAdd,setShowAdd]=useState(false);
  const [editRecipe,setEditRecipe]=useState(initialEdit||null);
  const [pendingFav,setPendingFav]=useState(null);

  const save=r=>{setRecipes(r);saveRecipes(r,activePid);};
  const remove=id=>save(recipes.filter(r=>r.id!==id));

  const saveAsQuickFood=recipe=>{
    if(!recipe.kcalPerPerson) return false;
    const pid=window._activePid||activePid;
    const entry={names:[recipe.name.toLowerCase()],label:`📖 ${recipe.name}`,
      kcal:Math.round(recipe.kcalPerPerson||0),carbs:parseFloat((recipe.carbsPerPerson||0).toFixed(1)),
      protein:parseFloat((recipe.proteinPerPerson||0).toFixed(1)),fat:parseFloat((recipe.fatPerPerson||0).toFixed(1)),
      defaultAmt:1,unit:"מנה",source:'recipe'};
    const db=loadCustomDB(pid);
    saveCustomDB([...db.filter(f=>f.label!==entry.label),entry],pid);
    return true;
  };

  const saveToQuickFoods=recipe=>{
    if(!recipe.kcalPerPerson) return false;
    const food={id:`qf_recipe_${Date.now()}`,label:`📖 ${recipe.name}`,
      kcal:Math.round(recipe.kcalPerPerson||0),carbs:parseFloat((recipe.carbsPerPerson||0).toFixed(1)),
      protein:parseFloat((recipe.proteinPerPerson||0).toFixed(1)),fat:parseFloat((recipe.fatPerPerson||0).toFixed(1))};
    setPendingFav(food);
    return true;
  };

  const share=recipe=>{const msg=formatRecipeShare(recipe,isHe);window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank');};
  const email=recipe=>{const msg=formatRecipeShare(recipe,isHe);window.open(`mailto:?subject=${encodeURIComponent(recipe.name)}&body=${encodeURIComponent(msg)}`,'_blank');};

  const handleAddToDay=(recipe,qty=1,unit="מנות")=>{
    const isByServing=unit==="מנות"||unit==="יח׳";
    const factor=isByServing?qty:qty/100;
    const unitLabel=isByServing?(qty===1?(isHe?"מנה":"serving"):`${qty} ${unit}`):`${qty}${unit}`;
    onAddToDay({uid:Date.now()+Math.random(),label:`📖 ${recipe.name} (${unitLabel})`,
      kcal:Math.round((recipe.kcalPerPerson||0)*factor),
      carbs:parseFloat(((recipe.carbsPerPerson||0)*factor).toFixed(1)),
      protein:parseFloat(((recipe.proteinPerPerson||0)*factor).toFixed(1)),
      fat:parseFloat(((recipe.fatPerPerson||0)*factor).toFixed(1))});
    onClose();
  };

  const filtered=search.trim()?recipes.filter(r=>r.name.toLowerCase().includes(search.toLowerCase())):recipes;

  if(showAdd||editRecipe){
    return <AddEditRecipeModal recipe={editRecipe} lang={lang} onAddToDay={e=>{onAddToDay(e);onClose();}}
      onClose={()=>{setShowAdd(false);setEditRecipe(null);}}
      onSave={r=>{const updated=editRecipe?recipes.map(x=>x.id===r.id?r:x):[r,...recipes];save(updated);setShowAdd(false);setEditRecipe(null);}}/>;
  }

  return(
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide" style={{maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:15,fontWeight:700}}>📖 {isHe?"ספר מתכונים":"My Recipes"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={isHe?"חפש מתכון...":"Search recipes..."} className="inp" style={{marginBottom:10}}/>
        <button onClick={()=>setShowAdd(true)} style={{width:"100%",background:"transparent",border:`1px dashed ${C.border}`,borderRadius:10,padding:10,fontSize:12,color:C.accent,cursor:"pointer",marginBottom:12,fontWeight:700}}>
          + {isHe?"הוסף מתכון":"Add Recipe"}
        </button>
        {filtered.length===0
          ?<div style={{textAlign:"center",color:C.muted,padding:30,fontSize:13}}>{isHe?"אין עדיין מתכונים":"No recipes yet"}</div>
          :filtered.map(recipe=>(
            <RecipeCard key={recipe.id} recipe={recipe} isHe={isHe}
              open={openId===recipe.id} onToggle={()=>setOpenId(openId===recipe.id?null:recipe.id)}
              onEdit={()=>setEditRecipe(recipe)} onDelete={()=>remove(recipe.id)}
              onShare={()=>share(recipe)} onEmail={()=>email(recipe)}
              onAddToDay={(qty,unit)=>handleAddToDay(recipe,qty,unit)}
              onSaveToDb={()=>saveAsQuickFood(recipe)}
              onSaveQuickFood={()=>saveToQuickFoods(recipe)}/>
          ))
        }
      </div>
      {pendingFav&&<SaveFavNameSheet defaultName={pendingFav.label} onConfirm={name=>{onSaveQuickFood?.({...pendingFav,label:name});setPendingFav(null);}} onClose={()=>setPendingFav(null)}/>}
    </div>
  );
}
