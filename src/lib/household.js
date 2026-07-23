// ── Household / Firebase (shared family sync) ─────────────────────────────────
// Moved out of App.jsx as part of splitting the 6000+ line single-file component
// into modules. No behavior changes — this is a straight cut-and-paste of the
// original module-level Household/Firebase section, with the loose _fbDb/
// _fbRefFn/_fbSet/_fbOnValue/_householdId/_memberName/_lastSyncAt variables
// wrapped into a single exported `fbState` object (since ES module bindings for
// `let` exports can be read from importers but not reassigned from outside —
// App.jsx does reassign these directly in a couple of places, e.g. on "leave
// household"). Everything else keeps its original name.

export let fbState = {
  db: null, refFn: null, set: null, onValue: null,
  householdId: null, memberName: "", lastSyncAt: 0,
};

// Pre-warm Firebase modules if household is already configured (improves first-open speed)
export function prewarmFirebaseIfConfigured(ls){
  if(ls.get('nutrition_household')){
    Promise.all([import('firebase/app'),import('firebase/database')]).catch(()=>{});
  }
}

// ── Google OAuth + Firebase Management API (auto household setup) ─────────────
const GOOG_CLIENT_ID='265332769587-rdfch8osb3k8f5tn7mf1ra1ods3kte38.apps.googleusercontent.com';

const _loadGIS=()=>new Promise((ok,fail)=>{
  if(window.google?.accounts?.oauth2){ok();return;}
  const s=document.createElement('script');
  s.src='https://accounts.google.com/gsi/client';
  s.onload=ok;s.onerror=fail;document.head.appendChild(s);
});

const _getGToken=()=>new Promise((ok,fail)=>{
  window.google.accounts.oauth2.initTokenClient({
    client_id:GOOG_CLIENT_ID,
    scope:'https://www.googleapis.com/auth/firebase https://www.googleapis.com/auth/cloud-platform',
    callback:r=>r.error?fail(new Error(r.error_description||r.error)):ok(r.access_token),
    error_callback:e=>fail(new Error(e?.type||'auth error')),
  }).requestAccessToken({prompt:''});
});

