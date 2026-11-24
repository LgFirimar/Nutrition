import React from 'react';

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