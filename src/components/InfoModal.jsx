import React from 'react';
import { LANG } from '../lib/lang.js';
import { C } from '../lib/nutrition.js';

// "About" info modal.

export function InfoModal({onClose,lang}){
  const T=LANG[lang]||LANG.he;
  const items=lang==='en'?[
    ["📊","Daily tracking","Log calories, carbs, protein & fat for every item"],
    ["🩸","Blood sugar","Enter morning glucose and track your weekly curve"],
    ["⚡","Quick add","Tap any food chip to instantly add to today's log"],
    ["🔍","Smart add","Search by name — Claude calculates the nutrition values"],
    ["📷","Photo analysis","Photograph a meal and Claude identifies & calculates it"],
    ["🍳","Meal planner","Get personalized meal suggestions using what's in your pantry"],
    ["📓","Weekly journal","View calorie chart, weight, sugar curve and weekly averages"],
    ["🫙","Pantry","Track what you have at home by category"],
    ["🛒","Shopping list","Manage your shopping list, synced across the household"],
    ["🏠","Household sync","Share pantry & shopping list in real time with family"],
    ["💾","Personal food DB","Save your own meals and foods with custom nutrition values"],
    ["👤","Profiles","Multiple profiles with separate goals, journal and food history"],
    ["📤","Backup & export","Export your data as JSON or text and restore it any time"],
  ]:[
    ["📊","מעקב יומי","רשמי קלוריות, פחמימות, חלבון ושומן לכל מאכל"],
    ["🩸","סוכר בדם","הזיני ערך סוכר בבוקר ועקבי אחר עקומה שבועית"],
    ["⚡","הוספה מהירה","לחצי על מאכל להוספה מיידית ליומן היום"],
    ["🔍","הוספה חכמה","חפשי מאכל לפי שם — Claude יחשב את הערכים"],
    ["📷","ניתוח תמונה","צלמי ארוחה ו-Claude יזהה ויחשב את הערכים"],
    ["🍳","מתכנן ארוחות","קבלי הצעות ארוחה עם מתכון מלא לפי מה שיש במזווה"],
    ["📓","יומן שבועי","גרף קלוריות, משקל, עקומת סוכר וממוצעים שבועיים"],
    ["🫙","מזווה","עקבי אחר מה שיש בבית לפי קטגוריות"],
    ["🛒","רשימת קניות","נהלי רשימת קניות — מסתנכרנת עם כל הבית"],
    ["🏠","סנכרון בית","שיתוף מזווה ורשימת קניות בזמן אמת עם בני הבית"],
    ["💾","מאגר אישי","שמרי מאכלים ומנות עם ערכים תזונתיים מותאמים אישית"],
    ["👤","פרופילים","מספר פרופילים עם יעדים, יומן והיסטוריה נפרדת לכל אחד"],
    ["📤","גיבוי וייצוא","ייצאי את הנתונים כ-JSON או טקסט ושחזרי בכל עת"],
  ];
  return(
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:700}}>ℹ️ {lang==='en'?"About the app":"על האפליקציה"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>
        {items.map(([icon,title,desc])=>(
          <div key={title} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontSize:20,flexShrink:0}}>{icon}</span>
            <div><div style={{fontSize:13,fontWeight:700,color:C.text}}>{title}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{desc}</div></div>
          </div>
        ))}
        <div style={{fontSize:10,color:C.muted,textAlign:"center",marginTop:14,opacity:.5}}>v1.5.0</div>
        <button onClick={onClose} className="btn-accent" style={{marginTop:8,borderRadius:12}}>{lang==='en'?"Got it":"הבנתי"}</button>
      </div>
    </div>
  );
}
