/* New Version update
*/

(() => {
  /* ---------- Sentences ---------- */
  const BANK = {
    easy: [
      "The quick brown fox jumps over the lazy dog.",
      "Typing fast is a useful skill.",
      "Practice a little every day.",
      "Coding is fun and creative.",
      "Focus on accuracy then speed."
    ],
    normal: [
      "JavaScript is fun to learn and use for building interactive pages.",
      "Consistent practice builds muscle memory and smooth typing flow.",
      "Small mistakes are normal; correct them and keep moving.",
      "Keep your hands relaxed and look ahead to the next word.",
      "A well-placed backspace is better than a string of errors."
    ],
    hard: [
      "Sustained concentration improves precision; precision, in turn, unlocks speed.",
      "Discipline grows from repetition, but curiosity transforms repetition into mastery.",
      "Beware of cognitive tunneling; maintain peripheral awareness of upcoming words.",
      "Latency in feedback loops can distort perception; trust measured metrics.",
      "Typing efficiency emerges from posture, rhythm, and anticipatory scanning."
    ]
  };

  /* ---------- Theme / Palette ---------- */
  const PALETTES = ["blue", "emerald", "rose", "violet", "amber"];
  const STORE = {
    theme: "tts_theme_v1",
    palette: "tts_palette_v1",
    scores: "tts_scores_v1",
  };

  const docEl = document.documentElement;

  function lsGet(key, fallback) {
    try { const v = localStorage.getItem(key); return v == null ? fallback : v; }
    catch { return fallback; }
  }
  function lsSet(key, value) {
    try { localStorage.setItem(key, value); } catch {}
  }

  function applyTheme(mode, palette) {
    const safeMode = mode === "light" ? "light" : "dark";
    const safePalette = PALETTES.includes(palette) ? palette : "blue";
    docEl.setAttribute("data-theme", safeMode);
    docEl.setAttribute("data-palette", safePalette);
    lsSet(STORE.theme, safeMode);
    lsSet(STORE.palette, safePalette);
  }

  function initTheme() {
    const savedMode = lsGet(STORE.theme, docEl.getAttribute("data-theme") || "dark");
    const savedPalette = lsGet(STORE.palette, docEl.getAttribute("data-palette") || "blue");
    applyTheme(savedMode, savedPalette);
  }

  /* ---------- Elements ---------- */
  const els = {
    input: document.getElementById("input"),
    sentence: document.getElementById("sentence"),
    result: document.getElementById("result"),
    timer: document.getElementById("timer"),
    wpm: document.getElementById("liveWPM"),
    acc: document.getElementById("liveACC"),
    mistakes: document.getElementById("mistakes"),
    progress: document.getElementById("progressBar"),
    startBtn: document.getElementById("startBtn"),
    nextBtn: document.getElementById("nextBtn"),
    resetBtn: document.getElementById("resetBtn"),
    difficulty: document.getElementById("difficulty"),
    sessionLength: document.getElementById("sessionLength"),
    playerName: document.getElementById("playerName"),
    themeToggle: document.getElementById("themeToggle"),
    leaderboardList: document.getElementById("leaderboardList"),
    tips: document.getElementById("tips"),
  };

  /* ---------- Game State ---------- */
  let startTime = null;
  let currentSentence = "";
  let mistakesCount = 0;
  let finished = false;
  let secondTick = null;
  let liveTick = null;
  let sessionSeconds = 60;

  /* ---------- Helpers ---------- */
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const now = () => Date.now();

  function pickSentence() {
    const level = (els.difficulty && els.difficulty.value) || "normal";
    const pool = BANK[level] || BANK.normal;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function renderSentence(typed = "") {
    const out = [];
    for (let i = 0; i < currentSentence.length; i++) {
      const c = currentSentence[i];
      const t = typed[i];
      let cls = "default";
      if (t != null) cls = t === c ? "correct" : "wrong";
      const caret = i === typed.length ? " caret" : "";
      out.push(`<span class="${cls}${caret}">${c === " " ? "&nbsp;" : c}</span>`);
    }
    els.sentence.innerHTML = out.join("");
    const p = currentSentence.length ? (typed.length / currentSentence.length) * 100 : 0;
    els.progress.style.width = `${clamp(p, 0, 100)}%`;
  }

  function accuracyOf(original, typed) {
    const len = original.length;
    let correct = 0;
    for (let i = 0; i < len; i++) if (typed[i] === original[i]) correct++;
    return len ? (correct / len) * 100 : 100;
  }

  function wordsCount(text) {
    const t = text.trim();
    return t ? t.split(/\s+/).length : 0;
  }

  function wpmOf(typed, elapsedSeconds) {
    if (elapsedSeconds <= 0) return 0;
    return (wordsCount(typed) / elapsedSeconds) * 60;
  }

  /* ---------- Game Flow ---------- */
  function startGame() {
    finished = false;
    mistakesCount = 0;
    sessionSeconds = parseInt(els.sessionLength.value, 10) || 60;

    els.input.value = "";
    currentSentence = pickSentence();
    renderSentence("");

    els.input.disabled = false;
    els.input.focus();

    els.startBtn.disabled = true;
    els.nextBtn.disabled = true;
    els.resetBtn.disabled = false;

    els.result.textContent = "";
    els.mistakes.textContent = "0";
    els.timer.textContent = "0";
    els.wpm.textContent = "0";
    els.acc.textContent = "100%";

    startTime = now();

    clearInterval(secondTick);
    clearInterval(liveTick);

    let elapsed = 0;
    secondTick = setInterval(() => {
      elapsed++;
      els.timer.textContent = String(elapsed);
      if (elapsed >= sessionSeconds) finishGame();
    }, 1000);

    liveTick = setInterval(() => {
      const seconds = (now() - startTime) / 1000;
      const typed = els.input.value;
      els.wpm.textContent = Math.max(0, wpmOf(typed, seconds)).toFixed(0);
      els.acc.textContent = `${clamp(accuracyOf(currentSentence, typed), 0, 100).toFixed(0)}%`;
    }, 120);
  }

  function finishGame() {
    if (finished) return;
    finished = true;
    clearInterval(secondTick); clearInterval(liveTick);

    els.input.disabled = true;
    els.startBtn.disabled = false;
    els.nextBtn.disabled = false;
    els.resetBtn.disabled = false;

    const totalSeconds = Math.max(0.001, (now() - startTime) / 1000);
    const typed = els.input.value;
    const finalWPM = Math.max(0, wpmOf(typed, totalSeconds)).toFixed(0);
    const finalACC = clamp(accuracyOf(currentSentence, typed), 0, 100).toFixed(0);

    els.result.textContent =
      `⏱ ${totalSeconds.toFixed(1)}s  •  🏃 WPM: ${finalWPM}  •  🎯 Accuracy: ${finalACC}%  •  ❌ Mistakes: ${mistakesCount}`;

    saveScore({
      name: (els.playerName.value || "Anonymous").slice(0, 20),
      wpm: Number(finalWPM),
      acc: Number(finalACC),
      when: new Date().toISOString(),
    });
    renderLeaderboard();
  }

  function nextSentence() {
    if (finished) { startGame(); return; }
    els.input.value = "";
    currentSentence = pickSentence();
    renderSentence("");
    els.input.focus();
  }

  function resetGame() {
    clearInterval(secondTick); clearInterval(liveTick);
    startTime = null; mistakesCount = 0; finished = false;
    els.input.value = ""; els.result.textContent = "";
    els.wpm.textContent = "0"; els.acc.textContent = "100%";
    els.timer.textContent = "0"; els.mistakes.textContent = "0";
    els.progress.style.width = "0%"; currentSentence = "";
    renderSentence("");
    els.input.disabled = true;
    els.startBtn.disabled = false; els.nextBtn.disabled = true; els.resetBtn.disabled = true;
  }

  /* ---------- Leaderboard (localStorage, github.io safe) ---------- */
  function readScores() {
    try { return JSON.parse(localStorage.getItem(STORE.scores) || "[]"); }
    catch { return []; }
  }
  function writeScores(arr) {
    try { localStorage.setItem(STORE.scores, JSON.stringify(arr)); } catch {}
  }
  function saveScore(entry) {
    const scores = readScores();
    scores.push(entry);
    scores.sort((a,b) => b.wpm - a.wpm || b.acc - a.acc);
    writeScores(scores.slice(0, 10));
  }
  function renderLeaderboard() {
    const list = els.leaderboardList;
    list.innerHTML = "";
    const scores = readScores();
    scores.forEach((s, i) => {
      const li = document.createElement("li");
      li.innerHTML =
        `<strong>#${i+1}</strong> — ${escapeHtml(s.name)} • <b>${s.wpm} WPM</b> • ${s.acc}% • ` +
        `<span style="opacity:.75">${new Date(s.when).toLocaleDateString()}</span>`;
      list.appendChild(li);
    });
  }
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }

  /* ---------- Input handling ---------- */
  function onInput(e) {
    if (finished || !currentSentence) return;
    const typed = e.target.value;
    const i = typed.length - 1;
    if (i >= 0 && typed[i] !== currentSentence[i]) {
      mistakesCount++; els.mistakes.textContent = String(mistakesCount);
    }
    renderSentence(typed);
    if (typed === currentSentence) setTimeout(nextSentence, 250);
  }

  /* ---------- Theme toggle ---------- */
  function onThemeToggle(ev) {
    const mode = docEl.getAttribute("data-theme") || "dark";
    const palette = docEl.getAttribute("data-palette") || "blue";

    if (ev.shiftKey) {
      // dark <-> light
      applyTheme(mode === "dark" ? "light" : "dark", palette);
      return;
    }
    // cycle palettes
    const idx = PALETTES.indexOf(palette);
    const next = PALETTES[(idx + 1) % PALETTES.length];
    applyTheme(mode, next);
  }

  /* ---------- Footer tips (rotate every 10s) ---------- */
  const TIP_LIST = [
    "Use <kbd>Shift</kbd> + <kbd>Left Click</kbd> on Theme to toggle dark and light mode.",
    "Use <kbd>Tab</kbd> to focus input fast. Theme remembers your palette &amp; mode."
  ];
  let tipIndex = 0;
  function startTips() {
    if (!els.tips) return;
    els.tips.innerHTML = TIP_LIST[tipIndex];
    setInterval(() => {
      els.tips.classList.add("fade-out");
      setTimeout(() => {
        tipIndex = (tipIndex + 1) % TIP_LIST.length;
        els.tips.innerHTML = TIP_LIST[tipIndex];
        els.tips.classList.remove("fade-out");
      }, 400); // match CSS transition
    }, 10000);
  }

  /* ---------- Boot ---------- */
  function boot() {
    initTheme();

    els.startBtn.addEventListener("click", startGame);
    els.nextBtn.addEventListener("click", nextSentence);
    els.resetBtn.addEventListener("click", resetGame);
    els.input.addEventListener("input", onInput);
    els.input.addEventListener("keydown", (e) => {
      if (e.key === "Tab") { e.preventDefault(); els.input.focus(); }
    });
    els.themeToggle.addEventListener("click", onThemeToggle);

    renderLeaderboard();
    renderSentence("");
    resetGame();
    startTips();
  }

  window.addEventListener("load", boot);
})();
