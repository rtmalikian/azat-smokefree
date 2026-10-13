/* Azat notifications — local scheduled reminders (no server needed).
   Phase 2 (server push): set AzatNotify.VAPID_PUBLIC_KEY and call
   AzatNotify.subscribePush() — see README "Push notifications". */
const AzatNotify = (() => {
  let timerId = null;
  const LS_KEY = "azat-notify";

  const VAPID_PUBLIC_KEY = null; // <-- paste VAPID public key here for phase 2

  function getCfg() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }
    catch { return {}; }
  }
  function setCfg(c) { localStorage.setItem(LS_KEY, JSON.stringify(c)); }

  async function swReg() {
    if (!("serviceWorker" in navigator)) return null;
    try { return await navigator.serviceWorker.ready; } catch { return null; }
  }

  async function showViaSW(title, body, tag) {
    const reg = await swReg();
    if (reg && reg.showNotification) {
      // If a service worker controls the page, route through it so the
      // click handler + offline icon work; else use the registration directly.
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(
          { type:"azat-notify", title, body, tag });
      } else {
        reg.showNotification(title, {
          body, icon:"icons/icon-192.png", badge:"icons/icon-192.png",
          tag: tag || "azat", renotify:true, data:{ url:"index.html#/home" }
        });
      }
      return true;
    }
    // Last resort: plain Notification while the page is open.
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon:"icons/icon-192.png", tag: tag || "azat" });
      return true;
    }
    return false;
  }

  function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

  function dailyText(lang) {
    const S = (window.STRINGS && STRINGS[lang]) || STRINGS.en;
    return { title:"Azat Ազատ", body: pick(S.notifs) };
  }

  function nextFire(timeStr) {
    const [h, m] = (timeStr || "09:00").split(":").map(Number);
    const d = new Date(); d.setHours(h||9, m||0, 0, 0);
    if (d.getTime() <= Date.now()) d.setDate(d.getDate()+1);
    return d.getTime();
  }

  async function fireDaily() {
    const cfg = getCfg();
    const lang = (window.AzatState && AzatState.lang) || "hy";
    const { title, body } = dailyText(lang);
    await showViaSW(title, body, "azat-daily");
    scheduleTimer(); // reschedule for tomorrow
  }

  function scheduleTimer() {
    clearTimeout(timerId);
    const cfg = getCfg();
    if (!cfg.enabled) return;
    const delay = Math.max(1000, nextFire(cfg.time) - Date.now());
    timerId = setTimeout(fireDaily, delay);
  }

  async function registerPeriodicSync() {
    try {
      const reg = await swReg();
      if (reg && "periodicSync" in reg) {
        const status = await navigator.permissions.query({ name:"periodic-background-sync" });
        if (status.state === "granted") {
          await reg.periodicSync.register("azat-daily", { minInterval: 24*60*60*1000 });
        }
      }
    } catch { /* not supported — timer path covers it while app is used */ }
  }

  // SW asks the open page for a localized daily message (periodicsync path).
  function listenForDailyWanted() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.addEventListener("message", (e) => {
      if (e.data && e.data.type === "azat-daily-wanted") {
        const lang = (window.AzatState && AzatState.lang) || "hy";
        const { title, body } = dailyText(lang);
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage(
            { type:"azat-notify", title, body, tag:"azat-daily" });
        }
      }
    });
  }

  return {
    VAPID_PUBLIC_KEY,

    async ensurePermission() {
      if (!("Notification" in window)) return "unsupported";
      if (Notification.permission === "granted") return "granted";
      if (Notification.permission === "denied") return "denied";
      try { return await Notification.requestPermission(); }
      catch { return Notification.permission; }
    },

    async enable(timeStr) {
      const p = await this.ensurePermission();
      if (p !== "granted") return p;
      setCfg({ enabled:true, time: timeStr || "09:00" });
      scheduleTimer();
      registerPeriodicSync();
      return "granted";
    },

    disable() { setCfg({ enabled:false }); clearTimeout(timerId); },

    isEnabled() { return !!getCfg().enabled; },
    getTime() { return getCfg().time || "09:00"; },

    async test() {
      const lang = (window.AzatState && AzatState.lang) || "hy";
      const { title, body } = dailyText(lang);
      return showViaSW(title, body, "azat-test");
    },

    milestone(text) { showViaSW("Azat Ազատ 🏆", text, "azat-trophy"); },

    init() { listenForDailyWanted(); scheduleTimer(); },

    /* Phase 2 scaffold: real Web Push needs a server holding the VAPID
       private key. This returns a subscription object to send to it. */
    async subscribePush() {
      if (!VAPID_PUBLIC_KEY) throw new Error("Set AzatNotify.VAPID_PUBLIC_KEY first (see README).");
      const reg = await swReg();
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY
      });
      return sub.toJSON();
    }
  };
})();
