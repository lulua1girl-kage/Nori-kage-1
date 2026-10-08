/* Nori Mentor Engine v2
 * Handbook-first deterministic control layer.
 * AI advises; this layer owns state, policy, evidence, and escalation.
 */
(function () {
  "use strict";

  const KEY = "nori_mentor_engine_v2";
  const VERSION = "2.1.0-handbook";
  const now = () => Date.now();
  const day = 86400000;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const iso = t => new Date(t || now()).toISOString();

  const DEFAULT = {
    version: VERSION,
    handbook: {
      humanOverride: true,
      mission: ["academic performance", "discipline", "long-term improvement"],
      priorities: ["school", "entrance", "learning", "health", "supplementary", "projects"],
      maxDegree: 4,
      escalationRequiresInvestigation: true,
      sleepProtection: true,
      aiLearningIntegrity: true
    },
    merit: 0,
    degree: 0,
    streak: { current: 0, best: 0, lastDate: null },
    checkInStreak: { current: 0, best: 0, lastDate: null },
    dailyCheckins: [],
    commitments: [],
    blocks: [],
    incidents: [],
    recovery: null,
    learning: [],
    reviews: [],
    patterns: {},
    metrics: { planned: 0, completed: 0, recovered: 0, distractions: 0, learningEvidence: 0 },
    lastAssessment: null
  };

  function load() {
    try {
      const x = JSON.parse(localStorage.getItem(KEY) || "null");
      return Object.assign({}, DEFAULT, x || {}, {
        handbook: Object.assign({}, DEFAULT.handbook, x && x.handbook || {}),
        streak: Object.assign({}, DEFAULT.streak, x && x.streak || {}),
        checkInStreak: Object.assign({}, DEFAULT.checkInStreak, x && x.checkInStreak || {}),
        dailyCheckins: Array.isArray(x && x.dailyCheckins) ? x.dailyCheckins : [],
        metrics: Object.assign({}, DEFAULT.metrics, x && x.metrics || {})
      });
    } catch (_) { return JSON.parse(JSON.stringify(DEFAULT)); }
  }

  let s = load();

  function save() {
    localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent("nori:state", { detail: api.snapshot() }));
  }

  function add(list, item, max) {
    list.push(item);
    if (list.length > (max || 200)) list.splice(0, list.length - (max || 200));
  }

  function classify(text) {
    const t = String(text || "").toLowerCase();
    if (/sleep|migraine|headache|exhaust|sick|pain|ill|too tired/.test(t)) return "capacity";
    if (/instagram|reels|scroll|tiktok|youtube|distraction|phone/.test(t)) return "distraction";
    if (/too much|too many|unrealistic|schedule|plan was|overload/.test(t)) return "planning";
    if (/don't understand|dont understand|confused|stuck|concept|formula|how do i/.test(t)) return "knowledge";
    if (/avoided|procrastinat|didn't want|didnt want|chose not|ignored/.test(t)) return "avoidance";
    return "unknown";
  }

  function priority(subject, taskType) {
    const t = (String(subject || "") + " " + String(taskType || "")).toLowerCase();
    if (/exam|test|quiz|deadline|homework|assignment|school/.test(t)) return 1;
    if (/entrance|physics|chemistry|biology|math|english/.test(t)) return 2;
    if (/futurex|review|practice/.test(t)) return 3;
    return 4;
  }

  function todayKey(t) {
    const d = new Date(t || now());
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
  }

  function yesterdayKey() {
    return todayKey(now() - day);
  }

  function updateStreak(success) {
    const d = todayKey();
    if (!success) return;
    if (s.streak.lastDate === d) return;
    const yesterday = yesterdayKey();
    s.streak.current = s.streak.lastDate === yesterday ? s.streak.current + 1 : 1;
    s.streak.best = Math.max(s.streak.best, s.streak.current);
    s.streak.lastDate = d;
  }

  function merit(delta, reason) {
    s.merit = Math.max(0, s.merit + delta);
    add(s.incidents, { type: "merit", delta, reason, at: now() });
  }

  function logIncident(type, details, cause) {
    const c = cause || classify(details);
    const item = { type, details: String(details || ""), cause: c, at: now() };
    add(s.incidents, item);
    if (c === "distraction") s.metrics.distractions++;
    s.patterns[c] = (s.patterns[c] || 0) + 1;
    return item;
  }

  function investigate(details) {
    const cause = classify(details);
    const count = s.patterns[cause] || 0;
    const recent = s.incidents.filter(x => now() - x.at < 7 * day && x.cause === cause).length;
    let response = "observe";
    if (cause === "capacity") response = "recover";
    else if (cause === "knowledge") response = "tutor";
    else if (cause === "planning") response = "replan";
    else if (cause === "distraction") response = recent >= 2 ? "environment-control" : "reset-and-return";
    else if (cause === "avoidance") response = recent >= 2 ? "structured-intervention" : "direct-challenge";
    else if (recent >= 3) response = "review-system";

    const severity = cause === "avoidance" && recent >= 3 ? 2 :
      cause === "distraction" && recent >= 3 ? 2 :
      cause === "capacity" ? 0 : (recent >= 2 ? 1 : 0);

    return {
      cause, recent, lifetime: count, severity, response,
      degreeChange: s.handbook.escalationRequiresInvestigation ? 0 : severity,
      humanOverrideAvailable: true
    };
  }

  function recommendConsequence(details) {
    const inv = investigate(details);
    const map = {
      capacity: "Protect recovery and reduce load; no punitive consequence.",
      knowledge: "Start targeted tutoring and require an independent check.",
      planning: "Rebuild the next block with a smaller measurable outcome.",
      distraction: "Remove the immediate distraction pathway and restart with a tiny next action.",
      avoidance: "Confront the avoided task with a bounded supervised block.",
      unknown: "Collect more evidence before escalating."
    };
    return Object.assign(inv, { recommendation: map[inv.cause] });
  }

  function plan(items, options) {
    const arr = Array.isArray(items) ? items : [items];
    const planned = arr.filter(Boolean).map((x, i) => ({
      id: "c_" + now() + "_" + i,
      task: typeof x === "string" ? x : x.task,
      subject: typeof x === "string" ? "" : x.subject || "",
      priority: priority(typeof x === "string" ? x : x.subject, typeof x === "string" ? "" : x.type),
      duration: typeof x === "string" ? null : x.duration || null,
      status: "planned",
      createdAt: now()
    })).sort((a,b) => a.priority - b.priority);
    planned.forEach(x => s.commitments.push(x));
    s.metrics.planned += planned.length;
    if (options && options.deadline) s.reviews.push({ type: "deadline", at: options.deadline, commitments: planned.map(x => x.id) });
    save();
    return planned;
  }

  function startBlock(id, outcome) {
    const c = s.commitments.find(x => x.id === id) || s.commitments.find(x => x.status === "planned");
    if (!c) return null;
    c.status = "active";
    c.startedAt = now();
    c.outcome = outcome || c.task;
    c.environment = { distractions: [], startedAt: now() };
    add(s.blocks, { id: c.id, task: c.task, subject: c.subject, start: now(), outcome: c.outcome, status: "active" });
    save();
    return c;
  }

  function endBlock(id, result) {
    const c = s.commitments.find(x => x.id === id) || s.commitments.find(x => x.status === "active");
    if (!c) return null;
    const ok = !!(result && result.completed);
    c.status = ok ? "completed" : "missed";
    c.endedAt = now();
    c.result = result || {};
    if (ok) {
      s.metrics.completed++;
      merit(2, "completed committed academic block");
      updateStreak(true);
    } else {
      logIncident("missed-block", result && result.reason || "commitment not completed");
    }
    const b = s.blocks.find(x => x.id === c.id && x.status === "active");
    if (b) Object.assign(b, { end: now(), status: c.status, result: result || {} });
    save();
    return c;
  }

  function checkInPrompt() {
    return [
      "NORI DAILY COMMAND CHECK-IN",
      "Answer naturally; Nori will interpret this and update the state.",
      "1. What did you actually accomplish today?",
      "2. What is still unfinished?",
      "3. What must be done tomorrow or has a near deadline?",
      "4. Any exam, test, assignment, or important school deadline approaching?",
      "5. How is your current capacity: normal, tired, sick, headache, overloaded, or something else?",
      "6. Any Instagram, Reels, or other distraction incident?",
      "7. What is the single most important next action?"
    ].join("\n");
  }

  function dailyCheckIn(data) {
    const input = Object.assign({}, data || {});
    const d = todayKey();
    const existing = s.dailyCheckins.find(x => x.date === d);
    const item = Object.assign(existing || {
      id: "ci_" + now(),
      date: d,
      at: now()
    }, {
      at: now(),
      accomplished: input.accomplished || input.completed || "",
      unfinished: input.unfinished || input.remaining || "",
      deadlines: input.deadlines || "",
      exams: input.exams || "",
      capacity: input.capacity || "",
      distractions: input.distractions || "",
      nextAction: input.nextAction || "",
      raw: input.raw || ""
    });

    if (!existing) {
      const y = yesterdayKey();
      s.checkInStreak.current = s.checkInStreak.lastDate === y ? s.checkInStreak.current + 1 : 1;
      s.checkInStreak.best = Math.max(s.checkInStreak.best, s.checkInStreak.current);
      s.checkInStreak.lastDate = d;
      s.dailyCheckins.push(item);
      if (s.dailyCheckins.length > 60) s.dailyCheckins.splice(0, s.dailyCheckins.length - 60);
    }
    add(s.incidents, {
      type: "daily-check-in",
      at: now(),
      details: "Daily check-in recorded",
      cause: "system"
    });
    save();
    return item;
  }

  function todayCheckIn() {
    return s.dailyCheckins.find(x => x.date === todayKey()) || null;
  }

  function recordLearning(data) {
    const x = Object.assign({
      id: "l_" + now(),
      at: now(),
      evidence: "unknown",
      independent: false,
      confidence: null
    }, data || {});
    add(s.learning, x, 300);
    s.metrics.learningEvidence++;
    if (x.independent) merit(1, "independent learning evidence");
    save();
    return x;
  }

  function retrieve(subject, topic, score, total) {
    return recordLearning({
      subject, topic, evidence: "retrieval",
      score: Number(score), total: Number(total),
      independent: true,
      nextReview: now() + (Number(score) / Math.max(1, Number(total)) >= 0.8 ? 4 : 1) * day
    });
  }

  function recover(reason, until) {
    s.recovery = { active: true, reason: reason || "capacity", startedAt: now(), until: until || now() + 2 * 3600000 };
    s.metrics.recovered++;
    logIncident("recovery", reason || "capacity", "capacity");
    save();
    return s.recovery;
  }

  function clearRecovery() {
    s.recovery = null;
    save();
  }

  function assess() {
    const recent = s.incidents.filter(x => now() - x.at < 7 * day);
    const avoid = recent.filter(x => x.cause === "avoidance").length;
    const dist = recent.filter(x => x.cause === "distraction").length;
    const capacity = recent.filter(x => x.cause === "capacity").length;
    const completion = s.metrics.planned ? s.metrics.completed / s.metrics.planned : null;
    const risk = clamp((avoid * 2 + dist * 1.5 + (completion !== null && completion < .6 ? 2 : 0)) - capacity, 0, 10);
    const recommendedDegree = risk >= 7 ? 3 : risk >= 4 ? 2 : risk >= 2 ? 1 : 0;
    s.lastAssessment = { at: now(), risk, recommendedDegree, completion, recent: recent.length };
    save();
    return s.lastAssessment;
  }

  function snapshot() {
    return {
      version: VERSION,
      handbook: s.handbook,
      merit: s.merit,
      degree: s.degree,
      streak: s.streak,
      checkInStreak: s.checkInStreak,
      todayCheckIn: todayCheckIn(),
      recovery: s.recovery,
      metrics: s.metrics,
      commitments: s.commitments.slice(-12),
      recentIncidents: s.incidents.slice(-10),
      recentLearning: s.learning.slice(-10),
      assessment: s.lastAssessment,
      patterns: s.patterns
    };
  }

  function promptContext() {
    const x = snapshot();
    return [
      "HANDBOOK STATE:",
      JSON.stringify(x),
      "",
      "MANDATORY MENTOR RULES:",
      "1. The deterministic handbook state outranks model improvisation.",
      "2. Human Override is always available.",
      "3. Never escalate a degree automatically. Investigate first.",
      "4. Never prescribe punishment that harms sleep, health, school readiness, or learning.",
      "5. Match the response to the failure cause.",
      "6. Preserve student agency; challenge reasoning rather than controlling the student.",
      "7. In academic tutoring, protect independent reasoning and retrieval. Do not make the student dependent on AI.",
      "8. Treat plans as hypotheses. Update them from execution evidence.",
      "9. Use the existing handbook vocabulary: merit, streak, degree, consequence, recovery, integrity, investigation.",
      "10. If the handbook state conflicts with a proposed action, explain the conflict and prefer the safer mission-aligned action.",
      "11. The daily check-in is an evidence/reporting loop, not a punishment trigger. Ask only for information needed to update academic state."
    ].join("\n");
  }

  function handle(text) {
    const t = String(text || "");
    const low = t.toLowerCase();
    if (/\b(start|begin)\b.*\b(block|study)\b/.test(low)) {
      const active = s.commitments.find(x => x.status === "planned");
      return { action: "start_block", data: active ? startBlock(active.id, active.task) : null };
    }
    if (/\b(finished|completed|done)\b/.test(low) && /\b(block|study|homework|math|physics|chemistry|biology|english|assignment)\b/.test(low)) {
      const active = s.commitments.find(x => x.status === "active");
      return { action: "complete_block", data: active ? endBlock(active.id, { completed: true, note: t }) : null };
    }
    if (/daily check.?in|check.?in|evening review/.test(low)) {
      return { action: "daily_checkin_prompt", prompt: checkInPrompt(), data: todayCheckIn() };
    }
    if (/instagram|reels|scrolling|distraction/.test(low)) {
      return { action: "investigate_distraction", data: recommendConsequence(t) };
    }
    if (/tired|sleepy|headache|migraine|sick|pain/.test(low)) {
      return { action: "capacity_check", data: recommendConsequence(t) };
    }
    return { action: "observe", data: assess() };
  }

  const api = {
    version: VERSION,
    snapshot, promptContext, plan, startBlock, endBlock, recordLearning, retrieve, checkInPrompt, dailyCheckIn, todayCheckIn,
    recover, clearRecovery, investigate, recommendConsequence, assess, handle,
    setDegree(n) {
      const next = clamp(Number(n) || 0, 0, s.handbook.maxDegree);
      s.degree = next; save(); return s.degree;
    },
    setHumanOverride(v) { s.handbook.humanOverride = v !== false; save(); },
    importKage(kage) {
      s.kage = kage || null;
      add(s.incidents, { type: "kage-import", at: now(), details: "KAGE bridge imported", cause: "system" });
      save();
      return snapshot();
    },
    exportState() { return JSON.stringify(snapshot(), null, 2); }
  };

  window.NoriEngine = api;
  window.NoriMentorContext = () => api.promptContext();
  window.dispatchEvent(new CustomEvent("nori:ready", { detail: snapshot() }));
})();
