import React, { useState, useRef, useEffect } from 'react';
import { C, getTodayKey, goalColor, sugarColor } from '../lib/nutrition.js';

// Weekly metric/sugar trend charts.

export function MetricWeekChart({journal,metric,color,label,lang,range,setRange,goal,goalDir}){
  const H=54,W=280,PAD=14,TOP=20;
  const isHe=(lang||localStorage.getItem('nutrition_lang')||'he')!=='en';
  const goalColor=v=>{
    if(!goal||!v) return color;
    if(goalDir==='min') return v>=goal?'#15803d':v>=goal*0.75?'#f59e0b':'#dc2626';
    return v<=goal?'#15803d':v<=goal*1.2?'#f59e0b':'#dc2626';
  };
  const DAY_LABELS=isHe?['א','ב','ג','ד','ה','ו','ש']:['Su','Mo','Tu','We','Th','Fr','Sa'];
  const xs=Array.from({length:range},(_,i)=>Math.round(PAD+i*(W-2*PAD)/Math.max(range-1,1)));
  const ref=useRef(null);
  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth",block:"nearest"});},[]);

  const now=new Date();
  const fmtKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const days=[];
  for(let i=range-1;i>=0;i--){
    const d=new Date(now);d.setDate(d.getDate()-i);
    const k=fmtKey(d);
    const tot=journal[k]?.totals;
    const v=(tot&&journal[k]?.entries?.length)?Number(tot[metric]||0):null;
    days.push({k,v,dow:d.getDay(),date:new Date(d)});
  }
  const vals=days.filter(d=>d.v!==null&&d.v>0).map(d=>d.v);
  if(!vals.length) return(
    <div ref={ref} style={{background:"rgba(255,255,255,.68)",border:`1px solid ${color}33`,borderRadius:16,padding:"12px 14px",marginBottom:12,maxWidth:440}}>
      <div style={{fontSize:9,color,letterSpacing:1.4,textTransform:"uppercase",marginBottom:6,fontWeight:700}}>{label}</div>
      <div style={{fontSize:12,color:C.muted,textAlign:"center",padding:"10px 0"}}>{isHe?"אין נתונים שמורים":"No saved data"}</div>
    </div>
  );

  const minV=Math.min(...vals),maxV=Math.max(...vals);
  const vpad=Math.max(maxV-minV,10)*0.2;
  const lo=Math.max(0,minV-vpad),hi=maxV+vpad,vrange=hi-lo;
  const toY=v=>Math.max(TOP+2,Math.min(TOP+H-2,TOP+H-(v-lo)/vrange*H));

  const pts=days.map((d,i)=>d.v!=null&&d.v>0?{x:xs[i],y:toY(d.v),v:d.v}:null);
  const known=pts.filter(Boolean);

  const crPath=ps=>{
    if(ps.length<2)return null;
    const s=[`M ${ps[0].x},${ps[0].y}`];
    for(let i=0;i<ps.length-1;i++){
      const p0=ps[Math.max(0,i-1)],p1=ps[i],p2=ps[i+1],p3=ps[Math.min(ps.length-1,i+2)];
      s.push(`C ${(p1.x+(p2.x-p0.x)/6).toFixed(1)},${(p1.y+(p2.y-p0.y)/6).toFixed(1)} ${(p2.x-(p3.x-p1.x)/6).toFixed(1)},${(p2.y-(p3.y-p1.y)/6).toFixed(1)} ${p2.x},${p2.y}`);
    }
    return s.join(' ');
  };
  const lp=known.length>=2?crPath(known):null;

  const svgLabels=[];
  if(range===7){
    days.forEach((d,i)=>svgLabels.push({x:xs[i],txt:DAY_LABELS[d.dow]}));
  } else if(range===30){
    days.forEach((d,i)=>{if(i%7===0)svgLabels.push({x:xs[i],txt:`${d.date.getDate()}/${d.date.getMonth()+1}`});});
  } else {
    const mNames=isHe?['ינו','פבר','מרץ','אפר','מאי','יוני','יולי','אוג','ספט','אוק','נוב','דצמ']:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let lastM=-1;
    days.forEach((d,i)=>{const m=d.date.getMonth();if(m!==lastM){lastM=m;svgLabels.push({x:xs[i],txt:mNames[m]});}});
  }
  const svgH=TOP+H+(range===7?14:16);
  const rangeLabel=range===7?(isHe?"7 ימים":"7 days"):range===30?(isHe?"חודש":"Month"):(isHe?"3 חודשים":"3 Months");

  return(
    <div ref={ref} style={{background:"rgba(255,255,255,.68)",backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",border:`1px solid ${color}33`,borderRadius:16,padding:"10px 12px 8px",marginBottom:12,boxShadow:"0 3px 14px rgba(80,130,180,.08)",maxWidth:440}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
        <div style={{fontSize:9.5,color,letterSpacing:1.4,textTransform:"uppercase",fontWeight:700}}>{label}</div>
        <div style={{display:"flex",gap:3}}>
          {[[7,isHe?"שבוע":"Week"],[30,isHe?"חודש":"Month"],[90,isHe?"3ח":"3M"]].map(([r,l])=>(
            <button key={r} onClick={()=>setRange(r)} style={{background:range===r?"rgba(148,163,184,.25)":"transparent",border:`1px solid ${range===r?"rgba(148,163,184,.5)":"rgba(148,163,184,.2)"}`,color:range===r?"#475569":"#94a3b8",borderRadius:5,padding:"2px 5px",fontSize:8,cursor:"pointer",fontFamily:"inherit",fontWeight:range===r?700:400}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{overflow:"hidden",borderRadius:8}}>
        <svg width="100%" viewBox={`0 0 ${W} ${svgH}`} style={{display:"block"}}>
          {goal&&known.length>=2&&<defs>
            <linearGradient id={`mg-${metric}`} x1={PAD} y1="0" x2={W-PAD} y2="0" gradientUnits="userSpaceOnUse">
              {known.map((p,i)=><stop key={i} offset={`${((p.x-PAD)/(W-2*PAD)*100).toFixed(1)}%`} stopColor={goalColor(p.v)}/>)}
            </linearGradient>
            <linearGradient id={`mg-${metric}-a`} x1={PAD} y1="0" x2={W-PAD} y2="0" gradientUnits="userSpaceOnUse">
              {known.map((p,i)=><stop key={i} offset={`${((p.x-PAD)/(W-2*PAD)*100).toFixed(1)}%`} stopColor={goalColor(p.v)} stopOpacity="0.13"/>)}
            </linearGradient>
          </defs>}
          {[minV,(minV+maxV)/2,maxV].map((v,i)=>{
            const ry=toY(v);
            const rl=metric==='kcal'?Math.round(v):v.toFixed(1);
            return(<g key={i}>
              <line x1={PAD} y1={ry} x2={W-PAD-18} y2={ry} stroke={color} strokeWidth="0.6" strokeDasharray="3,3" opacity="0.22"/>
              <text x={W-1} y={ry+(i===2?-2:3)} textAnchor="end" fontSize="6" fill={color} opacity="0.65" fontWeight="700">{rl}</text>
            </g>);
          })}
          {goal&&lo<=goal&&goal<=hi&&(()=>{const gy=toY(goal);return(<><line x1={PAD} y1={gy} x2={W-PAD} y2={gy} stroke="#0d9488" strokeWidth="0.8" strokeDasharray="4,3" opacity="0.45"/><text x={W-2} y={gy-1.5} fontSize="5.5" fill="#0d9488" opacity="0.7" textAnchor="end" fontFamily="Heebo,sans-serif">{goal}</text></>);})()}
          {lp&&<>
            <path d={`${lp} L ${known[known.length-1].x},${TOP+H} L ${known[0].x},${TOP+H} Z`}
                  fill={goal?`url(#mg-${metric}-a)`:color} fillOpacity={goal?1:0.07}/>
            <path d={lp} fill="none" stroke={goal?`url(#mg-${metric})`:color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </>}
          {(()=>{
            const step=range===7?1:range===30?5:13;
            return known.map((p,i)=>{
              const showLabel=i%step===0||i===known.length-1;
              const dc=goalColor(p.v);
              return(
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={showLabel?3.5:1.8} fill="white" stroke={dc} strokeWidth={showLabel?2:1.2}/>
                  {showLabel&&<text x={p.x} y={p.y-7} textAnchor="middle" fontSize={range===7?"7.5":"7"} fill={dc} fontWeight="700">
                    {metric==='kcal'?Math.round(p.v):Number(p.v).toFixed(1)}
                  </text>}
                </g>
              );
            });
          })()}
          {svgLabels.map((lbl,i)=>(
            <text key={i} x={lbl.x} y={svgH-2} textAnchor="middle" fontSize="8" fill="#94a3b8">{lbl.txt}</text>
          ))}
        </svg>
      </div>
    </div>
  );
}

export function SugarWeekChart({journal,lang}){
  const isHe=(lang||localStorage.getItem('nutrition_lang')||'he')!=='en'?true:false;
  const [range,setRange]=useState(7);
  const H=54, W=280, PAD=14, SUGAR_RANGE=80, MIN_V=60;
  const toY=v=>Math.max(2,Math.min(H-2, H-(Number(v)-MIN_V)/SUGAR_RANGE*H));
  const y100=H-(100-MIN_V)/SUGAR_RANGE*H;
  const y86 =H-(86 -MIN_V)/SUGAR_RANGE*H;
  const HE=['א','ב','ג','ד','ה','ו','ש'];
  const EN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const now=new Date();
  const todayKey=getTodayKey();
  const fmtKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  const days=[];
  for(let i=range-1;i>=0;i--){
    const d=new Date(now); d.setDate(d.getDate()-i);
    const k=fmtKey(d);
    const v=journal[k]?.bloodSugar?Number(journal[k].bloodSugar):null;
    days.push({k,v,dow:d.getDay(),date:new Date(d)});
  }
  const xs=Array.from({length:range},(_,i)=>Math.round(PAD+i*(W-2*PAD)/Math.max(range-1,1)));

  // Average for a given window: include today if it has a value, else start from yesterday
  const todayVal=journal[todayKey]?.bloodSugar?Number(journal[todayKey].bloodSugar):null;
  const calcAvg=nDays=>{
    const startOff=todayVal!=null?0:1;
    const vals=[];
    for(let i=startOff;i<startOff+nDays;i++){
      const d=new Date(now); d.setDate(d.getDate()-i);
      const v=journal[fmtKey(d)]?.bloodSugar?Number(journal[fmtKey(d)].bloodSugar):null;
      if(v!=null) vals.push(v);
    }
    return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):null;
  };
  const avg7=calcAvg(7);
  const avgRange=calcAvg(range);
  const avgY=avgRange!=null?toY(avgRange):null;

  const known=days.map((d,i)=>d.v?{x:xs[i],y:toY(d.v)}:null).filter(Boolean);
  if(!known.length)return null;

  const crPath=ps=>{
    if(ps.length<2)return null;
    const s=[`M ${ps[0].x},${ps[0].y}`];
    for(let i=0;i<ps.length-1;i++){
      const p0=ps[Math.max(0,i-1)],p1=ps[i],p2=ps[i+1],p3=ps[Math.min(ps.length-1,i+2)];
      s.push(`C ${(p1.x+(p2.x-p0.x)/6).toFixed(1)},${(p1.y+(p2.y-p0.y)/6).toFixed(1)} ${(p2.x-(p3.x-p1.x)/6).toFixed(1)},${(p2.y-(p3.y-p1.y)/6).toFixed(1)} ${p2.x},${p2.y}`);
    }
    return s.join(' ');
  };
  const linePath=known.length>=2?crPath(known):null;

  // X-axis labels for longer ranges (inside SVG)
  const svgLabels=[];
  if(range===30){
    days.forEach((d,i)=>{if(i%7===0)svgLabels.push({x:xs[i],txt:`${d.date.getDate()}/${d.date.getMonth()+1}`});});
  } else if(range===90){
    const mNames=['ינו','פבר','מרץ','אפר','מאי','יוני','יולי','אוג','ספט','אוק','נוב','דצמ'];
    let lastM=-1;
    days.forEach((d,i)=>{const m=d.date.getMonth();if(m!==lastM){lastM=m;svgLabels.push({x:xs[i],txt:mNames[m]});}});
  }
  const svgH=range===7?H:H+12;

  return(
    <div style={{background:"rgba(255,255,255,.68)",backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",border:"1px solid rgba(255,255,255,.88)",borderRadius:18,padding:"12px 14px 10px",marginBottom:16,boxShadow:"0 4px 20px rgba(80,130,180,.1)",maxWidth:440}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{fontSize:9.5,color:"#94a3b8",letterSpacing:1.4,textTransform:"uppercase"}}>🩸 {isHe?"סוכר":"Sugar"}</div>
          {avg7!=null&&<span style={{fontSize:8.5,color:sugarColor(avg7),background:sugarColor(avg7)+'18',borderRadius:8,padding:"1px 6px",fontWeight:700}}>{isHe?"ממוצע שבוע":"Week avg"}: {avg7}</span>}
        </div>
        <div style={{display:"flex",gap:3}}>
          {[[7,isHe?"שבוע":"Week"],[30,isHe?"חודש":"Month"],[90,isHe?"3ח":"3M"]].map(([r,l])=>(
            <button key={r} onClick={()=>setRange(r)} style={{background:range===r?"rgba(148,163,184,.25)":"transparent",border:`1px solid ${range===r?"rgba(148,163,184,.5)":"rgba(148,163,184,.2)"}`,color:range===r?"#475569":"#94a3b8",borderRadius:5,padding:"2px 5px",fontSize:8,cursor:"pointer",fontFamily:"inherit",fontWeight:range===r?700:400}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
        <div style={{display:"flex",gap:8}}>
          {[["≤85","#0d9488"],["86–99","#f59e0b"],["≥100","#dc2626"]].map(([l,c])=>(
            <span key={l} style={{fontSize:7.5,color:c,display:"inline-flex",alignItems:"center",gap:2}}>
              <span style={{width:6,height:2,borderRadius:1,background:"currentColor",display:"inline-block"}}></span>{l}
            </span>
          ))}
        </div>
        {avgRange!=null&&<span style={{fontSize:8,color:"#6366f1",fontWeight:700,background:"#6366f115",borderRadius:6,padding:"1px 7px"}}>⌀ {isHe?"ממוצע":"avg"} {range}{isHe?"י":"d"}: {avgRange}</span>}
      </div>

      <div style={{overflow:"hidden",borderRadius:8}}>
        <svg width="100%" viewBox={`0 0 ${W} ${svgH}`} style={{display:"block"}}>
          <defs>
            <linearGradient id="sg-line" x1="0" y1="0" x2="0" y2={H} gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#dc2626"/>
              <stop offset={`${(y100/H*100-8).toFixed(0)}%`} stopColor="#dc2626"/>
              <stop offset={`${(y100/H*100+8).toFixed(0)}%`} stopColor="#f59e0b"/>
              <stop offset={`${(y86/H*100+8).toFixed(0)}%`}  stopColor="#15803d"/>
              <stop offset="100%" stopColor="#15803d"/>
            </linearGradient>
            <linearGradient id="sg-area" x1={PAD} y1="0" x2={W-PAD} y2="0" gradientUnits="userSpaceOnUse">
              {known.map((p,i)=>{const di=xs.indexOf(p.x);const v=di>=0?days[di]?.v||0:0;return <stop key={i} offset={`${((p.x-PAD)/(W-2*PAD)*100).toFixed(1)}%`} stopColor={sugarColor(v)} stopOpacity="0.13"/>;})}
            </linearGradient>
          </defs>
          <line x1={PAD} y1={y100} x2={W-PAD} y2={y100} stroke="rgba(220,38,38,.15)" strokeWidth="0.7" strokeDasharray="3,3"/>
          <line x1={PAD} y1={y86}  x2={W-PAD} y2={y86}  stroke="rgba(245,158,11,.15)" strokeWidth="0.7" strokeDasharray="3,3"/>
          <text x={W-2} y={y100-1} fontSize="5.5" fill="rgba(220,38,38,.45)" textAnchor="end" fontFamily="Heebo,sans-serif">100</text>
          <text x={W-2} y={y86-1}  fontSize="5.5" fill="rgba(245,158,11,.5)"  textAnchor="end" fontFamily="Heebo,sans-serif">86</text>
          {avgY!=null&&<line x1={PAD} y1={avgY} x2={W-PAD} y2={avgY} stroke="#6366f1" strokeWidth="1.2" strokeDasharray="4,3" opacity="0.6"/>}
          {linePath&&known.length>=2&&<path d={`${linePath} L ${known[known.length-1].x},${H} L ${known[0].x},${H} Z`} fill="url(#sg-area)"/>}
          {linePath&&<path d={linePath} fill="none" stroke="url(#sg-line)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>}
          {range===7&&days.map((d,i)=>{
            if(!d.v) return <circle key={i} cx={xs[i]} cy={H*0.58} r="2" fill="none" stroke="rgba(148,163,184,.25)" strokeWidth="1"/>;
            const y=toY(d.v),col=sugarColor(d.v);
            return <g key={i}>
              <circle cx={xs[i]} cy={y} r="5.5" fill="rgba(255,255,255,.9)" stroke={col} strokeWidth="1.5"/>
              <circle cx={xs[i]} cy={y} r="2.2" fill={col}/>
            </g>;
          })}
          {range>7&&svgLabels.map((lbl,i)=>(
            <text key={i} x={lbl.x} y={svgH-1} textAnchor="middle" fontSize="7" fill="#94a3b8" fontFamily="Heebo,sans-serif">{lbl.txt}</text>
          ))}
        </svg>
      </div>

      {range===7&&(
        <div style={{display:"flex",direction:"ltr",marginTop:5}}>
          {days.map((d,i)=>(
            <div key={i} style={{flex:1,textAlign:"center"}}>
              <div style={{fontSize:7.5,color:"#94a3b8"}}>{isHe?HE[d.dow]:EN[d.dow]}</div>
              {d.v?<div style={{fontSize:8.5,fontWeight:700,color:sugarColor(d.v)}}>{d.v}</div>
                  :<div style={{fontSize:8.5,color:"rgba(148,163,184,.4)"}}>—</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
