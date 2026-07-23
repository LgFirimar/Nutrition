import React from 'react';
import { C } from '../lib/nutrition.js';

export function StatBar({value,max,color}){
  const pct=Math.min(value/max*100,100);
  const col=pct>85?C.danger:pct>60?C.warn:color;
  return <div className="stat-bar-bg"><div className="stat-bar" style={{width:`${pct}%`,background:col}}/></div>;
}