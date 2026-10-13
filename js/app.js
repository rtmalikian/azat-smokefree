/* Azat app — vanilla JS SPA. State in localStorage, hash routing. */
for (const l of ["en","ru","hy"]) Object.assign(STRINGS[l], EXTRA[l]);

const URGE_PHASES = {
  en:["The wave rises… stay with it.","Peak. You're doing great — breathe.","It's fading… almost there."],
  ru:["Волна поднимается… оставайся с ней.","Пик. Ты молодец — дыши.","Она спадает… почти всё."],
  hy:["Ալիքը բարձրանում ա… մնա դրա հետ։","Գագաթնակետ։ Լավ ես անում՝ շնչիր։","Մարում ա… քիչ մնաց։"]
};

/* ---------------- state ---------------- */
const LS = "azat-v1";
const DEF = () => ({
  lang:"hy", plan:null, ifthen:[], reasons:[], values:[], buddy:"",
  why:null, cravings:0, exercises:0, checkins:{}, logged:{}, lapses:[],
  trophiesWon:[], lore:[], egg:{}, createdAt:Date.now()
});
let S = DEF();
try { const raw = localStorage.getItem(LS); if (raw) S = Object.assign(DEF(), JSON.parse(raw)); } catch(e){}
function save(){ try{ localStorage.setItem(LS, JSON.stringify(S)); }catch(e){} }
function setLang(l){ S.lang = l; save(); document.documentElement.lang = l; applyLang(); router(); }

/* ---------------- helpers ---------------- */
const t = k => (STRINGS[S.lang] && STRINGS[S.lang][k]) || STRINGS.en[k] || k;
const esc = s => String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const LOCALE = {en:"en-US", ru:"ru-RU", hy:"hy-AM"};
const fmt = n => Number(n||0).toLocaleString(LOCALE[S.lang]||"en-US");
const dayKey = (d=new Date()) => d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const daysBetween = (a,b) => Math.floor((b-a)/86400000);

function quitStart(){ // ms timestamp of quit day start (local)
  if(!S.plan || !S.plan.quitDate) return null;
  const d = new Date(S.plan.quitDate+"T00:00:00"); return d.getTime();
}
function daysFree(){
  const q = quitStart(); if(q==null) return 0;
  return Math.max(0, daysBetween(q, Date.now()));
}
function daysUntilQuit(){
  const q = quitStart(); if(q==null) return 0;
  return Math.max(0, Math.ceil((q - Date.now())/86400000));
}
function cigsAvoided(){
  if(!S.plan) return 0;
  const per = S.plan.cigsPerDay||0;
  if(S.plan.goal==="cut"){
    const q = quitStart(); if(q==null) return 0;
    const days = Math.max(1, daysBetween(q, Date.now())+1);
    let logged = 0; for(const k in S.logged) logged += S.logged[k]||0;
    return Math.max(0, Math.round(days*per - logged));
  }
  const q = quitStart(); if(q==null) return 0;
  return Math.max(0, Math.floor(((Date.now()-q)/86400000)*per));
}
function moneySaved(){
  if(!S.plan) return 0;
  return Math.round(cigsAvoided() * (S.plan.packPrice||0) / 20);
}
function checkinStreak(){
  let n=0; const d=new Date();
  if(S.checkins[dayKey(d)]!=="clean") d.setDate(d.getDate()-1);
  while(S.checkins[dayKey(d)]==="clean"){ n++; d.setDate(d.getDate()-1); }
  return n;
}
function todayTip(){
  const arr = STRINGS[S.lang].tips;
  const dayNo = Math.floor(Date.now()/86400000);
  return arr[dayNo % arr.length];
}

/* ---------------- trophies ---------------- */
function trophyMet(tr){
  const n = tr.need;
  if(n.type==="egg") return false; // hidden lore eggs are awarded by js/eggs.js
  if(n.type==="plan") return !!S.plan;
  if(n.type==="why") return !!(S.why && S.why.doneAt);
  if(n.type==="days") return daysFree() >= n.n;
  if(n.type==="money") return moneySaved() >= n.n;
  if(n.type==="cravings") return S.cravings >= n.n;
  if(n.type==="exercises") return S.exercises >= n.n;
  if(n.type==="streak") return checkinStreak() >= n.n;
  return false;
}
function trophyProgress(tr){
  const n = tr.need;
  if(n.type==="days") return Math.min(daysFree(), n.n);
  if(n.type==="money") return Math.min(moneySaved(), n.n);
  if(n.type==="cravings") return Math.min(S.cravings, n.n);
  if(n.type==="exercises") return Math.min(S.exercises, n.n);
  if(n.type==="streak") return Math.min(checkinStreak(), n.n);
  return 0;
}
function checkTrophies(){
  let fresh = [];
  for(const tr of TROPHIES){
    if(!S.trophiesWon.includes(tr.id) && trophyMet(tr)){
      S.trophiesWon.push(tr.id); fresh.push(tr);
    }
  }
  if(fresh.length){ save(); for(const tr of fresh){
    toast("🏆 "+tr.name[S.lang], "trophy");
    if(AzatNotify.isEnabled()) AzatNotify.milestone(tr.name[S.lang]+" — "+tr.desc[S.lang]);
  }}
  if(window.Eggs) Eggs.onTrophies(); // Aragats egg: 4 trophies climbed
  return fresh;
}

/* ---------------- ui atoms ---------------- */
const view = document.getElementById("view");
function toast(msg, cls){
  const r = document.getElementById("toast-root");
  const el = document.createElement("div");
  el.className = "toast"+(cls?" "+cls:""); el.textContent = msg;
  r.appendChild(el); setTimeout(()=>{ el.style.opacity="0"; setTimeout(()=>el.remove(), 400); }, 3200);
}
function applyLang(){
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const k = el.getAttribute("data-i18n"); if(STRINGS[S.lang][k]) el.textContent = STRINGS[S.lang][k];
  });
  document.querySelectorAll(".lang-btn").forEach(b=>b.classList.toggle("active", b.dataset.lang===S.lang));
}
function card(html, cls){ return `<div class="card${cls?" "+cls:""}">${html}</div>`; }
function araratSVG(){
  // Smoke clears as smoke-free days grow (full clear at 30 days)
  const op = Math.max(0, 1 - daysFree()/30).toFixed(2);
  return `<svg viewBox="0 0 400 190" style="width:100%;height:auto" role="img" aria-label="Ararat">
    <circle cx="330" cy="34" r="22" fill="#F2A800" opacity="${1-op*0.55}"/>
    <path d="M20 165 L120 55 L160 110 L205 40 L250 105 L285 75 L360 165 Z" fill="#B3001B"/>
    <path d="M120 55 L142 88 L120 100 L100 84 Z" fill="#fff" opacity=".92"/>
    <path d="M205 40 L228 74 L205 86 L184 70 Z" fill="#fff" opacity=".92"/>
    <g opacity="${op}" fill="#9AA0A8">
      <ellipse cx="150" cy="80" rx="90" ry="26" opacity=".55"/>
      <ellipse cx="230" cy="60" rx="70" ry="20" opacity=".45"/>
      <ellipse cx="300" cy="90" rx="80" ry="24" opacity=".5"/>
      <ellipse cx="90" cy="105" rx="60" ry="18" opacity=".4"/>
    </g>
    <rect x="20" y="165" width="340" height="6" rx="3" fill="#1D4E9E" opacity=".25"/>
  </svg>`;
}

