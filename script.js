/* New Version update */
const $ = (id) => document.getElementById(id);

const els = {
  target: $("targetText"),
  editor: $("editor"),
  timeLeft: $("timeLeft"),
  wpm: $("wpm"),
  acc: $("accuracy"),
  mistakes: $("mistakes"),
  start: $("startBtn"),
  pause: $("pauseBtn"),
  next: $("nextBtn"),
  reset: $("resetBtn"),
  dur: $("duration"),
  diff: $("difficulty"),
  theme: $("themeToggle"),
  countdown: $("countdown"),
  tipText: $("tipText"),
};

function on(el, ev, fn){ el && el.addEventListener(ev, fn); }
function txt(el, v){ el && (el.textContent = v); }
function attr(el, n, v){ el && el.setAttribute(n, v); }

let state = {
  running: false,
  startTime: null,
  remaining: 60,
  timerId: null,
  countdownId: null,
  session: { typed: 0, correct: 0 },
  currentSentence: "",
};

/* ---------------- THEME (button only) ---------------- */
function setTheme(next){
  document.documentElement.setAttribute("data-theme", next);
  try{ localStorage.setItem("tm_theme", next); }catch{}
  attr(els.theme, "aria-pressed", next === "dark" ? "false" : "true");
}
function getTheme(){ try{ return localStorage.getItem("tm_theme") || "dark"; }catch{ return "dark"; } }
function toggleTheme(){
  const cur = document.documentElement.getAttribute("data-theme") || "dark";
  setTheme(cur === "dark" ? "light" : "dark");
}

/* ---------------- MEANINGFUL SENTENCE GENERATOR ----------------
   Grammar-aware templates with determiners (a/an/the),
   intransitive vs transitive verbs, optional adjectives & adverbs.
----------------------------------------------------------------- */

// Word banks per difficulty (kept simple & coherent)
const BANK = {
  easy: {
    nouns: ["cat","dog","child","bird","teacher","runner","sun","rain","river","garden","car","phone","book","music","game"],
    objects: ["ball","toy","food","letter","door","window","chair","bag","drink","snack","lesson","plan","story"],
    adjs: ["quiet","happy","calm","quick","bright","soft","simple","brave","friendly","fresh"],
    adverbs: ["slowly","quickly","calmly","softly","happily"],
    vi: ["runs","walks","rests","plays","smiles","waits","learns","sleeps","dances","shines"],
    vt: ["reads","opens","closes","brings","carries","writes","holds","starts","shares","builds","checks"]
  },
  normal: {
    nouns: ["developer","student","team","system","keyboard","writer","manager","engineer","designer","server","browser","network","project"],
    objects: ["feature","document","report","email","draft","module","layout","schedule","backup","dataset","update","release"],
    adjs: ["focused","reliable","careful","patient","curious","practical","helpful","precise","creative","confident"],
    adverbs: ["clearly","smoothly","steadily","carefully","quickly","quietly"],
    vi: ["improves","practices","types","focuses","collaborates","reviews","deploys","iterates","syncs","responds"],
    vt: ["tests","builds","writes","reviews","organizes","tracks","fixes","optimizes","updates","prepares","configures"]
  },
  hard: {
    nouns: ["researcher","analyst","algorithm","protocol","workflow","pipeline","dataset","mechanism","interface","scheduler","compiler"],
    objects: ["hypothesis","model","benchmark","proposal","artifact","prototype","specification","metric","record","schema","release"],
    adjs: ["deterministic","robust","granular","syntactic","orthogonal","resilient","adaptive","probabilistic","scalable","precise"],
    adverbs: ["rigorously","meticulously","concisely","reliably","efficiently","consistently"],
    vi: ["converges","generalizes","synchronizes","stabilizes","validates","profiles","benchmarks","compiles"],
    vt: ["evaluates","calibrates","orchestrates","documents","verifies","aligns","optimizes","integrates","refactors","instrumentes"]
  }
};

// helpers
const r = (arr) => arr[Math.floor(Math.random()*arr.length)];
const cap = (s) => s ? s[0].toUpperCase() + s.slice(1) : s;
const vowel = (c) => "aeiou".includes((c||"").toLowerCase());
function det(word) { // a/an/the (50% the, 50% a/an)
  if (Math.random() < 0.5) return "the";
  return vowel(word[0]) ? "an" : "a";
}
function maybeAdj(adjs){ return Math.random()<0.55 ? r(adjs) : ""; }
function maybeAdv(advs){ return Math.random()<0.45 ? r(advs) : ""; }

