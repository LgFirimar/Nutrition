import React, { useState } from 'react';
import { saveProfiles } from '../lib/storage.js';
import { C } from '../lib/nutrition.js';

export function ProfileModal({profiles, activeId, onSelect, onClose, onBackup, onSetupProfile, lang}){
  const isHe=(lang||'he')!=='en';
  const [showNew,setShowNew]=useState(false);
  const [newName,setNewName]=useState("");
  const [newEmoji,setNewEmoji]=useState("👤");
  const EMOJIS=["👩","👨","👧","👦","👵","👴","🧑","👩‍⚕️","👨‍⚕️","🧑‍🍳","🏃","💪","🧘","🌸","🌟","⭐","🦋","🐱","🐶","🦊","🍎","🥑","🌿","❤️","💙","💚","🔥","✨","🎯","🏅"];

  const createProfile=()=>{
    if(!newName.trim())return;
    const id="profile_"+Date.now();
    const p={id,name:newName.trim(),emoji:newEmoji,maxKcal:1800,maxCarbs:80,maxProtein:120};
    const updated=[...profiles,p];
    saveProfiles(updated);
    onSelect(p);
    onSetupProfile&&onSetupProfile(p);
  };

  const deleteProfile=(id)=>{
    if(id==="default")return;
    const updated=profiles.filter(p=>p.id!==id);
    saveProfiles(updated);
    if(activeId===id) onSelect(updated[0]);
    else onSelect(profiles.find(p=>p.id===activeId));
  };

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:700}}>{isHe?"👥 פרופילים":"👥 Profiles"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
          {profiles.map(p=>(
            <div key={p.id} onClick={()=>{onSelect(p);onClose();}}
              style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:p.id===activeId?"rgba(90,158,30,0.1)":"#f5f5f7",border:`1px solid ${p.id===activeId?C.accent:C.border}`,borderRadius:10,padding:"12px 14px",cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:22}}>{p.emoji}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:p.id===activeId?700:400,color:p.id===activeId?C.accent:C.text}}>{p.name}</div>
                  <div style={{fontSize:10,color:C.muted}}>{p.maxKcal} {isHe?"קק״ל":"kcal"} · {p.maxCarbs}g {isHe?"פחמ׳":"carbs"}</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                {p.id===activeId && <span style={{fontSize:10,color:C.accent,fontWeight:700}}>{isHe?"פעיל":"Active"}</span>}
                {p.recommendations && <span style={{fontSize:10,color:C.muted}} title={isHe?"יש המלצות":"Has recommendations"}>ℹ</span>}
                <button onClick={e=>{e.stopPropagation();onSetupProfile&&onSetupProfile(p);}} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:6,color:C.accent,fontSize:11,fontWeight:700,cursor:"pointer",padding:"3px 7px",fontFamily:"inherit"}}>🎯</button>
                {p.id!=="default" && <button onClick={e=>{e.stopPropagation();deleteProfile(p.id);}} style={{background:"none",border:"none",color:C.muted,fontSize:16,cursor:"pointer",padding:4}}>🗑</button>}
              </div>
            </div>
          ))}
        </div>
        {!showNew
          ? <><button onClick={()=>setShowNew(true)} style={{width:"100%",background:"transparent",border:`1px dashed ${C.border}`,borderRadius:10,padding:"10px",fontSize:13,color:C.muted,cursor:"pointer",marginBottom:8}}>{isHe?"+ פרופיל חדש":"+ New Profile"}</button>
            <button onClick={onBackup} style={{width:"100%",background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px",fontSize:13,color:C.muted,cursor:"pointer"}}>{isHe?"💾 גיבוי וייבוא נתונים":"💾 Backup & Import"}</button></>

          : (
            <div className="fade" style={{background:"#f5f5f7",borderRadius:10,padding:12}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{isHe?"שם":"Name"}</div>
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder={isHe?"שם הפרופיל":"Profile name"} className="inp" style={{marginBottom:10}}/>
              <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{isHe?"אימוג׳י":"Emoji"}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                {EMOJIS.map(em=>(
                  <button key={em} onClick={()=>setNewEmoji(em)} style={{width:36,height:36,border:`1px solid ${em===newEmoji?C.accent:C.border}`,borderRadius:8,background:em===newEmoji?"rgba(90,158,30,0.1)":"#fff",fontSize:18,cursor:"pointer"}}>{em}</button>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setShowNew(false)} className="btn-muted" style={{flex:1}}>{isHe?"ביטול":"Cancel"}</button>
                <button onClick={createProfile} disabled={!newName.trim()} style={{flex:2,background:newName.trim()?C.accent:"#ddd",border:"none",borderRadius:8,color:newName.trim()?"#fff":"#aaa",padding:"10px",fontSize:13,fontWeight:700,cursor:newName.trim()?"pointer":"default"}}>{isHe?"צור פרופיל":"Create Profile"}</button>
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
}