/* ---------------- router ---------------- */
const routes = {
  "home": renderHome, "plan": renderPlan, "sos": renderSOS,
  "about": renderAbout,
  "triggers": renderTriggers, "exercises": renderExercises,
  "trophies": renderTrophies, "learn": renderLearn,
  "menu": renderMenu, "settings": renderSettings,
};
function router(){
  const h = (location.hash||"#/home").replace("#/","");
  const [base] = h.split("/");
  document.querySelectorAll(".tab").forEach(a=>
    a.classList.toggle("active", a.dataset.tab===base || (base==="" && a.dataset.tab==="home")));
  if(routes[base]) routes[base](h);
  else if(base.startsWith("ex-")) renderExerciseDetail(h);
  else if(base.startsWith("sos-")) renderSOSDetail(h);
  else renderHome();
  window.scrollTo(0,0);
}
window.addEventListener("hashchange", router);

/* ---------------- HOME ---------------- */
function renderHome(){
  if(!S.plan){ // welcome
    view.innerHTML = `<div class="screen">
      ${card(`<h1>${t("w_title")}</h1><p>${t("w_sub")}</p>
        <p><span class="chip">📊 ${t("w_stat")}</span></p>
        <a class="btn btn-primary" href="#/plan">${t("w_cta_plan")}</a>`, "hero")}
      ${card(`<h2>${t("w_how")}</h2>
        <p><b>${t("w_how1t")}</b><br><span class="muted">${t("w_how1d")}</span></p>
        <p><b>${t("w_how2t")}</b><br><span class="muted">${t("w_how2d")}</span></p>
        <p><b>${t("w_how3t")}</b><br><span class="muted">${t("w_how3d")}</span></p>`)}
      <p class="muted small center">${t("install_tip")}</p>
    </div>`; return;
  }
  const df = daysFree(), until = daysUntilQuit();
  const heroNum = until>0
    ? `<div class="num" style="font-size:2.4rem;font-weight:800;color:var(--red)">${until}</div><div class="lbl">${t("d_until")}</div>`
    : `<div class="num" style="font-size:2.4rem;font-weight:800;color:var(--red)">${df}</div><div class="lbl">${t("d_days")}</div>`;
  if(until===0 && df===0) toast(t("quit_day_today"));

  const won = TROPHIES.filter(x=>S.trophiesWon.includes(x.id)).slice(-3).reverse();
  const ck = S.checkins[dayKey()];
  const plans = S.ifthen.map(p=>{
    const tr = TRIGGERS.find(x=>x.id===p.trigger), rs = RESPONSES.find(x=>x.id===p.response);
    return tr&&rs ? `<div class="kv"><span>🔹 ${t("t_if")} <b>${tr.name[S.lang]}</b>, ${t("t_then")} ${rs.text[S.lang]}</span></div>` : "";
  }).join("");

  view.innerHTML = `<div class="screen">
    ${card(`<h3 style="margin-top:0">${t("ararat_title")}</h3>${araratSVG()}
      <p class="muted small center">${df>=30 ? t("ararat_done") : t("ararat_sub")}</p>
      <p class="center" style="margin:0"><span id="egg-ark-tap" style="cursor:pointer;opacity:.4;user-select:none;-webkit-tap-highlight-color:transparent">✦</span></p>
      <div class="center">${heroNum}</div>`, "hero")}
    <div class="stat-grid">
      <div class="stat"><div class="num">${fmt(cigsAvoided())}</div><div class="lbl">${t("d_cigs")}</div></div>
      <div class="stat"><div class="num">${fmt(moneySaved())} ֏</div><div class="lbl">${t("d_money")}</div></div>
    </div>
    <a class="btn btn-sos" href="#/sos">🛟 SOS — ${t("d_sos_cta")}</a>
    ${S.plan.goal==="cut" ? cutdownCard() : ""}
    ${card(`<h3 style="margin-top:0">✅ ${t("d_checkin_q")}</h3>
      ${ck ? `<p class="muted">${t("d_checkin_done")}${checkinStreak()>1?` · <b>${t("d_streak").replace("{n}",checkinStreak())}</b>`:""}</p>`
      : `<div class="btn-row"><button class="btn btn-primary" id="ck-yes">${t("d_yes")}</button>
         <button class="btn btn-ghost" style="margin-top:0" id="ck-no">${t("d_no")}</button></div>`}`)}
    <div id="lapse-box"></div>
    ${plans ? card(`<h3 style="margin-top:0">📝 ${t("d_plans")}</h3>${plans}`) : ""}
    ${card(`<h3 style="margin-top:0">💡 ${t("d_tip")} <span id="egg-prov-tap" style="cursor:pointer;opacity:.4;user-select:none;-webkit-tap-highlight-color:transparent">✦</span></h3><p>${esc(todayTip())}</p>`)}
    ${card(`<h3 style="margin-top:0">${t("d_health")}</h3>${milestonesHTML()}`)}
    ${won.length?card(`<h3 style="margin-top:0">🏆 ${t("nav_trophies")}</h3>
      <div class="trophy-grid">${won.map(trophyHTML).join("")}</div>
      <p class="center"><a href="#/trophies">${t("c_next")} →</a></p>`):""}
  </div>`;

  const yb = document.getElementById("ck-yes"), nb = document.getElementById("ck-no");
  if(yb) yb.onclick = ()=>{ S.checkins[dayKey()]="clean"; save(); checkTrophies(); if(window.Eggs) Eggs.onClean(); renderHome(); };
  if(nb) nb.onclick = ()=>{
    document.getElementById("lapse-box").innerHTML = card(
      `<h3 style="margin-top:0">${t("d_lapse_t")}</h3><p>${t("d_lapse_d")}</p>
       <div class="field"><label>${t("d_lapse_q")}</label><input type="text" id="lapse-trig"></div>
       <button class="btn btn-primary" id="lapse-ok">${t("c_done")}</button>`);
    document.getElementById("lapse-ok").onclick = ()=>{
      const trig = document.getElementById("lapse-trig").value.trim();
      S.checkins[dayKey()]="lapse"; S.lapses.push({d:dayKey(), trig}); save();
      if(window.Eggs) Eggs.onLapse();
      toast(t("lapse_logged")); renderHome();
    };
  };
}
function cutdownCard(){
  const q = quitStart(); const dayNo = Math.max(0, daysBetween(q, Date.now()));
  const target = Math.max(0, (S.plan.cigsPerDay||20) - Math.floor(dayNo/2));
  const logged = S.logged[dayKey()]||0;
  let bars = "";
  for(let i=6;i>=0;i--){
    const d = new Date(); d.setDate(d.getDate()-i); const k = dayKey(d);
    const v = S.logged[k]||0; const h = Math.min(100, v*8+6);
    bars += `<div class="bar" style="height:${h}%"><span>${d.getDate()}</span></div>`;
  }
  return card(`<h3 style="margin-top:0">📉 ${t("d_target")}: <b style="color:var(--red)">${target}</b> · ${t("d_logged")}: <b>${logged}</b></h3>
    <div class="bar-chart">${bars}</div><p class="muted small center">${t("d_chart")}</p>
    <button class="btn btn-apricot" id="log-cig">${t("d_log1")}</button>`);
}
function milestonesHTML(){
  const mins = daysFree()*24*60 + (Date.now()- (quitStart()||Date.now()))% (24*60*60*1000)/(60*1000);
  const elapsed = quitStart()? (Date.now()-quitStart())/60000 : 0;
  return MILESTONES.map(m=>{
    const done = elapsed >= m.min;
    return `<div class="milestone${done?" done":""}"><div class="mile-dot">${done?"✓":m.icon}</div>
      <div class="mile-txt">${m.text[S.lang]}</div></div>`;
  }).join("");
}
function trophyHTML(tr){
  const won = S.trophiesWon.includes(tr.id);
  if(tr.hidden && !won){
    return `<div class="trophy secret"><div class="t-ico">🥚</div>
      <div class="t-name">???</div><div class="t-desc">${t("tr_secret")}</div></div>`;
  }
  let sub = tr.desc[S.lang];
  if(!won && tr.need.n) sub = t("tr_locked_n").replace("{n}", fmt(tr.need.n - trophyProgress(tr))) + " · " + sub;
  if(!won && !tr.need.n) sub = `<span class="muted">🔒</span> ` + sub;
  return `<div class="trophy${won?" won":""}"><div class="t-ico">${tr.icon}</div>
    <div class="t-name">${tr.name[S.lang]}</div><div class="t-desc">${sub}</div></div>`;
}

