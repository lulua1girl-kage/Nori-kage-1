/* Nori Daily Check-in Scheduler
 * Primary path: native Android Capacitor plugin with exact local alarm.
 * Fallback: browser notification/timer while the app remains alive.
 */
(function () {
  "use strict";

  const KEY = "nori_daily_checkin_schedule_v1";
  const HOUR = 18;
  const MINUTE = 0;
  let timer = null;

  function load() {
    try { return Object.assign({ enabled: false, mode: "off", lastScheduled: null }, JSON.parse(localStorage.getItem(KEY) || "{}")); }
    catch (_) { return { enabled: false, mode: "off", lastScheduled: null }; }
  }
  let state = load();
  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }

  function nextSixPM() {
    const d = new Date();
    d.setHours(HOUR, MINUTE, 0, 0);
    if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
    return d;
  }

  function nativePlugin() {
    return window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.NoriScheduler
      ? window.Capacitor.Plugins.NoriScheduler : null;
  }

  function fallbackNotification() {
    if (!("Notification" in window)) return false;
    if (Notification.permission !== "granted") return false;
    new Notification("NORI — Daily Command Check-in", {
      body: "Open Nori. Report what you accomplished, what remains, deadlines, capacity, distractions, and your next action.",
      tag: "nori-daily-checkin"
    });
    if (window.NoriCheckInScheduler && window.NoriCheckInScheduler.open) window.NoriCheckInScheduler.open();
    return true;
  }

  function armBrowserFallback() {
    if (timer) clearTimeout(timer);
    const target = nextSixPM();
    state.lastScheduled = target.toISOString();
    save();
    timer = setTimeout(function () {
      fallbackNotification();
      armBrowserFallback();
    }, Math.max(1000, target.getTime() - Date.now()));
  }

  async function enable() {
    state.enabled = true;
    const p = nativePlugin();
    if (p && p.scheduleDailyCheckIn) {
      try {
        const result = await p.scheduleDailyCheckIn();
        if (result && result.scheduled) {
          state.mode = "native-exact";
          state.lastScheduled = result.nextTrigger || null;
          save();
          return Object.assign({}, state, { result });
        }
      } catch (_) {}
    }

    if ("Notification" in window && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch (_) {}
    }
    state.mode = "browser-open-app";
    save();
    armBrowserFallback();
    return Object.assign({}, state, { warning: "Android native exact alarm is unavailable; browser fallback only works while the app is alive." });
  }

  async function disable() {
    const p = nativePlugin();
    if (p && p.cancelDailyCheckIn) {
      try { await p.cancelDailyCheckIn(); } catch (_) {}
    }
    if (timer) clearTimeout(timer);
    timer = null;
    state.enabled = false;
    state.mode = "off";
    state.lastScheduled = null;
    save();
    return state;
  }

  function open() {
    const text = window.NoriEngine && window.NoriEngine.checkInPrompt
      ? window.NoriEngine.checkInPrompt()
      : "NORI DAILY COMMAND CHECK-IN\nTell me what you accomplished, what remains, deadlines, capacity, distractions, and your next action.";
    if (typeof window.respond === "function") {
      window.respond(text);
      return;
    }
    const input = document.getElementById("input");
    if (input) {
      input.value = "";
      input.placeholder = "Daily check-in: tell Nori what actually happened today…";
      document.getElementById("ibox")?.classList.add("show");
      input.focus();
    }
  }

  function status() {
    return Object.assign({}, state, { nextSixPM: nextSixPM().toISOString(), native: !!nativePlugin() });
  }

  window.NoriCheckInScheduler = { enable, disable, open, status, armBrowserFallback };
  if (state.enabled) armBrowserFallback();
})();