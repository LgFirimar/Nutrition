import React, { useState, useRef, useEffect } from 'react';
import { loadCustomDB, saveCustomDB } from '../lib/storage.js';
import { C, FOOD_DB } from '../lib/nutrition.js';
import { LANG } from '../lib/lang.js';
import { CalcLoader } from './Shared.jsx';

// Personal food database management + AI-assisted food entry (Claude-backed).

export function PasteFromClaude({onParsed,amount,unit}){
  const [preview,setPreview]=useState(null);
  const [error,setError]=useState(false);
  const [lastRaw,setLastRaw]=useState(null);
  const [saveName,setSaveName]=useState("");
  const [savedOk,setSavedOk]=useState(false);

  const applyJSON=(raw,qty,u)=>{
    setError(false);setPreview(null);setSavedOk(false);
    try{
      const d=JSON.parse(raw.replace(/```json|```/g,"").trim());
      if(d.kcal===undefined)throw new Error();
      const q=parseFloat(qty)||1;
      const divisor=d.cubes_per_bar?d.cubes_per_bar:d.serving_size?d.serving_size:100;
      const pu=d.per_unit||{kcal:d.kcal/divisor,carbs:(d.carbs||0)/divisor,protein:(d.protein||0)/divisor,fat:(d.fat||0)/divisor};
      const result={kcal:Math.round(pu.kcal*q*10)/10,carbs:Math.round(pu.carbs*q*10)/10,protein:Math.round(pu.protein*q*10)/10,fat:Math.round(pu.fat*q*10)/10,name:d.name};
      setPreview({result,qty:q,unit:u,raw:d});
      setSaveName(d.name||"");
      setLastRaw(raw);
    }catch{setError(true);}
  };

  const handleClick=async()=>{
    setError(false);setPreview(null);
    try{const t=await navigator.clipboard.readText();applyJSON(t,amount,unit);}
    catch{setError(true);}
  };

  const recalc=()=>{if(lastRaw)applyJSON(lastRaw,amount,unit);};

  const loadOnly=()=>{
    if(!preview)return;
    onParsed(preview.result);
    setPreview(null);
  };

  const loadAndSave=()=>{
    if(!preview||!saveName)return;
    const d=preview.raw;
    const entry={
      names:[saveName.toLowerCase(),...(d.names||[d.name||saveName]).map(n=>n.toLowerCase())].filter((v,i,a)=>a.indexOf(v)===i),
      label:d.label||saveName, kcal:d.kcal, carbs:d.carbs||0, protein:d.protein||0, fat:d.fat||0,
      defaultAmt:d.defaultAmt||(d.cubes_per_bar?2:d.serving_size||100),
      unit:d.unit||(d.cubes_per_bar?"קוביות":"g"),
      ...(d.serving_size&&{serving_size:d.serving_size}),
      ...(d.cubes_per_bar&&{cubes_per_bar:d.cubes_per_bar}),
    };
    const db=loadCustomDB(window._activePid||"default");
    saveCustomDB([...db.filter(f=>!f.names.some(n=>entry.names.includes(n))),entry],window._activePid||"default");
    onParsed(preview.result);
    setSavedOk(true);setPreview(null);
  };

  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",gap:6}}>
        <button className="btn-warn" onClick={handleClick}>📋 הדבק ניתוח מ-Claude</button>
        {lastRaw && <button onClick={recalc} style={{background:"#fff8e1",border:`1px solid ${C.warn}`,borderRadius:8,padding:"9px 12px",fontSize:16,color:C.warn,cursor:"pointer"}}>🔄</button>}
      </div>
      {error && <div style={{fontSize:11,color:C.danger,marginTop:6,textAlign:"center"}}>לא הצלחתי לקרוא את הלוח — העתיקי שוב ונסי</div>}
      {savedOk && <div style={{fontSize:11,color:C.accent,textAlign:"center",marginTop:4}}>✓ נשמר!</div>}
      {preview && (
        <div className="green-box fade" style={{marginTop:8}}>
          <div style={{fontSize:11,color:C.accent,fontWeight:700,marginBottom:8}}>✦ {preview.qty} {preview.unit}</div>
          <div className="g3" style={{marginBottom:10}}>
            {[{l:"קק״ל",v:preview.result.kcal,c:C.accent},{l:"פחמ׳g",v:preview.result.carbs,c:C.warn},{l:"חלבוןg",v:preview.result.protein,c:C.blue}].map(({l,v,c})=>(
              <div key={l} className="preview-box"><div className="preview-val" style={{color:c}}>{v}</div><div className="preview-lbl">{l}</div></div>
            ))}
          </div>
          <div style={{fontSize:10,color:C.muted,marginBottom:4}}>שם לשמירה במאגר (ניתן לעריכה):</div>
          <input value={saveName} onChange={e=>setSaveName(e.target.value)} className="inp" style={{marginBottom:8,fontSize:13,borderColor:saveName?C.accent:C.border}}/>
          <div style={{display:"flex",gap:6}}>
            <button onClick={loadAndSave} disabled={!saveName}
              style={{flex:2,background:saveName?C.accent:"#ddd",border:"none",borderRadius:8,color:saveName?"#fff":"#aaa",padding:"9px 6px",fontSize:12,fontWeight:700,cursor:saveName?"pointer":"default"}}>
              הוסף + שמור
            </button>
            <button onClick={loadOnly}
              style={{flex:1,background:"#f5f5f7",border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,padding:"9px 6px",fontSize:11,fontWeight:600,cursor:"pointer"}}>
              הוסף ללא שמירה
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function LoadFoodToDB({foodName,amount,unit,onAddToDay,onSaved}){
  const [preview,setPreview]=useState(null);
  const [error,setError]=useState(false);
  const [savedOk,setSavedOk]=useState(false);
  const [savingMode,setSavingMode]=useState(false);
  const [saveName,setSaveName]=useState("");

  const handlePaste=async()=>{
    setError(false);setPreview(null);
    try{
      const t=await navigator.clipboard.readText();
      const d=JSON.parse(t.replace(/```json|```/g,"").trim());
      if(!d.kcal)throw new Error();
      // calc for current amount if given
      const qty = parseFloat(amount) || parseFloat(d.defaultAmt) || 100;
      // if serving_size defined, values are per serving_size units; else per 100g
      const divisor = d.cubes_per_bar ? d.cubes_per_bar : d.serving_size ? d.serving_size : 100;
      const per1 = d.per_unit
        ? d.per_unit
        : { kcal: d.kcal/divisor, carbs: (d.carbs||0)/divisor, protein: (d.protein||0)/divisor, fat: (d.fat||0)/divisor };
      const calc = {
        kcal:    Math.round(per1.kcal    * qty * 10) / 10,
        carbs:   Math.round(per1.carbs   * qty * 10) / 10,
        protein: Math.round(per1.protein * qty * 10) / 10,
        fat:     Math.round(per1.fat     * qty * 10) / 10,
      };
      const entry={names:d.names||[d.name||foodName],label:d.label||d.name||foodName,kcal:d.kcal,carbs:d.carbs||0,protein:d.protein||0,fat:d.fat||0,defaultAmt:d.defaultAmt||100,unit:d.unit||"g"};
      setPreview({calc, entry, qty, raw:d, unit: unit||d.unit||"g"});
      setSaveName(d.name||d.label||foodName||"");
    }catch{setError(true);}
  };

  const addToDay=()=>{
    if(!preview)return;
    const label=`${preview.entry.label}${amount?` (${amount}${unit||""})` : ""}`;
    onAddToDay({uid:Date.now()+Math.random(),label,...preview.calc});
  };

  const saveToDb=()=>{
    if(!preview||!saveName)return;
    const nameVariants=[saveName,...(preview.entry.names||[])].map(n=>n.toLowerCase());
    const entry={
      ...preview.entry,
      label:saveName,
      names:[...new Set([saveName.toLowerCase(),...nameVariants])],
    };
    const db=loadCustomDB(window._activePid||"default");
    saveCustomDB([...db.filter(f=>!f.names.some(n=>entry.names.includes(n.toLowerCase()))),entry], window._activePid||"default");
    setSavedOk(true);setSavingMode(false);
    setTimeout(()=>{ onSaved(); },700);
  };

  return (
    <div>
      <button onClick={handlePaste} style={{width:"100%",background:"#fff8e1",border:`1px solid ${C.warn}`,borderRadius:8,padding:"9px",fontSize:12,color:C.warn,cursor:"pointer",fontWeight:600,marginBottom:preview?8:0}}>
        📋 הדבק JSON מ-Claude
      </button>
      {error && <div style={{fontSize:11,color:C.danger,marginTop:4,textAlign:"center"}}>JSON לא תקין — העתיקי שוב</div>}

      {preview && (
        <div className="green-box fade">
          {!savedOk ? (
            <>
              <div style={{fontSize:11,color:C.accent,fontWeight:700,marginBottom:8}}>
                ✦ {preview.qty} {preview.unit} — ערכים מחושבים
              </div>
              <div className="g3" style={{marginBottom:10}}>
                {[{l:"קק״ל",v:preview.calc.kcal,c:C.accent},{l:"פחמ׳g",v:preview.calc.carbs,c:C.warn},{l:"חלבוןg",v:preview.calc.protein,c:C.blue}].map(({l,v,c})=>(
                  <div key={l} className="preview-box"><div className="preview-val" style={{color:c}}>{v}</div><div className="preview-lbl">{l}</div></div>
                ))}
              </div>
              <div style={{display:"flex",gap:8,marginBottom:savingMode?8:0}}>
                <button onClick={addToDay} style={{flex:1,background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"9px 6px",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ הוסף ליום</button>
                <button onClick={()=>setSavingMode(v=>!v)} style={{flex:1,background:savingMode?"#fff8e1":"#f5f5f7",border:`1px solid ${savingMode?C.warn:C.border}`,borderRadius:8,color:savingMode?C.warn:C.muted,padding:"9px 6px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  💾 שמור למאגר
                </button>
              </div>
              {savingMode && (
                <div className="fade">
                  <input value={saveName} onChange={e=>setSaveName(e.target.value)} placeholder="שם לשמירה..."
                    className="inp" style={{marginBottom:6,fontSize:14,borderColor:saveName?C.accent:C.border}}/>
                  <div style={{fontSize:11,color:C.muted,marginBottom:8,textAlign:"center"}}>
                    {preview.entry.kcal} קק״ל · {preview.entry.carbs}g פחמ׳ · {preview.entry.protein}g חלבון ל-100{preview.entry.unit||"g"}
                  </div>
                  <button onClick={saveToDb} disabled={!saveName}
                    style={{width:"100%",background:saveName?C.warn:"#ddd",border:"none",borderRadius:8,color:saveName?"#fff":"#aaa",padding:"9px",fontSize:13,fontWeight:700,cursor:saveName?"pointer":"default"}}>
                    💾 שמור
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{textAlign:"center",color:C.accent,fontSize:12,fontWeight:700,padding:4}}>✓ נשמר למאגר!</div>
          )}
        </div>
      )}
    </div>
  );
}

export function DBManagerModal({onClose,pid,lang}){
  const T=LANG[lang]||LANG.he;
  const isHe=(lang||'he')!=='en';
  const activePid = window._activePid||pid||'default';
  const [db,setDb]=useState(()=>loadCustomDB(activePid));
  useEffect(()=>{ setDb(loadCustomDB(window._activePid||pid||'default')); },[pid]);
  const [search,setSearch]=useState("");
  const [editing,setEditing]=useState(null);
  const [editData,setEditData]=useState({});
  const [editClaudeText,setEditClaudeText]=useState("");
  const [editQty,setEditQty]=useState(1);
  const [editLoading,setEditLoading]=useState(false);
  const [editPreview,setEditPreview]=useState(null);
  const editImgRef=useRef(null);
  // Add new item via text
  const [showAdd,setShowAdd]=useState(false);
  const [addText,setAddText]=useState("");
  const [addQty,setAddQty]=useState(1);
  const [addLoading,setAddLoading]=useState(false);
  const [addData,setAddData]=useState(null);
  const [addError,setAddError]=useState("");
  const addImgRef=useRef(null);
  const addRawRef=useRef(null); // stores raw Claude response for qty recalc

  // Recalc numbers when qty changes and raw data exists (keeps label/unit edits)
  useEffect(()=>{
    const raw=addRawRef.current;
    if(!raw)return;
    const qty=Math.max(1,addQty);
    setAddData(d=>d?{...d,kcal:String(Math.round((raw.kcal||0)/qty)),carbs:String(parseFloat(((raw.carbs||0)/qty).toFixed(1))),protein:String(parseFloat(((raw.protein||0)/qty).toFixed(1))),fat:String(parseFloat(((raw.fat||0)/qty).toFixed(1)))}:d);
  },[addQty]);

  const askClaudeAdd=async(textOrImg)=>{
    setAddLoading(true);setAddData(null);setAddError("");addRawRef.current=null;
    try{
      const body=textOrImg.type==='text'
        ?{dbEditText:textOrImg.val}
        :{dbEditImageData:textOrImg.b64,dbEditImageMediaType:textOrImg.mime,...(textOrImg.hint?{dbEditImageHint:textOrImg.hint}:{})};
      const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const d=await res.json();
      if(!d.kcal)throw new Error();
      addRawRef.current=d;
      const qty=Math.max(1,addQty);
      setAddData({label:d.label||"",kcal:String(Math.round((d.kcal||0)/qty)),carbs:String(parseFloat(((d.carbs||0)/qty).toFixed(1))),protein:String(parseFloat(((d.protein||0)/qty).toFixed(1))),fat:String(parseFloat(((d.fat||0)/qty).toFixed(1))),unit:"g"});
    }catch{setAddError(isHe?"שגיאה בחישוב — נסה שנית":"Calculation error — try again");}
    setAddLoading(false);
  };

  const handleAddImage=e=>{
    const file=e.target.files[0];if(!file)return;e.target.value="";
    const reader=new FileReader();
    reader.onload=ev=>askClaudeAdd({type:'img',b64:ev.target.result.split(',')[1],mime:file.type||'image/jpeg',hint:addText.trim()});
    reader.readAsDataURL(file);
  };

  const saveNewItem=()=>{
    if(!addData)return;
    const label=addData.label||addText.trim()||"פריט חדש";
    const entry={names:[label.toLowerCase().replace(/^[^\w]/,'')],label,kcal:parseFloat(addData.kcal)||0,carbs:parseFloat(addData.carbs)||0,protein:parseFloat(addData.protein)||0,fat:parseFloat(addData.fat)||0,unit:addData.unit||"g",defaultAmt:100,...(addText.trim()?{sourceText:addText.trim()}:{})};
    const apid=window._activePid||pid||'default';
    const updated=[...db.filter(f=>f.label!==label),entry];
    saveCustomDB(updated,apid);setDb(updated);
    setShowAdd(false);setAddText("");setAddData(null);setAddQty(1);
  };

  const filtered=search.trim()?db.filter(f=>f.label.toLowerCase().includes(search.toLowerCase())||f.names.some(n=>n.toLowerCase().includes(search.toLowerCase()))):db;
  const apid=()=>window._activePid||pid||'default';

  const remove=name=>{
    const updated=db.filter(f=>f.label!==name);
    saveCustomDB(updated,apid()); setDb(updated);
    if(editing!==null) setEditing(null);
  };

  const startEdit=(f,i)=>{
    setEditing(i);
    setEditData({label:f.label,kcal:String(f.kcal),carbs:String(f.carbs),protein:String(f.protein),fat:String(f.fat||0),unit:f.unit||"g"});
    setEditClaudeText(f.sourceText||f.label.replace(/^[^\w֐-׿]+/,'')); setEditQty(1); setEditPreview(null);
  };

  const saveEdit=(origLabel)=>{
    const updated=db.map(f=>f.label===origLabel?{
      ...f,
      label:editData.label||f.label,
      kcal:parseFloat(editData.kcal)||f.kcal,
      carbs:parseFloat(editData.carbs)||0,
      protein:parseFloat(editData.protein)||0,
      fat:parseFloat(editData.fat)||0,
      unit:editData.unit||f.unit,
      names:[...(f.names||[]),editData.label.toLowerCase()].filter((v,i,a)=>a.indexOf(v)===i),
    }:f);
    saveCustomDB(updated,apid()); setDb(updated); setEditing(null);
  };

  const applyClaudeResult=(d)=>{
    const q=Math.max(1,editQty);
    setEditData(ed=>({...ed,
      kcal:String(Math.round((d.kcal||0)/q)),
      carbs:String(parseFloat(((d.carbs||0)/q).toFixed(1))),
      protein:String(parseFloat(((d.protein||0)/q).toFixed(1))),
      fat:String(parseFloat(((d.fat||0)/q).toFixed(1))),
    }));
    setEditPreview(d);
    setEditLoading(false);
  };

  const askClaudeText=async()=>{
    if(!editClaudeText.trim())return;
    setEditLoading(true);setEditPreview(null);
    try{
      const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({dbEditText:editClaudeText})});
      if(!res.ok) throw new Error();
      const d=await res.json();
      if(!d.kcal) throw new Error();
      applyClaudeResult(d);
    }catch{setEditLoading(false);}
  };

  const handleEditImage=e=>{
    const file=e.target.files[0];
    if(!file)return; e.target.value="";
    setEditLoading(true);setEditPreview(null);
    const reader=new FileReader();
    reader.onload=async ev=>{
      const b64=ev.target.result.split(',')[1];
      try{
        const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({dbEditImageData:b64,dbEditImageMediaType:file.type||'image/jpeg'})});
        if(!res.ok) throw new Error();
        const d=await res.json();
        if(!d.kcal) throw new Error();
        applyClaudeResult(d);
      }catch{setEditLoading(false);}
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide" style={{maxHeight:"85vh"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:15,fontWeight:700}}>{T.dbTitle}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={T.search} className="inp" style={{marginBottom:8}}/>

        {/* Add new item */}
        <input ref={addImgRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif" onChange={handleAddImage} style={{display:"none"}}/>
        <button onClick={()=>setShowAdd(v=>!v)} style={{width:"100%",background:"transparent",border:`1px dashed ${C.border}`,borderRadius:10,padding:"8px",fontSize:12,color:C.accent,cursor:"pointer",marginBottom:10,fontWeight:700}}>
          {showAdd?(isHe?"✕ סגור":"✕ Close"):(isHe?"+ הוסף פריט חדש":"+ Add New Item")}
        </button>
        {showAdd&&(
          <div className="fade" style={{background:"#f5f5f7",borderRadius:10,padding:12,marginBottom:12,display:"flex",flexDirection:"column",gap:8}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:2}}>{isHe?"תאר את הפריט ו/או צלם אותו":"Describe the item and/or take a photo"}</div>
            <div style={{display:"flex",gap:6}}>
              <textarea value={addText} onChange={e=>setAddText(e.target.value)}
                placeholder={isHe?"למשל: 100g חזה עוף מבושל, כוס אורז מבושל...":"e.g. 100g cooked chicken breast, 1 cup cooked rice..."}
                className="inp" rows={2} style={{flex:1,fontSize:12,resize:"none"}}/>
              <button onClick={()=>addImgRef.current?.click()} style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:18}}>📷</button>
            </div>
            {addLoading&&<div style={{textAlign:'center',marginBottom:4}}><CalcLoader size={64}/></div>}
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:11,color:C.muted}}>{isHe?"מספר מנות:":"Servings:"}</span>
              <button onClick={()=>setAddQty(v=>Math.max(1,v-1))} style={{width:24,height:24,border:`1px solid ${C.border}`,borderRadius:6,background:"#fff",cursor:"pointer",fontSize:13}}>−</button>
              <input type="number" value={addQty} min="1" onChange={e=>setAddQty(Math.max(1,parseInt(e.target.value)||1))} style={{width:38,textAlign:"center",border:`1px solid ${C.border}`,borderRadius:6,padding:"3px",fontSize:13,fontFamily:"inherit"}}/>
              <button onClick={()=>setAddQty(v=>v+1)} style={{width:24,height:24,border:`1px solid ${C.border}`,borderRadius:6,background:"#fff",cursor:"pointer",fontSize:13}}>+</button>
              <button onClick={()=>askClaudeAdd({type:'text',val:addText})} disabled={!addText.trim()||addLoading}
                style={{flex:1,background:addText.trim()&&!addLoading?C.accent:"#ddd",border:"none",borderRadius:8,color:addText.trim()&&!addLoading?"#fff":"#aaa",padding:"6px 8px",fontSize:12,fontWeight:700,cursor:addText.trim()&&!addLoading?"pointer":"default"}}>
                {addLoading?(isHe?"חושב...":"Thinking..."):`✨ ${isHe?"חשב":"Calculate"}`}
              </button>
            </div>
            {addError&&<div style={{fontSize:11,color:C.danger,background:"rgba(220,38,38,.06)",borderRadius:6,padding:"5px 8px"}}>{addError}</div>}
            {addData&&(
              <div className="fade">
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
                  {[["label",isHe?"שם":"Name","#333"],["kcal",T.kcal,C.accent],["carbs",T.carbs+" g",C.warn],["protein",T.protein+" g",C.blue],["fat",T.fat+" g","#999"]].map(([k,l,c])=>(
                    k==="label"
                      ?<div key={k} style={{gridColumn:"1/-1"}}><input value={addData.label} onChange={e=>setAddData(d=>({...d,label:e.target.value}))} className="inp" style={{fontSize:12}} placeholder={l}/></div>
                      :<div key={k} className="num-wrap">
                        <input type="number" value={addData[k]} onChange={e=>setAddData(d=>({...d,[k]:e.target.value}))} style={{borderColor:c}} className="num-wrap"/>
                        <div className="num-lbl" style={{color:c}}>{l}</div>
                      </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:6}}>
                  <select value={addData.unit} onChange={e=>setAddData(d=>({...d,unit:e.target.value}))} className="inp" style={{flex:1,fontSize:12}}>
                    <option value="g">{isHe?"גר׳":"g"}</option><option value="ml">מ״ל</option><option value="יח׳">יח׳</option><option value="מנה">{isHe?"מנה":"serving"}</option>
                  </select>
                  <button onClick={saveNewItem} style={{flex:2,background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"8px",fontSize:13,fontWeight:700,cursor:"pointer"}}>{isHe?"💾 שמור פריט":"💾 Save Item"}</button>
                </div>
              </div>
            )}
          </div>
        )}
        {filtered.length===0
          ? <div style={{textAlign:"center",color:C.muted,fontSize:13,padding:"20px 0"}}>{db.length===0?T.dbEmpty:T.noResults}</div>
          : <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {filtered.map((f,i)=>(
                <div key={i} style={{background:"#f5f5f7",borderRadius:10,overflow:"hidden"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:C.text}}>{f.label}</div>
                      <div style={{fontSize:11,color:C.muted,marginTop:2}}>{f.kcal} {T.kcal} · {f.carbs}g {T.carbs} · {f.protein}g {T.protein} {T.per100}{f.unit}</div>
                    </div>
                    <div style={{display:"flex",gap:4}}>
                      <button onClick={()=>editing===i?setEditing(null):startEdit(f,i)}
                        style={{background:editing===i?"#fff8e1":"none",border:editing===i?`1px solid ${C.warn}`:"none",color:editing===i?C.warn:C.muted,fontSize:15,cursor:"pointer",padding:"4px 8px",borderRadius:6}}>✏️</button>
                      <button onClick={()=>remove(f.label)} style={{background:"none",border:"none",color:C.danger,fontSize:18,cursor:"pointer",padding:"4px 8px"}}>🗑</button>
                    </div>
                  </div>
                  {editing===i && (
                    <div className="fade" style={{padding:"0 14px 12px",display:"flex",flexDirection:"column",gap:8}}>
                      <input value={editData.label} onChange={e=>setEditData(d=>({...d,label:e.target.value}))}
                        placeholder="שם" className="inp" style={{fontSize:13}}/>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        {[["kcal",T.kcal,C.accent],["carbs",T.carbs+" g",C.warn],["protein",T.protein+" g",C.blue],["fat",T.fat+" g","#999"]].map(([k,l,c])=>(
                          <div key={k} className="num-wrap">
                            <input type="number" value={editData[k]} onChange={e=>setEditData(d=>({...d,[k]:e.target.value}))}
                              style={{borderColor:c}} className="num-wrap"/>
                            <div className="num-lbl" style={{color:c}}>{l}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        <select value={editData.unit} onChange={e=>setEditData(d=>({...d,unit:e.target.value}))} className="inp" style={{flex:1,fontSize:12}}>
                          <option value="g">גר׳</option><option value="ml">מ״ל</option><option value="יח׳">יח׳</option><option value="קוביות">קוביות</option><option value="מנה">מנה</option>
                        </select>
                        <button onClick={()=>setEditing(null)} className="btn-muted" style={{flex:1,padding:"8px"}}>{T.cancel}</button>
                        <button onClick={()=>saveEdit(f.label)} style={{flex:2,background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"8px",fontSize:13,fontWeight:700,cursor:"pointer"}}>{T.save}</button>
                      </div>
                      {/* Claude recalculation section */}
                      <input ref={editing===i?editImgRef:null} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif" onChange={handleEditImage} style={{display:"none"}}/>
                      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:8,marginTop:2}}>
                        <div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:6}}>חשב מחדש עם Claude</div>
                        <textarea value={editClaudeText} onChange={e=>setEditClaudeText(e.target.value)}
                          placeholder="תאר את המאכל... (למשל: 100g עוף + 50g אורז)"
                          className="inp" rows={2} style={{fontSize:12,resize:"none",marginBottom:6}}/>
                        {editLoading&&<div style={{textAlign:'center',marginBottom:4}}><CalcLoader size={64}/></div>}
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                          <span style={{fontSize:11,color:C.muted}}>מספר מנות:</span>
                          <button onClick={()=>setEditQty(v=>Math.max(1,v-1))} style={{width:24,height:24,border:`1px solid ${C.border}`,borderRadius:6,background:"#f5f5f7",cursor:"pointer",fontSize:13}}>−</button>
                          <input type="number" value={editQty} min="1" onChange={e=>setEditQty(Math.max(1,parseInt(e.target.value)||1))} style={{width:38,textAlign:"center",border:`1px solid ${C.border}`,borderRadius:6,padding:"3px",fontSize:13,fontFamily:"inherit"}}/>
                          <button onClick={()=>setEditQty(v=>v+1)} style={{width:24,height:24,border:`1px solid ${C.border}`,borderRadius:6,background:"#f5f5f7",cursor:"pointer",fontSize:13}}>+</button>
                          <button onClick={askClaudeText} disabled={!editClaudeText.trim()||editLoading}
                            style={{flex:1,background:editClaudeText.trim()&&!editLoading?C.accent:"#ddd",border:"none",borderRadius:8,color:editClaudeText.trim()&&!editLoading?"#fff":"#aaa",padding:"6px 8px",fontSize:12,fontWeight:700,cursor:editClaudeText.trim()&&!editLoading?"pointer":"default"}}>
                            {editLoading?"חושב...":"✨ חשב מחדש"}
                          </button>
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          <button onClick={()=>editImgRef.current&&editImgRef.current.click()} disabled={editLoading}
                            style={{flex:1,background:"#f5f5f7",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px",fontSize:12,color:C.muted,cursor:"pointer",fontFamily:"inherit"}}>
                            📷 מצלמה / גלריה
                          </button>
                        </div>
                        {editPreview&&<div style={{marginTop:6,fontSize:11,color:C.accent,background:"#f0fae8",borderRadius:8,padding:"6px 10px"}}>✨ {editPreview.label} — עודכן למנה ({editQty} {editQty===1?"מנה":"מנות"})</div>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}

export function FoodAutocomplete({value, onChange, onSelect, onSelectFood, placeholder, recentFoods, onSelectRecent}){
  const [open, setOpen] = useState(false);

  const allFoods = [
    ...loadCustomDB(window._activePid||"default").map(f=>({label:f.label, name:f.names[0], food:f})),
    ...FOOD_DB.map(f=>({label:f.label, name:f.names[0], food:f})),
  ];

  const q = value.trim().toLowerCase();
  const suggestions = q.length >= 1 ? allFoods.filter(f =>
    f.label.toLowerCase().includes(q) ||
    f.name.toLowerCase().includes(q)
  ).slice(0, 6) : [];

  const showRecent = open && q.length === 0 && recentFoods && recentFoods.length > 0;
  const showSuggestions = open && suggestions.length > 0;

  return (
    <div style={{position:"relative", marginBottom:8}}>
      <input
        value={value}
        onChange={e=>{ onChange(e.target.value); setOpen(true); }}
        onKeyDown={e=>{ if(e.key==="Enter"){ setOpen(false); onSelect(value); } if(e.key==="Escape") setOpen(false); }}
        onFocus={()=>setOpen(true)}
        onBlur={()=>setTimeout(()=>setOpen(false),150)}
        placeholder={placeholder}
        className="inp"
        style={{fontSize:15, width:"100%"}}
      />
      {(showRecent || showSuggestions) && (
        <div style={{position:"absolute", top:"calc(100% + 4px)", right:0, left:0, background:"#fff", border:`1px solid ${C.accent}`, borderRadius:10, zIndex:50, overflow:"hidden", boxShadow:"0 6px 20px rgba(0,0,0,0.1)", animation:"fadeIn 0.1s ease"}}>
          {showRecent && <>
            <div style={{padding:"6px 14px 4px", fontSize:9.5, color:C.muted, letterSpacing:1.5, background:"#f8f8fa"}}>אחרונים</div>
            {recentFoods.map((f,i)=>(
              <div key={i} onMouseDown={e=>{ e.preventDefault(); if(onSelectRecent) onSelectRecent(f); setOpen(false); }}
                style={{padding:"9px 14px", fontSize:13, color:C.text, cursor:"pointer", borderBottom:i<recentFoods.length-1?`1px solid ${C.border}`:"none", background:"#fff", display:"flex", justifyContent:"space-between", alignItems:"center"}}
                onMouseEnter={e=>e.currentTarget.style.background="#f0fae8"}
                onMouseLeave={e=>e.currentTarget.style.background="#fff"}
              >
                <span>{f.label}</span>
                <span style={{fontSize:11, color:C.muted}}>{Math.round(f.kcal)} קק״ל</span>
              </div>
            ))}
          </>}
          {showSuggestions && suggestions.map((f,i)=>(
            <div key={i} onMouseDown={e=>{
              e.preventDefault();
              onChange(f.label);
              setOpen(false);
              if(onSelectFood) onSelectFood(f.food);
            }}
              style={{padding:"10px 14px", fontSize:13, color:C.text, cursor:"pointer", borderBottom:i<suggestions.length-1?`1px solid ${C.border}`:"none", background:"#fff"}}
              onMouseEnter={e=>e.currentTarget.style.background="#f0fae8"}
              onMouseLeave={e=>e.currentTarget.style.background="#fff"}
            >
              {f.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AskClaude({foodName, amount, unit, onAddToDay, onSaved}){
  const [loading,setLoading]=useState(false);
  const [preview,setPreview]=useState(null);
  const [errorMsg,setErrorMsg]=useState(null);
  const [saveName,setSaveName]=useState("");
  const [savedOk,setSavedOk]=useState(false);
  const [localAmt,setLocalAmt]=useState(amount||"100");
  const [localUnit,setLocalUnit]=useState(unit||"g");

  const calcFromRaw=(d,qty,u)=>{
    const divisor=d.cubes_per_bar?d.cubes_per_bar:d.serving_size?d.serving_size:100;
    const per1={kcal:d.kcal/divisor,carbs:(d.carbs||0)/divisor,protein:(d.protein||0)/divisor,fat:(d.fat||0)/divisor};
    return {kcal:Math.round(per1.kcal*qty),carbs:parseFloat((per1.carbs*qty).toFixed(1)),protein:parseFloat((per1.protein*qty).toFixed(1)),fat:parseFloat((per1.fat*qty).toFixed(1))};
  };

  const recalc=()=>{
    if(!preview)return;
    const qty=parseFloat(localAmt)||1;
    setPreview(p=>({...p,calc:calcFromRaw(p.raw,qty,localUnit),qty,unit:localUnit}));
  };

  const ask=async()=>{
    if(!foodName.trim())return;
    setLoading(true);setPreview(null);setErrorMsg(null);setSavedOk(false);
    try{
      const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({foodName,amount:localAmt,unit:localUnit})
      });
      if(!res.ok) throw new Error(`שגיאת שרת ${res.status}`);
      const d=await res.json();
      if(d.error) throw new Error(d.error);
      if(!d.kcal) throw new Error("תגובה לא תקינה");
      const qty=parseFloat(localAmt)||d.defaultAmt||100;
      setPreview({calc:calcFromRaw(d,qty,localUnit),raw:d,qty,unit:localUnit||d.unit||"g"});
      setSaveName(d.name||d.label||foodName);
    }catch(e){
      setErrorMsg(e.message||"שגיאה");
    }
    setLoading(false);
  };

  const doSave=(name)=>{
    const d=preview.raw;
    const entry={
      names:[name.toLowerCase(),...(d.names||[]).map(n=>n.toLowerCase())].filter((v,i,a)=>a.indexOf(v)===i),
      label:d.label||name,
      kcal:d.kcal,carbs:d.carbs||0,protein:d.protein||0,fat:d.fat||0,
      defaultAmt:d.defaultAmt||100,unit:d.unit||"g",
      ...(d.serving_size&&{serving_size:d.serving_size}),
      ...(d.cubes_per_bar&&{cubes_per_bar:d.cubes_per_bar}),
    };
    const db=loadCustomDB(window._activePid||"default");
    saveCustomDB([...db.filter(f=>!f.names.some(n=>entry.names.includes(n))),entry],window._activePid||"default");
    setSavedOk(true);
    setTimeout(()=>{onSaved();},300);
  };

  const addToDay=(withSave)=>{
    if(!preview)return;
    if(withSave&&saveName) doSave(saveName);
    onAddToDay({uid:Date.now()+Math.random(),
      label:`${preview.raw.label||foodName} (${preview.qty}${preview.unit})`,
      kcal:preview.calc.kcal,carbs:preview.calc.carbs,protein:preview.calc.protein,fat:preview.calc.fat});
  };

  return (
    <div style={{marginTop:8}}>
      {!preview&&(
        <>
          {loading&&<div style={{textAlign:'center',marginBottom:8}}><CalcLoader size={64}/></div>}
          <button onClick={ask} disabled={loading} style={{width:"100%",background:"linear-gradient(135deg,#5a9e1e,#7bc42e)",border:"none",borderRadius:8,color:"#fff",padding:"10px",fontSize:13,fontWeight:700,cursor:loading?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:loading?0.85:1}}>
            {loading?"מחפש ערכים...":"✨ שאל את Claude"}
          </button>
        </>
      )}
      {errorMsg&&(
        <div style={{marginTop:6,background:"#fff0f0",border:`1px solid ${C.danger}`,borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
          <span style={{fontSize:11,color:C.danger}}>⚠ {errorMsg}</span>
          <button onClick={ask} style={{background:C.danger,border:"none",borderRadius:6,color:"#fff",padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>נסה שוב</button>
        </div>
      )}
      {preview&&(
        <div className="green-box fade">
          <div style={{fontSize:11,color:C.accent,fontWeight:700,marginBottom:8}}>✨ {preview.raw.label||foodName}</div>
          <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center"}}>
            <input type="number" value={localAmt} onChange={e=>setLocalAmt(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&recalc()}
              className="inp" style={{flex:1,textAlign:"center",padding:"7px 6px",fontSize:13}}/>
            <select value={localUnit} onChange={e=>setLocalUnit(e.target.value)} className="inp" style={{flex:1,padding:"7px 6px",fontSize:12,cursor:"pointer"}}>
              <option value="g">גר׳</option><option value="ml">מ״ל</option><option value="יח׳">יח׳</option><option value="קוביות">קוביות</option><option value="כף">כף</option><option value="כפית">כפית</option>
            </select>
            <button onClick={recalc} style={{background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"7px 12px",fontSize:16,cursor:"pointer",lineHeight:1}}>🔄</button>
          </div>
          <div className="g3" style={{marginBottom:10}}>
            {[{l:"קק״ל",v:preview.calc.kcal,c:C.accent},{l:"פחמ׳g",v:preview.calc.carbs,c:C.warn},{l:"חלבוןg",v:preview.calc.protein,c:C.blue}].map(({l,v,c})=>(
              <div key={l} className="preview-box"><div className="preview-val" style={{color:c}}>{v}</div><div className="preview-lbl">{l}</div></div>
            ))}
          </div>
          {!savedOk?(
            <>
              <div style={{fontSize:10,color:C.muted,marginBottom:4}}>שם לשמירה במאגר (ניתן לעריכה):</div>
              <input value={saveName} onChange={e=>setSaveName(e.target.value)} className="inp"
                style={{marginBottom:8,fontSize:13,borderColor:saveName?C.accent:C.border}}/>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>addToDay(true)} disabled={!saveName}
                  style={{flex:2,background:saveName?C.accent:"#ddd",border:"none",borderRadius:8,color:saveName?"#fff":"#aaa",padding:"9px 6px",fontSize:12,fontWeight:700,cursor:saveName?"pointer":"default"}}>
                  הוסף + שמור
                </button>
                <button onClick={()=>addToDay(false)}
                  style={{flex:1,background:"#f5f5f7",border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,padding:"9px 6px",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                  הוסף ללא שמירה
                </button>
              </div>
            </>
          ):(
            <button onClick={()=>addToDay(false)} style={{width:"100%",background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ הוסף ליום</button>
          )}
        </div>
      )}
    </div>
  );
}
