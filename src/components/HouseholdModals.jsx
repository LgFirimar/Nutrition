import React, { useState, useRef, useEffect } from 'react';
import { _fbInit, autoSetupHousehold, fbReset, fbState } from '../lib/household.js';
import { ls } from '../lib/storage.js';
import { C } from '../lib/nutrition.js';

// Household (shared family) welcome + settings modal — UI for src/lib/household.js.

export function HouseholdWelcome({householdName,cfg,onDone,lang}){
  const isHe=(lang||'he')!=='en';
  return(
    <div style={{position:'fixed',top:0,right:0,bottom:0,left:0,zIndex:9999,background:'linear-gradient(150deg,#edfad5 0%,#bde890 52%,#92d045 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
      {/* bg circles */}
      <div style={{position:'absolute',top:-100,right:-100,width:320,height:320,borderRadius:'50%',background:'rgba(255,255,255,.18)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:-80,left:-80,width:280,height:280,borderRadius:'50%',background:'rgba(255,255,255,.13)',pointerEvents:'none'}}/>
      {/* content */}
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <div style={{fontSize:48,fontWeight:900,color:'#1e4a06',animation:'welcomeUp 0.5s ease 0.1s both',marginBottom:4,letterSpacing:'-0.5px',textShadow:'0 2px 12px rgba(255,255,255,.6)'}}>
          {isHe?'ברוכים הבאים!':'Welcome!'}
        </div>
        <div style={{position:'relative',width:260,height:260,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 0 -8px'}}>
          {[0,.8,1.6].map((d,i)=>(
            <div key={i} style={{position:'absolute',width:220,height:220,borderRadius:'50%',border:'2px solid rgba(90,158,30,.28)',animation:`ringOut 2.4s ${d}s ease-out infinite`,pointerEvents:'none'}}/>
          ))}
          <div style={{animation:'avoBounceIn 0.9s cubic-bezier(0.34,1.56,0.64,1) both',position:'relative',zIndex:2}}>
            <div style={{animation:'avoBob 3.2s ease-in-out 1s infinite',filter:'drop-shadow(0 10px 28px rgba(80,160,10,.4))'}}>
              <div style={{width:240,height:240,borderRadius:'50%',background:'#c8e89a',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <video src="/Nutrition/avo-cart.mp4" autoPlay loop muted playsInline
                  style={{width:260,height:260,objectFit:'contain',mixBlendMode:'multiply',display:'block'}}/>
              </div>
            </div>
          </div>
        </div>
        <div style={{fontSize:26,fontWeight:900,color:'#1e4a06',letterSpacing:'-0.5px',textShadow:'0 2px 10px rgba(255,255,255,.6)',animation:'welcomeUp 0.6s ease 0.8s both',textAlign:'center',padding:'0 20px',marginBottom:10}}>
          {isHe?`בית ${householdName}`:householdName}
        </div>
        <div style={{fontSize:13,color:'#4a7a10',animation:'welcomeUp 0.5s ease 1.2s both',display:'flex',alignItems:'center',gap:8}}>
          <span style={{width:8,height:8,borderRadius:'50%',background:'#5a9e1e',boxShadow:'0 0 8px rgba(90,158,30,.6)',display:'inline-block',animation:'glowPulse 1.4s ease-in-out infinite'}}/>
          {isHe?'משק הבית שלכם מוכן!':'Your household is ready!'}
        </div>
      </div>
      {/* bottom button */}
      <div style={{width:'100%',padding:'0 24px',paddingBottom:'calc(32px + env(safe-area-inset-bottom))',flexShrink:0}}>
        <button onClick={()=>onDone(cfg)} style={{width:'100%',background:'linear-gradient(135deg,#5a9e1e,#3d7a0a)',border:'none',borderRadius:16,color:'#fff',padding:'16px',fontSize:17,fontWeight:800,cursor:'pointer',fontFamily:'inherit',letterSpacing:0.3,boxShadow:'0 4px 20px rgba(30,74,6,.35)'}}>
          {isHe?'מתחילים':'Let\'s go'}
        </button>
      </div>
    </div>
  );
}

export function HouseholdModal({householdCfg,onConnect,onHouseholdReady,onLeave,onClose,onWelcome,lang}){
  const isHe=(lang||'he')!=='en';
  const connected=!!householdCfg;
  const[tab,setTab]=useState(connected?'connected':'create');
  const[memberName,setMemberName]=useState(householdCfg?.memberName||'');
  const[householdName,setHouseholdName]=useState(householdCfg?.householdName||'');
  const[configText,setConfigText]=useState('');
  const[joinCode,setJoinCode]=useState('');
  const[createStep,setCreateStep]=useState(1);
  const[showScreenshot,setShowScreenshot]=useState(null);
  const[projectIdInput,setProjectIdInput]=useState('');
  const[autoProgress,setAutoProgress]=useState(null);
  const[autoError,setAutoError]=useState('');
  const[useManual,setUseManual]=useState(false);
  const autoSuccessCfgRef=useRef(null);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState('');
  const[copied,setCopied]=useState(false);
  const[members,setMembers]=useState({});
  const[confirmLeave,setConfirmLeave]=useState(false);
  const[showQR,setShowQR]=useState(false);
  const[qrSvg,setQrSvg]=useState('');
  const[syncLabel,setSyncLabel]=useState('');

  useEffect(()=>{
    if(!householdCfg||!fbState.db||!fbState.onValue||!fbState.refFn)return;
    const unsub=fbState.onValue(fbState.refFn(fbState.db,`households/${fbState.householdId}/members`),snap=>{
      setMembers(snap.val()||{});
    });
    return()=>unsub();
  },[householdCfg]);

  // Last sync label — updates every 15s
  useEffect(()=>{
    if(!householdCfg)return;
    const update=()=>{
      if(!fbState.lastSyncAt){setSyncLabel('');return;}
      const s=Math.round((Date.now()-fbState.lastSyncAt)/1000);
      if(s<60)setSyncLabel(isHe?`סונכרן לפני ${s} שניות`:`Synced ${s}s ago`);
      else setSyncLabel(isHe?`סונכרן לפני ${Math.round(s/60)} דקות`:`Synced ${Math.round(s/60)}m ago`);
    };
    update();
    const id=setInterval(update,15000);
    return()=>clearInterval(id);
  },[householdCfg,isHe]);

  const genId=()=>{
    const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({length:8},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
  };

  const getDeviceId=()=>{
    let id=ls.get('nutrition_device_id');
    if(!id){id=Date.now().toString(36)+Math.random().toString(36).slice(2);ls.set('nutrition_device_id',id);}
    return id;
  };

  const registerMember=async(hid,name)=>{
    if(!fbState.db)return;
    const did=getDeviceId();
    await fbState.set(fbState.refFn(fbState.db,`households/${hid}/members/${did}`),{name,joinedAt:Date.now()}).catch(()=>{});
  };

  const parseConfig=text=>{
    // Normalize JS object literal → JSON (handle unquoted keys and single quotes)
    let s=text.trim();
    if(!s.startsWith('{'))s='{'+s;
    if(!s.endsWith('}'))s=s+'}';
    s=s.replace(/([{,]\s*)([a-zA-Z_]\w*)\s*:/g,'$1"$2":').replace(/'/g,'"');
    return JSON.parse(s);
  };

  const handleCreate=async()=>{
    if(!memberName.trim()){setError(isHe?'נא להזין שם':'Please enter your name');return;}
    let cfg;
    try{cfg=parseConfig(configText);}catch{setError(isHe?'הגדרות Firebase לא תקינות':'Invalid Firebase config');return;}
    if(!cfg.apiKey||!cfg.databaseURL){setError(isHe?'חסרים שדות: apiKey ו-databaseURL':'Missing: apiKey and databaseURL');return;}
    setLoading(true);setError('');
    const hid=genId();
    const newCfg={firebaseConfig:cfg,householdId:hid,memberName:memberName.trim(),householdName:householdName.trim()||memberName.trim()};
    const ok=await _fbInit(newCfg);
    if(!ok){setError(isHe?'שגיאה בחיבור ל-Firebase':'Firebase connection error');setLoading(false);return;}
    registerMember(hid,memberName.trim()).catch(()=>{});
    ls.set('nutrition_household',newCfg);
    const sc=btoa(unescape(encodeURIComponent(JSON.stringify({firebaseConfig:cfg,householdId:hid,householdName:newCfg.householdName}))));
    onWelcome?.({householdName:newCfg.householdName,sharingCode:sc,cfg:newCfg});
    setLoading(false);
  };

  const AUTO_STEPS=[
    {key:'auth',   he:'מתחבר לחשבון Google',      en:'Signing into Google'},
    {key:'project',he:'מאמת פרויקט Firebase',      en:'Verifying Firebase project'},
    {key:'database',he:'יוצר Realtime Database',   en:'Creating Realtime Database'},
    {key:'webapp', he:'יוצר Web App',              en:'Creating Web App'},
    {key:'config', he:'מקבל הגדרות Firebase',      en:'Getting Firebase config'},
  ];

  const handleAutoSetup=async()=>{
    if(!memberName.trim()){setError(isHe?'נא להזין שם':'Enter your name');return;}
    if(!projectIdInput.trim()){setError(isHe?'נא להזין Project ID':'Enter Project ID');return;}
    setError('');setAutoError('');
    const completed=[];
    setAutoProgress({current:'auth',completed});
    try{
      const cfg=await autoSetupHousehold(projectIdInput.trim(),(step)=>{
        completed.push(step==='auth'?null:AUTO_STEPS[AUTO_STEPS.findIndex(s=>s.key===step)-1]?.key);
        setAutoProgress({current:step,completed:[...completed].filter(Boolean)});
      });
      const hid=genId();
      const newCfg={firebaseConfig:cfg,householdId:hid,memberName:memberName.trim(),householdName:householdName.trim()||memberName.trim()};
      ls.set('nutrition_household',newCfg);
      autoSuccessCfgRef.current=newCfg;
      const sc=btoa(unescape(encodeURIComponent(JSON.stringify({firebaseConfig:cfg,householdId:hid,householdName:newCfg.householdName}))));
      setAutoProgress(null);
      onWelcome?.({householdName:newCfg.householdName,sharingCode:sc,cfg:newCfg});
      // Init Firebase + register member in background (non-blocking)
      _fbInit(newCfg).then(ok=>{if(ok)registerMember(hid,memberName.trim());}).catch(()=>{});
    }catch(e){
      setAutoError(e.message||(isHe?'שגיאה בהגדרה האוטומטית':'Auto setup failed'));
      setAutoProgress(null);
    }
  };

  const handleJoin=async()=>{
    if(!memberName.trim()){setError(isHe?'נא להזין שם':'Please enter your name');return;}
    if(!joinCode.trim()){setError(isHe?'נא להזין קוד הצטרפות':'Please enter join code');return;}
    let decoded;
    const rawCode=joinCode.trim().replace(/\s/g,'');
    try{
      try{decoded=JSON.parse(decodeURIComponent(escape(atob(rawCode))));}
      catch{decoded=JSON.parse(decodeURIComponent(atob(rawCode).split('').map(c=>'%'+c.charCodeAt(0).toString(16).padStart(2,'0')).join('')));}
    }catch{setError(isHe?'קוד הצטרפות לא תקין':'Invalid join code');return;}
    setLoading(true);setError('');
    try{
      const newCfg={...decoded,memberName:memberName.trim()};
      const ok=await _fbInit(newCfg);
      if(!ok){setError(isHe?'שגיאה בחיבור':'Connection error');setLoading(false);return;}
      registerMember(newCfg.householdId,memberName.trim()).catch(()=>{});
      ls.set('nutrition_household',newCfg);
      autoSuccessCfgRef.current=newCfg;
      const sc=btoa(unescape(encodeURIComponent(JSON.stringify({firebaseConfig:decoded.firebaseConfig,householdId:decoded.householdId,householdName:decoded.householdName}))));
      onWelcome?.({householdName:decoded.householdName||memberName.trim(),sharingCode:sc,cfg:newCfg});
    }catch(e){
      setError(isHe?'שגיאה בהצטרפות':'Join failed');
    }finally{
      setLoading(false);
    }
  };

  const getSharingCode=()=>{
    if(!householdCfg)return'';
    const{memberName:_mn,...shareData}=householdCfg;
    return btoa(unescape(encodeURIComponent(JSON.stringify(shareData))));
  };

  const copyCode=()=>{
    navigator.clipboard.writeText(getSharingCode()).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}).catch(()=>{});
  };

  const handleLeave=()=>{
    if(!confirmLeave){setConfirmLeave(true);setTimeout(()=>setConfirmLeave(false),3000);return;}
    ls.set('nutrition_household',null);
    fbReset();
    onLeave();
  };

  const handleShowQR=async()=>{
    if(showQR){setShowQR(false);return;}
    try{
      const mod=await import('qrcode-svg');
      const QRCodeSVG=mod.default||mod;
      const svg=new QRCodeSVG({content:getSharingCode(),container:'svg-viewbox',width:200,height:200,color:'#0d9488',background:'#fff'}).svg();
      setQrSvg(svg);setShowQR(true);
    }catch(e){console.error(e);}
  };

  const btnStyle={flex:1,padding:"8px 0",fontSize:12,fontWeight:700,borderRadius:8,cursor:"pointer",border:"none",transition:"all .2s"};
  const inputStyle={width:"100%",boxSizing:"border-box",padding:"9px 10px",borderRadius:10,border:"1px solid rgba(148,163,184,.3)",fontSize:12,fontFamily:"inherit",background:"rgba(255,255,255,.8)",marginBottom:8};

  return(
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide" style={{maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:22}}>👥</span>
            {isHe?"משק בית משותף":"Shared Household"}
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#94a3b8"}}>×</button>
        </div>

        {!connected?(
          <>
            {/* Tabs */}
            <div style={{display:"flex",gap:6,marginBottom:16,background:"rgba(148,163,184,.1)",borderRadius:10,padding:4}}>
              {['create','join'].map(t=>(
                <button key={t} onClick={()=>{setTab(t);setError('');}}
                  style={{...btnStyle,flex:1,background:tab===t?"#fff":"transparent",color:tab===t?"#0d9488":"#94a3b8",boxShadow:tab===t?"0 1px 4px rgba(0,0,0,.08)":"none"}}>
                  {t==='create'?(isHe?'צור משק בית':'Create'):(isHe?'הצטרף':'Join')}
                </button>
              ))}
            </div>

            {tab==='create'?(()=>{
              const linkBtn={width:"100%",background:"rgba(13,148,136,.06)",border:"1px solid rgba(13,148,136,.2)",borderRadius:8,color:"#0d9488",padding:"9px 12px",fontSize:12,fontWeight:700,cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontFamily:"inherit"};
              const infoBtn={background:"rgba(13,148,136,.08)",border:"1px solid rgba(13,148,136,.2)",borderRadius:"50%",width:20,height:20,fontSize:11,color:"#0d9488",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit",flexShrink:0};
              const backBtn={...btnStyle,flex:1,background:"rgba(148,163,184,.1)",color:"#64748b",border:"1px solid rgba(148,163,184,.2)",padding:"9px"};
              const nextBtn={...btnStyle,flex:3,background:"linear-gradient(135deg,#14b8a6,#059669)",color:"#fff",padding:"9px"};
              return(<>
                {/* Progress bar */}
                <div style={{display:"flex",gap:4,marginBottom:14}}>
                  {[1,2].map(s=><div key={s} style={{flex:1,height:3,borderRadius:2,background:createStep>=s?"#0d9488":"rgba(148,163,184,.2)"}}/>)}
                </div>

                {/* Step 1: Create project */}
                {createStep===1&&<div className="fade">
                  <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>{isHe?"שלב 1 — צרו פרויקט Firebase":"Step 1 — Create a Firebase project"}</div>
                  <button onClick={()=>window.open('https://console.firebase.google.com','_blank')} style={linkBtn}>
                    🔗 {isHe?"פתחו את Firebase Console":"Open Firebase Console"}
                  </button>
                  <ol style={{fontSize:12,color:"#475569",lineHeight:2.2,margin:"4px 0 10px",paddingRight:18,paddingLeft:0}}>
                    <li>{isHe?'לחצו "Add project"':'Click "Add project"'}</li>
                    <li>{isHe?"תנו שם כלשהו לפרויקט":"Give your project any name"}</li>
                    <li>{isHe?"לחצו Continue עד הסוף":"Click Continue until done"}</li>
                  </ol>
                  <div style={{background:"rgba(13,148,136,.06)",border:"1px solid rgba(13,148,136,.2)",borderRadius:8,padding:"8px 12px",fontSize:11,color:"#0d9488",marginBottom:14}}>
                    📝 {isHe?"זכרו את ה-Project ID (למשל: my-project-abc123) — תצטרכו אותו בשלב הבא":"Remember your Project ID (e.g. my-project-abc123) — you'll need it in the next step"}
                  </div>
                  <button onClick={()=>setCreateStep(2)} style={{...nextBtn,flex:"unset",width:"100%",padding:"10px"}}>
                    {isHe?"✓ יצרתי פרויקט →":"✓ I created a project →"}
                  </button>
                </div>}

                {/* Step 2: Auto Setup */}
                {createStep===2&&<div className="fade">
                  <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>
                    {isHe?"שלב 2 — הגדרה אוטומטית":"Step 2 — Auto Setup"}
                  </div>

                  {!autoProgress&&!useManual&&<>
                    <input value={memberName} onChange={e=>setMemberName(e.target.value)}
                      placeholder={isHe?"השם שלך (יוצג בעגלה)":"Your name (shown in cart)"} style={inputStyle}/>
                    <input value={householdName} onChange={e=>setHouseholdName(e.target.value)}
                      placeholder={isHe?"שם משק הבית (למשל: משפחת לוי)":"Household name"} style={inputStyle}/>
                    <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>
                      {isHe?"Project ID של הפרויקט שיצרתם:":"Project ID of your Firebase project:"}
                    </div>
                    <input value={projectIdInput} onChange={e=>setProjectIdInput(e.target.value)}
                      placeholder="my-project-abc123"
                      style={{...inputStyle,fontFamily:"monospace",direction:"ltr",textAlign:"left"}}/>
                    <div style={{fontSize:10,color:C.muted,marginBottom:10}}>
                      {isHe?"נמצא ב-Firebase Console ← שם הפרויקט ← Project settings":"Found in Firebase Console → your project → Project settings"}
                    </div>
                    {error&&<div style={{color:"#dc2626",fontSize:11,marginBottom:8}}>{error}</div>}
                    <div style={{display:"flex",gap:8,marginBottom:8}}>
                      <button onClick={()=>setCreateStep(1)} style={backBtn}>←</button>
                      <button onClick={handleAutoSetup} style={{...nextBtn,background:"linear-gradient(135deg,#4f46e5,#0d9488)"}}>
                        🚀 {isHe?"Sign in with Google & הגדר":"Sign in with Google & Setup"}
                      </button>
                    </div>
                    <button onClick={()=>setUseManual(true)} style={{background:"none",border:"none",fontSize:11,color:C.muted,cursor:"pointer",textDecoration:"underline",width:"100%",textAlign:"center"}}>
                      {isHe?"הגדרה ידנית במקום":"Manual setup instead"}
                    </button>
                  </>}

                  {/* Auto progress display */}
                  {autoProgress&&<div style={{display:"flex",flexDirection:"column",gap:10,padding:"8px 0"}}>
                    {AUTO_STEPS.map(({key,he,en})=>{
                      const done=autoProgress.completed?.includes(key);
                      const active=autoProgress.current===key;
                      return(
                        <div key={key} style={{display:"flex",alignItems:"center",gap:10,opacity:(!done&&!active)?.4:1}}>
                          <span style={{width:22,height:22,borderRadius:"50%",background:done?"#0d9488":active?"rgba(13,148,136,.15)":"rgba(148,163,184,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>
                            {done?"✓":active?<span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⟳</span>:"○"}
                          </span>
                          <span style={{fontSize:12,color:done?C.accent:active?C.text:C.muted,fontWeight:done||active?600:400}}>{isHe?he:en}</span>
                        </div>
                      );
                    })}
                    {autoProgress.current===null&&<div style={{marginTop:6,fontSize:13,fontWeight:700,color:C.accent}}>✅ {isHe?"הכל מוכן!":"All done!"}</div>}
                  </div>}

                  {autoError&&<>
                    <div style={{color:"#dc2626",fontSize:11,background:"rgba(220,38,38,.06)",borderRadius:8,padding:"8px 10px",marginBottom:10}}>{autoError}</div>
                    <button onClick={()=>{setAutoError('');setAutoProgress(null);}} style={{...backBtn,width:"100%",marginBottom:6}}>{isHe?"נסה שוב":"Try again"}</button>
                    <button onClick={()=>setUseManual(true)} style={{background:"none",border:"none",fontSize:11,color:C.muted,cursor:"pointer",textDecoration:"underline",width:"100%",textAlign:"center"}}>{isHe?"הגדרה ידנית במקום":"Switch to manual setup"}</button>
                  </>}

                  {/* Welcome screen after successful setup */}

                  {/* Manual fallback */}
                  {useManual&&<>
                    <div style={{fontSize:11,color:C.muted,marginBottom:8,background:"rgba(13,148,136,.04)",borderRadius:8,padding:"8px 10px"}}>
                      {isHe?"הגדרה ידנית: עקבו אחרי השלבים ב-Firebase Console והדביקו את הconfig למטה":"Manual setup: follow the steps in Firebase Console and paste the config below"}
                    </div>
                    <input value={memberName} onChange={e=>setMemberName(e.target.value)} placeholder={isHe?"השם שלך":"Your name"} style={inputStyle}/>
                    <input value={householdName} onChange={e=>setHouseholdName(e.target.value)} placeholder={isHe?"שם משק הבית":"Household name"} style={inputStyle}/>
                    <div style={{fontFamily:"monospace",fontSize:11,color:"#64748b",background:"#f5f5f7",borderRadius:"8px 8px 0 0",padding:"6px 10px",border:"1px solid rgba(148,163,184,.25)",borderBottom:"none"}}>const firebaseConfig = {'{'}</div>
                    <textarea value={configText} onChange={e=>setConfigText(e.target.value)}
                      placeholder={"  apiKey: \"AIza...\",\n  authDomain: \"...\",\n  databaseURL: \"https://...\",\n  projectId: \"...\",\n  storageBucket: \"...\",\n  messagingSenderId: \"...\",\n  appId: \"...\""}
                      style={{...inputStyle,height:100,resize:"vertical",fontFamily:"monospace",fontSize:11,borderRadius:0,borderTop:"none",borderBottom:"none",marginBottom:0}}/>
                    <div style={{fontFamily:"monospace",fontSize:11,color:"#64748b",background:"#f5f5f7",borderRadius:"0 0 8px 8px",padding:"6px 10px",border:"1px solid rgba(148,163,184,.25)",borderTop:"none",marginBottom:4}}>{'};'}</div>
                    <div style={{fontSize:10,color:C.muted,marginBottom:8}}>{isHe?"העתיקו רק את השורות שבפנים — ללא { }":"Copy only inner lines — without { }"}</div>
                    {error&&<div style={{color:"#dc2626",fontSize:11,marginBottom:8}}>{error}</div>}
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>setUseManual(false)} style={backBtn}>←</button>
                      <button onClick={handleCreate} disabled={loading} style={nextBtn}>
                        {loading?(isHe?"מתחבר...":"Connecting..."):(isHe?"צור משק בית":"Create Household")}
                      </button>
                    </div>
                  </>}
                </div>}

                {/* Screenshot overlay */}
                {showScreenshot&&<div onClick={()=>setShowScreenshot(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
                  <div style={{position:"relative",maxWidth:300,width:"100%"}}>
                    <img src={showScreenshot==='step1'?"/Nutrition/fb-step1.png":"/Nutrition/fb-step2.png"} style={{width:"100%",borderRadius:12,display:"block"}} alt=""/>
                    {showScreenshot==='step1'&&<>
                      {/* White cover over "Lior" */}
                      <div style={{position:"absolute",background:"white",top:"37%",left:"44%",width:"30%",height:"7%",borderRadius:2}}/>
                      {/* Cover pink arrow + replace with teal styled arrow */}
                      <div style={{position:"absolute",background:"white",top:"11%",left:"5%",width:"48%",height:"9%"}}/>
                      <svg style={{position:"absolute",top:"11%",left:"5%",width:"48%",height:"9%"}} viewBox="0 0 110 24" fill="none">
                        <defs><marker id="a1" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto"><polygon points="8 0,0 3,8 6" fill="#0d9488"/></marker></defs>
                        <path d="M 100 12 C 80 5, 55 18, 15 12" stroke="#0d9488" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#a1)"/>
                      </svg>
                    </>}
                    {showScreenshot==='step2'&&<>
                      {/* Arrow pointing to Realtime Database from right */}
                      <svg style={{position:"absolute",top:"53%",right:"3%",width:"28%",height:"7%"}} viewBox="0 0 80 20" fill="none">
                        <defs><marker id="a2" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto"><polygon points="8 0,0 3,8 6" fill="#0d9488"/></marker></defs>
                        <path d="M 75 10 L 10 10" stroke="#0d9488" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#a2)"/>
                      </svg>
                    </>}
                    <div style={{textAlign:"center",color:"rgba(255,255,255,.7)",fontSize:11,marginTop:10}}>{isHe?"לחצו לסגירה":"Tap to close"}</div>
                  </div>
                </div>}
              </>);
            })():(
              <>
                <input value={memberName} onChange={e=>setMemberName(e.target.value)}
                  placeholder={isHe?"השם שלך (יוצג בעגלה)":"Your name (shown in cart)"}
                  style={inputStyle}/>
                <textarea value={joinCode} onChange={e=>setJoinCode(e.target.value)}
                  placeholder={isHe?"הדבק כאן את קוד ההצטרפות":"Paste the join code here"}
                  style={{...inputStyle,height:80,resize:"vertical",fontFamily:"monospace",fontSize:11}}/>
                {error&&<div style={{color:"#dc2626",fontSize:11,marginBottom:8}}>{error}</div>}
                <button onClick={handleJoin} disabled={loading}
                  style={{...btnStyle,width:"100%",background:"linear-gradient(135deg,#14b8a6,#059669)",color:"#fff",padding:"10px"}}>
                  {loading?(isHe?"מתחבר...":"Connecting..."):(isHe?"הצטרף למשק בית":"Join Household")}
                </button>
              </>
            )}
          </>
        ):(
          <>
            {/* Sharing code box */}
            <div style={{background:"rgba(13,148,136,.06)",borderRadius:12,padding:"12px 14px",marginBottom:14,border:"1px solid rgba(13,148,136,.15)"}}>
              <div style={{fontSize:11,color:"#64748b",marginBottom:8}}>{isHe?"קוד הצטרפות לשיתוף:":"Join code to share:"}</div>
              {householdCfg?.householdName&&<div style={{fontSize:13,fontWeight:700,color:"#0d9488",marginBottom:6}}>🏠 {householdCfg.householdName}</div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                <button onClick={copyCode}
                  style={{...btnStyle,background:copied?"rgba(13,148,136,.12)":"rgba(255,255,255,.9)",color:copied?"#0d9488":"#475569",border:"1px solid rgba(148,163,184,.3)",padding:"7px 8px",fontSize:11}}>
                  {copied?(isHe?"✓ הועתק!":"✓ Copied!"):(isHe?"📋 העתק קוד":"📋 Copy code")}
                </button>
                <button onClick={handleShowQR}
                  style={{...btnStyle,background:showQR?"rgba(13,148,136,.12)":"rgba(255,255,255,.9)",color:showQR?"#0d9488":"#475569",border:"1px solid rgba(148,163,184,.3)",padding:"7px 8px",fontSize:11}}>
                  {isHe?(showQR?"✕ סגור QR":"📷 QR"):(showQR?"✕ Close":"📷 QR")}
                </button>
                <button onClick={()=>{const msg=encodeURIComponent((isHe?"קוד הצטרפות למשק הבית":"Household join code")+": "+getSharingCode());window.open(`https://wa.me/?text=${msg}`,'_blank');}}
                  style={{...btnStyle,background:"rgba(37,211,102,.1)",color:"#128c7e",border:"1px solid rgba(37,211,102,.3)",padding:"7px 8px",fontSize:11}}>
                  💬 WhatsApp
                </button>
                <button onClick={()=>{const sub=encodeURIComponent(isHe?"הצטרפות למשק הבית":"Join Household");const body=encodeURIComponent((isHe?"קוד ההצטרפות שלך:":"Your join code:")+"\n\n"+getSharingCode());window.open(`mailto:?subject=${sub}&body=${body}`,'_blank');}}
                  style={{...btnStyle,background:"rgba(59,130,246,.08)",color:"#2563eb",border:"1px solid rgba(59,130,246,.2)",padding:"7px 8px",fontSize:11}}>
                  ✉️ {isHe?"מייל":"Email"}
                </button>
              </div>
              {showQR&&qrSvg&&(
                <div style={{display:"flex",justifyContent:"center",padding:"8px 0"}}>
                  <div dangerouslySetInnerHTML={{__html:qrSvg}} style={{width:200,height:200}}/>
                </div>
              )}
            </div>

            {/* Members */}
            {Object.keys(members).length>0&&(
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,color:"#64748b",marginBottom:8,fontWeight:600}}>{isHe?"חברי המשק:":"Household members:"}</div>
                {Object.values(members).map((m,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"rgba(255,255,255,.6)",borderRadius:8,marginBottom:4}}>
                    <span style={{fontSize:16}}>👤</span>
                    <span style={{fontSize:13,fontWeight:600}}>{m.name}</span>
                    {m.name===householdCfg.memberName&&<span style={{fontSize:10,color:"#0d9488",background:"rgba(13,148,136,.08)",borderRadius:8,padding:"1px 6px"}}>{isHe?"אני":"me"}</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Sync status */}
            <div style={{fontSize:11,color:"#64748b",marginBottom:14,display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",display:"inline-block",flexShrink:0}}/>
              <span>{isHe?"מזווה ועגלה מסונכרנים":"Pantry & cart synced"}{syncLabel?` · ${syncLabel}`:""}</span>
            </div>

            {/* Back to main */}
            <button onClick={onClose}
              style={{...btnStyle,width:"100%",background:"linear-gradient(135deg,#14b8a6,#059669)",color:"#fff",border:"none",padding:"12px",fontSize:14,fontWeight:800,marginBottom:8,boxShadow:"0 4px 14px rgba(13,148,136,.3)"}}>
              {isHe?"→ חזרה לדף הראשי":"→ Go to Main Screen"}
            </button>

            {/* Leave */}
            <button onClick={handleLeave}
              style={{...btnStyle,width:"100%",background:confirmLeave?"rgba(220,38,38,.12)":"rgba(220,38,38,.06)",color:"#dc2626",border:`1px solid ${confirmLeave?"rgba(220,38,38,.4)":"rgba(220,38,38,.2)"}`,padding:"9px",transition:"all .2s"}}>
              {confirmLeave?(isHe?"בטוח? לחץ שוב לאישור":"Sure? Tap again to confirm"):(isHe?"עזוב משק בית":"Leave Household")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
