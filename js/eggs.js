/* Azat easter eggs — Armenian lore, hidden trophies, lore codex.
   Self-contained: content, triggers, and codex live here. Hooks into app.js
   via guarded window.Eggs calls (see app.js: setLang, renderSOS, checkTrophies,
   check-in/lapse handlers, water & breath tools). */

/* ---------- UI strings ---------- */
const EGG_UI = {
en:{
  egg_found:"🥚 Secret discovered!",
  tr_secret:"Secret trophy — hidden somewhere in the app…",
  lore_title:"Legends",
  lore_sub:"Armenian legends you've uncovered on the road.",
  m_lore:"Legends", m_lore_d:"Secrets you've found",
},
ru:{
  egg_found:"🥚 Секрет раскрыт!",
  tr_secret:"Секретная награда — спрятана где-то в приложении…",
  lore_title:"Легенды",
  lore_sub:"Армянские легенды, найденные тобой в пути.",
  m_lore:"Легенды", m_lore_d:"Найденные тобой секреты",
},
hy:{
  egg_found:"🥚 Գաղտնիք բացահայտվեց։",
  tr_secret:"Գաղտնի մրցանակ — ինչ-որ տեղ թաքնված ա հավելվածում…",
  lore_title:"Ավանդություններ",
  lore_sub:"Հայկական ավանդություններ, որ գտել ես ճանապարհին։",
  m_lore:"Ավանդություններ", m_lore_d:"Գտած գաղտնիքներդ",
}};
for (const l of ["en","ru","hy"]) Object.assign(STRINGS[l], EGG_UI[l]);

