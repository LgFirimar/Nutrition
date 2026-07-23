import React, { useState, useRef } from 'react';
import { C, getTodayKey } from '../lib/nutrition.js';
import { loadActiveProfileId, loadCustomBtns, loadCustomDB, loadFridge, loadJournal, loadPantry, loadProfiles, loadQuickFoods, loadRecipes, loadShopping, saveActiveProfileId, saveCustomBtns, saveCustomDB, saveFridgeLS, saveJournal, saveProfiles, saveQuickFoods, saveRecipes } from '../lib/storage.js';
import { savePantryLS, saveShopping } from '../lib/household.js';

export function ExportImportModal({pid, onClose, lang, todayEntries, todayDate, todayBloodSugar, todayTotals}){
  const isHe=(lang||'he')!=='en';
  const [importing,setImporting]=useState(false);
  const [importText,setImportText]=useState("");
  const [msg,setMsg]=useState(null);
  const [filename,setFilename]=useState(`nutrition-backup-${pid}-${new Date().toISOString().slice(0,10)}`);
  const fileInputRef=useRef(null);

  const exportData=()=>{
    // Build today's live data directly from props (don't rely on LS round-trip)
    const todayKey=todayDate||getTodayKey();
    const todayLive=(todayEntries?.length||todayBloodSugar)?{
      entries:(todayEntries||[]).map(e=>({label:e.label,kcal:e.kcal,carbs:e.carbs,protein:e.protein,fat:e.fat||0,...(e.count&&{count:e.count}),...(e.perUnit&&{perUnit:e.perUnit})})),
      totals:todayTotals||{kcal:0,carbs:0,protein:0,fat:0},
      ...(todayBloodSugar?{bloodSugar:parseFloat(todayBloodSugar)}:{}),
    }:null;
    // Current profile's journal: merge LS data + today's live state
    const currentJournal={...loadJournal(pid),...(todayLive?{[todayKey]:todayLive}:{})};
    // Collect data for ALL profiles
    const allProfiles=loadProfiles();
    const profilesData={};
    allProfiles.forEach(p=>{
      profilesData[p.id]={
        journal:p.id===pid?currentJournal:loadJournal(p.id),
        customBtns:loadCustomBtns(p.id),
        customDB:loadCustomDB(p.id),
        quickFoods:loadQuickFoods(p.id),
        recipes:loadRecipes(p.id),
      };
    });
    // Always include the active profile even if profiles array was empty
    if(!profilesData[pid]){
      profilesData[pid]={
        journal:currentJournal,
        customBtns:loadCustomBtns(pid),
        customDB:loadCustomDB(pid),
        quickFoods:loadQuickFoods(pid),
        recipes:loadRecipes(pid),
      };
    }
    const data={
      version:5,
      exportDate:new Date().toISOString(),
      pid,
      profiles:allProfiles,
      activeProfileId:loadActiveProfileId(),
      profilesData,
      // v4 compat keys for current pid
      journal:currentJournal,
      customBtns:loadCustomBtns(pid),
      customDB:loadCustomDB(pid),
      fridge:loadFridge(),
      pantry:loadPantry(),
      shopping:loadShopping(),
      savedPrefs:JSON.parse(localStorage.getItem("nutrition_saved_prefs")||"[]"),
      quickFoods:loadQuickFoods(pid),
      recipes:loadRecipes(pid),
    };
    const json=JSON.stringify(data,null,2);
    const fname=(filename.trim()||`nutrition-backup-${pid}`).replace(/\.json$/,"")+".json";
    const blob=new Blob([json],{type:"application/json"});
    // Try navigator.share first (iOS Files app), fallback to download link
    if(navigator.share&&navigator.canShare&&navigator.canShare({files:[new File([blob],fname,{type:"application/json"})]})){
      navigator.share({files:[new File([blob],fname,{type:"application/json"})],title:fname})
        .then(()=>{ setMsg({type:"success",text:isHe?"✓ הקובץ נשמר":"✓ Saved"}); setTimeout(onClose,1200); })
        .catch(()=>{});
    } else {
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url; a.download=fname;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMsg({type:"success",text:isHe?"✓ הקובץ נשמר בהצלחה":"✓ File saved"});
      setTimeout(onClose,1200);
    }
  };

  const importData=()=>{
    try{
      const data=JSON.parse(importText.trim());
      if(!data.version) throw new Error(isHe?"פורמט לא תקין":"Invalid format");
      if(data.profiles) saveProfiles(data.profiles);
      if(data.activeProfileId) saveActiveProfileId(data.activeProfileId);
      // v5: restore all profiles' data
      if(data.profilesData){
        Object.entries(data.profilesData).forEach(([profileId,pd])=>{
          if(pd.journal){const ex=loadJournal(profileId);saveJournal({...ex,...pd.journal},profileId);}
          if(pd.customBtns) saveCustomBtns(pd.customBtns,profileId);
          if(pd.customDB) saveCustomDB(pd.customDB,profileId);
          if(pd.quickFoods) saveQuickFoods(pd.quickFoods,profileId);
          if(pd.recipes) saveRecipes(pd.recipes,profileId);
        });
        // Restore top-level keys if the active profile wasn't covered by profilesData
        const targetPid=data.pid||pid;
        if(!data.profilesData[targetPid]){
          if(data.journal){const ex=loadJournal(targetPid);saveJournal({...ex,...data.journal},targetPid);}
          if(data.customBtns) saveCustomBtns(data.customBtns,targetPid);
          if(data.customDB) saveCustomDB(data.customDB,targetPid);
          if(data.quickFoods) saveQuickFoods(data.quickFoods,targetPid);
          if(data.recipes) saveRecipes(data.recipes,targetPid);
        }
      } else if(data.journal) {
        // v4 fallback: single profile
        const targetPid=data.pid||pid;
        const existing=loadJournal(targetPid);
        saveJournal({...existing,...data.journal},targetPid);
        if(data.customBtns) saveCustomBtns(data.customBtns,targetPid);
        if(data.customDB) saveCustomDB(data.customDB,targetPid);
        if(data.quickFoods) saveQuickFoods(data.quickFoods,targetPid);
        if(data.recipes) saveRecipes(data.recipes,targetPid);
      }
      if(data.fridge) saveFridgeLS(data.fridge);
      if(data.pantry) savePantryLS(data.pantry);
      if(data.shopping) saveShopping(data.shopping);
      if(data.savedPrefs) localStorage.setItem("nutrition_saved_prefs",JSON.stringify(data.savedPrefs));
      const days=Object.keys((data.profilesData?Object.values(data.profilesData)[0]?.journal:data.journal)||{}).length;
      setMsg({type:"success",text:isHe?`✓ יובאו ${days} ימים בהצלחה! טוען מחדש...`:`✓ Imported ${days} days. Reloading...`});
      setImporting(false);
      setImportText("");
      setTimeout(()=>window.location.reload(),1500);
    }catch(e){
      setMsg({type:"error",text:"שגיאה: "+e.message});
    }
  };

  const importFromFile=(e)=>{
    const file=e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>setImportText(ev.target.result);
    reader.readAsText(file);
  };

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:700}}>{isHe?"📤 ייצוא / ייבוא נתונים":"📤 Export / Import"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>

        {msg && (
          <div style={{background:msg.type==="success"?"#f0fae8":"#fff0f0",border:`1px solid ${msg.type==="success"?C.accent:C.danger}`,borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:13,color:msg.type==="success"?C.accent:C.danger}}>
            {msg.text}
          </div>
        )}

        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>{isHe?"ייצוא נתונים":"Export Data"}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:10,lineHeight:1.6}}>
            {isHe?"שומר קובץ JSON עם כל היומן, הכפתורים, המאגר האישי והמזווה שלך.":"Saves a JSON file with your journal, buttons, personal database and pantry."}
          </div>
          <div style={{marginBottom:8}}>
            <input
              value={filename}
              onChange={e=>setFilename(e.target.value)}
              style={{width:"100%",boxSizing:"border-box",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",fontSize:12,fontFamily:"inherit",direction:"ltr",textAlign:"left"}}
              placeholder={isHe?"שם הקובץ":"File name"}
            />
          </div>
          <button onClick={exportData} style={{width:"100%",background:C.accent,border:"none",borderRadius:10,color:"#fff",padding:"12px",fontSize:13,fontWeight:700,cursor:"pointer"}}>
            {isHe?"💾 שמור קובץ גיבוי":"💾 Save Backup File"}
          </button>
        </div>

        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:16}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>{isHe?"ייבוא נתונים":"Import Data"}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:10,lineHeight:1.6}}>
            {isHe?"טעינת נתונים מקובץ גיבוי קודם. ⚠️ ידרוס את הנתונים הקיימים בפרופיל הנוכחי.":"Load data from a previous backup. ⚠️ Will overwrite current profile data."}
          </div>
          <input ref={fileInputRef} type="file" accept=".json" onChange={importFromFile} style={{display:"none"}}/>
          {!importText ? (
            <button onClick={()=>fileInputRef.current?.click()} style={{width:"100%",background:"#f5f5f7",border:`1px solid ${C.border}`,borderRadius:10,color:C.muted,padding:"12px",fontSize:13,fontWeight:700,cursor:"pointer"}}>
              {isHe?"📂 ייבא מקובץ":"📂 Import from File"}
            </button>
          ) : (
            <div className="fade">
              <div style={{fontSize:11,color:C.accent,marginBottom:8}}>{isHe?"✓ קובץ נטען — לחצי ייבא":"✓ File loaded — tap Import"}</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setImportText("")} className="btn-muted" style={{flex:1}}>{isHe?"ביטול":"Cancel"}</button>
                <button onClick={importData} style={{flex:2,background:C.warn,border:"none",borderRadius:8,color:"#fff",padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer"}}>{isHe?"ייבא עכשיו":"Import Now"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}