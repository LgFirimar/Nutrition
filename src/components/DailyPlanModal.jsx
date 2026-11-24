import React, { useState, useEffect } from 'react';
import { loadJournal, ls } from '../lib/storage.js';
import { C } from '../lib/nutrition.js';
import { RecipeIdeaSheet } from './RecipeIdeaSheet.jsx';

export function DailyPlanModal({onClose, pid, lang, profile, onSaveRules}){
  const isHe=(lang||'he')!=='en';
  const [plan,setPlan]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [recipeTarget,setRecipeTarget]=useState(null);
  const [animErr,setAnimErr]=useState(false);
  const [showNotes,setShowNotes]=useState(false);
  const [newRulesText,setNewRulesText]=useState('');
  const [showPrevRules,setShowPrevRules]=useState(false);
  const [editRulesMode,setEditRulesMode]=useState(false);
  const [editedRules,setEditedRules]=useState([]);

  const buildHistory=()=>{
    const journal=loadJournal(pid);
    const days30=[];
    const today=new Date();
    for(let i=0;i<30;i++){
      const d=new Date(today);d.setDate(today.getDate()-i);
      const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      if(journal[k])days30.push(journal[k]);
    }
    const foodCounts={};
    let tKcal=0,tCarbs=0,tProtein=0,tFat=0;
    const sugarVals=[];
    days30.forEach(day=>{
      (day.entries||[]).forEach(e=>{
        const nm=(e.label||'').replace(/^[\u{1F300}-\u{1FFFF}☀-⟿\s]+/u,'').trim();
        if(nm)foodCounts[nm]=(foodCounts[nm]||0)+1;
      });
      tKcal+=day.totals?.kcal||0;tCarbs+=day.totals?.carbs||0;
      tProtein+=day.totals?.protein||0;tFat+=day.totals?.fat||0;
      if(day.bloodSugar)sugarVals.push(parseFloat(day.bloodSugar));
    });
    const n=days30.length||1;
    const topFoods=Object.entries(foodCounts).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([food,count])=>({food,count}));
    return{topFoods,avgKcal:Math.round(tKcal/n),avgCarbs:parseFloat((tCarbs/n).toFixed(1)),
      avgProtein:parseFloat((tProtein/n).toFixed(1)),avgFat:parseFloat((tFat/n).toFixed(1)),
      sugarAvg:sugarVals.length?Math.round(sugarVals.reduce((a,b)=>a+b,0)/sugarVals.length):null,
      sugarMin:sugarVals.length?Math.min(...sugarVals):null,sugarMax:sugarVals.length?Math.max(...sugarVals):null,
      days:days30.length};
  };

  const fetchPlan=async()=>{
    setLoading(true);setError(null);
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),28000);
    try{
      const history=buildHistory();
      const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({dailyPlan:{profile,history,lang}}),signal:ctrl.signal});
      const txt=await res.text();
      if(!res.ok){
        let detail='';try{detail=JSON.parse(txt).error||'';}catch(_){}
        throw new Error(detail||'server '+res.status);
      }
      const m=txt.match(/\{[\s\S]*\}/);
      if(!m)throw new Error("parse");
      const parsed=JSON.parse(m[0]);
      if(parsed.error)throw new Error(parsed.error);
      // Reconstruct full plan from compact worker response
      const prof=profile||{};
      const tK=prof.maxKcal||1800,tC=prof.maxCarbs||130,tP=prof.maxProtein||90;
      const tF=Math.round(tK*0.28/9);
      const dinnerMain=!!(prof.planRules&&/ערב.*(מרכז|עיקרי|פחמ|גדול|יותר|ראשי)|מרכז.*ערב|עיקר.*ערב|פחמ.*ערב|dinner.*(main|most|heavy|primary)/i.test(prof.planRules));
      const mK=dinnerMain?[Math.round(tK*.19),Math.round(tK*.07),Math.round(tK*.24),Math.round(tK*.08),Math.round(tK*.42)]:[Math.round(tK*.25),Math.round(tK*.08),Math.round(tK*.35),Math.round(tK*.08),Math.round(tK*.24)];
      const mC=dinnerMain?[Math.round(tC*.14),Math.round(tC*.07),Math.round(tC*.19),Math.round(tC*.07),Math.round(tC*.53)]:[Math.round(tC*.22),Math.round(tC*.09),Math.round(tC*.35),Math.round(tC*.09),Math.round(tC*.25)];
      const mP=dinnerMain?[Math.round(tP*.20),Math.round(tP*.08),Math.round(tP*.27),Math.round(tP*.08),Math.round(tP*.37)]:[Math.round(tP*.22),Math.round(tP*.09),Math.round(tP*.35),Math.round(tP*.09),Math.round(tP*.25)];
      const mFt=dinnerMain?[Math.round(tF*.20),Math.round(tF*.07),Math.round(tF*.25),Math.round(tF*.08),Math.round(tF*.40)]:[Math.round(tF*.22),Math.round(tF*.09),Math.round(tF*.35),Math.round(tF*.09),Math.round(tF*.25)];
      const META=isHe
        ?[{type:'breakfast',label:'ארוחת בוקר',time:'07:00-09:00'},{type:'morning_snack',label:'ביניים בוקר',time:'10:30'},{type:'lunch',label:'ארוחת צהריים',time:'12:30-14:00'},{type:'afternoon_snack',label:'ביניים',time:'16:00'},{type:'dinner',label:'ארוחת ערב',time:'19:00-20:30'}]
        :[{type:'breakfast',label:'Breakfast',time:'7:00-9:00'},{type:'morning_snack',label:'Morning Snack',time:'10:30'},{type:'lunch',label:'Lunch',time:'12:30-2:00'},{type:'afternoon_snack',label:'Afternoon Snack',time:'4:00-5:00'},{type:'dinner',label:'Dinner',time:'7:00-8:30'}];
      setPlan({
        meals:META.map((mt,i)=>({...mt,targetKcal:mK[i],targetCarbs:mC[i],targetProtein:mP[i],targetFat:mFt[i],ideas:(parsed.ideas||[])[i]||[],note:(parsed.notes||[])[i]||''})),
        insight:parsed.insight||'',totalKcal:tK,totalCarbs:tC,totalProtein:tP,totalFat:tF
      });
    }catch(e){
      const msg=e?.name==='AbortError'?(isHe?"פג זמן הטעינה. נסי שוב.":"Timed out. Try again."):e?.message||'';
      setError((isHe?"שגיאה בטעינה. ":"Error loading. ")+msg);
    }finally{clearTimeout(timer);setLoading(false);}
  };

  useEffect(()=>{fetchPlan();},[]);

  const mealIcon=t=>({breakfast:"🌅",morning_snack:"☕",lunch:"☀️",afternoon_snack:"🍵",dinner:"🌙"}[t]||"🍽");

  return(<>
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.55)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#f8fafc",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,maxHeight:"92vh",overflowY:"auto",padding:"20px 16px",boxShadow:"0 -8px 40px rgba(15,23,42,.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={{fontSize:17,fontWeight:900,color:C.text}}>{isHe?"תכנון יומי":"Daily Plan"}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{isHe?"המלצות מותאמות אישית על בסיס הפרופיל שלך":"Personalized recommendations based on your profile"}</div>
          </div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:"50%",background:"rgba(148,163,184,.18)",border:"none",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.muted}}>✕</button>
        </div>

        {loading&&(
          <div style={{textAlign:"center",padding:"32px 0"}}>
            {animErr
              ?<div style={{width:80,height:80,margin:"0 auto 8px",borderRadius:"50%",border:`6px solid rgba(13,148,136,.15)`,borderTop:`6px solid ${C.accent}`,animation:"spin 1s linear infinite"}}/>
              :<img src="/Nutrition/loader-plan.webp?v=5" alt="" onError={()=>setAnimErr(true)}
                  style={{width:160,height:160,objectFit:"contain",display:"block",margin:"0 auto 8px"}}/>}
            <div style={{fontSize:14,fontWeight:700,color:C.text}}>{isHe?"מכין תפריט יומי...":"Building your daily menu..."}</div>
          </div>
        )}

        {error&&!loading&&(
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:13,color:C.danger,marginBottom:12}}>{error}</div>
            <button onClick={fetchPlan} style={{background:C.accent,color:"#fff",border:"none",borderRadius:10,padding:"10px 24px",fontSize:13,fontWeight:700,cursor:"pointer"}}>{isHe?"נסה שוב":"Try Again"}</button>
          </div>
        )}

        {plan&&!loading&&(<>
          {plan.insight&&(
            <div style={{background:"linear-gradient(135deg,rgba(13,148,136,.08),rgba(20,184,166,.04))",border:"1px solid rgba(13,148,136,.18)",borderRadius:14,padding:"11px 13px",marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:C.accent,marginBottom:3}}>{isHe?"💡 תובנה":"💡 Insight"}</div>
              <div style={{fontSize:12.5,color:C.text,lineHeight:1.55}}>{plan.insight}</div>
            </div>
          )}
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            {[{lbl:isHe?"קק״ל":"kcal",val:plan.totalKcal,c:"#0d9488"},{lbl:isHe?"פחמ׳":"carbs",val:(plan.totalCarbs||0)+"g",c:"#f59e0b"},{lbl:isHe?"חלבון":"protein",val:(plan.totalProtein||0)+"g",c:"#6366f1"},{lbl:isHe?"שומן":"fat",val:(plan.totalFat||0)+"g",c:"#f97316"}].map(({lbl,val,c})=>(
              <div key={lbl} style={{flex:1,background:"rgba(255,255,255,.8)",borderRadius:10,padding:"7px 4px",textAlign:"center",border:"1px solid rgba(148,163,184,.18)"}}>
                <div style={{fontSize:12,fontWeight:800,color:c}}>{val}</div>
                <div style={{fontSize:9,color:C.muted,marginTop:1}}>{lbl}</div>
              </div>
            ))}
          </div>
          {(plan.meals||[]).map((meal,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,.88)",borderRadius:14,padding:12,marginBottom:8,border:"1px solid rgba(148,163,184,.15)",boxShadow:"0 1px 6px rgba(15,23,42,.05)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:20,lineHeight:1}}>{mealIcon(meal.type)}</span>
                  <div>
                    <div style={{fontSize:12.5,fontWeight:800,color:C.text}}>{meal.label}</div>
                    <div style={{fontSize:10,color:C.muted}}>{meal.time}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:3}}>
                  {[{v:meal.targetKcal,u:isHe?"קק״ל":"kcal",c:"#0d9488"},{v:meal.targetCarbs,u:"g פחמ׳",c:"#f59e0b"},{v:meal.targetProtein,u:"g חל׳",c:"#6366f1"}].map(({v,u,c},j)=>(
                    <div key={j} style={{background:"rgba(255,255,255,.9)",borderRadius:6,padding:"3px 5px",textAlign:"center",minWidth:30,border:`1px solid ${c}22`}}>
                      <div style={{fontSize:10,fontWeight:800,color:c}}>{v}</div>
                      <div style={{fontSize:8,color:C.muted}}>{u}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:0}}>
                {(meal.ideas||[]).map((idea,j)=>(
                  <div key={j} onClick={()=>setRecipeTarget({idea,meal})}
                    style={{display:"flex",alignItems:"center",gap:6,padding:"7px 0",borderBottom:j<meal.ideas.length-1?"1px solid rgba(148,163,184,.1)":"none",cursor:"pointer"}}>
                    <span style={{color:C.accent,fontSize:11,flexShrink:0}}>•</span>
                    <span style={{fontSize:12,color:"#1e293b",lineHeight:1.45,flex:1}}>{idea}</span>
                    <span style={{color:C.muted,fontSize:14,flexShrink:0}}>›</span>
                  </div>
                ))}
              </div>
              {meal.note&&<div style={{marginTop:7,fontSize:11,color:C.muted,fontStyle:"italic",borderTop:"1px solid rgba(148,163,184,.1)",paddingTop:6}}>💬 {meal.note}</div>}
            </div>
          ))}
          {(plan.substitutions||[]).length>0&&(
            <div style={{background:"rgba(255,255,255,.88)",borderRadius:14,padding:12,marginBottom:8,border:"1px solid rgba(245,158,11,.2)"}}>
              <div style={{fontSize:12,fontWeight:800,color:"#b45309",marginBottom:8}}>{isHe?"🔄 תחליפים מומלצים":"🔄 Recommended Substitutions"}</div>
              {plan.substitutions.map((s,i)=>(
                <div key={i} style={{padding:"6px 0",borderBottom:i<plan.substitutions.length-1?"1px solid rgba(148,163,184,.1)":"none"}}>
                  <div style={{fontSize:11.5,color:C.text}}><span style={{textDecoration:"line-through",color:C.muted}}>{s.original}</span> <span style={{color:C.accent}}>→</span> <span style={{fontWeight:700,color:C.accent}}>{s.suggested}</span></div>
                  {s.reason&&<div style={{fontSize:10.5,color:C.muted,marginTop:2,lineHeight:1.4}}>{s.reason}</div>}
                </div>
              ))}
            </div>
          )}
          <button onClick={fetchPlan} style={{width:"100%",background:"rgba(13,148,136,.08)",color:C.accent,border:"1px solid rgba(13,148,136,.22)",borderRadius:12,padding:"11px",fontSize:13,fontWeight:700,cursor:"pointer",marginTop:2,marginBottom:6}}>
            🔄 {isHe?"רענן תכנון":"Refresh Plan"}
          </button>
          <button onClick={()=>{setShowNotes(v=>!v);setEditRulesMode(false);setShowPrevRules(false);}} style={{width:"100%",background:showNotes?"rgba(37,99,235,.08)":"rgba(148,163,184,.08)",color:showNotes?C.blue:C.muted,border:`1px solid ${showNotes?"rgba(37,99,235,.22)":"rgba(148,163,184,.2)"}`,borderRadius:12,padding:"10px",fontSize:12.5,fontWeight:700,cursor:"pointer",marginBottom:8}}>
            📝 {isHe?"הערות לתכנון הבא":"Notes for Next Plan"}{profile?.planRules?` ✓`:''}
          </button>
          {showNotes&&(()=>{
            const freshProfiles=JSON.parse(localStorage.getItem('nutrition_profiles')||'[]');
            const freshRules=(freshProfiles.find(x=>x.id===pid)||{}).planRules||ls.get('nutrition_plan_rules_'+pid)||'';
            const savedLines=freshRules.split('\n').filter(l=>l.trim());
            return(
            <div style={{background:"rgba(37,99,235,.04)",border:"1px solid rgba(37,99,235,.15)",borderRadius:12,padding:12,marginBottom:10}}>
              {editRulesMode?(
                <>
                  <div style={{fontSize:12,fontWeight:700,color:"#334155",marginBottom:8,borderBottom:"1px solid rgba(15,23,42,.1)",paddingBottom:6}}>{isHe?"עריכת העדפות שמורות":"Edit saved preferences"}</div>
                  {editedRules.map((rule,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                      <input value={rule} onChange={e=>{const r=[...editedRules];r[i]=e.target.value;setEditedRules(r);}}
                        style={{flex:1,borderRadius:7,border:"1px solid rgba(37,99,235,.2)",padding:"7px 10px",fontSize:12,outline:"none",fontFamily:"inherit",direction:isHe?"rtl":"ltr",background:"rgba(255,255,255,.9)"}}/>
                      <button onClick={()=>setEditedRules(editedRules.filter((_,j)=>j!==i))}
                        style={{width:28,height:28,borderRadius:"50%",border:"none",background:"rgba(220,38,38,.08)",color:C.danger,fontSize:14,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                    </div>
                  ))}
                  <button onClick={()=>{const joined=editedRules.map(r=>r.trim()).filter(Boolean).join('\n');onSaveRules&&onSaveRules(joined);if(joined)ls.set('nutrition_plan_rules_'+pid,joined);setEditRulesMode(false);setShowNotes(false);setShowPrevRules(false);}}
                    style={{marginTop:4,width:"100%",background:C.blue,color:"#fff",border:"none",borderRadius:9,padding:"9px",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                    {isHe?"שמירה":"Save"}
                  </button>
                </>
              ):(
                <>
                  <textarea value={newRulesText} onChange={e=>setNewRulesText(e.target.value)}
                    placeholder={isHe?"הנחיות חדשות לתכנון...":"New instructions for the plan..."}
                    style={{width:"100%",minHeight:64,borderRadius:8,border:"1px solid rgba(37,99,235,.2)",padding:"8px 10px",fontSize:12,lineHeight:1.5,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit",direction:isHe?"rtl":"ltr",background:"rgba(255,255,255,.9)"}}/>
                  {savedLines.length>0&&(
                    <div style={{marginTop:8}}>
                      <button onClick={()=>setShowPrevRules(v=>!v)}
                        style={{width:"100%",background:"none",border:"none",textAlign:isHe?"right":"left",padding:"6px 2px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,borderBottom:"1px solid rgba(15,23,42,.12)",paddingBottom:6}}>
                        <span style={{fontSize:10,color:C.muted}}>{showPrevRules?"▼":"▶"}</span>
                        <span style={{fontSize:13,fontWeight:600,color:"#334155"}}>{isHe?"העדפות אישיות שמורות":"Saved preferences"}</span>
                      </button>
                      {showPrevRules&&(
                        <div style={{background:"rgba(148,163,184,.08)",borderRadius:8,padding:"8px 10px",marginTop:6,direction:isHe?"rtl":"ltr"}}>
                          {savedLines.map((line,i)=>(
                            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:i<savedLines.length-1?5:0}}>
                              <span style={{color:C.muted,fontSize:12,flexShrink:0,marginTop:1}}>•</span>
                              <span style={{fontSize:11.5,color:C.muted,lineHeight:1.5}}>{line.trim()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{display:"flex",gap:8,marginTop:8}}>
                    <button onClick={()=>{if(newRulesText.trim()){const combined=[freshRules,newRulesText.trim()].filter(Boolean).join('\n');onSaveRules&&onSaveRules(combined);if(combined)ls.set('nutrition_plan_rules_'+pid,combined);}setNewRulesText('');setShowNotes(false);setShowPrevRules(false);}}
                      style={{flex:1,background:C.blue,color:"#fff",border:"none",borderRadius:9,padding:"9px",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                      {isHe?"שמירה":"Save"}
                    </button>
                    {savedLines.length>0&&<button onClick={()=>{setEditedRules(savedLines);setEditRulesMode(true);setShowPrevRules(false);}}
                      style={{background:"rgba(37,99,235,.08)",color:C.blue,border:"1px solid rgba(37,99,235,.2)",borderRadius:9,padding:"9px 14px",fontSize:15,fontWeight:700,cursor:"pointer"}}>
                      ✏️
                    </button>}
                  </div>
                </>
              )}
            </div>
          );})()}
        </>)}
      </div>
    </div>
    {recipeTarget&&<RecipeIdeaSheet idea={recipeTarget.idea} meal={recipeTarget.meal} lang={lang} onClose={()=>setRecipeTarget(null)}/>}
  </>);
}