/* ---------- lore registry ---------- */
const LORE = {
ark:{ icon:"🕊️", trophy:"egg_ark",
  title:{en:"The Ark on Ararat", ru:"Ковчег на Арарате", hy:"Տապանը Արարատի վրա"},
  text:{en:"Legend says that after the flood, Noah's Ark came to rest on Ararat — and the world began again. Every smoke-free morning is your own small new beginning.",
        ru:"Легенда гласит: после потопа Ноев ковчег остановился на Арарате — и мир начался заново. Каждое утро без сигарет — твоё маленькое новое начало.",
        hy:"Ավանդությունն ասում ա՝ ջրհեղեղից հետո Նոյի տապանը կանգնել ա Արարատի վրա, ու աշխարհը նորից ա սկսվել։ Ամեն առավոտ առանց ծխախոտի քո փոքր նոր սկիզբն ա։"},
  hint:{en:"Something glimmers beneath the mountain…", ru:"Что-то мерцает под горой…", hy:"Սարի տակ ինչ-որ բան փայլում ա…"} },
vishap:{ icon:"🐉", trophy:"egg_vishap",
  title:{en:"Vahagn the Dragon-reaper", ru:"Ваагн Вишапаках", hy:"Վահագն Վիշապաքաղը"},
  text:{en:"Vahagn Vishapakagh — “the dragon-reaper” — was the old Armenian god of fire and thunder, who slew the vishaps, the dragons of the deep waters. Every craving you outlast is a small dragon slain.",
        ru:"Ваагн Вишапаках — «убийца драконов» — был древнеармянским богом огня и грома, сражавшим вишапов, драконов глубоких вод. Каждая тяга, которую ты пережил, — маленький поверженный дракон.",
        hy:"Վահագն Վիշապաքաղը՝ հին հայոց կրակի ու ամպրոպի աստվածը, կռվում էր վիշապների՝ խոր ջրերի վիշապների դեմ։ Ամեն գայթակղություն, որ դիմանում ես, մի փոքր վիշապ ա, որ սպանում ես։"},
  hint:{en:"Type the dragon's name…", ru:"Напечатай имя дракона…", hy:"Գրիր վիշապի անունը…"} },
hayk:{ icon:"🏹", trophy:"egg_hayk",
  title:{en:"Hayk the Forefather", ru:"Айк Наапет", hy:"Հայկ Նահապետը"},
  text:{en:"Hayk Nahapet, the legendary forefather of Armenians, drew his bow against the tyrant Bel and freed his people with a single arrow. Aim at the tyrant — nicotine — like Hayk.",
        ru:"Айк Наапет, легендарный прародитель армян, натянул лук против тирана Бэла и одной стрелой освободил свой народ. Целься в тирана — никотин — как Айк.",
        hy:"Հայկ նահապետը՝ հայոց առասպելական նախահայրը, իր աղեղով հաղթեց բռնակալ Բելին ու ազատեց իր ժողովրդին։ Նշան բռնիր բռնակալի վրա՝ նիկոտինի, Հայկի պես։"},
  hint:{en:"Type the archer's name…", ru:"Напечатай имя лучника…", hy:"Գրիր նետաձիգի անունը…"} },
proverbs:{ icon:"🦉", trophy:"egg_proverb",
  title:{en:"Proverbs", ru:"Пословицы", hy:"Առածները"},
  text:{en:"Armenian village life ran on proverbs — a whole philosophy in a single line, passed from grandparent to grandchild like a recipe. Here's one for the road:",
        ru:"Армянская деревенская жизнь держалась на пословицах — целая философия в одной строке, передавалась от бабушки к внуку, как рецепт. Вот одна в дорогу:",
        hy:"Հայկական գյուղը առածներով էր ապրում՝ մի ամբողջ փիլիսոփայություն մեկ տողի մեջ, տատիկից թոռանը՝ բաղադրատոմսի պես։ Ահա մեկը ճանապարհի համար."},
  hint:{en:"Wisdom hides in the daily tip…", ru:"Мудрость прячется в совете дня…", hy:"Իմաստությունը թաքնված ա օրվա խորհրդի մեջ…"} },
mashtots:{ icon:"✍️", trophy:"egg_mashtots",
  title:{en:"Mesrop Mashtots", ru:"Месроп Маштоц", hy:"Մեսրոպ Մաշտոցը"},
  text:{en:"In 405 AD, Mesrop Mashtots created the Armenian alphabet so his people could read in their own tongue. You just read the same app in three languages. Heir indeed.",
        ru:"В 405 году Месроп Маштоц создал армянский алфавит, чтобы его народ читал на своём языке. Ты только что прочитал одно приложение на трёх языках. Наследник, не иначе.",
        hy:"405 թվին Մեսրոպ Մաշտոցը հայոց այբուբենն ա ստեղծել, որ իր ժողովուրդը կարդա իր լեզվով։ Դու հենց նոր նույն հավելվածը կարդացիր երեք լեզվով։ Ժառանգ ես, իսկապես։"},
  hint:{en:"Speak in tongues…", ru:"Говори на языках…", hy:"Խոսիր լեզուներով…"} },
lusin:{ icon:"🌙", trophy:"egg_lusin",
  title:{en:"Lusin, the Moon", ru:"Лусин", hy:"Լուսինը"},
  text:{en:"Lusin is the old Armenian spirit of the moon — guardian of night owls. Cravings love the night, but so does the moon, and it's on your side.",
        ru:"Лусин — древнеармянский дух луны, покровитель полуночников. Тяга любит ночь, но луна тоже любит ночь — и она на твоей стороне.",
        hy:"Լուսինը հին հայոց լուսնի ոգին ա՝ գիշերային բուերի պահապանը։ Գայթակղությունը գիշերն ա սիրում, բայց լուսինն էլ ա գիշերը սիրում, ու նա քո կողմից ա։"},
  hint:{en:"Visit when the moon is high…", ru:"Загляни, когда луна высоко…", hy:"Այցելիր, երբ լուսինը բարձր ա…"} },
sevan:{ icon:"🌊", trophy:"egg_sevan",
  title:{en:"Lake Sevan", ru:"Озеро Севан", hy:"Սևանա լիճը"},
  text:{en:"Sevan — the blue eye of Armenia — sits a mile high among the mountains. Cold, clear, ancient: like the water you're drinking instead of smoking.",
        ru:"Севан — голубое око Армении — лежит на высоте мили среди гор. Холодный, чистый, древний — как вода, которую ты пьёшь вместо сигареты.",
        hy:"Սևանը՝ Հայաստանի կապույտ աչքը, սարերի մեջ՝ մի մղոն բարձրության վրա։ Սառը, մաքուր, հնադարյան՝ ինչպես այն ջուրը, որ խմում ես ծխելու փոխարեն։"},
  hint:{en:"Drink deep…", ru:"Пей глубоко…", hy:"Խորը խմիր…"} },
duduk:{ icon:"🎵", trophy:"egg_duduk",
  title:{en:"The Duduk", ru:"Дудук", hy:"Դուդուկը"},
  text:{en:"The duduk is carved from apricot wood — tsiranapogh, “apricot pipe” — and they say its sound is the soul of Armenia. Breathe the way the duduk plays: slow, deep, unhurried.",
        ru:"Дудук вырезают из абрикосового дерева — циранапох, «абрикосовая дудочка», — и говорят, его звук — душа Армении. Дыши так, как играет дудук: медленно, глубоко, не спеша.",
        hy:"Դուդուկը ծիրանի փայտից ա՝ ծիրանափող, ու ասում են՝ նրա ձայնը հայի հոգին ա։ Շնչիր ինչպես դուդուկն ա նվագում՝ դանդաղ, խորը, առանց շտապելու։"},
  hint:{en:"Breathe with the music…", ru:"Дыши вместе с музыкой…", hy:"Շնչիր երաժշտության հետ…"} },
sasun:{ icon:"⚔️", trophy:"egg_sasun",
  title:{en:"David of Sassoun", ru:"Давид Сасунский", hy:"Սասունցի Դավիթը"},
  text:{en:"David of Sassoun, hero of the great Armenian epic, faced four cycles of trials. You faced three cravings in a single day and stood your ground. That's epic.",
        ru:"Давид Сасунский, герой великого армянского эпоса, прошёл четыре круга испытаний. Ты за один день выстоял против трёх тяг. Это эпос.",
        hy:"Սասունցի Դավիթը՝ հայոց մեծ էպոսի հերոսը, չորս շրջան փորձությունների միջով ա անցել։ Դու մեկ օրում երեք գայթակղության դիմացար ու կանգնած մնացիր։ Էպոս ա։"},
  hint:{en:"Heroes ask for help…", ru:"Герои просят о помощи…", hy:"Հերոսները օգնություն են խնդրում…"} },
ara:{ icon:"🌅", trophy:"egg_ara",
  title:{en:"Ara the Beautiful", ru:"Ара Прекрасный", hy:"Արա Գեղեցիկը"},
  text:{en:"Legend says that when Ara the Beautiful fell, the Aralez — the old spirits — tried to lick his wounds and bring him back. A lapse is not the end of the story. You came back. That's the whole point.",
        ru:"Легенда гласит: когда пал Ара Прекрасный, аралезы — древние духи — пытались зализать его раны и вернуть к жизни. Срыв — не конец истории. Ты вернулся. В этом весь смысл.",
        hy:"Ավանդությունն ասում ա՝ երբ Արա Գեղեցիկն ընկավ, Արալեզները՝ հին ոգիները, փորձեցին լիզել նրա վերքերն ու հետ բերել կյանք։ Սայթաքումը պատմության վերջը չի։ Դու հետ եկար։ Հենց դա ա ամենակարևորը։"},
  hint:{en:"Everyone falls; the legend is in rising…", ru:"Все падают; легенда — в том, чтобы встать…", hy:"Բոլորն են ընկնում, առասպելը վեր կենալու մեջ ա…"} },
nuri:{ icon:"🔴", trophy:"egg_nuri",
  title:{en:"The Pomegranate", ru:"Гранат", hy:"Նուռը"},
  text:{en:"The pomegranate — nur — is Armenia's fruit of abundance; they say it holds as many seeds as there are days in the year. Every smoke-free day is a seed.",
        ru:"Гранат — нур — плод изобилия Армении; говорят, в нём столько зёрен, сколько дней в году. Каждый свободный день — зёрнышко.",
        hy:"Նուռը Հայաստանի առատության միրգն ա. ասում են՝ այնքան հատիկ ունի, քանի օր կա տարվա մեջ։ Ամեն ազատ օր մի հատիկ ա։"},
  hint:{en:"Something red hides in About…", ru:"Что-то красное прячется в «О приложении»…", hy:"Ինչ-որ կարմիր բան թաքնված ա «Մասին»-ում…"} },
aragats:{ icon:"⛰️", trophy:"egg_aragats",
  title:{en:"Mount Aragats", ru:"Арагац", hy:"Արագածը"},
  text:{en:"Aragats, Armenia's highest mountain, has four peaks — and legend says St. Gregory's lantern still burns on its summit. You've climbed four peaks; the lantern is lit.",
        ru:"Арагац, высочайшая гора Армении, — с четырьмя вершинами; легенда гласит, фонарь святого Григория до сих пор горит на её вершине. Ты поднялся на четыре вершины — фонарь зажжён.",
        hy:"Արագածը՝ Հայաստանի ամենաբարձր սարը, չորս գագաթ ունի, ու ավանդությունն ասում ա՝ Սուրբ Գրիգորի լապտերը դեռ վառվում ա նրա գագաթին։ Չորս գագաթ բարձրացար. լապտերը վառված ա։"},
  hint:{en:"Climb four peaks…", ru:"Поднимись на четыре вершины…", hy:"Բարձրացիր չորս գագաթ…"} },
};

