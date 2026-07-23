import React, { useState, useRef, useEffect } from 'react';
import { loadProfiles, saveActiveProfileId, saveCustomBtns, saveCustomDB, saveFridgeLS, saveJournal, saveProfiles, saveQuickFoods } from '../lib/storage.js';
import { C } from '../lib/nutrition.js';
import { savePantryLS, saveShopping } from '../lib/household.js';
import { CalcLoader } from './Shared.jsx';
import { RecommendationsInfoModal } from './Backup.jsx';

// Profile creation wizard, setup screen, and profile switcher.

export function ProfileSetupWizard({profile,onSave,onSkip,lang,onToggleLang}){
  const isHe=(lang||'he')!=='en';
  const [step,setStep]=useState(0);
  const [age,setAge]=useState(profile?.age||"");
  const [gender,setGender]=useState(profile?.gender||"female");
  const [height,setHeight]=useState(profile?.height||"");
  const [weight,setWeight]=useState(profile?.weight||"");
  const [conditions,setConditions]=useState(profile?.conditions||[]);
  const [condText,setCondText]=useState(profile?.conditionText||"");
  const [dietPrefs,setDietPrefs]=useState(profile?.dietPrefs||[]);
  const [dietText,setDietText]=useState(profile?.dietText||"");
  const [activity,setActivity]=useState(profile?.activity||"moderate");
  const [activityText,setActivityText]=useState(profile?.activityText||"");
  const [goals,setGoals]=useState(profile?.goals||[]);
  const [goalText,setGoalText]=useState(profile?.goalText||"");
  const [loading,setLoading]=useState(false);
  const [recs,setRecs]=useState(null);
  const [editVals,setEditVals]=useState({kcal:1800,carbs:130,protein:90,fat:60});
  const [error,setError]=useState(null);
  const [showRecsInfo,setShowRecsInfo]=useState(false);

  const CONDS=[
    {id:"t2d",he:"סוכרת סוג 2",en:"Type 2 Diabetes"},{id:"t1d",he:"סוכרת סוג 1",en:"Type 1 Diabetes"},
    {id:"prediab",he:"טרום סכרת",en:"Pre-diabetes"},
    {id:"menopause",he:"גיל המעבר",en:"Menopause"},{id:"hyper",he:"יתר לחץ דם",en:"High Blood Pressure"},
    {id:"chol",he:"כולסטרול גבוה",en:"High Cholesterol"},{id:"meta",he:"תסמונת מטבולית",en:"Metabolic Syndrome"},
    {id:"kidney",he:"מחלת כליות",en:"Kidney Disease"},{id:"heart",he:"מחלת לב",en:"Heart Disease"},
  ];
  const DIETS=[
    {id:"veg",he:"צמחוני",en:"Vegetarian"},{id:"vegan",he:"טבעוני",en:"Vegan"},
    {id:"gf",he:"ללא גלוטן",en:"Gluten-Free"},{id:"lf",he:"ללא לקטוז",en:"Lactose-Free"},
    {id:"kosher",he:"כשר",en:"Kosher"},{id:"lowsodium",he:"דל נתרן",en:"Low Sodium"},
    {id:"keto",he:"קטוגני",en:"Keto"},
  ];
  const ACTIVITIES=[
    {id:"sedentary",he:"יושבני",en:"Sedentary",sub:isHe?"ללא פעילות גופנית":"No physical activity"},
    {id:"light",he:"קל",en:"Light",sub:isHe?"1-2 פעמים בשבוע":"1-2 times/week"},
    {id:"moderate",he:"מתון",en:"Moderate",sub:isHe?"3-4 פעמים בשבוע":"3-4 times/week"},
    {id:"active",he:"פעיל",en:"Active",sub:isHe?"5+ פעמים בשבוע":"5+ times/week"},
    {id:"very_active",he:"ספורטאי",en:"Athlete",sub:isHe?"אימונים יומיים אינטנסיביים":"Intense daily training"},
  ];
  const GOALS=[
    {id:"weight_loss",he:"ירידה במשקל",en:"Weight Loss"},{id:"maintain",he:"שמירה על משקל",en:"Maintain Weight"},
    {id:"gain",he:"עלייה במסת שריר",en:"Build Muscle"},{id:"sugar",he:"איזון סוכר בדם",en:"Blood Sugar Balance"},
    {id:"heart",he:"שיפור בריאות לב",en:"Heart Health"},{id:"energy",he:"שיפור אנרגיה",en:"Improve Energy"},
  ];

  const toggle=(arr,setArr,id)=>setArr(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);

  const askClaude=async()=>{
    setLoading(true);setError(null);
    try{
      const allConds=[...conditions,...(condText.trim()?[condText.trim()]:[])]
      const allDiets=[...dietPrefs,...(dietText.trim()?[dietText.trim()]:[])]
      const allGoals=[...goals,...(goalText.trim()?[goalText.trim()]:[])]
      const res=await fetch("https://nutrition-ai.lior0gal.workers.dev",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({profileData:{age,gender,height,weight,conditions:allConds,dietPrefs:allDiets,activity,activityText,goals:allGoals}})
      });
      if(!res.ok) throw new Error("שגיאת שרת");
      const d=await res.json();
      if(d.error) throw new Error(d.error);
      setRecs(d);
      setEditVals({kcal:d.kcal||1800,carbs:d.carbs||130,protein:d.protein||90,fat:d.fat||60});
      setStep(6);
    }catch(e){setError(e.message);setLoading(false);return;}
    setLoading(false);
  };

  const handleNext=()=>{
    if(step===4){setStep(5);askClaude();}
    else setStep(s=>s+1);
  };

  const handleSave=()=>{
    const updated={
      ...profile,
      maxKcal:parseInt(editVals.kcal)||profile.maxKcal||1800,
      maxCarbs:parseInt(editVals.carbs)||profile.maxCarbs||130,
      maxProtein:parseInt(editVals.protein)||profile.maxProtein||90,
      age:parseFloat(age)||undefined,gender,
      height:parseFloat(height)||undefined,weight:parseFloat(weight)||undefined,
      conditions,conditionText:condText,dietPrefs,dietText,activity,activityText,goals,goalText,
      recommendations:{explanation:recs?.explanation||"",sources:recs?.sources||[]}
    };
    const all=loadProfiles();
    saveProfiles(all.map(p=>p.id===updated.id?updated:p));
    onSave(updated);
  };

  const stepTitles=isHe?["📋 פרטים בסיסיים","🏥 בעיות רפואיות","🥗 העדפות תזונה","🏃 פעילות גופנית","🎯 יעדים"]:["📋 Basic Info","🏥 Medical","🥗 Diet Prefs","🏃 Activity","🎯 Goals"];
  const chipStyle=(active)=>({padding:"8px 14px",borderRadius:20,border:`1px solid ${active?C.accent:C.border}`,background:active?"rgba(90,158,30,0.1)":"#fff",color:active?C.accent:C.text,fontSize:12,fontWeight:active?700:400,cursor:"pointer"});

  return (
    <div style={{position:"fixed",inset:0,background:"#f5f5f7",zIndex:1000,display:"flex",flexDirection:"column",overflowY:"auto"}}>
      {/* Header */}
      <div style={{padding:"52px 20px 12px",background:"rgba(255,255,255,.95)",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:15,fontWeight:700,color:C.text}}>🎯 {isHe?"כוון יעדים תזונתיים":"Set Nutrition Goals"}</div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            {onToggleLang&&<button onClick={onToggleLang} style={{height:24,borderRadius:7,background:"rgba(255,255,255,.85)",border:"1px solid rgba(200,200,200,.6)",cursor:"pointer",fontSize:9,fontWeight:700,color:"#666",padding:"0 8px"}}>{isHe?'EN':'עב'}</button>}
            <button onClick={onSkip} style={{background:"none",border:"none",color:C.muted,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{isHe?"דלג ›":"Skip ›"}</button>
          </div>
        </div>
        {step<5&&(
          <div style={{display:"flex",gap:4}}>
            {stepTitles.map((_,i)=>(
              <div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=step?C.accent:"#e0e0e5",transition:"background .3s"}}/>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{flex:1,padding:20,overflowY:"auto"}}>
        {step===0&&(
          <div >
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:16}}>{stepTitles[0]}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              <div>
                <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:700}}>{isHe?"גיל":"Age"}</div>
                <input type="number" value={age} onChange={e=>setAge(e.target.value)} className="inp" placeholder="35"/>
              </div>
              <div>
                <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700}}>{isHe?"מין":"Gender"}</div>
                <div style={{display:"flex",gap:4}}>
                  {[{id:"female",he:"נקבה",en:"Female"},{id:"male",he:"זכר",en:"Male"},{id:"other",he:"אחר",en:"Other"}].map(g=>(
                    <button key={g.id} onClick={()=>setGender(g.id)} style={{flex:1,padding:"8px 2px",borderRadius:8,border:`1px solid ${gender===g.id?C.accent:C.border}`,background:gender===g.id?"rgba(90,158,30,0.08)":"#fff",fontSize:11,fontWeight:gender===g.id?700:400,color:gender===g.id?C.accent:C.muted,cursor:"pointer",fontFamily:"inherit"}}>{isHe?g.he:g.en}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div>
                <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:700}}>{isHe?"גובה (ס״מ)":"Height (cm)"}</div>
                <input type="number" value={height} onChange={e=>setHeight(e.target.value)} className="inp" placeholder="165"/>
              </div>
              <div>
                <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:700}}>{isHe?"משקל (ק״ג)":"Weight (kg)"}</div>
                <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} className="inp" placeholder="70"/>
              </div>
            </div>
          </div>
        )}
        {step===1&&(
          <div >
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>{stepTitles[1]}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:14}}>{isHe?"בחרי את כל מה שרלוונטי, או השאירי ריק":"Select all that apply, or leave empty"}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
              {CONDS.map(c=><button key={c.id} onClick={()=>toggle(conditions,setConditions,c.id)} style={chipStyle(conditions.includes(c.id))}>{isHe?c.he:c.en}</button>)}
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:700}}>{isHe?"מצב רפואי נוסף":"Other medical condition"}</div>
            <input value={condText} onChange={e=>setCondText(e.target.value)} className="inp" placeholder={isHe?"לדוגמה: תת פעילות בלוטת התריס":"e.g. hypothyroidism"}/>
          </div>
        )}
        {step===2&&(
          <div >
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>{stepTitles[2]}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:14}}>{isHe?"בחרי את ההעדפות שלך":"Select your preferences"}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
              {DIETS.map(d=><button key={d.id} onClick={()=>toggle(dietPrefs,setDietPrefs,d.id)} style={chipStyle(dietPrefs.includes(d.id))}>{isHe?d.he:d.en}</button>)}
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:700}}>{isHe?"העדפה נוספת":"Other preference"}</div>
            <input value={dietText} onChange={e=>setDietText(e.target.value)} className="inp" placeholder={isHe?"לדוגמה: אלרגיה לאגוזים":"e.g. nut allergy"}/>
          </div>
        )}
        {step===3&&(
          <div >
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:14}}>{stepTitles[3]}</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {ACTIVITIES.map(a=>(
                <button key={a.id} onClick={()=>setActivity(a.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,border:`2px solid ${activity===a.id?C.accent:C.border}`,background:activity===a.id?"rgba(90,158,30,0.07)":"#fff",textAlign:"right",cursor:"pointer",width:"100%",fontFamily:"inherit",transition:"border .2s"}}>
                  <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${activity===a.id?C.accent:C.border}`,background:activity===a.id?C.accent:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {activity===a.id&&<div style={{width:8,height:8,borderRadius:"50%",background:"#fff"}}/>}
                  </div>
                  <div style={{flex:1,textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:700,color:activity===a.id?C.accent:C.text}}>{isHe?a.he:a.en}</div>
                    <div style={{fontSize:11,color:C.muted}}>{a.sub}</div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:700,marginTop:14}}>{isHe?"רוצה לספר לי על זה? (פירוט פעילות - אופציונלי)":"Want to tell me more? (activity details - optional)"}</div>
            <input value={activityText} onChange={e=>setActivityText(e.target.value)} className="inp" placeholder={isHe?"סוג פעילות, משך ותדירות — לדוגמה: ריצה 40 דקות 3×/שבוע, אימוני כוח שעה 2×/שבוע":"type, duration & frequency — e.g. 40min run 3×/week, 1hr strength 2×/week"}/>
          </div>
        )}
        {step===4&&(
          <div >
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>{stepTitles[4]}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:14}}>{isHe?"מה חשוב לך להשיג?":"What would you like to achieve?"}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
              {GOALS.map(g=><button key={g.id} onClick={()=>toggle(goals,setGoals,g.id)} style={chipStyle(goals.includes(g.id))}>{isHe?g.he:g.en}</button>)}
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:700}}>{isHe?"יעד נוסף":"Other goal"}</div>
            <input value={goalText} onChange={e=>setGoalText(e.target.value)} className="inp" placeholder={isHe?"לדוגמה: הפחתת דלקות":"e.g. reduce inflammation"}/>
          </div>
        )}
        {step===5&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:280,gap:12}}>
            <CalcLoader size={80}/>
            <div style={{fontSize:15,fontWeight:700,color:C.text}}>{isHe?"Claude מנתח את הפרופיל שלך":"Claude is analyzing your profile"}</div>
            <div style={{fontSize:12,color:C.muted,textAlign:"center",lineHeight:1.7}}>
              {isHe?"בודק המלצות האיגודים הרפואיים...":"Checking medical guidelines..."}<br/>{isHe?"מחשב יעדים מותאמים אישית...":"Calculating personalized goals..."}
            </div>
            {error&&<div style={{background:"#fff0f0",border:`1px solid ${C.danger}`,borderRadius:10,padding:"12px 16px",fontSize:12,color:C.danger,textAlign:"center",width:"100%"}}>
              ⚠ {error}
              <br/><button onClick={()=>{setError(null);askClaude();}} style={{marginTop:8,background:C.danger,border:"none",borderRadius:6,color:"#fff",padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>{isHe?"נסה שוב":"Try again"}</button>
            </div>}
          </div>
        )}
        {step===6&&(
          <div >
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>{recs?(isHe?"✨ ההמלצות שלך":"✨ Your recommendations"):(isHe?"✏️ קבעי יעדים ידנית":"✏️ Set goals manually")}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:16}}>{isHe?"תוכלי לשנות את הערכים לפני השמירה":"You can adjust the values before saving"}</div>
            <div style={{background:"rgba(255,255,255,.9)",borderRadius:14,padding:"16px",marginBottom:10,boxShadow:"0 2px 10px rgba(0,0,0,.06)"}}>
              {[
                {label:isHe?"קלוריות יומיות":"Daily calories",key:"kcal",unit:"kcal",color:C.accent},
                {label:isHe?"פחמימות":"Carbs",key:"carbs",unit:"g",color:C.warn},
                {label:isHe?"חלבון":"Protein",key:"protein",unit:"g",color:C.blue},
                {label:isHe?"שומן":"Fat",key:"fat",unit:"g",color:"#94a3b8"},
              ].map(({label,key,unit,color})=>(
                <div key={key} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{fontSize:11,color:C.muted,width:100,flexShrink:0}}>{label}</div>
                  <input type="number" value={editVals[key]} onChange={e=>setEditVals(v=>({...v,[key]:e.target.value}))}
                    className="inp" style={{flex:1,fontWeight:700,fontSize:16,color,textAlign:"center",marginBottom:0,padding:"8px 4px"}}/>
                  <div style={{fontSize:11,color:C.muted,width:32,flexShrink:0}}>{unit}</div>
                </div>
              ))}
            </div>
            {recs&&<button onClick={()=>setShowRecsInfo(true)} style={{width:"100%",background:"none",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px",fontSize:12,color:C.muted,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontFamily:"inherit",marginBottom:4}}>
              ℹ {isHe?"על בסיס מה ניתנו ההמלצות?":"What are the recommendations based on?"}
            </button>}
            {showRecsInfo&&recs&&<RecommendationsInfoModal recs={recs} onClose={()=>setShowRecsInfo(false)}/>}
          </div>
        )}
      </div>

      {/* Footer */}
      {step!==5&&(
        <div style={{padding:"12px 20px 34px",background:"rgba(255,255,255,.97)",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
          {step===6?(
            <button onClick={handleSave} style={{width:"100%",background:C.accent,border:"none",borderRadius:12,color:"#fff",padding:"14px",fontSize:15,fontWeight:700,cursor:"pointer"}}>
              ✓ {isHe?"אשרי ושמרי יעדים":"Confirm & save goals"}
            </button>
          ):(
            <>
            <div style={{display:"flex",gap:8}}>
              {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,background:"none",border:`1px solid ${C.border}`,borderRadius:12,padding:"13px",fontSize:14,fontWeight:600,color:C.muted,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>{isHe?<><span>→</span><span>חזרה</span></>:"← Back"}</button>}
              <button onClick={handleNext} style={{flex:2,background:C.accent,border:"none",borderRadius:12,color:"#fff",padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                {step===4?(isHe?"קבלי המלצות מ-Claude 🔍 ←":"Get Claude's recommendations 🔍 →"):(isHe?"הבא ←":"Next →")}
              </button>
            </div>
            {step===4&&(
              <button onClick={()=>setStep(6)} style={{width:"100%",marginTop:8,background:"none",border:"none",color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",padding:"6px"}}>
                ✏️ {isHe?"קבע ידנית במקום":"Set manually instead"}
              </button>
            )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

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
