import React, { useRef, useEffect } from 'react';

// App splash/loading screen.
// Lazily import the (large, background-removed) splash icon loader — see src/imgUtils.js.
// Kicked off at module load so the icons are usually ready by the time the splash paints.
const imgUtilsReady = import('../imgUtils.js');

export function SplashScreen({onDone,lang}){
  const isHe=(lang||localStorage.getItem('nutrition_lang')||'he')!=='en';
  const wrapRef=useRef(null);
  const cvRef=useRef(null);
  const vidRef=useRef(null);
  const skipRef=useRef(false);

  const doSkip=()=>{
    if(skipRef.current)return;
    skipRef.current=true;
    const el=wrapRef.current; if(!el)return;
    el.style.animation='splashExitContent .4s ease-in forwards';
    const burst=document.createElement('div');
    burst.style.cssText='position:absolute;top:50%;left:50%;width:70px;height:70px;border-radius:50%;background:rgba(170,240,90,.9);pointer-events:none;z-index:10;transform:translate(-50%,-50%) scale(0);animation:splashBurst .4s cubic-bezier(.15,.6,.3,1) forwards;';
    el.appendChild(burst);
    setTimeout(onDone,400);
  };

  useEffect(()=>{
    imgUtilsReady.then(()=>{ if(window._loadSplashImages) window._loadSplashImages(); });
    const t1=setTimeout(()=>{
      if(skipRef.current)return;
      const el=wrapRef.current; if(!el)return;
      el.style.animation='splashExitContent .95s ease-in forwards';
      const burst=document.createElement('div');
      burst.style.cssText='position:absolute;top:50%;left:50%;width:70px;height:70px;border-radius:50%;background:rgba(170,240,90,.9);pointer-events:none;z-index:10;transform:translate(-50%,-50%) scale(0);animation:splashBurst .95s cubic-bezier(.15,.6,.3,1) forwards;';
      el.appendChild(burst);
    },2500);
    const t2=setTimeout(()=>{if(!skipRef.current)onDone();},3500);
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[]);
  // Canvas-based white-background removal for the animation video
  useEffect(()=>{
    const vid=vidRef.current, cv=cvRef.current;
    if(!vid||!cv) return;
    // Scale canvas to device pixel ratio for crisp rendering on retina screens
    const dpr=Math.min(window.devicePixelRatio||1,3);
    const SIZE=200;
    cv.width=SIZE*dpr;
    cv.height=SIZE*dpr;
    const ctx=cv.getContext('2d',{willReadFrequently:true});
    let raf;
    vid.play().catch(()=>{});
    const draw=()=>{
      raf=requestAnimationFrame(draw);
      if(!vid.videoWidth || vid.readyState<2) return;
      const w=cv.width, h=cv.height;
      ctx.clearRect(0,0,w,h);
      ctx.drawImage(vid,0,0,w,h);
      try{
        const id=ctx.getImageData(0,0,w,h), d=id.data;
        for(let i=0;i<d.length;i+=4){
          const mn=Math.min(d[i],d[i+1],d[i+2]);
          if(mn>230) d[i+3]=0;
          else if(mn>180) d[i+3]=Math.round(255*(1-(mn-180)/50));
        }
        ctx.putImageData(id,0,0);
      }catch(_){}
    };
    raf=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(raf);
  },[]);
  const R=140, DUR=16;
  const icons=[
    {id:'sp-cup',  delay:0},
    {id:'sp-salad',delay:-(DUR/6)},
    {id:'sp-dumb', delay:-(DUR/6*2)},
    {id:'sp-tape', delay:-(DUR/6*3)},
    {id:'sp-leaf', delay:-(DUR/6*4)},
    {id:'sp-heart',delay:-(DUR/6*5)},
  ];
  return (
    <div ref={wrapRef} onClick={doSkip} style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:9999,overflow:'hidden',cursor:'pointer',
      background:'linear-gradient(150deg,#edfad5 0%,#bde890 52%,#92d045 100%)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      {/* bg circles */}
      <div style={{position:'absolute',top:-100,right:-100,width:320,height:320,borderRadius:'50%',
        background:'rgba(255,255,255,.18)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:-80,left:-80,width:280,height:280,borderRadius:'50%',
        background:'rgba(255,255,255,.13)',pointerEvents:'none'}}/>
      {/* Speech bubble */}
      {isHe
        ? <canvas id="sp-bubble"/>
        : <img src="/Nutrition/bubble-en.png" id="sp-bubble" alt="Nourish your life"/>}
      {/* Hub */}
      <div style={{position:'relative',width:R*2+80,height:R*2+80,flexShrink:0}}>
        {/* Orbit track */}
        <div style={{position:'absolute',top:'50%',left:'50%',width:R*2,height:R*2,
          marginTop:-R,marginLeft:-R,borderRadius:'50%',
          border:'2px dashed rgba(90,158,30,.35)',
          animation:'splashTrackPulse 2.5s ease-in-out infinite',pointerEvents:'none'}}/>
        {/* Orbit items */}
        {icons.map(({id,delay})=>(
          <div key={id} className="sp-orbit-rot" style={{animationDelay:`${delay}s`}}>
            <div className="sp-orbit-pos"><canvas id={id}/></div>
          </div>
        ))}
        {/* Center animation */}
        <div className="sp-avo-center">
          <div className="sp-avo-anim" style={{position:"relative",width:200,height:200}}>
            <video ref={vidRef} src="/Nutrition/avo-animation.mp4" autoPlay loop muted playsInline crossOrigin="anonymous"
              style={{position:"absolute",inset:0,width:200,height:200,opacity:0}}/>
            <canvas ref={cvRef}
              style={{position:"absolute",inset:0,width:200,height:200,display:"block",filter:"drop-shadow(0 6px 22px rgba(35,90,5,.3))"}}/>
          </div>
        </div>
      </div>
      {/* Title */}
      {isHe&&<div style={{fontSize:26,fontWeight:900,color:'#1e4a06',marginTop:16,letterSpacing:-0.5,
        textShadow:'0 2px 10px rgba(255,255,255,.6)',animation:'splashFadeUp .5s ease .65s both'}}>מעקב תזונה</div>}
      <div style={{fontSize:12,color:'#4a7a10',letterSpacing:2.5,marginTop:isHe?6:20,
        animation:'splashFadeUp .5s ease .85s both'}}>{isHe?'חכם · מהיר · מדויק':'Smart · Fast · Accurate'}</div>
      {/* Dots */}
      <div style={{display:'flex',gap:7,marginTop:20}}>
        {[0.25,0.43,0.61].map(d=>(
          <div key={d} style={{width:8,height:8,borderRadius:'50%',background:'#5a9e1e',
            animation:`splashDot 1.2s ease-in-out ${d}s infinite`}}/>
        ))}
      </div>
    </div>
  );
}
