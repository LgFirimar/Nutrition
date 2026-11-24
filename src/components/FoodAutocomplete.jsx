import React, { useState } from 'react';
import { loadCustomDB } from '../lib/storage.js';
import { C, FOOD_DB } from '../lib/nutrition.js';

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