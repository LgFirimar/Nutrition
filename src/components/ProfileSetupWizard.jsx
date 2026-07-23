import React, { useState } from 'react';
import { loadProfiles, saveProfiles } from '../lib/storage.js';
import { C } from '../lib/nutrition.js';
import { CalcLoader } from './CalcLoader.jsx';
import { RecommendationsInfoModal } from './RecommendationsInfoModal.jsx';

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