import React, { useState } from 'react';
import { LANG } from '../lib/lang.js';
import { loadJournal, saveJournal } from '../lib/storage.js';
import { C, getDateLabel, getTodayKey, sugarColor } from '../lib/nutrition.js';
import { MetricWeekChart, SugarWeekChart } from './Charts.jsx';

// Journal (saved days) view.

export function JournalView({onClose,onLoadDay,pid,lang,profile}){
  const T=LANG[lang]||LANG.he;
  const [journal,setJournal]=useState(()=>loadJournal(pid||'default'));
  const [selected,setSelected]=useState(null);
  const [detailMode,setDetailMode]=useState("full");
  const [view,setView]=useState("list");
  const [activeChart,setActiveChart]=useState("kcal");
  const [metricRanges,setMetricRanges]=useState({kcal:7,carbs:7,protein:7});
  const isHe=(lang||'he')!=='en';
  const todayKey=getTodayKey();
  const days=Object.keys(journal).sort((a,b)=>b.localeCompare(a));
  const weekDays=days.filter(k=>k!==todayKey).slice(0,7);
  const wt=weekDays.reduce((acc,k)=>{const d=journal[k];return{kcal:acc.kcal+d.totals.kcal,carbs:acc.carbs+d.totals.carbs,protein:acc.protein+d.totals.protein,n:acc.n+1};},{kcal:0,carbs:0,protein:0,n:0});
  const now=new Date();
  const fmtK=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const calcAvgMetric=(metric,nDays)=>{let sum=0,cnt=0;for(let i=nDays-1;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i);const k=fmtK(d);if(journal[k]&&k!==todayKey){sum+=journal[k].totals[metric];cnt++;}}return cnt?sum/cnt:0;};
  const setMR=(m,r)=>setMetricRanges(prev=>({...prev,[m]:r}));
  const deleteDay=key=>{const j={...journal};delete j[key];saveJournal(j,pid||'default');setJournal(j);if(selected===key)setSelected(null);};

  return (
    <div className="journal-screen fade">
      <div className="journal-header">
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>📓</span>
          <div><div style={{fontSize:11,color:C.muted,letterSpacing:2}}>{T.journalTitle}</div><div style={{fontSize:13,color:C.accent}}>{days.length} {T.daysSaved}</div></div>
        </div>
        <button onClick={onClose} style={{background:"none",border:"1px solid #e0e0e5",color:C.muted,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12}}>{T.close}</button>
      </div>
      <div className="tab-bar">
        {[[("list"),T.journalTab],[("week"),T.weekTab]].map(([v,l])=>(
          <button key={v} className={`tab${view===v?" active":""}`} onClick={()=>{setView(v);setSelected(null);}}>{l}</button>
        ))}
      </div>
      <div className="journal-body">
        {view==="list" && (
          <div>
            {days.length===0 && <div style={{padding:40,textAlign:"center",color:C.muted,fontSize:13}}>{T.noDays}</div>}
            {days.map(key=>(
              <div key={key}>
                <div onClick={()=>setSelected(selected===key?null:key)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",borderBottom:"1px solid #e0e0e5",cursor:"pointer",background:selected===key?"rgba(90,158,30,0.07)":"transparent"}}>
                  <div><div style={{fontSize:13,color:C.text,fontWeight:600}}>{getDateLabel(key)}</div><div style={{fontSize:11,color:C.muted,marginTop:3}}>{Math.round(journal[key].totals.kcal)} {T.kcal} · {Number(journal[key].totals.carbs).toFixed(1)}g {T.carbs}</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <button onClick={e=>{e.stopPropagation();deleteDay(key);}} style={{background:"none",border:"none",color:C.muted,fontSize:16,cursor:"pointer",padding:4}}>🗑</button>
                    <span style={{color:C.muted,fontSize:16,display:"inline-block",transform:selected===key?"rotate(90deg)":"none",transition:"transform 0.2s"}}>›</span>
                  </div>
                </div>
                {selected===key && (
                  <div style={{background:"rgba(255,255,255,.55)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid rgba(148,163,184,.18)"}} className="fade">
                    <div style={{display:"flex",gap:8,padding:"12px 20px 8px",flexWrap:"wrap",alignItems:"center"}}>
                      {[["full",T.details],["stats",T.statsTab]].map(([m,l])=>(
                        <button key={m} onClick={()=>setDetailMode(m)} style={{background:detailMode===m?C.accent:"transparent",border:`1px solid ${detailMode===m?C.accent:C.border}`,color:detailMode===m?"#fff":C.muted,padding:"5px 12px",borderRadius:16,fontSize:11,cursor:"pointer",fontWeight:detailMode===m?700:400}}>{l}</button>
                      ))}
                      {key===todayKey && (
                        <button onClick={()=>{onLoadDay(journal[key].entries);onClose();}} style={{marginRight:"auto",background:"transparent",border:`1px solid ${C.warn}`,color:C.warn,padding:"5px 12px",borderRadius:16,fontSize:11,cursor:"pointer"}}>{T.loadEdit}</button>
                      )}
                    </div>
                    {detailMode==="full" && (
                      <div style={{padding:"0 20px 12px"}}>
                        {journal[key].entries.map((e,i)=>(
                          <div key={i} style={{padding:"7px 0",borderBottom:"1px solid rgba(0,0,0,0.06)",display:"flex",justifyContent:"space-between"}}>
                            <span style={{fontSize:13,color:C.text}}>{e.label}</span>
                            <span style={{fontSize:12,color:C.muted}}>{Math.round(e.kcal)} {T.kcal} · {Number(e.carbs||0).toFixed(1)}g {T.carbs}</span>
                          </div>
                        ))}
                        {journal[key].bloodSugar&&(
                          <div style={{padding:"6px 0",borderBottom:"1px solid rgba(0,0,0,0.06)",display:"flex",justifyContent:"space-between"}}>
                            <span style={{fontSize:12,color:sugarColor(journal[key].bloodSugar)}}>{T.bloodSugarLabel}</span>
                            <span style={{fontSize:12,fontWeight:700,color:sugarColor(journal[key].bloodSugar)}}>{journal[key].bloodSugar} mg/dL</span>
                          </div>
                        )}
                        <div style={{marginTop:10,padding:"8px 0",borderTop:"1px solid rgba(90,158,30,0.27)",display:"flex",justifyContent:"space-between"}}>
                          <span style={{fontSize:12,fontWeight:700,color:C.accent}}>{T.total}</span>
                          <span style={{fontSize:12,color:C.accent}}>{Math.round(journal[key].totals.kcal)} {T.kcal} · {Number(journal[key].totals.carbs).toFixed(1)}g {T.carbs}</span>
                        </div>
                      </div>
                    )}
                    {detailMode==="stats" && (
                      <div style={{padding:"8px 20px 16px"}} className="g3">
                        {[{l:T.kcal,v:Math.round(journal[key].totals.kcal),c:C.accent},{l:T.carbsFull,v:Number(journal[key].totals.carbs).toFixed(1)+"g",c:C.warn},{l:T.protein,v:Number(journal[key].totals.protein).toFixed(1)+"g",c:C.blue}].map(({l,v,c})=>(
                          <div key={l} style={{background:"rgba(255,255,255,.68)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",borderRadius:12,padding:"10px 8px",textAlign:"center",border:"1px solid rgba(255,255,255,.8)"}}>
                            <div style={{fontSize:20,fontWeight:900,color:c}}>{v}</div>
                            <div style={{fontSize:10,color:C.muted,marginTop:3}}>{l}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {view==="week" && (
          <div style={{padding:20}}>
            {weekDays.length===0 && <div style={{textAlign:"center",color:C.muted,fontSize:13,padding:30}}>{T.noData}</div>}
            {weekDays.length>0 && <>
              <div style={{fontSize:11,color:C.muted,letterSpacing:1.5,marginBottom:10}}>{T.avgDaily}</div>
              <div className="g3" style={{marginBottom:12}}>
                {[{l:T.kcal,vFn:()=>Math.round(calcAvgMetric('kcal',metricRanges.kcal)),c:C.accent,m:"kcal"},{l:T.carbsFull,vFn:()=>calcAvgMetric('carbs',metricRanges.carbs).toFixed(1)+"g",c:C.warn,m:"carbs"},{l:T.protein,vFn:()=>calcAvgMetric('protein',metricRanges.protein).toFixed(1)+"g",c:C.blue,m:"protein"}].map(({l,vFn,c,m})=>{
                  const isActive=activeChart===m;
                  return(
                    <div key={l} onClick={()=>setActiveChart(isActive?null:m)}
                      style={{background:"rgba(255,255,255,.68)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",borderRadius:16,padding:"14px 10px",textAlign:"center",border:`${isActive?"2":"1"}px solid ${isActive?c:"rgba(255,255,255,.88)"}`,boxShadow:"0 3px 14px rgba(80,130,180,.08)",cursor:"pointer",transition:"border .15s"}}>
                      <div style={{fontSize:22,fontWeight:900,color:c}}>{vFn()}</div>
                      <div style={{fontSize:10,color:C.muted,marginTop:4}}>{l}</div>
                      <div style={{fontSize:8,color:isActive?c:"#cbd5e1",marginTop:3}}>{isActive?"▲":"▼"}</div>
                    </div>
                  );
                })}
              </div>
              {activeChart&&<MetricWeekChart key={activeChart} journal={journal} metric={activeChart} color={activeChart==="kcal"?C.accent:activeChart==="carbs"?C.warn:C.blue} label={activeChart==="kcal"?T.kcal:activeChart==="carbs"?T.carbsFull:T.protein} lang={lang} range={metricRanges[activeChart]} setRange={r=>setMR(activeChart,r)} goal={activeChart==="kcal"?profile?.maxKcal||1800:activeChart==="carbs"?profile?.maxCarbs||80:profile?.maxProtein||120} goalDir={activeChart==="protein"?"min":"max"}/>}
              <SugarWeekChart journal={journal} lang={lang}/>
              <div className="card">
                {weekDays.map((key,i)=>(
                  <div key={key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:i<weekDays.length-1?"1px solid #e0e0e5":"none"}}>
                    <div style={{fontSize:12,color:C.text}}>{getDateLabel(key)}</div>
                    <div style={{fontSize:11,color:C.muted}}>{Math.round(journal[key].totals.kcal)} {T.kcal} · {Number(journal[key].totals.carbs).toFixed(1)}g</div>
                  </div>
                ))}
                <div className="summary-row">
                  <span style={{fontSize:12,fontWeight:700,color:C.accent}}>{T.total} ({weekDays.length} {T.days})</span>
                  <span style={{fontSize:12,color:C.accent}}>{Math.round(wt.kcal)} {T.kcal} · {wt.carbs.toFixed(1)}g {T.carbs}</span>
                </div>
              </div>
            </>}
          </div>
        )}
      </div>
    </div>
  );
}