const _gapi=async(url,tok,method='GET',body=null)=>{
  const r=await fetch(url,{method,headers:{Authorization:`Bearer ${tok}`,'Content-Type':'application/json'},...(body!=null?{body:JSON.stringify(body)}:{})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error?.message||`שגיאה ${r.status}`);
  return d;
};

export async function autoSetupHousehold(projectId,onStep){
  await _loadGIS();
  onStep('auth');
  const tok=await _getGToken();

  onStep('project');
  // Get project info — also ensures Firebase is activated on this Cloud project
  let proj;
  try{
    proj=await _gapi(`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}`,tok);
  }catch(e){
    // If not yet a Firebase project, try to add Firebase to the Cloud project
    try{
      const op=await _gapi(`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}:addFirebase`,tok,'POST',{});
      // Poll until done
      let addOp=op;
      for(let i=0;i<15&&!addOp.done;i++){
        await new Promise(r=>setTimeout(r,2000));
        addOp=await _gapi(`https://firebase.googleapis.com/v1beta1/${addOp.name}`,tok);
      }
      proj=await _gapi(`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}`,tok);
    }catch(e2){throw new Error(`פרויקט לא נמצא: ${e2.message}`,{cause:e2});}
  }
  const pNum=proj.projectNumber;
  if(!pNum)throw new Error('לא הצלחנו לאמת את הפרויקט — בדקי את ה-Project ID');

  onStep('database');
  // Try known URL patterns first (avoids management API permission issues)
  const _probeDb=async(url)=>{
    try{const r=await fetch(`${url}/.json?shallow=true`,{headers:{Authorization:`Bearer ${tok}`}});return r.status!==404;}catch(_){return false;}
  };
  const candidates=[
    `https://${projectId}-default-rtdb.firebaseio.com`,
    `https://${projectId}-default-rtdb.europe-west1.firebasedatabase.app`,
    `https://${projectId}.firebaseio.com`,
  ];
  let dbUrl=null;
  for(const url of candidates){if(await _probeDb(url)){dbUrl=url;break;}}
  // If not found by probing, try management API to create
  if(!dbUrl){
    for(const [ref,loc] of[[pNum,'europe-west1'],[pNum,'us-central1'],[projectId,'us-central1']]){
      try{
        const db=await _gapi(`https://firebasedatabase.googleapis.com/v1beta/projects/${ref}/locations/${loc}/instances?databaseId=${projectId}-default-rtdb`,tok,'POST',{type:'USER_DATABASE'});
        dbUrl=db.databaseUrl;break;
      }catch(e){
        if(e.message.toLowerCase().includes('multiple')||e.message.toLowerCase().includes('blaze')||e.message.toLowerCase().includes('already')){
          // DB definitely exists — use standard URL
          dbUrl=candidates[0];break;
        }
      }
    }
  }
  if(!dbUrl)throw new Error('לא הצלחנו למצוא את ה-Realtime Database — צרו אחד ידנית ב-Firebase Console');

  onStep('webapp');
  let appId=null;
  try{
    const al=await _gapi(`https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`,tok);
    if(al.apps?.length)appId=al.apps[0].appId;
  }catch(_){}
  if(!appId){
    let op=await _gapi(`https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`,tok,'POST',{displayName:'Nutrition'});
    for(let i=0;i<20&&!op.done;i++){await new Promise(r=>setTimeout(r,1500));op=await _gapi(`https://firebase.googleapis.com/v1beta1/${op.name}`,tok);}
    if(!op.done)throw new Error('יצירת Web App לקחה יותר מדי זמן');
    appId=op.response?.appId;
  }

  onStep('config');
  const cfg=await _gapi(`https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps/${appId}/config`,tok);
  if(!cfg.databaseURL)cfg.databaseURL=dbUrl;

  // Enable Anonymous Auth so the database can require authentication instead of being world-writable
  try{
    await _gapi(`https://serviceusage.googleapis.com/v1/projects/${pNum}/services/identitytoolkit.googleapis.com:enable`,tok,'POST',{});
  }catch(_){}
  try{
    await _gapi(`https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config?updateMask=signIn.anonymous.enabled`,tok,'PATCH',{signIn:{anonymous:{enabled:true}}});
  }catch(_){}

  // Lock rules down to "must be signed in" + scoped to the households path (was previously wide-open '.read'/'.write': true,
  // which let anyone who ever saw a sharing code or the databaseURL read/write the whole database, forever, with no auth).
  // Best effort: if this fails (e.g. anonymous auth couldn't be enabled above), the client falls back to unauthenticated
  // access in _fbInit so existing/manual setups keep working.
  try{
    await fetch(`${cfg.databaseURL}/.settings/rules.json`,{method:'PUT',headers:{Authorization:`Bearer ${tok}`,'Content-Type':'application/json'},body:JSON.stringify({rules:{
      '.read':false,'.write':false,
      households:{'$hid':{'.read':'auth != null','.write':'auth != null'}},
    }})});
  }catch(_){}
  return cfg;
}

export async function _fbInit(cfg){
  if(fbState.db&&fbState.householdId===cfg.householdId)return true;
  try{
    const[appMod,dbMod,authMod]=await Promise.all([import('firebase/app'),import('firebase/database'),import('firebase/auth')]);
    const{initializeApp,getApps,deleteApp}=appMod;
    const{getDatabase,ref,set,onValue}=dbMod;
    const{getAuth,signInAnonymously}=authMod;
    const ANAME='nutrition-household';
    const existing=getApps().find(a=>a.name===ANAME);
    if(existing&&existing.options.projectId!==cfg.firebaseConfig?.projectId){
      await deleteApp(existing);
    }
    const app=getApps().find(a=>a.name===ANAME)||initializeApp(cfg.firebaseConfig,ANAME);
    // New households have rules that require auth ('auth != null'). Sign in anonymously so reads/writes are authorized.
    // Best effort: older/manual households may not have Anonymous Auth enabled on their Firebase project — in that
    // case this fails silently and we fall back to whatever (legacy, possibly open) rules that project already has.
    try{
      const auth=getAuth(app);
      if(!auth.currentUser)await signInAnonymously(auth);
    }catch(e){console.error('Firebase anon auth (continuing without it):',e);}
    fbState.db=getDatabase(app);
    fbState.refFn=ref;fbState.set=set;fbState.onValue=onValue;
    fbState.householdId=cfg.householdId;
    fbState.memberName=cfg.memberName||"";
    return true;
  }catch(e){console.error('Firebase init:',e);return false;}
}

function _fbSyncPantry(p){
  if(!fbState.db||!fbState.householdId)return;
  fbState.set(fbState.refFn(fbState.db,`households/${fbState.householdId}/pantry`),p).catch(()=>{});
}

function _fbSyncShopping(s){
  if(!fbState.db||!fbState.householdId)return;
  // Store as object (Firebase handles arrays inconsistently)
  const obj={};s.forEach(item=>{obj[String(item.id).replace('.','_')]=item;});
  fbState.set(fbState.refFn(fbState.db,`households/${fbState.householdId}/shopping`),obj).catch(()=>{});
}

export const savePantryLS=p=>{localStorage.setItem("nutrition_pantry",JSON.stringify(p));_fbSyncPantry(p);};
export const saveShopping=s=>{localStorage.setItem("nutrition_shopping",JSON.stringify(s));_fbSyncShopping(s);};

// Reset all household/Firebase session state (used when a member leaves the household).
export function fbReset(){
  fbState.db=null;fbState.refFn=null;fbState.set=null;fbState.onValue=null;
  fbState.householdId=null;fbState.memberName="";fbState.lastSyncAt=0;
}
