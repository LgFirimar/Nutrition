import React, { useState } from 'react';

export function CalcLoader({size=32}){
  const [v]=useState(()=>Math.ceil(Math.random()*3));
  return(
    <div style={{width:size,height:size,borderRadius:'50%',overflow:'hidden',display:'inline-block',verticalAlign:'middle',flexShrink:0,WebkitMaskImage:'-webkit-radial-gradient(circle, white 100%, black 100%)'}}>
      <video src={`/Nutrition/loader${v}.mp4`} autoPlay loop muted playsInline style={{width:'100%',height:'100%',objectFit:'cover',display:'block',transform:'translateZ(0)',willChange:'transform'}}/>
    </div>
  );
}