import React, { useState } from 'react';
import { LANG } from '../lib/lang.js';
import { loadCustomDB, loadFridge, loadPantry, loadShopping, saveCustomDB, saveFridgeLS } from '../lib/storage.js';
import { API, C, FRIDGE_CATS } from '../lib/nutrition.js';
import { saveShopping } from '../lib/household.js';
import { CalcLoader } from './CalcLoader.jsx';

export function MealPlannerModal({onAdd,onClose,lang,profile,onSaveRecipe}){
  const T=LANG[lang]||LANG.he;
  const isHe=lang!=='en';
  const [step,setStep]=useState(1);
  const [prefs,setPrefs]=useState("");
  const [people,setPeople]=useState(2);
  const [loading,setLoading]=useState(false);
  const [options,setOptions]=useState([]);
  const [selected,setSelected]=useState(null);
  const [recipe,setRecipe]=useState(null);
  const [showRefine,setShowRefine]=useState(false);
  const [refineText,setRefineText]=useState("");
  const [notes,setNotes]=useState("");
  const [showJsonInput,setShowJsonInput]=useState(false);
  const [jsonText,setJsonText]=useState("");
  const [jsonError,setJsonError]=useState("");
  const [error,setError]=useState("");
  const syncFridgeFromPantry=(base)=>{
    const p=loadPantry();
    const merged={...base};
    FRIDGE_CATS.forEach(c=>{
      const pNames=(p[c.key]||[]).map(i=>i.name);
      const existing=base[c.key]||[];
      const combined=[...existing,...pNames.filter(n=>!existing.includes(n))];
      if(combined.length) merged[c.key]=combined;
    });
    return merged;
  };
  const [fridge,setFridge]=useState(()=>syncFridgeFromPantry(loadFridge()));
  const [fridgeIn,setFridgeIn]=useState(()=>Object.fromEntries(FRIDGE_CATS.map(c=>[c.key,""])));
  const [fridgeOpen,setFridgeOpen]=useState(()=>Object.fromEntries(FRIDGE_CATS.map(c=>[c.key,false])));
  const [savedPrefs,setSavedPrefs]=useState(()=>{try{return JSON.parse(localStorage.getItem("nutrition_saved_prefs")||"[]");}catch{return [];}});
  const savePref=()=>{
    const v=prefs.trim();
    if(!v||savedPrefs.includes(v))return;
    const updated=[...savedPrefs,v];
    setSavedPrefs(updated);
    localStorage.setItem("nutrition_saved_prefs",JSON.stringify(updated));
  };
  const removeSavedPref=p=>{
    const updated=savedPrefs.filter(x=>x!==p);
    setSavedPrefs(updated);
    localStorage.setItem("nutrition_saved_prefs",JSON.stringify(updated));
  };

  const updateFridge=f=>{setFridge(f);saveFridgeLS(f);};
  const resyncFromPantry=()=>{const synced=syncFridgeFromPantry(fridge);setFridge(synced);saveFridgeLS(synced);};
  const addFridgeItem=(cat,val)=>{
    const items=val.split(/[,،]/).map(s=>s.trim()).filter(Boolean);
    if(!items.length)return;
    const existing=fridge[cat]||[];
    const updated={...fridge,[cat]:[...existing,...items.filter(v=>!existing.includes(v))]};
    updateFridge(updated);
    setFridgeIn(i=>({...i,[cat]:""}));
  };
  const removeFridgeItem=(cat,val)=>updateFridge({...fridge,[cat]:(fridge[cat]||[]).filter(x=>x!==val)});

  const buildFridgeStr=()=>FRIDGE_CATS
    .filter(c=>(fridge[c.key]||[]).length)
    .map(c=>`${isHe?c.he:c.en}: ${fridge[c.key].join(", ")}`)
    .join(" | ");

  const BASE_INGS=['שמן','מלח','פלפל שחור','סוכר','אבקת אפייה','סודה לשתייה','מים','חומץ'];
  const fridgeFlat=FRIDGE_CATS.flatMap(c=>(fridge[c.key]||[]).map(s=>s.toLowerCase()));
  const isMissing=name=>{
    const n=name.toLowerCase();
    if(BASE_INGS.some(b=>n===b||n.startsWith(b+' ')))return false;
    // Build search list: Hebrew originals + English translations when available
    const enValues=Object.values(fridgeTrans).map(s=>s.toLowerCase());
    const searchList=[...fridgeFlat,...enValues];
    return!searchList.some(f=>f.includes(n)||n.includes(f));
  };
  const getMissing=opt=>(opt.ingredients||[]).filter(isMissing);
  const [cartMsg,setCartMsg]=useState("");
  const [fridgeTrans,setFridgeTrans]=useState({});
  const addMissingToCart=missing=>{
    if(!missing||!missing.length)return;
    const current=loadShopping();
    const toAdd=missing.filter(m=>!current.some(c=>c.name.toLowerCase()===m.toLowerCase()));
    if(!toAdd.length){setCartMsg(isHe?"✓ כבר ברשימה":"✓ Already in list");setTimeout(()=>setCartMsg(""),2000);return;}
    saveShopping([...current,...toAdd.map(m=>({id:Date.now()+Math.random(),name:m,qty:'',checked:false,auto:false,addedBy:''}))]);
    setCartMsg(isHe?`✓ ${toAdd.length} פריטים נוספו לעגלה`:`✓ ${toAdd.length} item${toAdd.length>1?'s':''} added`);
    setTimeout(()=>setCartMsg(""),2500);
  };
  const fetchOptions=async(refine, exclude=[])=>{
    setLoading(true);setError("");
    const fridgeStr=buildFridgeStr();
    const fullPrefs=[prefs,notes?(isHe?`הערות: ${notes}`:`Notes: ${notes}`):"",fridgeStr?(isHe?`מה במקרר: ${fridgeStr}`:`Fridge: ${fridgeStr}`):""].filter(Boolean).join("\n");
    try{
      const r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({mealPlan:{preferences:fullPrefs,people,refine:refine||undefined,exclude:exclude.length?exclude:undefined,lang}})});
      const d=await r.json();
      if(d.error)throw new Error(d.error);
      setOptions(d.options||[]);
      if(d.translatedFridge) setFridgeTrans(d.translatedFridge);
      setShowRefine(false);setRefineText("");
      setStep(2);
    }catch(e){setError(isHe?"שגיאה, נסי שוב":"Error, please try again");}
    setLoading(false);
  };

  const fetchRecipe=async(optionName)=>{
    setSelected(optionName);
    setLoading(true);setError("");
    try{
      const r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({mealPlan:{selectedMeal:optionName,people,lang}})});
      const d=await r.json();
      if(d.error)throw new Error(d.error);
      const rec=d.recipe||d;
      if(!rec||!rec.name)throw new Error("No recipe returned");
      setRecipe(rec);
      setStep(3);
    }catch(e){
      setError((isHe?"שגיאה: ":"Error: ")+e.message);
    }
    setLoading(false);
  };

  const [showIngEdit,setShowIngEdit]=useState(false);
  const [editIngs,setEditIngs]=useState([]);
  const [editNutr,setEditNutr]=useState({});
  const [recalcLoading,setRecalcLoading]=useState(false);
  const [newIngItem,setNewIngItem]=useState("");
  const [newIngAmt,setNewIngAmt]=useState("");

  const addToDay=(nutr)=>{
    if(!recipe)return;
    const n=nutr||{kcal:recipe.kcalPerPerson||0,carbs:recipe.carbsPerPerson||0,protein:recipe.proteinPerPerson||0,fat:recipe.fatPerPerson||0};
    onAdd({uid:Date.now()+Math.random(),label:recipe.name,kcal:n.kcal,carbs:n.carbs,protein:n.protein,fat:n.fat});
    onClose();
  };

  const openIngEdit=()=>{
    setEditIngs((recipe.ingredients||[]).map((ing,i)=>({...ing,_id:i})));
    setEditNutr({kcal:recipe.kcalPerPerson||0,carbs:recipe.carbsPerPerson||0,protein:recipe.proteinPerPerson||0,fat:recipe.fatPerPerson||0});
    setShowIngEdit(true);
  };

  const [savedToDb,setSavedToDb]=useState(false);
  const saveToDb=(nutr)=>{
    const n=nutr||{kcal:recipe.kcalPerPerson||0,carbs:recipe.carbsPerPerson||0,protein:recipe.proteinPerPerson||0,fat:recipe.fatPerPerson||0};
    const name=recipe.name;
    const entry={names:[name.toLowerCase()],label:`🍳 ${name}`,kcal:n.kcal,carbs:n.carbs,protein:n.protein,fat:n.fat,defaultAmt:1,unit:isHe?"מנה":"serving"};
    const pid=window._activePid||"default";
    const db=loadCustomDB(pid);
    saveCustomDB([...db.filter(f=>f.label!==entry.label),entry],pid);
    setSavedToDb(true);
    setTimeout(()=>setSavedToDb(false),2000);
  };

  const recalculate=async()=>{
    setRecalcLoading(true);
    const mealDesc=editIngs.map(i=>`${i.item} ${i.amount}`).join(', ');
    try{
      const r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({mealDescription:mealDesc})});
      const d=await r.json();
      if(d.kcal!==undefined){
        setEditNutr({kcal:Math.round(d.kcal/people),carbs:parseFloat((d.carbs/people).toFixed(1)),protein:parseFloat((d.protein/people).toFixed(1)),fat:parseFloat(((d.fat||0)/people).toFixed(1))});
      }
    }catch(e){}
    setRecalcLoading(false);
  };

  return(
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide" style={{maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:700}}>🍳 {isHe?"מה אוכלים?":"What to eat?"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>
        {cartMsg&&<div style={{background:"#f0fae8",border:`1px solid ${C.accent}`,borderRadius:8,padding:"7px 12px",fontSize:12,color:C.accent,fontWeight:600,marginBottom:10,textAlign:"center"}}>{cartMsg}</div>}

        {/* Step indicator */}
        <div style={{display:"flex",gap:6,marginBottom:20}}>
          {[isHe?"העדפות":"Preferences",isHe?"אפשרויות":"Options",isHe?"מתכון":"Recipe"].map((s,i)=>(
            <div key={i} style={{flex:1,height:4,borderRadius:2,background:step>i?C.accent:"rgba(148,163,184,.25)"}}/>
          ))}
        </div>

        {/* Step 1 */}
        {step===1&&(()=>{
          const COND_MAP={t2d:"סוכרת סוג 2",t1d:"סוכרת סוג 1",prediab:"טרום סכרת",menopause:"גיל המעבר",hyper:"יתר לחץ דם",chol:"כולסטרול גבוה",meta:"תסמונת מטבולית",kidney:"מחלת כליות",heart:"מחלת לב"};
          const DIET_MAP={veg:"צמחוני",vegan:"טבעוני",gf:"ללא גלוטן",lf:"ללא לקטוז",kosher:"כשר",lowsodium:"דל נתרן",keto:"קטוגני"};
          const profileChips=[
            ...(profile?.conditions||[]).map(c=>COND_MAP[c]||c),
            ...(profile?.dietPrefs||[]).map(d=>DIET_MAP[d]||d),
            ...(profile?.dietText?[profile.dietText]:[]),
          ];
          const toggleChip=chip=>{
            const current=prefs.split(',').map(s=>s.trim()).filter(Boolean);
            const idx=current.indexOf(chip);
            if(idx>=0) setPrefs(current.filter((_,i)=>i!==idx).join(', '));
            else setPrefs([...current,chip].join(', '));
          };
          const activePrefs=prefs.split(',').map(s=>s.trim()).filter(Boolean);
          return(<>
          <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{isHe?"העדפות תזונה (רשות)":"Dietary preferences (optional)"}</div>
          <div style={{display:"flex",gap:6,marginBottom:profileChips.length?6:12}}>
            <textarea value={prefs} onChange={e=>setPrefs(e.target.value)}
              placeholder={isHe?"ללא גלוטן, טבעוני, דל פחמימות...":"gluten-free, vegan, low carb..."}
              rows={1} className="inp" style={{flex:1,resize:"none"}}/>
            <button onClick={savePref} title={isHe?"שמור העדפה":"Save preference"}
              style={{background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"0 10px",cursor:"pointer",fontSize:14,flexShrink:0}}>💾</button>
          </div>
          {profileChips.length>0&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
              {profileChips.map(chip=>{
                const active=activePrefs.includes(chip);
                return(
                  <button key={chip} onClick={()=>toggleChip(chip)}
                    style={{background:active?"rgba(13,148,136,.18)":"rgba(148,163,184,.1)",border:`1px solid ${active?"rgba(13,148,136,.45)":"rgba(148,163,184,.3)"}`,borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:600,color:active?C.accent:C.muted,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
                    {active?"✓ ":""}{chip}
                  </button>
                );
              })}
            </div>
          )}
          {savedPrefs.length>0&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
              {savedPrefs.map(p=>(
                <span key={p} onClick={()=>setPrefs(p)}
                  style={{background:prefs===p?"rgba(13,148,136,.18)":"rgba(148,163,184,.12)",border:`1px solid ${prefs===p?"rgba(13,148,136,.4)":"rgba(148,163,184,.3)"}`,borderRadius:20,padding:"4px 10px",fontSize:11,color:prefs===p?C.accent:C.text,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:5}}>
                  {p}
                  <button onClick={e=>{e.stopPropagation();removeSavedPref(p);}}
                    style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,padding:0,lineHeight:1}}>×</button>
                </span>
              ))}
            </div>
          )}

          {/* Fridge section */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>🥗 {isHe?"מה במקרר?":"What's in the fridge?"}</div>
            <button onClick={resyncFromPantry} style={{background:'none',border:`1px solid ${C.accent}`,borderRadius:8,color:C.accent,fontSize:11,fontWeight:600,padding:'4px 10px',cursor:'pointer',fontFamily:'inherit'}}>🔄 {isHe?'עדכן ממזווה':'Sync pantry'}</button>
          </div>
          {FRIDGE_CATS.map(cat=>(
            <div key={cat.key} style={{marginBottom:8}}>
              <button onClick={()=>setFridgeOpen(o=>({...o,[cat.key]:!o[cat.key]}))}
                style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",background:"none",border:"none",cursor:"pointer",padding:"4px 0",fontFamily:"inherit"}}>
                <span style={{fontSize:11,fontWeight:600,color:C.muted}}>{isHe?cat.he:cat.en}{(fridge[cat.key]||[]).length>0&&<span style={{marginRight:4,background:C.accent,color:"#fff",borderRadius:10,fontSize:9,padding:"1px 5px"}}>{(fridge[cat.key]||[]).length}</span>}</span>
                <span style={{fontSize:10,color:C.muted,transform:fridgeOpen[cat.key]?"rotate(180deg)":"none",transition:"transform .2s",display:"inline-block"}}>▾</span>
              </button>
              {fridgeOpen[cat.key]&&<><div style={{display:"flex",gap:6,marginBottom:6}}>
                <input
                  value={fridgeIn[cat.key]}
                  onChange={e=>setFridgeIn(i=>({...i,[cat.key]:e.target.value}))}
                  onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addFridgeItem(cat.key,fridgeIn[cat.key]);}}}
                  placeholder={isHe?"הוסף...":"Add..."}
                  className="inp" style={{flex:1,fontSize:12,padding:"6px 10px"}}/>
                <button onClick={()=>addFridgeItem(cat.key,fridgeIn[cat.key])}
                  style={{background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"0 12px",cursor:"pointer",fontSize:16,fontWeight:700}}>+</button>
              </div>
              {(fridge[cat.key]||[]).length>0&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {(fridge[cat.key]||[]).map(item=>(
                    <span key={item} style={{background:"rgba(13,148,136,.12)",border:"1px solid rgba(13,148,136,.3)",borderRadius:20,padding:"5px 12px 5px 8px",fontSize:12,color:C.accent,display:"inline-flex",alignItems:"center",gap:6,fontWeight:500}}>
                      {!isHe&&fridgeTrans[item]?fridgeTrans[item]:item}
                      <button onClick={()=>removeFridgeItem(cat.key,item)}
                        style={{background:"rgba(13,148,136,.2)",border:"none",borderRadius:"50%",color:C.accent,cursor:"pointer",fontSize:11,padding:0,width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,flexShrink:0}}>×</button>
                    </span>
                  ))}
                </div>
              )}</>}
            </div>
          ))}

          <div style={{fontSize:11,color:C.muted,marginBottom:8,marginTop:4}}>{isHe?"מספר סועדים":"Number of people"}</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,background:"rgba(148,163,184,.1)",borderRadius:10,padding:"8px 14px"}}>
            <button onClick={()=>setPeople(v=>Math.max(1,v-1))} style={{width:28,height:28,border:`1px solid ${C.border}`,borderRadius:6,background:"rgba(255,255,255,.7)",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
            <span style={{flex:1,textAlign:"center",fontSize:16,fontWeight:700,color:C.text}}>{people} {isHe?"אנשים":"people"}</span>
            <button onClick={()=>setPeople(v=>v+1)} style={{width:28,height:28,border:`1px solid ${C.border}`,borderRadius:6,background:"rgba(255,255,255,.7)",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
          </div>
          {/* Notes field */}
          <div style={{fontSize:11,color:C.muted,marginBottom:4,marginTop:4}}>{isHe?"הערות והארות לקלוד (רשות)":"Notes for Claude (optional)"}</div>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)}
            placeholder={isHe?"למשל: לא יכולה לאכול בשר היום, משהו קל וקצר הכנה...":"e.g. no meat today, something quick to prepare..."}
            rows={2} className="inp" style={{resize:"none",marginBottom:16,fontSize:12}}/>

          {error&&<div style={{color:C.danger,fontSize:12,marginBottom:8}}>{error}</div>}
          {loading&&<div style={{textAlign:'center',marginBottom:8}}><CalcLoader size={64}/></div>}
          <button onClick={()=>fetchOptions()} disabled={loading} className="btn-accent" style={{borderRadius:12}}>
            {loading?(isHe?"מחפש...":"Searching..."):(isHe?"✨ קבל הצעות":"✨ Get suggestions")}
          </button>

          {/* Manual JSON input */}
          <button onClick={()=>{setShowJsonInput(v=>!v);setJsonError("");}}
            style={{background:"none",border:"none",color:C.muted,fontSize:11,cursor:"pointer",marginTop:10,padding:0,fontFamily:"inherit",textDecoration:"underline"}}>
            {isHe?"📋 הזן JSON ידנית מקלוד":"📋 Paste Claude JSON manually"}
          </button>
          {showJsonInput&&<>
            <textarea value={jsonText} onChange={e=>setJsonText(e.target.value)}
              placeholder={isHe?'הדבק כאן JSON מקלוד\n{"options":[...]} או {"recipe":{...}}':'Paste Claude JSON here\n{"options":[...]} or {"recipe":{...}}'}
              rows={5} className="inp" style={{resize:"vertical",marginTop:6,fontSize:11,fontFamily:"monospace"}}/>
            {jsonError&&<div style={{color:C.danger,fontSize:11,marginTop:4}}>{jsonError}</div>}
            <button onClick={()=>{
              setJsonError("");
              try{
                const d=JSON.parse(jsonText.trim());
                if(d.options&&Array.isArray(d.options)){
                  setOptions(d.options);
                  if(d.translatedFridge) setFridgeTrans(d.translatedFridge);
                  setStep(2);setShowJsonInput(false);
                }else if(d.recipe){
                  setRecipe(d.recipe);
                  setStep(3);setShowJsonInput(false);
                }else{
                  setJsonError(isHe?"JSON לא תקין — צפוי {options:[...]} או {recipe:{...}}":"Invalid JSON — expected {options:[...]} or {recipe:{...}}");
                }
              }catch(e){setJsonError((isHe?"שגיאת JSON: ":"JSON error: ")+e.message);}
            }} className="btn-accent" style={{borderRadius:12,marginTop:6}}>
              {isHe?"📥 טען":"📥 Load"}
            </button>
          </>}
        </>);})()}

        {/* Step 2 — Options */}
        {step===2&&<>
          {error&&<div style={{background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:8,padding:"8px 12px",fontSize:12,color:C.danger,marginBottom:10}}>{error}</div>}
          {options.map((opt,i)=>{
            const missing=getMissing(opt);
            return(
            <div key={i} style={{background:"rgba(255,255,255,.7)",border:`1px solid rgba(148,163,184,.25)`,borderRadius:16,padding:14,marginBottom:10,position:'relative'}}>
              {/* Cart icon — top-left, always visible */}
              <button onClick={()=>addMissingToCart(missing)} title={isHe?'הוסף חסרים לעגלה':'Add missing to cart'}
                style={{position:'absolute',top:10,left:10,background:'none',border:'none',cursor:'pointer',padding:0,lineHeight:1,opacity:missing.length?1:0.35}}>
                <img src="/Nutrition/shopping-cart.png" style={{width:20,height:20,objectFit:'contain'}} alt=""/>
              </button>
              <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4,paddingRight:4,paddingLeft:30}}>{opt.name}</div>
              <div style={{fontSize:12,color:C.muted,marginBottom:8}}>{opt.description}</div>
              <div style={{display:"flex",gap:8,marginBottom:6}}>
                {[{l:isHe?"קק״ל":"kcal",v:opt.kcalPerPerson,c:C.accent},
                  {l:isHe?"פחמ׳":"carbs",v:opt.carbsPerPerson,c:C.warn},
                  {l:isHe?"חלבון":"prot",v:opt.proteinPerPerson,c:C.blue}].map(({l,v,c})=>(
                  <div key={l} style={{flex:1,background:`${c}11`,borderRadius:8,padding:"4px 6px",textAlign:"center"}}>
                    <div style={{fontSize:13,fontWeight:700,color:c}}>{Math.round(v||0)}</div>
                    <div style={{fontSize:9,color:C.muted}}>{l}/{isHe?"אדם":"person"}</div>
                  </div>
                ))}
              </div>
              {(opt.ingredients||[]).length>0&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
                  {(opt.ingredients||[]).map(ing=>{
                    const m=isMissing(ing);
                    return(
                      <span key={ing} style={{fontSize:11,padding:"3px 8px",borderRadius:12,
                        background:m?"rgba(153,27,27,.08)":"rgba(13,148,136,.08)",
                        color:m?"#991b1b":C.accent,
                        border:`1px solid ${m?"rgba(153,27,27,.25)":"rgba(13,148,136,.25)"}`,
                        fontWeight:m?700:400}}>
                        {m?"✗ ":"✓ "}{ing}
                      </span>
                    );
                  })}
                </div>
              )}
              <button onClick={()=>fetchRecipe(opt.name)} disabled={loading}
                style={{width:"100%",background:C.accent,border:"none",borderRadius:10,color:"#fff",padding:"9px",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                {loading&&selected===opt.name?(isHe?"טוען...":"Loading..."):(isHe?"בחר":"Select")}
              </button>
            </div>
            );
          })}
          {/* More ideas + Refine */}
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <button onClick={()=>fetchOptions(undefined,options.map(o=>o.name))} disabled={loading}
              style={{flex:1,background:"rgba(13,148,136,.08)",border:`1px solid rgba(13,148,136,.3)`,borderRadius:10,padding:"8px",fontSize:12,color:C.accent,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
              {loading?(isHe?"מחפש...":"Searching..."):(isHe?"💡 עוד רעיונות":"💡 More ideas")}
            </button>
            <button onClick={()=>setShowRefine(v=>!v)}
              style={{flex:1,background:showRefine?"rgba(148,163,184,.1)":"none",border:`1px solid ${C.border}`,borderRadius:10,padding:"8px",fontSize:12,color:C.muted,cursor:"pointer",fontFamily:"inherit"}}>
              {isHe?"🔍 דייקי":"🔍 Refine"} {showRefine?"↑":"↓"}
            </button>
          </div>
          {showRefine&&<>
            <textarea value={refineText} onChange={e=>setRefineText(e.target.value)}
              placeholder={isHe?"מה לשנות? למשל: משהו קל יותר, ללא בשר...":"What to change? e.g. something lighter, no meat..."}
              rows={2} className="inp" style={{marginBottom:8,resize:"none"}}/>
            {loading&&<div style={{textAlign:'center',marginBottom:8}}><CalcLoader size={64}/></div>}
            <button onClick={()=>fetchOptions(refineText,options.map(o=>o.name))} disabled={loading} className="btn-accent" style={{borderRadius:10}}>
              {loading?(isHe?"מחפש...":"Searching..."):(isHe?"✨ עדכן הצעות":"✨ Update")}
            </button>
          </>}
          {error&&<div style={{color:C.danger,fontSize:12,marginTop:8}}>{error}</div>}
        </>}

        {/* Step 3 — Recipe */}
        {step===3&&recipe&&<>
          {!showIngEdit ? <>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3}}>
              <div style={{fontSize:14,fontWeight:900,color:C.text,flex:1}}>{recipe.name}</div>
              {(()=>{const m=(recipe.ingredients||[]).filter(ing=>isMissing(ing.item)).map(ing=>ing.item);return<button onClick={()=>addMissingToCart(m)} title={isHe?'הוסף חסרים לעגלה':'Add missing to cart'} style={{background:'none',border:'none',cursor:'pointer',padding:'0 4px',flexShrink:0,lineHeight:1,opacity:m.length?1:0.35}}><img src="/Nutrition/shopping-cart.png" style={{width:22,height:22,objectFit:'contain'}} alt=""/></button>})()}
            </div>
            <div style={{fontSize:10,color:C.muted,marginBottom:10}}>{isHe?"לאדם":"per person"}: {Math.round(recipe.kcalPerPerson||0)} {isHe?"קק״ל":"kcal"} · {Math.round(recipe.carbsPerPerson||0)}g {isHe?"פחמ׳":"carbs"} · {Math.round(recipe.proteinPerPerson||0)}g {isHe?"חלבון":"prot"}</div>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1.2,marginBottom:6}}>{isHe?"רכיבים (ל-":"Ingredients (for "}{people}{isHe?" אנשים)":")"}</div>
            <div style={{background:"rgba(148,163,184,.08)",borderRadius:10,padding:"8px 12px",marginBottom:10}}>
              {(recipe.ingredients||[]).map((ing,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:i<recipe.ingredients.length-1?`1px solid ${C.border}`:"none"}}>
                  <span style={{fontSize:12,color:C.text}}>{ing.item}</span>
                  <span style={{fontSize:11,color:C.muted,fontWeight:600}}>{ing.amount}</span>
                </div>
              ))}
            </div>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1.2,marginBottom:6}}>{isHe?"הכנה":"Instructions"}</div>
            <ol style={{paddingRight:14,marginBottom:12,marginTop:0}}>
              {(recipe.steps||[]).map((s,i)=><li key={i} style={{fontSize:12,color:C.text,marginBottom:4,lineHeight:1.4}}>{s}</li>)}
            </ol>
            {error&&<div style={{color:C.danger,fontSize:12,marginBottom:8}}>{error}</div>}
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setStep(2);setRecipe(null);}} className="btn-muted" style={{flex:1,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>{isHe?<><span>→</span><span>חזרה</span></>:"← Back"}</button>
                <button onClick={()=>addToDay()} className="btn-accent" style={{flex:2,borderRadius:10}}>{isHe?"+ הוסף ליומן היום":"+ Add to today"}</button>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={openIngEdit} style={{flex:1,background:"none",border:`1px solid ${C.accent}`,color:C.accent,borderRadius:10,padding:"9px",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                  {isHe?"✏️ עם שינויים":"✏️ Modify"}
                </button>
                <button onClick={()=>saveToDb()} style={{flex:1,background:savedToDb?"rgba(13,148,136,.12)":"none",border:`1px solid ${savedToDb?C.accent:C.border}`,color:savedToDb?C.accent:C.muted,borderRadius:10,padding:"9px",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                  {savedToDb?(isHe?"✓ נשמר":"✓ Saved"):(isHe?"💾 מאגר":"💾 DB")}
                </button>
                <button onClick={()=>{
                  const r={id:`recipe_${Date.now()}`,name:recipe.name,servings:people,source:'claude',
                    ingredients:(recipe.ingredients||[]).map(i=>({item:i.item,amount:i.amount,unit:''})),
                    steps:recipe.steps||[],kcalPerPerson:recipe.kcalPerPerson||0,
                    carbsPerPerson:recipe.carbsPerPerson||0,proteinPerPerson:recipe.proteinPerPerson||0,
                    fatPerPerson:recipe.fatPerPerson||0,savedAt:new Date().toISOString()};
                  onSaveRecipe&&onSaveRecipe(r);
                }} style={{flex:1,background:"rgba(99,102,241,.08)",border:"1px solid rgba(99,102,241,.3)",color:"#6366f1",borderRadius:10,padding:"9px",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                  📖 {isHe?"ספר":"Book"}
                </button>
              </div>
            </div>
          </> : <>
            {/* Ingredient editor */}
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>{isHe?"ערוך מרכיבים":"Edit ingredients"}</div>
            <div style={{background:"rgba(148,163,184,.06)",borderRadius:12,padding:"8px 12px",marginBottom:10}}>
              {editIngs.map((ing,i)=>(
                <div key={ing._id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",borderBottom:i<editIngs.length-1?`1px solid ${C.border}`:"none"}}>
                  <span style={{flex:1,fontSize:12,color:C.text}}>{ing.item}</span>
                  <input value={ing.amount} onChange={e=>setEditIngs(prev=>prev.map(x=>x._id===ing._id?{...x,amount:e.target.value}:x))}
                    style={{width:90,border:`1px solid ${C.border}`,borderRadius:6,padding:"3px 6px",fontSize:11,textAlign:"center",fontFamily:"inherit"}}/>
                  <button onClick={()=>setEditIngs(prev=>prev.filter(x=>x._id!==ing._id))}
                    style={{background:"none",border:"none",color:C.danger,fontSize:16,cursor:"pointer",padding:"0 2px",lineHeight:1}}>×</button>
                </div>
              ))}
            </div>
            {/* Add ingredient */}
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              <input value={newIngItem} onChange={e=>setNewIngItem(e.target.value)} placeholder={isHe?"שם מרכיב":"Ingredient"} className="inp" style={{flex:2,fontSize:12}}/>
              <input value={newIngAmt} onChange={e=>setNewIngAmt(e.target.value)} placeholder={isHe?"כמות":"Amount"} className="inp" style={{flex:1,fontSize:12}}/>
              <button onClick={()=>{if(newIngItem.trim()){setEditIngs(p=>[...p,{item:newIngItem,amount:newIngAmt,_id:Date.now()}]);setNewIngItem("");setNewIngAmt("");}}} style={{background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"0 10px",cursor:"pointer",fontSize:16}}>+</button>
            </div>
            {/* Nutrition display */}
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              {[["kcal",editNutr.kcal,C.accent],["carbs",editNutr.carbs,C.warn],["protein",editNutr.protein,C.blue],["fat",editNutr.fat,"#999"]].map(([k,v,c])=>(
                <div key={k} style={{flex:1,background:`${c}11`,borderRadius:8,padding:"6px 4px",textAlign:"center"}}>
                  <div style={{fontSize:14,fontWeight:700,color:c}}>{Math.round(v||0)}</div>
                  <div style={{fontSize:9,color:C.muted}}>{isHe?(k==="kcal"?"קק״ל":k==="carbs"?"פחמ׳":k==="protein"?"חלבון":"שומן"):k}/{isHe?"אדם":"p"}</div>
                </div>
              ))}
            </div>
            <button onClick={recalculate} disabled={recalcLoading} style={{width:"100%",background:"rgba(13,148,136,.08)",border:`1px solid rgba(13,148,136,.3)`,borderRadius:10,padding:"9px",fontSize:13,fontWeight:600,color:C.accent,cursor:"pointer",marginBottom:10}}>
              {recalcLoading?(isHe?"מחשב...":"Calculating..."):(isHe?"🔄 חשב ערכים מחדש":"🔄 Recalculate")}
            </button>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setShowIngEdit(false)} className="btn-muted" style={{flex:1,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>{isHe?<><span>→</span><span>חזרה</span></>:"← Back"}</button>
              <button onClick={()=>addToDay(editNutr)} className="btn-accent" style={{flex:2,borderRadius:10}}>{isHe?"✓ הוסף ליומן":"✓ Add to log"}</button>
              <button onClick={()=>saveToDb(editNutr)} style={{flex:1,background:savedToDb?"rgba(13,148,136,.12)":"none",border:`1px solid ${savedToDb?C.accent:C.border}`,color:savedToDb?C.accent:C.muted,borderRadius:10,padding:"9px",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                {savedToDb?"✓":"💾"}
              </button>
            </div>
          </>}
        </>}
      </div>
    </div>
  );
}