/* ---------------- PLAN WIZARD ---------------- */
let WZ = {};
function renderPlan(){
  if(S.plan && !WZ.step){ // summary view
    const p = S.plan;
    const goalTxt = p.goal==="quit" ? t("p_goal_quit_t") : t("p_goal_cut_t");
    const trigs = (p.triggers||[]).map(id=>{ const tr=TRIGGERS.find(x=>x.id===id); return tr?tr.icon+" "+tr.name[S.lang]:""; }).join(", ");
    view.innerHTML = `<div class="screen">${card(`
      <h1>${t("m_plan")}</h1>
      <div class="kv"><span>${t("p_sum_goal")}</span><b>${goalTxt}</b></div>
      <div class="kv"><span>${t("p_sum_date")}</span><b>${esc(p.quitDate)}</b></div>
      <div class="kv"><span>${t("p_sum_cigs")}</span><b>${p.cigsPerDay}</b></div>
      <div class="kv"><span>${t("p_sum_price")}</span><b>${fmt(p.packPrice)} ֏</b></div>
      ${trigs?`<div class="kv"><span>${t("p_sum_trig")}</span><b>${trigs}</b></div>`:""}
      <div style="margin-top:14px"><button class="btn btn-ghost" id="plan-edit">${t("p_restart")}</button></div>`)}
    </div>`;
    document.getElementById("plan-edit").onclick = ()=>{ WZ={step:1}; renderPlan(); };
    return;
  }
  const step = WZ.step || 1;
  let body = "";
  if(step===1) body = `
    <div class="field"><label>${t("p_goal")}</label><div class="radio-cards">
      <div class="radio-card${WZ.goal==="quit"?" selected":""}" data-v="quit"><b>${t("p_goal_quit_t")}</b><span>${t("p_goal_quit_d")}</span></div>
      <div class="radio-card${WZ.goal==="cut"?" selected":""}" data-v="cut"><b>${t("p_goal_cut_t")}</b><span>${t("p_goal_cut_d")}</span></div>
    </div></div>`;
  if(step===2) body = `
    <div class="field"><label>${t("p_date")}</label><input type="date" id="wz-date" value="${WZ.quitDate||dayKey(new Date(Date.now()+86400000))}" min="${dayKey()}"><p class="muted small">${t("p_date_d")}</p></div>`;
  if(step===3) body = `
    <div class="field"><label>${t("p_cigs")}</label><input type="number" id="wz-cigs" min="1" max="100" value="${WZ.cigsPerDay||20}"><p class="muted small">${t("p_cigs_d")}</p></div>
    <div class="field"><label>${t("p_price")}</label><input type="number" id="wz-price" min="0" step="10" value="${WZ.packPrice||600}"><p class="muted small">${t("p_price_d")}</p></div>`;
  if(step===4) body = `
    <div class="field"><label>${t("p_trig")}</label><p class="muted small">${t("p_trig_d")}</p>
    <div class="check-list" id="wz-trigs">
      ${TRIGGERS.map(tr=>`<div class="check-item${(WZ.triggers||[]).includes(tr.id)?" selected":""}" data-v="${tr.id}">
        <div class="box">✓</div><span>${tr.icon} ${tr.name[S.lang]}</span></div>`).join("")}
    </div></div>`;
  if(step===5){
    const goalTxt = WZ.goal==="quit"?t("p_goal_quit_t"):t("p_goal_cut_t");
    body = `<h3>${t("p_ready_t")}</h3><p class="muted">${t("p_ready_d")}</p>
      <div class="kv"><span>${t("p_sum_goal")}</span><b>${goalTxt}</b></div>
      <div class="kv"><span>${t("p_sum_date")}</span><b>${esc(WZ.quitDate)}</b></div>
      <div class="kv"><span>${t("p_sum_cigs")}</span><b>${WZ.cigsPerDay}</b></div>
      <div class="kv"><span>${t("p_sum_price")}</span><b>${fmt(WZ.packPrice)} ֏</b></div>`;
  }
  view.innerHTML = `<div class="screen">${card(`
    <h1>${t("p_title")}</h1><p class="muted">${t("p_sub")}</p>
    <p class="muted small">— ${step} / 5 —</p>${body}
    <div class="btn-row" style="margin-top:16px">
      ${step>1?`<button class="btn btn-ghost" style="margin-top:0" id="wz-back">${t("c_back")}</button>`:""}
      <button class="btn btn-primary" id="wz-next">${step===5?t("p_start"):t("c_next")}</button>
    </div>`)}
  </div>`;
  view.querySelectorAll(".radio-card").forEach(el=>el.onclick=()=>{ WZ.goal=el.dataset.v; renderPlan(); });
  const tl = document.getElementById("wz-trigs");
  if(tl) tl.querySelectorAll(".check-item").forEach(el=>el.onclick=()=>{
    WZ.triggers = WZ.triggers||[];
    const v = el.dataset.v;
    if(WZ.triggers.includes(v)) WZ.triggers = WZ.triggers.filter(x=>x!==v);
    else if(WZ.triggers.length<3) WZ.triggers.push(v);
    renderPlan();
  });
  const back = document.getElementById("wz-back");
  if(back) back.onclick = ()=>{ WZ.step--; renderPlan(); };
  document.getElementById("wz-next").onclick = ()=>{
    if(step===1 && !WZ.goal){ toast("—"); return; }
    if(step===2) WZ.quitDate = document.getElementById("wz-date").value || dayKey();
    if(step===3){ WZ.cigsPerDay = Math.max(1, +document.getElementById("wz-cigs").value||20);
                  WZ.packPrice = Math.max(0, +document.getElementById("wz-price").value||0); }
    if(step<5){ WZ.step = step+1; renderPlan(); return; }
    // finish
    S.plan = { goal:WZ.goal||"quit", quitDate:WZ.quitDate||dayKey(), cigsPerDay:WZ.cigsPerDay||20,
               packPrice:WZ.packPrice||0, triggers:WZ.triggers||[] };
    // default if-then plans for chosen triggers
    S.ifthen = (S.plan.triggers||[]).map((id,i)=>({trigger:id, response:["walk","breath","water"][i%3]}));
    save(); WZ = {}; checkTrophies(); toast(t("p_saved")); location.hash = "#/home";
  };
  // log button on dashboard is bound in renderHome; here bind cutdown log too
  const logBtn = document.getElementById("log-cig");
  if(logBtn) logBtn.onclick = ()=>{ const k=dayKey(); S.logged[k]=(S.logged[k]||0)+1; save(); renderHome(); };
}