// Build noun phrase like "the quick dog" / "a robust protocol"
function np(bank, isSubject=true){
  const n = r(bank.nouns);
  const a = maybeAdj(bank.adjs);
  const article = det(a ? a : n);
  return `${article} ${[a,n].filter(Boolean).join(" ")}`.trim();
}
// Build object NP from objects pool (so transitive verbs make sense)
function op(bank){
  const n = r(bank.objects);
  const a = maybeAdj(bank.adjs);
  const article = det(a ? a : n);
  return `${article} ${[a,n].filter(Boolean).join(" ")}`.trim();
}

// Templates:
//  T1: [NP] [vi] [adv].                            e.g., The calm dog runs quickly.
//  T2: [NP] [vt] [OP] [adv].                       e.g., The developer tests a feature carefully.
//  T3: [NP] [vt] [OP], and [NP] [vi] [adv].        e.g., The team builds a module, and the system responds smoothly.
//  T4: [NP] [vi], then [NP] [vt] [OP].             e.g., The writer reviews, then the manager approves a draft.
function generateMeaningfulSentence(level){
  const bank = BANK[level] || BANK.normal;
  const t = Math.random();
  if (t < 0.35) {
    const s = np(bank); const v = r(bank.vi); const adv = maybeAdv(bank.adverbs);
    return cap([s, v, adv].filter(Boolean).join(" ")) + ".";
  } else if (t < 0.7) {
    const s = np(bank); const v = r(bank.vt); const o = op(bank); const adv = maybeAdv(bank.adverbs);
    return cap([s, v, o, adv].filter(Boolean).join(" ")) + ".";
  } else if (t < 0.85) {
    const s1 = np(bank), v1 = r(bank.vt), o1 = op(bank);
    const s2 = np(bank), v2 = r(bank.vi), adv2 = maybeAdv(bank.adverbs);
    return cap(`${s1} ${v1} ${o1}, and ${s2} ${[v2,adv2].filter(Boolean).join(" ")}`) + ".";
  } else {
    const s1 = np(bank), v1 = r(bank.vi);
    const s2 = np(bank), v2 = r(bank.vt), o2 = op(bank);
    return cap(`${s1} ${v1}, then ${s2} ${v2} ${o2}`) + ".";
  }
}

/* ---------------- RENDERING & METRICS ---------------- */
function esc(s){ return (s??"").replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m])); }
function paint(target, input){
  const out=[], L=Math.max(target.length, input.length);
  for(let i=0;i<L;i++){
    const t = target[i]??"", b = input[i]??"";
    let cls="pending", ch=t;
    if(b===""){ cls="pending"; ch=t; }
    else if(b===t){ cls="correct"; ch=t; }
    else{ cls="incorrect"; ch=b; }
    out.push(`<span class="${cls}">${esc(ch)}</span>`);
  }
  els.target.innerHTML = out.join("");
}
function measure(target, input){
  const L=Math.max(target.length,input.length);
  let correct=0, typed=input.length;
  for(let i=0;i<L;i++){
    const t=target[i]??"", b=input[i]??"";
    if(b!=="" && b===t) correct++;
  }
  const elapsedMs = state.startTime ? (Date.now()-state.startTime) : 0;
  const elapsedMin = Math.max(1e-6, elapsedMs/60000);
  const sessionCorrect = state.session.correct + correct;
  const sessionTyped   = state.session.typed + typed;
  const wpm = Math.max(0, Math.round((sessionCorrect/5)/elapsedMin));
  const acc = Math.round(100 * sessionCorrect / Math.max(1, sessionTyped));
  const mistakesShown = Math.max(0, sessionTyped - sessionCorrect);
  return { correct, typed, wpm, acc, mistakesShown };
}
function updateHud(m){
  txt(els.wpm, String(m.wpm));
  txt(els.acc, `${m.acc}%`);
  txt(els.mistakes, String(m.mistakesShown));
}

function difficulty(){ return els.diff?.value || "normal"; }
function duration(){ return parseInt(els.dur?.value,10) || 60; }

function newSentence(refreshHud=false){
  state.currentSentence = generateMeaningfulSentence(difficulty());
  els.editor.value = "";
  paint(state.currentSentence, "");
  if (refreshHud) compute();
}
function compute(){
  const input = els.editor.value;
  const m = measure(state.currentSentence, input);
  paint(state.currentSentence, input);
  updateHud(m);

  // Auto-advance when fully matched (exact sentence)
  if (input.length >= state.currentSentence.length && input === state.currentSentence){
    state.session.correct += m.correct;
    state.session.typed   += m.typed;
    newSentence(true);
  }
}

