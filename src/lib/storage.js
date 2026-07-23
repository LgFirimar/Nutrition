// ── Storage (localStorage helpers + one-time data migration) ──────────────────
// Moved out of App.jsx as part of splitting the 6000+ line single-file component
// into modules. Pure cut-and-paste — no behavior changes.

export const ls = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)||"null"); } catch { return null; } },
  set: (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
// ── Profiles ───────────────────────────────────────────────────────────────────
export const loadProfiles = () => ls.get("nutrition_profiles") || [];
export const saveProfiles = p => ls.set("nutrition_profiles", p);
export const loadActiveProfileId = () => ls.get("nutrition_active_profile") || "default";
export const saveActiveProfileId = id => ls.set("nutrition_active_profile", id);

export const pKey = (pid, k) => k + "_" + pid;
export const loadJournal = (pid) => { pid=pid||"default"; return ls.get(pKey(pid,"nutrition_journal")) || {}; };
export const saveJournal = (j, pid) => { pid=pid||"default"; ls.set(pKey(pid,"nutrition_journal"), j); };
export const loadCustomBtns = (pid) => { pid=pid||"default"; return ls.get(pKey(pid,"nutrition_custom_btns")) || []; };
export const saveCustomBtns = (b, pid) => { pid=pid||"default"; ls.set(pKey(pid,"nutrition_custom_btns"), b); };
export const loadCustomDB = (pid) => { pid=pid||"default"; return ls.get(pKey(pid,"nutrition_food_db")) || []; };
export const saveCustomDB = (db, pid) => { pid=pid||"default"; ls.set(pKey(pid,"nutrition_food_db"), db); };
export const loadQuickFoods = (pid) => { pid=pid||"default"; return ls.get(pKey(pid,"nutrition_quick_foods")); }; // null = use defaults
export const saveQuickFoods = (f, pid) => { pid=pid||"default"; ls.set(pKey(pid,"nutrition_quick_foods"), f); };

// ── Data Migration (old keys → pid-based keys) ────────────────────────────────
export function migrateOldData() {
  // Run migration every time - check all possible old key formats
  const oldJournal = ls.get("nutrition_journal");
  const oldBtns = ls.get("nutrition_custom_btns");
  const oldDB = ls.get("nutrition_food_db");
  const newJournal = ls.get("nutrition_journal_default");
  const newDB = ls.get("nutrition_food_db_default");
  // migrate journal
  if (oldJournal && !newJournal) {
    saveJournal(oldJournal, "default");
  }
  // migrate custom buttons
  if (oldBtns && !ls.get("nutrition_custom_btns_default")) {
    saveCustomBtns(oldBtns, "default");
  }
  // migrate food db
  if (oldDB && !newDB) {
    saveCustomDB(oldDB, "default");
  }
  // also handle keys with _profile_ prefix
  const keys = Object.keys(localStorage);
  keys.forEach(k => {
    if(k.startsWith("nutrition_journal_profile_") || k.startsWith("nutrition_food_db_profile_")) {
      // already in new format, no action needed
    }
  });
}

// ── Pantry & Shopping helpers ─────────────────────────────────────────────────
export const loadPantry=()=>{try{return JSON.parse(localStorage.getItem("nutrition_pantry")||"{}");}catch{return {};}};
export const loadShopping=()=>{try{return JSON.parse(localStorage.getItem("nutrition_shopping")||"[]");}catch{return [];}};

// ── Special-food edits (per-portion overrides for QUICK_FOODS etc.) ───────────
export const loadSpecialEdits=()=>ls.get("nutrition_special_edits")||{};
export const saveSpecialEdit=(id,data)=>{const e=loadSpecialEdits();ls.set("nutrition_special_edits",{...e,[id]:data});};
export const getSpecialEdit=(id)=>loadSpecialEdits()[id]||null;
export const loadHiddenSpecial=()=>ls.get("nutrition_hidden_special")||[];
export const toggleHiddenSpecial=(id)=>{const h=loadHiddenSpecial();ls.set("nutrition_hidden_special",h.includes(id)?h.filter(x=>x!==id):[...h,id]);};
export const isHiddenSpecial=(id)=>loadHiddenSpecial().includes(id);

// ── Recipe book ────────────────────────────────────────────────────────────────
export const loadRecipes=pid=>ls.get(`nutrition_recipes_${pid||'default'}`) || [];
export const saveRecipes=(r,pid)=>ls.set(`nutrition_recipes_${pid||'default'}`,r);

// ── Fridge (legacy pantry precursor) ──────────────────────────────────────────
export const loadFridge=()=>{try{return JSON.parse(localStorage.getItem("nutrition_fridge")||"{}");}catch{return {};}};
export const saveFridgeLS=f=>localStorage.setItem("nutrition_fridge",JSON.stringify(f));
