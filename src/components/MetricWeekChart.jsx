import React, { useRef, useEffect } from 'react';
import { C, goalColor } from '../lib/nutrition.js';

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