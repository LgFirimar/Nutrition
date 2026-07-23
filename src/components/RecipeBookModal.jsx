import React, { useState } from 'react';
import { loadCustomDB, loadRecipes, saveCustomDB, saveRecipes } from '../lib/storage.js';
import { C } from '../lib/nutrition.js';
import { AddEditRecipeModal } from './AddEditRecipeModal.jsx';
import { RecipeCard } from './RecipeCard.jsx';
import { SaveFavNameSheet } from './SaveFavNameSheet.jsx';

function formatRecipeShare(recipe,isHe){
  const lines=[`📖 ${recipe.name}`,''];
  if(recipe.ingredients?.length){
    lines.push(isHe?'🧂 מצרכים:':'🧂 Ingredients:');
    recipe.ingredients.forEach(i=>lines.push(`• ${i.amount} ${i.unit} ${i.item}`));
    lines.push('');
  }
  if(recipe.steps?.length){
    lines.push(isHe?'👨‍🍳 הכנה:':'👨‍🍳 Instructions:');
    recipe.steps.forEach((s,i)=>lines.push(`${i+1}. ${s}`));
    lines.push('');
  }
  if(recipe.kcalPerPerson) lines.push(`📊 ${isHe?'לכל מנה':'Per serving'}: ${Math.round(recipe.kcalPerPerson)} kcal · ${(recipe.carbsPerPerson||0).toFixed(1)}g carbs · ${(recipe.proteinPerPerson||0).toFixed(1)}g prot`);
  return lines.join('\n');
}

export function RecipeBookModal({onClose,lang,pid,onAddToDay,onSaveQuickFood,initialEdit}){
  const isHe=(lang||'he')!=='en';
  const activePid=pid||window._activePid||'default';
  const [recipes,setRecipes]=useState(()=>loadRecipes(activePid));
  const [openId,setOpenId]=useState(null);
  const [search,setSearch]=useState('');
  const [showAdd,setShowAdd]=useState(false);
  const [editRecipe,setEditRecipe]=useState(initialEdit||null);
  const [pendingFav,setPendingFav]=useState(null);

  const save=r=>{setRecipes(r);saveRecipes(r,activePid);};
  const remove=id=>save(recipes.filter(r=>r.id!==id));

  const saveAsQuickFood=recipe=>{
    if(!recipe.kcalPerPerson) return false;
    const pid=window._activePid||activePid;
    const entry={names:[recipe.name.toLowerCase()],label:`📖 ${recipe.name}`,
      kcal:Math.round(recipe.kcalPerPerson||0),carbs:parseFloat((recipe.carbsPerPerson||0).toFixed(1)),
      protein:parseFloat((recipe.proteinPerPerson||0).toFixed(1)),fat:parseFloat((recipe.fatPerPerson||0).toFixed(1)),
      defaultAmt:1,unit:"מנה",source:'recipe'};
    const db=loadCustomDB(pid);
    saveCustomDB([...db.filter(f=>f.label!==entry.label),entry],pid);
    return true;
  };

  const saveToQuickFoods=recipe=>{
    if(!recipe.kcalPerPerson) return false;
    const food={id:`qf_recipe_${Date.now()}`,label:`📖 ${recipe.name}`,
      kcal:Math.round(recipe.kcalPerPerson||0),carbs:parseFloat((recipe.carbsPerPerson||0).toFixed(1)),
      protein:parseFloat((recipe.proteinPerPerson||0).toFixed(1)),fat:parseFloat((recipe.fatPerPerson||0).toFixed(1))};
    setPendingFav(food);
    return true;
  };

  const share=recipe=>{const msg=formatRecipeShare(recipe,isHe);window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank');};
  const email=recipe=>{const msg=formatRecipeShare(recipe,isHe);window.open(`mailto:?subject=${encodeURIComponent(recipe.name)}&body=${encodeURIComponent(msg)}`,'_blank');};

  const handleAddToDay=(recipe,qty=1,unit="מנות")=>{
    const isByServing=unit==="מנות"||unit==="יח׳";
    const factor=isByServing?qty:qty/100;
    const unitLabel=isByServing?(qty===1?(isHe?"מנה":"serving"):`${qty} ${unit}`):`${qty}${unit}`;
    onAddToDay({uid:Date.now()+Math.random(),label:`📖 ${recipe.name} (${unitLabel})`,
      kcal:Math.round((recipe.kcalPerPerson||0)*factor),
      carbs:parseFloat(((recipe.carbsPerPerson||0)*factor).toFixed(1)),
      protein:parseFloat(((recipe.proteinPerPerson||0)*factor).toFixed(1)),
      fat:parseFloat(((recipe.fatPerPerson||0)*factor).toFixed(1))});
    onClose();
  };

  const filtered=search.trim()?recipes.filter(r=>r.name.toLowerCase().includes(search.toLowerCase())):recipes;

  if(showAdd||editRecipe){
    return <AddEditRecipeModal recipe={editRecipe} lang={lang} onAddToDay={e=>{onAddToDay(e);onClose();}}
      onClose={()=>{setShowAdd(false);setEditRecipe(null);}}
      onSave={r=>{const updated=editRecipe?recipes.map(x=>x.id===r.id?r:x):[r,...recipes];save(updated);setShowAdd(false);setEditRecipe(null);}}/>;
  }

  return(
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-sheet slide" style={{maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:15,fontWeight:700}}>📖 {isHe?"ספר מתכונים":"My Recipes"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={isHe?"חפש מתכון...":"Search recipes..."} className="inp" style={{marginBottom:10}}/>
        <button onClick={()=>setShowAdd(true)} style={{width:"100%",background:"transparent",border:`1px dashed ${C.border}`,borderRadius:10,padding:10,fontSize:12,color:C.accent,cursor:"pointer",marginBottom:12,fontWeight:700}}>
          + {isHe?"הוסף מתכון":"Add Recipe"}
        </button>
        {filtered.length===0
          ?<div style={{textAlign:"center",color:C.muted,padding:30,fontSize:13}}>{isHe?"אין עדיין מתכונים":"No recipes yet"}</div>
          :filtered.map(recipe=>(
            <RecipeCard key={recipe.id} recipe={recipe} isHe={isHe}
              open={openId===recipe.id} onToggle={()=>setOpenId(openId===recipe.id?null:recipe.id)}
              onEdit={()=>setEditRecipe(recipe)} onDelete={()=>remove(recipe.id)}
              onShare={()=>share(recipe)} onEmail={()=>email(recipe)}
              onAddToDay={(qty,unit)=>handleAddToDay(recipe,qty,unit)}
              onSaveToDb={()=>saveAsQuickFood(recipe)}
              onSaveQuickFood={()=>saveToQuickFoods(recipe)}/>
          ))
        }
      </div>
      {pendingFav&&<SaveFavNameSheet defaultName={pendingFav.label} onConfirm={name=>{onSaveQuickFood?.({...pendingFav,label:name});setPendingFav(null);}} onClose={()=>setPendingFav(null)}/>}
    </div>
  );
}