/* ---------------- SOS ---------------- */
function renderSOS(){
  if(window.Eggs) Eggs.sosOpen();
  view.innerHTML = `<div class="screen">
    ${card(`<h1>🛟 ${t("s_title")}</h1><p>${t("s_sub")}</p>
      <a class="btn btn-sos" href="#/sos" id="sos-big" style="margin:8px 0">${t("s_resist")}</a>`, "hero")}
    ${card(`<h3 style="margin-top:0">${t("s_pick")}</h3><div class="menu-list">
      <a class="menu-item" href="#/sos-delay"><span class="m-ico">⏳</span><span><b>${t("s_d1t")}</b><small>${t("s_d1d")}</small></span></a>
      <a class="menu-item" href="#/sos-breath"><span class="m-ico">🌬️</span><span><b>${t("s_breath_t")}</b><small>${t("s_breath_d")}</small></span></a>
      <a class="menu-item" href="#/sos-urge"><span class="m-ico">🌊</span><span><b>${t("s_urge_t")}</b><small>${t("s_urge_d")}</small></span></a>
      <a class="menu-item" href="#/sos-water"><span class="m-ico">💧</span><span><b>${t("s_d3t")}</b><small>${t("s_d3d")}</small></span></a>
      ${S.buddy?`<a class="menu-item" href="#/sos-buddy"><span class="m-ico">📞</span><span><b>${t("s_buddy_t")}</b><small>${t("s_buddy_d").replace("{name}",esc(S.buddy))}</small></span></a>`:""}
    </div>`)}
  </div>`;
  document.getElementById("sos-big").onclick = (e)=>{ e.preventDefault(); resisted(); };
}
function resisted(){
  S.cravings++; S.exercises++; save(); checkTrophies();
  view.innerHTML = `<div class="screen">${card(
    `<div class="center" style="font-size:3rem">💪</div><h1 class="center">${t("s_win_t")}</h1>
     <p class="center">${t("s_win_d")}</p>
     <a class="btn btn-primary" href="#/home">${t("s_home")}</a>`, "hero")}</div>`;
}
function renderSOSDetail(h){
  const kind = h.split("/")[1] || h;
  if(kind==="sos-delay"){
    let left = 600;
    view.innerHTML = `<div class="screen">${card(
      `<h1>⏳ ${t("s_d1t")}</h1><p>${t("s_d1d")}</p>
       <div class="timer-big" id="tm">10:00</div>
       <div class="progress"><div id="pb" style="width:0%"></div></div>
       <button class="btn btn-primary" id="done" style="display:none">${t("s_resist")}</button>`,"hero")}</div>`;
    const iv = setInterval(()=>{
      left--; const mm = String(Math.floor(left/60)).padStart(2,"0"), ss = String(left%60).padStart(2,"0");
      const el = document.getElementById("tm"); if(!el){ clearInterval(iv); return; }
      el.textContent = mm+":"+ss;
      document.getElementById("pb").style.width = ((600-left)/600*100)+"%";
      if(left<=0){ clearInterval(iv); document.getElementById("done").style.display="block"; el.textContent="✓"; }
    },1000);
    document.getElementById("done").onclick = resisted;
  }
  else if(kind==="sos-breath"){ breathScreen(); }
  else if(kind==="sos-urge"){
    let left = 180, phase = 0;
    view.innerHTML = `<div class="screen">${card(
      `<h1>🌊 ${t("s_urge_t")}</h1><p id="phase">${URGE_PHASES[S.lang][0]}</p>
       <div class="wave">${"<span></span>".repeat(14)}</div>
       <div class="timer-big" id="tm">3:00</div>
       <div class="progress"><div id="pb" style="width:0%"></div></div>
       <button class="btn btn-primary" id="done" style="display:none">${t("s_resist")}</button>`,"hero")}</div>`;
    const iv = setInterval(()=>{
      left--; const el = document.getElementById("tm"); if(!el){ clearInterval(iv); return; }
      el.textContent = Math.floor(left/60)+":"+String(left%60).padStart(2,"0");
      document.getElementById("pb").style.width = ((180-left)/180*100)+"%";
      const np = left<120?2:(left<60?1:0); // reversed: phases advance as time passes
      const pIdx = left>120?0:(left>60?1:2);
      if(pIdx!==phase){ phase=pIdx; document.getElementById("phase").textContent = URGE_PHASES[S.lang][phase]; }
      if(left<=0){ clearInterval(iv); document.getElementById("done").style.display="block"; el.textContent="✓"; }
    },1000);
    document.getElementById("done").onclick = resisted;
  }
  else if(kind==="sos-water"){
    view.innerHTML = `<div class="screen">${card(
      `<div class="center" style="font-size:3rem">💧</div><h1 class="center">${t("s_d3t")}</h1>
       <p class="center">${t("s_d3d")}</p>
       <button class="btn btn-primary" id="done">${t("s_resist")}</button>`,"hero")}</div>`;
    document.getElementById("done").onclick = ()=>{ if(window.Eggs) Eggs.water(); resisted(); };
  }
  else if(kind==="sos-buddy"){
    view.innerHTML = `<div class="screen">${card(
      `<div class="center" style="font-size:3rem">📞</div><h1 class="center">${t("s_buddy_t")}</h1>
       <p class="center">${t("s_buddy_d").replace("{name}","<b>"+esc(S.buddy)+"</b>")}</p>
       <a class="btn btn-apricot" href="sms:?body=${encodeURIComponent("Hey, craving is loud right now. Can you distract me for a few minutes? — via Azat")}">✉️ SMS</a>
       <button class="btn btn-primary" id="done" style="margin-top:8px">${t("s_resist")}</button>`,"hero")}</div>`;
    document.getElementById("done").onclick = resisted;
  }
  else renderSOS();
}
function breathScreen(){
  view.innerHTML = `<div class="screen">${card(
    `<h1 class="center">🌬️ ${t("s_breath_t")}</h1><p class="center muted">${t("s_breath_d")}</p>
     <div class="breath-circle" id="bc"><span id="bt">${t("s_breath_start")}</span></div>
     <p class="center muted" id="round"></p>
     <div class="btn-row"><button class="btn btn-primary" id="go">${t("s_breath_start")}</button>
     <a class="btn btn-ghost" style="margin-top:0" href="#/sos">${t("c_back")}</a></div>
     <button class="btn btn-apricot" id="done" style="display:none;margin-top:8px">${t("s_resist")}</button>`,"hero")}</div>`;
  document.getElementById("go").onclick = ()=>{
    document.getElementById("go").style.display="none";
    const bc = document.getElementById("bc"), bt = document.getElementById("bt"), rd = document.getElementById("round");
    let round = 0;
    const seq = [[t("s_in"),4000,"in"],[t("s_hold"),7000,""],[t("s_out"),8000,"out"]];
    function phase(i){
      if(!document.getElementById("bc")) return;
      if(i>=seq.length){ round++;
        if(round>=3){ bt.textContent="✓"; rd.textContent="";
          document.getElementById("done").style.display="block"; return; }
        rd.textContent = (round+1)+" / 3"; phase(0); return; }
      const [label, ms, cls] = seq[i];
      bt.textContent = label; bc.className = "breath-circle "+cls;
      setTimeout(()=>phase(i+1), ms);
    }
    rd.textContent = "1 / 3"; phase(0);
  };
  document.getElementById("done").onclick = ()=>{ S.exercises++; save(); checkTrophies(); if(window.Eggs) Eggs.breath(); resisted(); };
}