/* ---------------- FLOW (mouse-only) ---------------- */
function startCountdownThenRun(){
  let n=3;
  txt(els.countdown, n);
  els.countdown.classList.remove("hidden");
  attr(els.countdown, "aria-hidden", "false");
  clearInterval(state.countdownId);
  state.countdownId = setInterval(()=>{
    n--;
    if(n<=0){
      clearInterval(state.countdownId);
      els.countdown.classList.add("hidden");
      attr(els.countdown, "aria-hidden", "true");
      beginRun();
    }else{ txt(els.countdown, n); }
  },1000);
}
function beginRun(){
  if(state.running) return;
  state.running = true;
  els.start.disabled=true; els.pause.disabled=false;
  els.editor.removeAttribute("disabled"); els.editor.focus();

  state.remaining = duration();
  txt(els.timeLeft, state.remaining);

  clearInterval(state.timerId);
  state.timerId = setInterval(()=>{
    if(!state.running) return;
    state.remaining -= 1;
    txt(els.timeLeft, state.remaining);
    if(state.remaining<=0) finishRun();
  },1000);
}
function finishRun(){
  state.running=false;
  clearInterval(state.timerId);
  els.pause.disabled=true; els.start.disabled=false;
  els.editor.setAttribute("disabled","true");

  const input = els.editor.value;
  const m = measure(state.currentSentence, input);
  state.session.correct += m.correct;
  state.session.typed   += m.typed;
  compute();
}
function pauseRun(){
  if(!state.running) return;
  state.running=false;
  els.pause.disabled=true; els.start.disabled=false;
}
function nextSentence(){
  const input = els.editor.value;
  const m = measure(state.currentSentence, input);
  state.session.correct += m.correct;
  state.session.typed   += m.typed;
  newSentence(true);
}
function resetAll(){
  clearInterval(state.timerId);
  clearInterval(state.countdownId);
  state.running=false; state.startTime=null; state.remaining=duration();
  state.timerId=null; state.countdownId=null; state.session={typed:0, correct:0};

  txt(els.timeLeft, state.remaining);
  txt(els.wpm, "0");
  txt(els.acc, "100%");
  txt(els.mistakes, "0");
  els.editor.value=""; els.editor.setAttribute("disabled","true");
  els.start.disabled=false; els.pause.disabled=true;

  newSentence(true);
}

/* --- Mode (light/dark) --- */
function setMode(m) {
  document.documentElement.setAttribute("data-mode", m);
  try { localStorage.setItem("tm_mode", m); } catch {}
}
function getMode(){ try{ return localStorage.getItem("tm_mode") || "dark"; }catch{ return "dark"; } }
function toggleMode(){
  const cur = document.documentElement.getAttribute("data-mode") || "dark";
  setMode(cur === "dark" ? "light" : "dark");
}

/* --- Theme palettes --- */
const THEMES = ["blue","green","purple","orange"];
function setTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  try { localStorage.setItem("tm_theme", t); } catch {}
}
function getTheme(){ try{ return localStorage.getItem("tm_theme") || "blue"; }catch{ return "blue"; } }
function cycleTheme(){
  const cur = document.documentElement.getAttribute("data-theme") || "blue";
  const idx = THEMES.indexOf(cur);
  const next = THEMES[(idx+1) % THEMES.length];
  setTheme(next);
}

/* --- Init --- */
document.addEventListener("DOMContentLoaded", () => {
  // restore saved
  setMode(getMode());
  setTheme(getTheme());

  // hook buttons
  document.getElementById("modeBtn").addEventListener("click", toggleMode);
  document.getElementById("themeBtn").addEventListener("click", cycleTheme);

  // ...rest of your init (resetAll, tips, etc)...
});

/* ---------------- Tips (#5 ↔ #66, fade) ---------------- */
const TIPS = {
  5:  "Tip #5 — Accuracy first; speed follows.",
  66: "Tip #66 — Build rhythm: steady cadence beats bursts."
};
let tipIdx = 5, tipsTimer=null;
function setTip(text){
  els.tipText.classList.remove("fade-in");
  els.tipText.classList.add("fade-out");
  setTimeout(()=>{
    els.tipText.textContent = text;
    els.tipText.classList.remove("fade-out");
    els.tipText.classList.add("fade-in");
  },300);
}
function startTips(){
  setTip(TIPS[tipIdx]);
  clearInterval(tipsTimer);
  tipsTimer = setInterval(()=>{
    tipIdx = (tipIdx===5)?66:5;
    setTip(TIPS[tipIdx]);
  },10000);
}

/* ---------------- Init (no keyboard bindings) ---------------- */
document.addEventListener("DOMContentLoaded", ()=>{
  setTheme(getTheme());
  on(els.theme, "click", toggleTheme);
  txt($("y"), new Date().getFullYear());

  on(els.start, "click", startCountdownThenRun);
  on(els.pause, "click", pauseRun);
  on(els.next, "click", nextSentence);
  on(els.reset, "click", resetAll);

  on(els.dur, "change", ()=>{ if(!state.running) txt(els.timeLeft, els.dur.value); });
  on(els.editor, "input", ()=>{
    if(!state.startTime && els.editor.value.length>0) state.startTime = Date.now();
    compute();
  });

  resetAll();
  startTips();
});

