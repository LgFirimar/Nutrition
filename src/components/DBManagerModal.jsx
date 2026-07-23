import React, { useState, useRef, useEffect } from 'react';
import { LANG } from '../lib/lang.js';
import { loadCustomDB, saveCustomDB } from '../lib/storage.js';
import { C } from '../lib/nutrition.js';
import { CalcLoader } from './CalcLoader.jsx';

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