/* ---------------- TRIGGERS ---------------- */
function renderTriggers(){
  const mine = S.ifthen;
  view.innerHTML = `<div class="screen">
    ${card(`<h1>${t("t_title")}</h1><p class="muted">${t("t_sub")}</p>`)}
    ${card(`<h3 style="margin-top:0">${t("t_mine")}</h3>
      <div id="iflist">${mine.length?mine.map((p,i)=>{
        const tr=TRIGGERS.find(x=>x.id===p.trigger), rs=RESPONSES.find(x=>x.id===p.response);
        return `<div class="kv"><span>🔹 ${t("t_if")} <b>${tr.name[S.lang]}</b>, ${t("t_then")} ${rs.text[S.lang]}</span>
          <button class="lang-btn" data-del="${i}">✕</button></div>`; }).join(""):`<p class="muted">—</p>`}</div>`)}
    ${card(`<h3 style="margin-top:0">＋</h3>
      <div class="field"><label>${t("t_if")}…</label><select id="nt-trig">${TRIGGERS.map(x=>`<option value="${x.id}">${x.icon} ${x.name[S.lang]}</option>`).join("")}</select></div>
      <div class="field"><label>…${t("t_then")}</label><select id="nt-resp">${RESPONSES.map(x=>`<option value="${x.id}">${x.icon} ${x.text[S.lang]}</option>`).join("")}</select></div>
      <button class="btn btn-primary" id="nt-add">${t("t_save_plan")}</button>`)}
    ${TRIGGERS.map(tr=>card(`<b>${tr.icon} ${tr.name[S.lang]}</b><p class="muted">${t("t_coping")}</p><p>${tr.coping[S.lang]}</p>`)).join("")}
  </div>`;
  view.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{ S.ifthen.splice(+b.dataset.del,1); save(); renderTriggers(); });
  document.getElementById("nt-add").onclick = ()=>{
    S.ifthen.push({trigger:document.getElementById("nt-trig").value, response:document.getElementById("nt-resp").value});
    save(); toast(t("t_plan_saved")); renderTriggers();
  };
}

