import React, { useState, useRef, useEffect } from 'react';
import { loadPantry } from '../lib/storage.js';
import { C, FRIDGE_CATS } from '../lib/nutrition.js';
import { savePantryLS } from '../lib/household.js';
import { CalcLoader } from './CalcLoader.jsx';

export function PantryModal({onClose,lang,syncTick}){
  const isHe=(lang||'he')!=='en';
  const [pantry,setPantry]=useState(loadPantry);
  const [inputs,setInputs]=useState(()=>Object.fromEntries(FRIDGE_CATS.map(c=>[c.key,{name:"",qty:"",unit:""}])));
  const [open,setOpen]=useState(()=>Object.fromEntries(FRIDGE_CATS.map(c=>[c.key,false])));
  const [imgLoading,setImgLoading]=useState({});
  const [scanLoading,setScanLoading]=useState(false);
  const [scanResults,setScanResults]=useState(null);
  const imgRefs=useRef({});
  const bulkInputRef=useRef(null);

  useEffect(()=>{if(syncTick>0)setPantry(loadPantry());},[syncTick]);

  const update=p=>{setPantry(p);savePantryLS(p);};

  const handleBulkScan=e=>{
    const file=e.target.files[0]; if(!file)return; e.target.value="";
    setScanLoading(true);
    const reader=new FileReader();
    reader.onload=async ev=>{
      const b64=ev.target.result.split(',')[1];
      try{
        const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({pantryBulkData:b64,pantryBulkMediaType:file.type||'image/jpeg'})});
        if(!res.ok)throw new Error();
        const d=await res.json();
        if(d.items?.length) setScanResults(d.items.map((item,i)=>({...item,_id:i,checked:true})));
      }catch{}
      setScanLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // Find existing pantry item by name across all categories
  const findExistingPantryItem=(name)=>{
    for(const c of FRIDGE_CATS){
      const arr=pantry[c.key]||[];
      const idx=arr.findIndex(e=>e.name.toLowerCase()===name.toLowerCase());
      if(idx>=0) return {cat:c.key,idx,item:arr[idx]};
    }
    return null;
  };

  const confirmScan=()=>{
    const newPantry={...pantry};
    const newOpen={...open};
    scanResults.filter(i=>i.checked).forEach(item=>{
      const suggestedCat=FRIDGE_CATS.find(c=>c.key===item.cat)?item.cat:'other';
      const itemUnit=item.unit||"";
      const found=findExistingPantryItem(item.name);
      if(found){
        const {cat:foundCat,idx:foundIdx,item:existing}=found;
        const existUnit=existing.unit||"";
        newOpen[foundCat]=true;
        if(existUnit===itemUnit){
          // Same unit — add quantities numerically
          const eq=parseFloat(existing.qty)||0;
          const nq=parseFloat(item.qty)||0;
          const merged=eq>0&&nq>0?String(eq+nq):(item.qty||existing.qty||"");
          newPantry[foundCat]=[...newPantry[foundCat]];
          newPantry[foundCat][foundIdx]={...existing,qty:merged};
        }else{
          // Different units — add as separate item in suggested category
          if(!newPantry[suggestedCat])newPantry[suggestedCat]=[];
          newPantry[suggestedCat]=[...newPantry[suggestedCat],{id:Date.now()+Math.random(),name:item.name,qty:item.qty||"",unit:itemUnit}];
          newOpen[suggestedCat]=true;
        }
      }else{
        if(!newPantry[suggestedCat])newPantry[suggestedCat]=[];
        newPantry[suggestedCat]=[...newPantry[suggestedCat],{id:Date.now()+Math.random(),name:item.name,qty:item.qty||"",unit:itemUnit}];
        newOpen[suggestedCat]=true;
      }
    });
    update(newPantry);
    setOpen(newOpen);
    setScanResults(null);
  };

  const addItem=(cat)=>{
    const {name,qty,unit}=inputs[cat];
    if(!name.trim())return;
    const items=[...(pantry[cat]||[])];
    const idx=items.findIndex(i=>i.name.toLowerCase()===name.trim().toLowerCase());
    if(idx>=0) items[idx]={...items[idx],qty:qty.trim()||items[idx].qty,unit:unit||items[idx].unit||""};
    else items.push({id:Date.now()+Math.random(),name:name.trim(),qty:qty.trim(),unit:unit||""});
    update({...pantry,[cat]:items});
    setInputs(i=>({...i,[cat]:{name:"",qty:"",unit:""}}));
  };

  const handlePantryImage=(e,cat)=>{
    const file=e.target.files[0];
    if(!file)return; e.target.value="";
    setImgLoading(l=>({...l,[cat]:true}));
    const reader=new FileReader();
    reader.onload=async ev=>{
      const b64=ev.target.result.split(',')[1];
      try{
        const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({pantryImageData:b64,pantryImageMediaType:file.type||'image/jpeg'})});
        if(!res.ok) throw new Error();
        const d=await res.json();
        if(d.name) setInputs(i=>({...i,[cat]:{name:d.name,qty:d.qty||""}}));
      }catch{}
      setImgLoading(l=>({...l,[cat]:false}));
    };
    reader.readAsDataURL(file);
  };

  const removeItem=(cat,id)=>update({...pantry,[cat]:(pantry[cat]||[]).filter(i=>i.id!==id)});
  const updateQty=(cat,id,qty)=>update({...pantry,[cat]:(pantry[cat]||[]).map(i=>i.id===id?{...i,qty}:i)});
  const updateUnit=(cat,id,unit)=>update({...pantry,[cat]:(pantry[cat]||[]).map(i=>i.id===id?{...i,unit}:i)});

  return(
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide" style={{maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:15,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>
            <img src={isHe?"/Nutrition/pantry-he.png":"/Nutrition/pantry-en.png"} style={{width:44,height:44,objectFit:"contain"}} alt=""/>
            {isHe?"מזווה":"Pantry"}
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>
        {/* Bulk scan button */}
        <input ref={bulkInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif" style={{display:"none"}} onChange={handleBulkScan}/>
        <button onClick={()=>bulkInputRef.current?.click()} disabled={scanLoading}
          style={{width:"100%",background:"rgba(99,102,241,.07)",border:"1px solid rgba(99,102,241,.25)",borderRadius:10,color:"#6366f1",padding:"10px",fontSize:12,fontWeight:700,cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          {scanLoading?<CalcLoader/>:"📸"} {isHe?"סרוק חשבונית / מדפי מזווה":"Scan receipt / pantry shelf"}
        </button>
        <div style={{fontSize:11,color:C.muted,marginBottom:14}}>{isHe?"מה יש בבית? הכנס פריטים עם כמויות:":"What do you have at home? Add items with quantities:"}</div>
        {/* Scan confirmation overlay */}
        {scanResults&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:300,display:"flex",alignItems:"flex-end"}}>
            <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%",maxHeight:"70vh",overflowY:"auto",boxSizing:"border-box"}}>
              <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>{isHe?`נמצאו ${scanResults.length} פריטים`:`Found ${scanResults.length} items`}</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:12}}>{isHe?"סמן את הפריטים להוספה למזווה:":"Select items to add to pantry:"}</div>
              {scanResults.map((item,i)=>{
                const found=findExistingPantryItem(item.name);
                const sameUnit=found&&(found.item.unit||"")===(item.unit||"");
                const diffUnit=found&&!sameUnit;
                const eq=found?parseFloat(found.item.qty)||0:0;
                const nq=parseFloat(item.qty)||0;
                const mergedQty=sameUnit&&eq>0&&nq>0?eq+nq:null;
                return(
                <div key={item._id} style={{padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                    <input type="checkbox" checked={item.checked} onChange={()=>setScanResults(r=>r.map((x,j)=>j===i?{...x,checked:!x.checked}:x))} style={{width:16,height:16,cursor:"pointer",flexShrink:0}}/>
                    <span style={{flex:1,fontSize:13,color:C.text,fontWeight:500}}>{item.name}</span>
                    {sameUnit&&mergedQty!=null&&<span style={{fontSize:9.5,color:"#16a34a",background:"#f0fae8",borderRadius:6,padding:"2px 7px",flexShrink:0,fontWeight:600}}>
                      {found.item.qty}→{mergedQty}
                    </span>}
                    {sameUnit&&mergedQty==null&&found&&<span style={{fontSize:9.5,color:"#16a34a",background:"#f0fae8",borderRadius:6,padding:"2px 7px",flexShrink:0}}>{isHe?"יתחבר":"merge"}</span>}
                    {diffUnit&&<span style={{fontSize:9.5,color:"#b45309",background:"#fff8e1",borderRadius:6,padding:"2px 7px",flexShrink:0}}>{isHe?"פריט נפרד":"separate"}</span>}
                  </div>
                  <div style={{display:"flex",gap:6,paddingRight:24}}>
                    <input value={item.qty||""} onChange={e=>setScanResults(r=>r.map((x,j)=>j===i?{...x,qty:e.target.value}:x))}
                      placeholder={isHe?"כמות":"Qty"}
                      style={{width:68,border:`1px solid ${C.border}`,borderRadius:7,padding:"4px 6px",fontSize:12,textAlign:"center",fontFamily:"inherit"}}/>
                    <select value={item.cat||"other"} onChange={e=>setScanResults(r=>r.map((x,j)=>j===i?{...x,cat:e.target.value}:x))}
                      style={{flex:1,border:`1px solid ${C.border}`,borderRadius:7,padding:"4px 6px",fontSize:11,fontFamily:"inherit",background:"#fff",cursor:"pointer"}}>
                      {FRIDGE_CATS.map(c=><option key={c.key} value={c.key}>{isHe?c.he:c.en}</option>)}
                    </select>
                  </div>
                </div>
                );
              })}
              <div style={{display:"flex",gap:8,marginTop:16}}>
                <button onClick={()=>setScanResults(null)} style={{flex:1,background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{isHe?"ביטול":"Cancel"}</button>
                <button onClick={confirmScan} disabled={!scanResults.some(i=>i.checked)}
                  style={{flex:2,background:scanResults.some(i=>i.checked)?C.accent:"#ddd",border:"none",borderRadius:10,color:"#fff",padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                  {isHe?`הוסף ${scanResults.filter(i=>i.checked).length} פריטים`:`Add ${scanResults.filter(i=>i.checked).length} items`}
                </button>
              </div>
            </div>
          </div>
        )}
        {FRIDGE_CATS.map(cat=>(
          <div key={cat.key} style={{marginBottom:10}}>
            <input ref={el=>imgRefs.current[cat.key]=el} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif"
              style={{display:"none"}} onChange={e=>handlePantryImage(e,cat.key)}/>
            <button onClick={()=>setOpen(o=>({...o,[cat.key]:!o[cat.key]}))}
              style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",background:"none",border:"none",cursor:"pointer",padding:"4px 0",fontFamily:"inherit"}}>
              <span style={{fontSize:12,fontWeight:700,color:C.text}}>{isHe?cat.he:cat.en}
                {(pantry[cat.key]||[]).length>0&&<span style={{marginRight:5,background:C.accent,color:"#fff",borderRadius:10,fontSize:9,padding:"1px 5px"}}>{(pantry[cat.key]||[]).length}</span>}
              </span>
              <span style={{fontSize:10,color:C.muted,transform:open[cat.key]?"rotate(180deg)":"none",transition:"transform .2s",display:"inline-block"}}>▾</span>
            </button>
            {open[cat.key]&&<>
              <div style={{display:"flex",gap:6,marginBottom:6,marginTop:4}}>
                <input value={inputs[cat.key].name} onChange={e=>setInputs(i=>({...i,[cat.key]:{...i[cat.key],name:e.target.value}}))}
                  onKeyDown={e=>e.key==="Enter"&&addItem(cat.key)}
                  placeholder={isHe?"שם מוצר":"Product"} className="inp" style={{flex:2,fontSize:12,padding:"6px 8px"}}/>
                <input value={inputs[cat.key].qty} onChange={e=>setInputs(i=>({...i,[cat.key]:{...i[cat.key],qty:e.target.value}}))}
                  onKeyDown={e=>e.key==="Enter"&&addItem(cat.key)}
                  placeholder={isHe?"כמות":"Qty"} className="inp" style={{width:52,fontSize:12,padding:"6px 6px",flexShrink:0}}/>
                <select value={inputs[cat.key].unit} onChange={e=>setInputs(i=>({...i,[cat.key]:{...i[cat.key],unit:e.target.value}}))}
                  className="inp" style={{width:60,fontSize:11,padding:"6px 4px",flexShrink:0,cursor:"pointer"}}>
                  <option value="">יח׳</option>
                  <option value="מ״ל">מ״ל</option>
                  <option value="מ״ג">מ״ג</option>
                  <option value="ג׳">ג׳</option>
                  <option value="ק״ג">ק״ג</option>
                </select>
                <button onClick={()=>imgRefs.current[cat.key]&&imgRefs.current[cat.key].click()} disabled={imgLoading[cat.key]}
                  style={{background:"#f5f5f7",border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,padding:"0 8px",cursor:"pointer",fontSize:16,minWidth:36}}>
                  {imgLoading[cat.key]?<CalcLoader/>:"📷"}
                </button>
                <button onClick={()=>addItem(cat.key)} style={{background:C.accent,border:"none",borderRadius:8,color:"#fff",padding:"0 10px",cursor:"pointer",fontSize:16}}>+</button>
              </div>
              {(pantry[cat.key]||[]).map(item=>(
                <div key={item.id} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",borderBottom:`1px solid ${C.border}`}}>
                  <span style={{flex:1,fontSize:12,color:C.text}}>{item.name}</span>
                  <input value={item.qty} onChange={e=>updateQty(cat.key,item.id,e.target.value)}
                    placeholder={isHe?"כמות":"Qty"} style={{width:48,border:`1px solid ${C.border}`,borderRadius:6,padding:"3px 6px",fontSize:11,textAlign:"center",fontFamily:"inherit"}}/>
                  <select value={item.unit||""} onChange={e=>updateUnit(cat.key,item.id,e.target.value)}
                    style={{width:58,border:`1px solid ${C.border}`,borderRadius:6,padding:"3px 4px",fontSize:11,fontFamily:"inherit",background:"#fff",cursor:"pointer"}}>
                    <option value="">יח׳</option>
                    <option value="מ״ל">מ״ל</option>
                    <option value="מ״ג">מ״ג</option>
                    <option value="ג׳">ג׳</option>
                    <option value="ק״ג">ק״ג</option>
                  </select>
                  <button onClick={()=>removeItem(cat.key,item.id)} style={{background:"none",border:"none",color:C.danger,fontSize:16,cursor:"pointer",padding:"0 3px"}}>×</button>
                </div>
              ))}
            </>}
          </div>
        ))}
      </div>
    </div>
  );
}