import React, { useState, useRef, useEffect } from 'react';
import { saveActiveProfileId, saveCustomBtns, saveCustomDB, saveFridgeLS, saveJournal, saveProfiles, saveQuickFoods } from '../lib/storage.js';
import { savePantryLS, saveShopping } from '../lib/household.js';
import { C } from '../lib/nutrition.js';

export function SetupScreen({onDone,lang,onToggleLang,onRestored}){
  const isHe=(lang||'he')!=='en';
  const [name,setName]=useState("");
  const [emoji,setEmoji]=useState("👩");
  const [restoreErr,setRestoreErr]=useState("");
  const restoreRef=useRef(null);
  const setupCvRef=useRef(null);
  const setupVidRef=useRef(null);
  useEffect(()=>{
    const vid=setupVidRef.current, cv=setupCvRef.current;
    if(!vid||!cv) return;
    const dpr=Math.min(window.devicePixelRatio||1,3);
    const SIZE=120;
    cv.width=SIZE*dpr; cv.height=SIZE*dpr;
    const ctx=cv.getContext('2d',{willReadFrequently:true});
    let raf;
    vid.play().catch(()=>{});
    const draw=()=>{
      raf=requestAnimationFrame(draw);
      if(!vid.videoWidth||vid.readyState<2) return;
      ctx.clearRect(0,0,cv.width,cv.height);
      ctx.drawImage(vid,0,0,cv.width,cv.height);
      try{
        const id=ctx.getImageData(0,0,cv.width,cv.height),d=id.data;
        for(let i=0;i<d.length;i+=4){const mn=Math.min(d[i],d[i+1],d[i+2]);if(mn>230)d[i+3]=0;else if(mn>180)d[i+3]=Math.round(255*(1-(mn-180)/50));}
        ctx.putImageData(id,0,0);
      }catch(_){}
    };
    raf=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(raf);
  },[]);
  const EMOJIS=["👩","👨","👧","👦","👵","👴","🧑","👩‍⚕️","👨‍⚕️","🧑‍🍳","🏃","💪","🧘","🌸","🌟","⭐","🦋","🐱","🐶","🦊","🍎","🥑","🌿","❤️","💙","💚","🔥","✨","🎯","🏅"];
  const create=()=>{
    if(!name.trim())return;
    onDone({id:"profile_"+Date.now(),name:name.trim(),emoji,maxKcal:1800,maxCarbs:80,maxProtein:120});
  };
  const restoreFromFile=e=>{
    const file=e.target.files[0]; if(!file)return; e.target.value="";
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const data=JSON.parse(ev.target.result);
        if(!data.profiles?.length) throw new Error(isHe?"קובץ לא תקין — חסרים פרופילים":"Invalid file — no profiles found");
        saveProfiles(data.profiles);
        if(data.activeProfileId) saveActiveProfileId(data.activeProfileId);
        if(data.profilesData){
          Object.entries(data.profilesData).forEach(([pid,pd])=>{
            if(pd.journal) saveJournal(pd.journal,pid);
            if(pd.customBtns) saveCustomBtns(pd.customBtns,pid);
            if(pd.customDB) saveCustomDB(pd.customDB,pid);
            if(pd.quickFoods) saveQuickFoods(pd.quickFoods,pid);
          });
        } else if(data.journal){
          const tpid=data.pid||data.profiles[0]?.id;
          if(tpid){saveJournal(data.journal,tpid);if(data.customBtns)saveCustomBtns(data.customBtns,tpid);if(data.customDB)saveCustomDB(data.customDB,tpid);if(data.quickFoods)saveQuickFoods(data.quickFoods,tpid);}
        }
        if(data.fridge) saveFridgeLS(data.fridge);
        if(data.pantry) savePantryLS(data.pantry);
        if(data.shopping) saveShopping(data.shopping);
        if(data.savedPrefs) localStorage.setItem("nutrition_saved_prefs",JSON.stringify(data.savedPrefs));
        onRestored&&onRestored();
      }catch(err){setRestoreErr(err.message);}
    };
    reader.readAsText(file);
  };
  return (
    <div style={{minHeight:"100vh",background:"#f5f5f7",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative"}}>
      {onToggleLang&&<button onClick={onToggleLang} style={{position:"fixed",top:18,right:20,zIndex:10,height:26,borderRadius:7,background:"rgba(255,255,255,.85)",border:"1px solid rgba(200,200,200,.7)",cursor:"pointer",fontSize:10,fontWeight:700,color:"#666",padding:"0 10px",boxShadow:"0 1px 4px rgba(0,0,0,.08)"}}>{isHe?'EN':'עב'}</button>}
      <div style={{position:"relative",width:120,height:120,marginBottom:8}}>
        <video ref={setupVidRef} src="/Nutrition/avo-animation.mp4" autoPlay loop muted playsInline crossOrigin="anonymous"
          style={{position:"absolute",inset:0,width:120,height:120,opacity:0}}/>
        <canvas ref={setupCvRef} style={{position:"absolute",inset:0,width:120,height:120,display:"block"}}/>
      </div>
      <div style={{fontSize:22,fontWeight:900,color:C.accent,marginBottom:4}}>{isHe?"ברוכים הבאים!":"Welcome!"}</div>
      <div style={{fontSize:13,color:C.muted,marginBottom:28,textAlign:"center"}}>{isHe?"בואו ניצור פרופיל":"Create your first profile to get started"}</div>
      <div style={{background:"#fff",borderRadius:16,padding:20,width:"100%",maxWidth:360,boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
        <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700}}>{isHe?"שם":"Name"}</div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder={isHe?"שם הפרופיל":"Profile name"} className="inp" style={{marginBottom:14}}/>
        <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:700}}>{isHe?"אימוג׳י":"Emoji"}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
          {EMOJIS.map(em=>(
            <button key={em} onClick={()=>setEmoji(em)} style={{width:38,height:38,border:`2px solid ${em===emoji?C.accent:"#e0e0e5"}`,borderRadius:8,background:em===emoji?"rgba(90,158,30,0.1)":"#fff",fontSize:20,cursor:"pointer"}}>{em}</button>
          ))}
        </div>
        <button onClick={create} disabled={!name.trim()} style={{width:"100%",background:name.trim()?C.accent:"#ddd",border:"none",borderRadius:10,color:name.trim()?"#fff":"#aaa",padding:"13px",fontSize:14,fontWeight:700,cursor:name.trim()?"pointer":"default"}}>
          {isHe?"מתחילים":"Let's go"}
        </button>
        <div style={{display:"flex",alignItems:"center",gap:8,margin:"16px 0 12px"}}>
          <div style={{flex:1,height:1,background:C.border}}/>
          <span style={{fontSize:11,color:C.muted}}>{isHe?"או":"or"}</span>
          <div style={{flex:1,height:1,background:C.border}}/>
        </div>
        <input ref={restoreRef} type="file" accept=".json" onChange={restoreFromFile} style={{display:"none"}}/>
        <button onClick={()=>restoreRef.current?.click()} style={{width:"100%",background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,color:C.muted,padding:"12px",fontSize:13,fontWeight:700,cursor:"pointer"}}>
          📂 {isHe?"טען מגיבוי קיים":"Restore from Backup"}
        </button>
        {restoreErr&&<div style={{fontSize:11,color:C.danger,marginTop:8,textAlign:"center"}}>{restoreErr}</div>}
      </div>
    </div>
  );
}