/* ---------------- EXERCISES ---------------- */
const EXLIST = [
  {id:"why", icon:"🪞", titleKey:"why_t", descKey:"why_d"},
  {id:"breath", icon:"🌬️", titleKey:"s_breath_t", descKey:"s_breath_d", link:"#/sos-breath"},
  {id:"urge", icon:"🌊", titleKey:"s_urge_t", descKey:"s_urge_d", link:"#/sos-urge"},
  {id:"reasons", icon:"💭", titleKey:"e_reasons_t", descKey:"e_reasons_d"},
  {id:"cost", icon:"🧮", titleKey:"e_cost_t", descKey:"e_cost_d"},
  {id:"values", icon:"⭐", titleKey:"e_values_t", descKey:"e_values_d"},
  {id:"buddy", icon:"📞", titleKey:"e_buddy_t", descKey:"e_buddy_d"},
];
function renderExercises(){
  view.innerHTML = `<div class="screen">
    ${card(`<h1>${t("e_title")}</h1><p class="muted">${t("e_sub")}</p>`)}
    <div class="menu-list">${EXLIST.map(e=>`
      <a class="menu-item" href="${e.link||"#/ex-"+e.id}"><span class="m-ico">${e.icon}</span>
      <span><b>${t(e.titleKey)}</b><small>${t(e.descKey)}</small></span></a>`).join("")}</div>
  </div>`;
}
function renderExerciseDetail(h){
  const id = h.replace("ex-","");
  if(id==="reasons"){
    view.innerHTML = `<div class="screen">${card(`<h1>💭 ${t("e_reasons_t")}</h1><p class="muted">${t("e_reasons_d")}</p>
      <div id="rlist">${S.reasons.length?S.reasons.map((r,i)=>`<div class="kv"><span>💬 ${esc(r)}</span><button class="lang-btn" data-del="${i}">✕</button></div>`).join(""):`<p class="muted">${t("e_reasons_empty")}</p>`}</div>
      <div class="field"><input type="text" id="rin" placeholder="${esc(t("e_reasons_ph"))}"></div>
      <button class="btn btn-primary" id="radd">${t("e_reasons_add")}</button>`)}
    </div>`;
    view.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{ S.reasons.splice(+b.dataset.del,1); save(); renderExerciseDetail(h); });
    document.getElementById("radd").onclick = ()=>{
      const v = document.getElementById("rin").value.trim(); if(!v) return;
      S.reasons.push(v); S.exercises++; save(); checkTrophies(); renderExerciseDetail(h);
    };
  }
  else if(id==="cost"){
    const per = (S.plan&&S.plan.cigsPerDay)||20, price = (S.plan&&S.plan.packPrice)||600;
    const yr = Math.round(per*365/20*price), y10 = yr*10;
    view.innerHTML = `<div class="screen">${card(`<h1>🧮 ${t("e_cost_t")}</h1><p class="muted">${t("e_cost_d")}</p>
      <div class="kv"><span>${t("e_cost_year")}</span><b style="color:var(--red)">${fmt(yr)} ֏</b></div>
      <div class="kv"><span>${t("e_cost_10")}</span><b style="color:var(--red)">${fmt(y10)} ֏</b></div>
      <p class="muted small">${t("d_money")}: <b>${fmt(moneySaved())} ֏</b></p>
      <button class="btn btn-primary" id="ok">${t("c_done")}</button>`)}
    </div>`;
    document.getElementById("ok").onclick = ()=>{ S.exercises++; save(); checkTrophies(); location.hash="#/exercises"; };
  }
  else if(id==="values"){
    view.innerHTML = `<div class="screen">${card(`<h1>⭐ ${t("e_values_t")}</h1><p class="muted">${t("e_values_d")}</p>
      <div class="check-list" id="vl">${VALUES.map(v=>`
        <div class="check-item${S.values.includes(v.id)?" selected":""}" data-v="${v.id}"><div class="box">✓</div><span>${v.icon} ${v.text[S.lang]}</span></div>`).join("")}</div>
      <button class="btn btn-primary" id="ok" style="margin-top:12px">${t("c_done")}</button>`)}
    </div>`;
    document.getElementById("vl").querySelectorAll(".check-item").forEach(el=>el.onclick=()=>{
      const v = el.dataset.v;
      if(S.values.includes(v)) S.values = S.values.filter(x=>x!==v);
      else if(S.values.length<3) S.values.push(v);
      el.classList.toggle("selected");
    });
    document.getElementById("ok").onclick = ()=>{ S.exercises++; save(); checkTrophies(); toast(t("e_values_done")); location.hash="#/exercises"; };
  }
  else if(id==="buddy"){
    view.innerHTML = `<div class="screen">${card(`<h1>📞 ${t("e_buddy_t")}</h1><p class="muted">${t("e_buddy_d")}</p>
      <div class="field"><input type="text" id="bin" value="${esc(S.buddy)}" placeholder="${esc(t("e_buddy_ph"))}"></div>
      <button class="btn btn-primary" id="ok">${t("e_buddy_save")}</button>`)}
    </div>`;
    document.getElementById("ok").onclick = ()=>{ S.buddy = document.getElementById("bin").value.trim(); S.exercises++; save(); checkTrophies(); location.hash="#/exercises"; };
  }
  else if(id==="why"){ renderWhy(); }
  else renderExercises();
}

