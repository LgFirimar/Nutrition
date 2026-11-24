import React, { useState, useRef, useEffect } from 'react';
import { C, unitToG } from '../lib/nutrition.js';
import { loadCustomDB, loadQuickFoods, saveCustomDB, saveQuickFoods } from '../lib/storage.js';
import { CalcLoader } from './CalcLoader.jsx';
import { SaveFavNameSheet } from './SaveFavNameSheet.jsx';

export function PhotoMealPanel({onAdd,onClose,initialPhoto,lang}){
  const isHe=(lang||localStorage.getItem('nutrition_lang')||'he')!=='en';
  const [loading,setLoading]=useState(false);
  const [preview,setPreview]=useState(null);
  const [calcVals,setCalcVals]=useState(null);
  const [error,setError]=useState(null);
  const [imgSrc,setImgSrc]=useState(initialPhoto?.src||null);
  const [servings,setServings]=useState(1);
  const [localAmt,setLocalAmt]=useState("1");
  const [qtyUnit,setQtyUnit]=useState("יח׳");
  const [mealWeight,setMealWeight]=useState("");
  const [totalUnits,setTotalUnits]=useState(0);
  const [savedToDb,setSavedToDb]=useState(false);
  const [showDbInput,setShowDbInput]=useState(false);
  const [dbName,setDbName]=useState("");
  const [savedToFav,setSavedToFav]=useState(false);
  const [pendingFav,setPendingFav]=useState(null);
  const [imgHint,setImgHint]=useState('');
  const [storedB64,setStoredB64]=useState(initialPhoto?.base64||null);
  const [storedMime,setStoredMime]=useState(initialPhoto?.mediaType||'image/jpeg');
  const fileRef=useRef(null);

  useEffect(()=>{
    if(initialPhoto?.base64) analyze(initialPhoto.base64,initialPhoto.mediaType,'');
  },[]);

  const unitToG=(amt,unit)=>{
    if(unit==='כף') return amt*15;
    if(unit==='כפית') return amt*5;
    if(unit==='כוס') return amt*240;
    return amt;
  };

  const getP100g=(p,mealW)=>{
    if(p.per100g) return p.per100g;
    const w=parseFloat(mealW);
    if(w>0) return {
      kcal:Math.round(p.kcal/w*100),
      carbs:parseFloat(((p.carbs||0)/w*100).toFixed(1)),
      protein:parseFloat(((p.protein||0)/w*100).toFixed(1)),
      fat:parseFloat(((p.fat||0)/w*100).toFixed(1))
    };
    return null;
  };

  const computeVals=(p,s,amt,unit,mealW,mealU)=>{
    const a=parseFloat(amt)||1;
    const pg=getP100g(p,mealW);
    if(unit==='יח׳'||unit==='מנות'||unit==='קוביות'){
      // When we know grams-per-unit, use gram path for accuracy
      const uCount=parseFloat(mealU)||0;
      if(pg&&uCount>0&&parseFloat(mealW)>0){
        const gPerUnit=parseFloat(mealW)/uCount;
        const totalG=a*gPerUnit;
        const factor=totalG/100/s;
        return {
          kcal:Math.round(pg.kcal*factor),
          carbs:parseFloat(((pg.carbs||0)*factor).toFixed(1)),
          protein:parseFloat(((pg.protein||0)*factor).toFixed(1)),
          fat:parseFloat(((pg.fat||0)*factor).toFixed(1))
        };
      }
      // Fallback: fraction of whole meal
      const factor=a/s;
      return {
        kcal:Math.round(p.kcal*factor),
        carbs:parseFloat(((p.carbs||0)*factor).toFixed(1)),
        protein:parseFloat(((p.protein||0)*factor).toFixed(1)),
        fat:parseFloat(((p.fat||0)*factor).toFixed(1))
      };
    }
    if(pg){
      const g=unitToG(a,unit);
      const factor=g/100/s;
      return {
        kcal:Math.round(pg.kcal*factor),
        carbs:parseFloat(((pg.carbs||0)*factor).toFixed(1)),
        protein:parseFloat(((pg.protein||0)*factor).toFixed(1)),
        fat:parseFloat(((pg.fat||0)*factor).toFixed(1))
      };
    }
    return {kcal:0,carbs:0,protein:0,fat:0};
  };

  const analyze=async(base64,mediaType,hint)=>{
    setLoading(true);setPreview(null);setCalcVals(null);setError(null);
    setServings(1);setLocalAmt("1");setQtyUnit("יח׳");setMealWeight("");setTotalUnits(0);
    try{
      const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({imageData:base64,imageMediaType:mediaType,lang,...(hint?{imageHint:hint}:{})})
      });
      if(!res.ok){const eb=await res.json().catch(()=>({}));throw new Error(eb.error||(isHe?"שגיאת שרת":"Server error"));}
      const d=await res.json();
      if(d.error||!d.kcal) throw new Error(d.error||(isHe?"לא הצלחתי לנתח את התמונה":"Could not analyze the photo"));
      // Derive per100g from totalGrams if server included a sensible weight
      if(!d.per100g && d.totalGrams >= 20){
        d.per100g={
          kcal:Math.round(d.kcal/d.totalGrams*100),
          carbs:parseFloat(((d.carbs||0)/d.totalGrams*100).toFixed(1)),
          protein:parseFloat(((d.protein||0)/d.totalGrams*100).toFixed(1)),
          fat:parseFloat(((d.fat||0)/d.totalGrams*100).toFixed(1))
        };
      }
      // Parse unit/piece count — prefer explicit piecesCount, then portions string
      const parsedU=d.piecesCount>0?d.piecesCount:(d.portions?parseInt((d.portions.match(/(\d+)\s*(יח|piece)/i)||[])[1]||"0"):0);
      const hasGrams=d.totalGrams>=20;
      const initW=hasGrams?String(d.totalGrams):"";
      // Use Claude's suggested amount/unit if provided, otherwise fall back to grams
      const VALID_UNITS=["יח׳","קוביות","מנות","g","ml","כף","כפית","כוס"];
      const initAmt=d.suggestedAmt?String(d.suggestedAmt):(hasGrams?String(d.totalGrams):"1");
      const initUnit=(d.suggestedUnit&&VALID_UNITS.includes(d.suggestedUnit))?d.suggestedUnit:(hasGrams?"g":"יח׳");
      setMealWeight(initW);setTotalUnits(parsedU);setLocalAmt(initAmt);setQtyUnit(initUnit);
      setPreview(d);
      setCalcVals(computeVals(d,1,initAmt,initUnit,initW,parsedU));
    }catch(e){setError(e.message);}
    setLoading(false);
  };

  const recalc=()=>{
    if(!preview)return;
    setCalcVals(computeVals(preview,servings,localAmt,qtyUnit,mealWeight,totalUnits));
  };

  // Auto-recalc whenever any input changes
  useEffect(()=>{ if(preview) recalc(); },[servings,localAmt,qtyUnit,mealWeight,totalUnits]);

  const handleFile=e=>{
    const file=e.target.files[0];
    if(!file)return;
    e.target.value="";
    const reader=new FileReader();
    reader.onload=ev=>{
      const b64=ev.target.result.split(',')[1];
      const mime=file.type||'image/jpeg';
      setImgSrc(ev.target.result);
      setStoredB64(b64);setStoredMime(mime);
      setPreview(null);setCalcVals(null);setError(null);
      analyze(b64,mime,imgHint.trim());
    };
    reader.readAsDataURL(file);
  };

  const addToDay=()=>{
    if(!preview||!calcVals)return;
    const a=parseFloat(localAmt)||1;
    onAdd({uid:Date.now()+Math.random(),
      label:`📷 ${preview.label}${servings>1?` (1/${servings})`:""}${(a!==1||qtyUnit!=='יח׳')?` ${a}${qtyUnit}`:""}`,
      kcal:calcVals.kcal,carbs:calcVals.carbs,protein:calcVals.protein,fat:calcVals.fat});
    onClose();
  };

  const openDbSave=()=>{
    if(!preview)return;
    setDbName(preview.label||"ארוחה");
    setShowDbInput(true);
  };

  const saveToDb=()=>{
    if(!preview)return;
    const name=(dbName.trim()||preview.label||"ארוחה");
    const tg=parseFloat(mealWeight)||preview.totalGrams||0;
    const p100g=preview.per100g||(tg>=20?{
      kcal:Math.round(preview.kcal/tg*100),
      carbs:parseFloat(((preview.carbs||0)/tg*100).toFixed(1)),
      protein:parseFloat(((preview.protein||0)/tg*100).toFixed(1)),
      fat:parseFloat(((preview.fat||0)/tg*100).toFixed(1))
    }:null);
    const srcText=preview.label+(preview.portions?` — ${preview.portions}`:'');
    const entry=p100g?{
      names:[name.toLowerCase()],label:`📷 ${name}`,
      kcal:p100g.kcal,carbs:p100g.carbs,protein:p100g.protein,fat:p100g.fat,
      defaultAmt:tg||100,unit:"g",sourceText:srcText
    }:{
      names:[name.toLowerCase()],label:`📷 ${name}`,
      kcal:Math.round(preview.kcal),carbs:parseFloat((preview.carbs||0).toFixed(1)),
      protein:parseFloat((preview.protein||0).toFixed(1)),fat:parseFloat((preview.fat||0).toFixed(1)),
      defaultAmt:1,unit:"מנה",serving_size:1,sourceText:srcText
    };
    const pid=window._activePid||"default";
    const db=loadCustomDB(pid);
    saveCustomDB([...db.filter(f=>f.label!==entry.label),entry],pid);
    setShowDbInput(false);setSavedToDb(true);
    setTimeout(()=>setSavedToDb(false),2000);
  };

  const saveToFavorites=()=>{
    if(!preview||!calcVals)return;
    const food={id:`qf_photo_${Date.now()}`,label:`📷 ${preview.label||"ארוחה"}`,
      kcal:calcVals.kcal,carbs:calcVals.carbs,protein:calcVals.protein,fat:calcVals.fat};
    setPendingFav(food);
  };

  return (
    <div className="panel fade">
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif" onChange={handleFile} style={{display:"none"}}/>
      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>📷 {isHe?"ניתוח תמונה":"Photo Analysis"}</div>
      {imgSrc?(
        <div style={{position:"relative",marginBottom:10}}>
          <img src={imgSrc} style={{width:"100%",borderRadius:10,maxHeight:180,objectFit:"cover"}}/>
          <button onClick={()=>fileRef.current.click()} style={{position:"absolute",top:6,left:6,background:"rgba(0,0,0,0.55)",border:"none",borderRadius:6,padding:"4px 10px",fontSize:12,color:"#fff",cursor:"pointer"}}>🖼️ {isHe?"החלף":"Replace"}</button>
        </div>
      ):(!loading&&!error&&(
        <button onClick={()=>fileRef.current.click()} style={{width:"100%",background:"#f5f5f7",border:`1px solid ${C.border}`,borderRadius:10,padding:"18px 8px",textAlign:"center",cursor:"pointer",fontFamily:"inherit",marginBottom:10}}>
          <div style={{fontSize:26,marginBottom:4}}>📷</div>
          <div style={{fontSize:12,color:C.muted}}>{isHe?"בחרי תמונה":"Choose a photo"}</div>
        </button>
      ))}
      {/* Optional description field */}
      <textarea value={imgHint} onChange={e=>setImgHint(e.target.value)}
        placeholder={isHe?"תיאור אופציונלי: כמות, אופן הכנה, מוצר ספציפי...":"Optional: quantity, preparation, specific product..."}
        className="inp" rows={2} style={{fontSize:12,resize:"none",marginBottom:8}}/>
      {storedB64&&imgHint.trim()&&!loading&&(
        <button onClick={()=>analyze(storedB64,storedMime,imgHint.trim())}
          style={{width:"100%",background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"7px",fontSize:12,fontWeight:700,cursor:"pointer",marginBottom:8}}>
          🔄 {isHe?"נתח מחדש עם התיאור":"Re-analyze with description"}
        </button>
      )}
      {loading&&<div style={{textAlign:"center",padding:"14px 0",color:C.muted,fontSize:13}}><CalcLoader size={64}/><div style={{marginTop:6}}>{isHe?"מנתח תמונה...":"Analyzing photo..."}</div></div>}
      {error&&<div style={{background:"#fff0f0",border:`1px solid ${C.danger}`,borderRadius:8,padding:"8px 12px",fontSize:11,color:C.danger,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span>⚠ {error}</span>
        <button onClick={()=>fileRef.current.click()} style={{background:C.danger,border:"none",borderRadius:6,color:"#fff",padding:"2px 8px",fontSize:11,fontWeight:700,cursor:"pointer"}}>{isHe?"נסי שוב":"Retry"}</button>
      </div>}
      {preview&&calcVals&&(
        <div className="green-box fade" style={{marginBottom:8}}>
          <div style={{fontSize:11,color:C.accent,fontWeight:700,marginBottom:4}}>✨ {preview.label}</div>
          {preview.portions&&(
            <div style={{fontSize:10,color:C.muted,background:"#fff",borderRadius:6,padding:"5px 8px",marginBottom:6,lineHeight:1.5}}>
              📐 {preview.portions}
            </div>
          )}
          {/* Serving info — drives all calculations */}
          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8,background:"rgba(255,255,255,0.85)",borderRadius:8,padding:"6px 10px",border:`1px solid ${mealWeight?C.accent:C.border}`}}>
            <span style={{fontSize:10,color:C.muted}}>⚖️ {isHe?"מנה:":"Serving:"}</span>
            <input type="number" value={mealWeight} onChange={e=>setMealWeight(e.target.value)}
              placeholder="g" className="inp"
              style={{width:58,padding:"4px 6px",fontSize:13,textAlign:"center",marginBottom:0,fontWeight:700,borderColor:mealWeight?C.accent:C.border}}/>
            <span style={{fontSize:10,color:C.muted}}>g</span>
            {totalUnits>0&&<span style={{fontSize:10,color:C.muted,marginRight:4}}>/</span>}
            {totalUnits>0&&<input type="number" value={totalUnits} onChange={e=>setTotalUnits(parseFloat(e.target.value)||0)}
              className="inp"
              style={{width:46,padding:"4px 6px",fontSize:13,textAlign:"center",marginBottom:0,fontWeight:700}}/>}
            {totalUnits>0&&<span style={{fontSize:10,color:C.muted}}>pcs</span>}
          </div>
          <div className="g3" style={{marginBottom:8}}>
            {[{l:"kcal",v:calcVals.kcal,c:C.accent},{l:"carbs g",v:calcVals.carbs,c:C.warn},{l:"prot g",v:calcVals.protein,c:C.blue}].map(({l,v,c})=>(
              <div key={l} className="preview-box"><div className="preview-val" style={{color:c}}>{v}</div><div className="preview-lbl">{l}</div></div>
            ))}
          </div>
          {qtyUnit!=='יח׳'&&qtyUnit!=='מנות'&&!mealWeight&&(
            <div style={{fontSize:10,color:C.warn,marginBottom:6,textAlign:"center"}}>⚠ {isHe?`הזן משקל הצילום בגר׳ למעלה כדי לחשב לפי ${qtyUnit}`:`Enter photo weight in g above to calculate by ${qtyUnit}`}</div>
          )}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,background:"rgba(255,255,255,0.7)",borderRadius:8,padding:"5px 10px"}}>
            <span style={{fontSize:11,color:C.muted,flex:1}}>{isHe?"חלק עם:":"Share with:"}</span>
            <button onClick={()=>setServings(v=>Math.max(1,v-1))} style={{width:24,height:24,border:`1px solid ${C.border}`,borderRadius:6,background:"#f5f5f7",cursor:"pointer",fontSize:13}}>−</button>
            <span style={{fontWeight:700,fontSize:13,color:C.accent,minWidth:16,textAlign:"center"}}>{servings}</span>
            <button onClick={()=>setServings(v=>v+1)} style={{width:24,height:24,border:`1px solid ${C.border}`,borderRadius:6,background:"#f5f5f7",cursor:"pointer",fontSize:13}}>+</button>
            <span style={{fontSize:11,color:C.muted}}>{isHe?(servings===1?"אנשים (כל הארוחה לי)":"אנשים"):(servings===1?"people (whole meal)":"people")}</span>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:8,alignItems:"center"}}>
            <input type="number" value={localAmt} onChange={e=>setLocalAmt(e.target.value)}
              className="inp" style={{flex:1,textAlign:"center",padding:"7px 6px",fontSize:13}}/>
            <select value={qtyUnit} onChange={e=>setQtyUnit(e.target.value)} className="inp" style={{flex:1,padding:"7px 6px",fontSize:12,cursor:"pointer"}}>
              <option value="יח׳">{isHe?"יח׳":"pcs"}</option>
              <option value="קוביות">{isHe?"קוביות":"cubes"}</option>
              <option value="מנות">{isHe?"מנות":"servings"}</option>
              <option value="g">{isHe?"גר׳":"g"}</option>
              <option value="ml">{isHe?"מ״ל":"ml"}</option>
              <option value="כף">{isHe?"כף (15מ״ל)":"tbsp (15ml)"}</option>
              <option value="כפית">{isHe?"כפית (5מ״ל)":"tsp (5ml)"}</option>
              <option value="כוס">{isHe?"כוס (240מ״ל)":"cup (240ml)"}</option>
            </select>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={addToDay} style={{flex:2,background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ {isHe?"הוסף ליום":"Add to day"}</button>
            <button onClick={openDbSave} style={{flex:1,background:savedToDb?"rgba(13,148,136,.1)":"transparent",border:`1px solid ${savedToDb?C.accent:C.border}`,borderRadius:8,padding:"10px",fontSize:13,fontWeight:600,color:savedToDb?C.accent:C.muted,cursor:"pointer",transition:"all .2s"}}>
              {savedToDb?"✓":"💾"}
            </button>
            <button onClick={saveToFavorites} style={{flex:1,background:savedToFav?"rgba(245,158,11,.12)":"transparent",border:`1px solid ${savedToFav?"#f59e0b":"rgba(245,158,11,.35)"}`,borderRadius:8,padding:"10px",fontSize:13,fontWeight:600,color:savedToFav?"#f59e0b":C.muted,cursor:"pointer",transition:"all .2s"}}>
              {savedToFav?"✓":"⭐"}
            </button>
          </div>
          {showDbInput&&(
            <div className="fade" style={{marginTop:8,display:"flex",gap:6}}>
              <input value={dbName} onChange={e=>setDbName(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&saveToDb()}
                className="inp" style={{flex:1,fontSize:12}} autoFocus
                placeholder={isHe?"שם לשמירה במאגר":"Name to save"}/>
              <button onClick={saveToDb} style={{background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"0 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>{isHe?"שמור":"Save"}</button>
              <button onClick={()=>setShowDbInput(false)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,padding:"0 10px",cursor:"pointer",fontSize:12}}>✕</button>
            </div>
          )}
        </div>
      )}
      <button onClick={onClose} className="btn-muted" style={{marginTop:4}}>{isHe?"ביטול":"Cancel"}</button>
      {pendingFav&&<SaveFavNameSheet defaultName={pendingFav.label} onConfirm={name=>{const pid=window._activePid||"default";const f={...pendingFav,label:name};const ex=loadQuickFoods(pid)||[];saveQuickFoods([...ex.filter(x=>x.label!==name),f],pid);setPendingFav(null);setSavedToFav(true);setTimeout(()=>setSavedToFav(false),2000);}} onClose={()=>setPendingFav(null)}/>}
    </div>
  );
}