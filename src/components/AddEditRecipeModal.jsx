import React, { useState, useRef } from 'react';
import { C } from '../lib/nutrition.js';
import { CalcLoader } from './CalcLoader.jsx';

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