/* ---- the "Why do I smoke?" guided module ---- */
function renderWhy(){
  const w = S.why || {};
  if(w.doneAt){ renderWhyDone(); return; }
  view.innerHTML = `<div class="screen">${card(`<h1>🪞 ${t("why_t")}</h1><p class="muted">${t("why_d")}</p>
    <div class="field"><label>${t("why_q_age")}</label><input type="number" id="w-age" min="5" max="90" value="${w.age||""}" placeholder="${esc(t("why_q_age_ph"))}"></div>
    <div class="field"><label>${t("why_q_with")}</label><input type="text" id="w-with" value="${esc(w.with||"")}" placeholder="${esc(t("why_q_with_ph"))}"></div>
    <div class="field"><label>${t("why_q_gives")}</label><div class="check-list" id="w-gives">
      ${GIVES.map(g=>`<div class="check-item${(w.gives||[]).includes(g.id)?" selected":""}" data-v="${g.id}"><div class="box">✓</div><span>${g.icon} ${t("g_"+g.id)}</span></div>`).join("")}
    </div></div>
    <div class="field"><label>${t("why_q_family")}</label><div class="radio-cards" id="w-fam">
      ${["a1","a2","a3","skip"].map(a=>`<div class="radio-card${w.family===a?" selected":""}" data-v="${a}"><b>${t("why_fam_"+a)}</b></div>`).join("")}
    </div></div>
    <div class="field"><label>${t("why_q_replace")}</label><textarea id="w-rep" rows="2" placeholder="${esc(t("why_q_replace_ph"))}">${esc(w.replace||"")}</textarea></div>
    <div class="btn-row"><button class="btn btn-ghost" style="margin-top:0" id="w-skip">${t("why_skip")}</button>
    <button class="btn btn-primary" id="w-save">${t("c_save")}</button></div>`)}
  </div>`;
  document.getElementById("w-gives").querySelectorAll(".check-item").forEach(el=>el.onclick=()=>{
    el.classList.toggle("selected");
  });
  document.getElementById("w-fam").querySelectorAll(".radio-card").forEach(el=>el.onclick=()=>{
    document.getElementById("w-fam").querySelectorAll(".radio-card").forEach(x=>x.classList.remove("selected"));
    el.classList.add("selected");
  });
  const collect = (done)=>{
    const gives = [...document.querySelectorAll("#w-gives .check-item.selected")].map(x=>x.dataset.v);
    const fam = (document.querySelector("#w-fam .radio-card.selected")||{}).dataset?.v || null;
    S.why = { age: document.getElementById("w-age").value||null, with: document.getElementById("w-with").value.trim()||null,
              gives, family: fam, replace: document.getElementById("w-rep").value.trim()||null, doneAt: done?Date.now():null };
    if(done){ S.exercises++; }
    save(); checkTrophies();
  };
  document.getElementById("w-save").onclick = ()=>{ collect(true); toast(t("why_saved")); renderWhyDone(); };
  document.getElementById("w-skip").onclick = ()=>{ collect(false); location.hash="#/exercises"; };
}
function renderWhyDone(){
  const w = S.why||{};
  const fam = w.family==="a1"||w.family==="a2";
  const tools = [...new Set((w.gives||[]).flatMap(g=>GIVES_TOOLS[g]||[]))];
  const toolLink = { tool_walk:"#/sos", tool_breath:"#/sos-breath", tool_buddy:"#/sos-buddy",
                     tool_water:"#/sos-water", tool_delay:"#/sos-delay", tool_trophy:"#/trophies" };
  view.innerHTML = `<div class="screen">${card(`<h1>🪞 ${t("why_done_t")}</h1>
    ${w.age?`<div class="kv"><span>${t("why_q_age")}</span><b>${esc(w.age)}</b></div>`:""}
    ${w.with?`<div class="kv"><span>${t("why_q_with")}</span><b>${esc(w.with)}</b></div>`:""}
    ${(w.gives||[]).length?`<div class="kv"><span>${t("why_q_gives")}</span><b>${w.gives.map(g=>t("g_"+g)).join(", ")}</b></div>`:""}
    ${w.replace?`<p>💭 <i>“${esc(w.replace)}”</i></p>`:""}
    <div class="divider"></div>
    <p>${fam ? t("why_done_family") : t("why_done_nofamily")}</p>
    ${tools.length?`<h3>${t("why_tools")}</h3><div class="menu-list">${tools.map(k=>
      `<a class="menu-item" href="${toolLink[k]}"><span class="m-ico">→</span><span><b>${t(k)}</b></span></a>`).join("")}</div>`:""}
    <div style="margin-top:12px"><a class="btn btn-ghost" href="#/exercises">${t("c_back")}</a></div>`,"hero")}
  </div>`;
}

/* ---------------- TROPHIES ---------------- */
function renderTrophies(){
  const wonN = S.trophiesWon.length;
  view.innerHTML = `<div class="screen">
    ${card(`<h1>🏆 ${t("tr_title")}</h1><p class="muted">${t("tr_sub")}</p>
      <div class="progress"><div style="width:${Math.round(wonN/TROPHIES.length*100)}%"></div></div>
      <p class="muted small">${wonN} / ${TROPHIES.length} ${t("tr_won")}</p>`,"hero")}
    <div class="trophy-grid">${TROPHIES.map(trophyHTML).join("")}</div>
  </div>`;
}

/* ---------------- LEARN ---------------- */
function renderLearn(){
  view.innerHTML = `<div class="screen">
    ${card(`<h1>📚 ${t("l_title")}</h1><p class="muted">${t("l_sub")}</p>`,"hero")}
    ${LEARN.map(c=>card(`<h3 style="margin-top:0">${c.title[S.lang]}</h3><p>${c.body[S.lang]}</p>
      <div class="cite">📎 ${c.sources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join(" · ")}</div>`,"learn-card")).join("")}
    ${card(`<h3 style="margin-top:0">${t("l_sources")}</h3><p class="muted small">
      WHO · CDC · Cochrane Library · U.S. Community Preventive Services Task Force · UN Interagency Task Force on NCDs</p>`)}
  </div>`;
}

/* ---------------- ABOUT ---------------- */
function renderAbout(){
  const paras = t("about_story").split("\n\n");
  view.innerHTML = `<div class="screen">
    ${card(`<h1>👋 ${t("about_title")}</h1>
      ${paras.map(p=>`<p>${esc(p)}</p>`).join("")}
      <p><b>Raphael Malikian</b><br>📧 <a href="mailto:rtmalikian@gmail.com">rtmalikian@gmail.com</a></p>
      <p class="muted small">${t("about_note")}</p>`,"hero")}
  </div>`;
}

/* ---------------- MENU ---------------- */
function renderMenu(){
  const items = [
    ["#/plan","🗺️","m_plan","m_plan_d"],["#/triggers","🎯","m_triggers","m_triggers_d"],
    ["#/exercises","🏋️","m_exercises","m_exercises_d"],["#/learn","📚","m_learn","m_learn_d"],
    ["#/about","👋","m_about","m_about_d"],
    ["#/settings","⚙️","m_settings","m_settings_d"],
  ];
  if(S.lore && S.lore.length) items.push(["#/lore","✦","m_lore","m_lore_d"]);
  view.innerHTML = `<div class="screen">${card(`<h1>${t("nav_menu")}</h1>`)}
    <div class="menu-list">${items.map(([href,ic,tk,dk])=>`
      <a class="menu-item" href="${href}"><span class="m-ico">${ic}</span><span><b>${t(tk)}</b><small>${t(dk)}</small></span></a>`).join("")}</div>
  </div>`;
}