const PROVERBS = [
  {en:"Drop by drop, a sea is formed.", ru:"Капля за каплей — и вот уже море.", hy:"Կաթիլ-կաթիլ ծով կդառնա։"},
  {en:"Don't fear going slowly — fear standing still.", ru:"Не бойся идти медленно — бойся стоять на месте.", hy:"Մի՛ վախեցիր դանդաղ գնալուց, վախեցի՛ր կանգնելուց։"},
  {en:"A tree is known by its fruit.", ru:"Дерево познаётся по плодам.", hy:"Ծառը պտուղով կճանաչվի։"},
  {en:"Without sweat, there is no bread.", ru:"Без пота нет хлеба.", hy:"Առանց քրտինքի հաց չկա։"},
  {en:"Strength is in unity.", ru:"Сила — в единстве.", hy:"Ուժը միաբանության մեջ ա։"},
];

/* ---------- engine ---------- */
function closeEgg(){ const m = document.getElementById("egg-modal"); if(m) m.remove(); }

const Eggs = {
  st(){ S.egg = S.egg || {}; return S.egg; },
  bump(key, n){
    const e = this.st(); e[key] = (e[key]||0) + (n==null?1:n); save(); return e[key];
  },
  discover(id){
    const L = LORE[id]; if(!L) return;
    if(!S.lore.includes(id)){
      S.lore.push(id);
      if(!S.trophiesWon.includes(L.trophy)){
        S.trophiesWon.push(L.trophy); save();
        const tr = TROPHIES.find(x=>x.id===L.trophy);
        if(tr){ toast("🏆 "+tr.name[S.lang], "trophy");
          if(window.AzatNotify && AzatNotify.isEnabled()) AzatNotify.milestone(tr.name[S.lang]+" — "+tr.desc[S.lang]); }
      } else save();
      toast(t("egg_found"));
    }
    this.showModal(id);
  },
  showModal(id){
    const L = LORE[id]; if(!L) return;
    closeEgg();
    const tr = TROPHIES.find(x=>x.id===L.trophy);
    const prov = id==="proverbs" ? `<p class="egg-proverb">“${PROVERBS[Math.floor(Math.random()*PROVERBS.length)][S.lang]}”</p>` : "";
    const ov = document.createElement("div");
    ov.className = "egg-modal"; ov.id = "egg-modal";
    ov.innerHTML = `<div class="egg-card" role="dialog" aria-modal="true" aria-label="${esc(L.title[S.lang])}">
      <div class="egg-icon">${L.icon}</div>
      <h2 style="margin:8px 0">${esc(L.title[S.lang])}</h2>
      ${prov}
      <p>${esc(L.text[S.lang])}</p>
      ${tr?`<p class="egg-trophy">🏆 <b>${esc(tr.name[S.lang])}</b><br><small class="muted">${esc(tr.desc[S.lang])}</small></p>`:""}
      <button class="btn btn-primary" id="egg-close">${t("c_done")}</button>
    </div>`;
    ov.addEventListener("click", e=>{ if(e.target===ov) closeEgg(); });
    document.body.appendChild(ov);
    document.getElementById("egg-close").onclick = closeEgg;
  },
  proverb(){
    if(S.lore.includes("proverbs")) this.showModal("proverbs");
    else this.discover("proverbs");
  },
  /* counter hooks called from app.js */
  water(){ if(this.bump("water")>=10 && !S.lore.includes("sevan")) this.discover("sevan"); },
  breath(){ if(this.bump("breath")>=3 && !S.lore.includes("duduk")) this.discover("duduk"); },
  sosOpen(){
    const e = this.st(), k = dayKey();
    if(e.sosDay!==k){ e.sosDay=k; e.sosN=0; }
    e.sosN++; save();
    if(e.sosN>=3 && S.checkins[k]!=="lapse" && !S.lore.includes("sasun")) this.discover("sasun");
  },
  onLapse(){ this.st().araArmed = true; save(); },
  onClean(){
    const e = this.st();
    if(e.araArmed){ e.araArmed = false; save(); this.discover("ara"); }
  },
  onTrophies(){
    if(!S.lore.includes("aragats") && S.trophiesWon.length>=4) this.discover("aragats");
  },
  midnight(){
    if(new Date().getHours()!==0) return;
    const e = this.st(), k = dayKey();
    if(e.lusinDay!==k){ e.lusinDay = k; save(); this.discover("lusin"); }
  },
  renderCodex(){
    const ids = Object.keys(LORE);
    view.innerHTML = `<div class="screen">
      ${card(`<h1>✦ ${t("lore_title")}</h1><p class="muted">${t("lore_sub")}</p>
        <div class="progress"><div style="width:${Math.round(S.lore.length/ids.length*100)}%"></div></div>
        <p class="muted small">${S.lore.length} / ${ids.length}</p>`,"hero")}
      <div class="menu-list">${ids.map(id=>{
        const L = LORE[id], found = S.lore.includes(id);
        return found
          ? `<div class="menu-item" style="cursor:default"><span class="m-ico">${L.icon}</span><span><b>${esc(L.title[S.lang])}</b><small>${esc(L.text[S.lang])}</small></span></div>`
          : `<div class="menu-item" style="cursor:default;opacity:.55"><span class="m-ico">🔒</span><span><b>???</b><small>${esc(L.hint[S.lang])}</small></span></div>`;
      }).join("")}</div>
    </div>`;
  },
  init(){
    /* tap targets (delegated — survives re-renders) */
    document.addEventListener("click", e=>{
      const q = s => e.target.closest && e.target.closest(s);
      if(q("#egg-ark-tap")){
        if(this.bump("arktap")>=7 && !S.lore.includes("ark")) this.discover("ark");
      } else if(q("#egg-prov-tap")){
        if(this.bump("provtap")%5===0) this.proverb();
      } else if(q("#egg-nur")){
        this.discover("nuri");
      } else if(q("#egg-ver")){
        if(this.bump("ver")>=5){ this.st().ver = 0; save(); location.hash = "#/lore"; }
      }
    });
    /* typed secrets: vishap, hayk */
    let buf = "";
    document.addEventListener("keydown", e=>{
      const tag = (e.target && e.target.tagName) || "";
      if(/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      if(e.key && e.key.length===1 && /[a-z]/i.test(e.key)){
        buf = (buf + e.key.toLowerCase()).slice(-12);
        if(buf.endsWith("vishap")){ buf = ""; this.discover("vishap"); }
        else if(buf.endsWith("hayk")){ buf = ""; this.discover("hayk"); }
      }
    });
    /* language roulette → Mashtots (count records, not callbacks — rapid
       switches batch into one callback) */
    let langN = 0;
    new MutationObserver((recs)=>{
      langN += recs.length;
      if(langN>=5 && !S.lore.includes("mashtots")){ langN = 0; this.discover("mashtots"); }
    }).observe(document.documentElement, {attributes:true, attributeFilter:["lang"]});
    /* route + midnight check */
    if(typeof routes !== "undefined") routes.lore = ()=>this.renderCodex();
    this.midnight();
  }
};
window.Eggs = Eggs;
Eggs.init();