/* ---------------- SETTINGS ---------------- */
function renderSettings(){
  const cfgOn = AzatNotify.isEnabled();
  view.innerHTML = `<div class="screen">
    ${card(`<h1>⚙️ ${t("se_title")}</h1>`)}
    ${card(`<h3 style="margin-top:0">${t("se_lang")}</h3>
      <div class="btn-row">
        <button class="btn ${S.lang==="hy"?"btn-primary":"btn-ghost"}" style="margin-top:0" data-l="hy">Հայերեն</button>
        <button class="btn ${S.lang==="ru"?"btn-primary":"btn-ghost"}" style="margin-top:0" data-l="ru">Русский</button>
        <button class="btn ${S.lang==="en"?"btn-primary":"btn-ghost"}" style="margin-top:0" data-l="en">English</button>
      </div>`)}
    ${card(`<h3 style="margin-top:0">🔔 ${t("se_notif")}</h3><p class="muted">${t("se_notif_d")}</p>
      <div class="field"><label>${t("se_time")}</label><input type="time" id="nt-time" value="${AzatNotify.getTime()}"></div>
      <div class="btn-row">
        <button class="btn ${cfgOn?"btn-ghost":"btn-primary"}" style="margin-top:0" id="nt-toggle">${cfgOn?t("c_cancel"):t("se_notif")}</button>
        <button class="btn btn-ghost" style="margin-top:0" id="nt-test">${t("se_test")}</button>
      </div>
      <p class="muted small" id="nt-msg">${cfgOn?"":t("se_perm")}</p>`)}
    ${card(`<h3 style="margin-top:0">💾</h3>
      <div class="btn-row"><button class="btn btn-ghost" style="margin-top:0" id="exp">${t("se_export")}</button>
      <button class="btn btn-ghost" style="margin-top:0" id="imp">📥 ${t("se_import")}</button></div>
      <input type="file" id="imp-file" accept="application/json,.json" style="display:none">
      <div style="margin-top:8px"><button class="btn btn-ghost" style="margin-top:0" id="rst">🗑️ ${t("se_reset")}</button></div>`)}
    ${card(`<h3 style="margin-top:0">${t("se_about")}</h3>
      <p><b>Azat Ազատ</b> — ${t("tagline")}.</p>
      <p class="muted small">${t("se_privacy")}</p>
      <p class="muted small">v1.0 · <span id="egg-ver" style="cursor:pointer">✦</span> · <span id="egg-nur" style="cursor:pointer;color:#B3001B;font-weight:bold">նուռ</span></p>`)}
  </div>`;
  view.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>setLang(b.dataset.l));
  document.getElementById("nt-toggle").onclick = async ()=>{
    if(AzatNotify.isEnabled()){ AzatNotify.disable(); renderSettings(); }
    else{
      const tm = document.getElementById("nt-time").value || "09:00";
      const r = await AzatNotify.enable(tm);
      document.getElementById("nt-msg").textContent = r==="granted" ? "✓" : t("se_perm");
      renderSettings();
    }
  };
  document.getElementById("nt-test").onclick = async ()=>{
    const ok = await AzatNotify.test();
    toast(t("se_test_sent"));
  };
  document.getElementById("exp").onclick = ()=>{
    const blob = new Blob([JSON.stringify(S,null,2)],{type:"application/json"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "azat-data.json"; a.click(); toast(t("se_exported"));
  };
  document.getElementById("rst").onclick = ()=>{
    if(confirm(t("se_reset_q"))){ localStorage.removeItem(LS); location.reload(); }
  };
  document.getElementById("imp").onclick = ()=>document.getElementById("imp-file").click();
  document.getElementById("imp-file").onchange = (e)=>{
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = ()=>{
      try{
        const obj = JSON.parse(r.result);
        if(!obj || typeof obj !== "object" || !("lang" in obj && "checkins" in obj)) throw 0;
        S = Object.assign(DEF(), obj); save();
        toast(t("se_import_done")); setTimeout(()=>location.reload(), 900);
      }catch(_){ toast(t("se_import_fail")); }
    };
    r.readAsText(f);
  };
}

/* ---------------- boot ---------------- */
document.querySelectorAll(".lang-btn[data-lang]").forEach(b=>b.onclick=()=>setLang(b.dataset.lang));
document.documentElement.lang = S.lang;
applyLang();
AzatNotify.init();

/* Self-update: if the service worker finds a newer app version, reload once
   into it. Without this, phones can sit on a stale cached copy indefinitely. */
if("serviceWorker" in navigator){
  const hadController = !!navigator.serviceWorker.controller;
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", ()=>{
    if(!hadController || refreshing) return; refreshing = true;
    toast(t("update_found")); setTimeout(()=>window.location.reload(), 1500);
  });
  navigator.serviceWorker.getRegistration().then(r=>{ if(r) r.update(); }).catch(()=>{});
}

/* Accessibility: custom radio/checkbox cards expose roles, keyboard support,
   and checked state to assistive tech (they're divs, not native inputs). */
function tagA11y(root){
  const scope = root.querySelectorAll ? root : document;
  scope.querySelectorAll(".radio-card").forEach(el=>{
    el.setAttribute("role","radio");
    el.setAttribute("tabindex","0");
    el.setAttribute("aria-checked", el.classList.contains("selected") ? "true" : "false");
  });
  scope.querySelectorAll(".check-item").forEach(el=>{
    el.setAttribute("role","checkbox");
    el.setAttribute("tabindex","0");
    el.setAttribute("aria-checked", el.classList.contains("selected") ? "true" : "false");
  });
}
document.addEventListener("keydown", (e)=>{
  const el = e.target && e.target.closest ? e.target.closest(".radio-card,.check-item") : null;
  if(el && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); el.click(); }
});
new MutationObserver((muts)=>{
  for(const m of muts){
    if(m.type === "attributes" && m.attributeName === "class") tagA11y(m.target);
    if(m.type === "childList") m.addedNodes.forEach(n=>{ if(n.nodeType === 1) tagA11y(n); });
  }
}).observe(document.getElementById("view"), { childList:true, subtree:true, attributes:true, attributeFilter:["class"] });
tagA11y(document);

router();
