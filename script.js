function showTypingTest() {
  const gameArea = document.getElementById("gameArea");
  gameArea.innerHTML = `
    <div id="sentence"></div>
    <input type="text" id="input" placeholder="Start typing here..." disabled autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
    <div class="stats">
      <div id="wpmBox">WPM: 0</div>
      <div id="accuracyBox">Accuracy: 0%</div>
      <div id="progressBar"><div id="progress"></div></div>
    </div>
    <div class="controls">
      <button id="startBtn">▶ Start Test</button>
      <button id="restartBtn" disabled>🔄 Restart</button>
    </div>
    <div id="result"></div>
    <div id="history"></div>
  `;

  const sentences = [
    "The quick brown fox jumps over the lazy dog.",
    "JavaScript is fun to learn and use.",
    "Practice makes perfect if you stay consistent.",
    "Typing fast is a useful skill for programmers.",
    "Patience and practice are the keys to improvement.",
    "A journey of a thousand miles begins with a single step."
  ];

  let startTime, timer, currentSentence, typed = "";

  const inputEl = document.getElementById("input");
  const sentenceEl = document.getElementById("sentence");
  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");
  const resultEl = document.getElementById("result");
  const historyEl = document.getElementById("history");
  const wpmBox = document.getElementById("wpmBox");
  const accuracyBox = document.getElementById("accuracyBox");
  const progressEl = document.getElementById("progress");

  startBtn.onclick = function () {
    currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
    inputEl.value = "";
    inputEl.disabled = false;
    inputEl.focus();
    resultEl.textContent = "";
    restartBtn.disabled = false;
    startTime = new Date();
    typed = "";
    updateSentenceDisplay("");
    startBtn.disabled = true;

    // start timer for live WPM update
    clearInterval(timer);
    timer = setInterval(updateLiveStats, 1000);
  };

  restartBtn.onclick = function () {
    showTypingTest();
  };

  inputEl.addEventListener("input", function () {
    typed = this.value;
    updateSentenceDisplay(typed);
    updateProgress();

    if (typed === currentSentence) {
      clearInterval(timer);
      const endTime = new Date();
      const timeTaken = (endTime - startTime) / 1000;
      const accuracy = calculateAccuracy(currentSentence, typed);
      const wpm = Math.round((typed.split(" ").length / timeTaken) * 60);

      resultEl.innerHTML = `
        ✅ Completed in <b>${timeTaken.toFixed(2)}s</b><br>
        ⏱ WPM: <b>${wpm}</b> | 🎯 Accuracy: <b>${accuracy}%</b>
      `;

      // add to history
      const record = document.createElement("div");
      record.className = "record";
      record.innerHTML = `⏱ ${timeTaken.toFixed(2)}s | WPM: ${wpm} | Accuracy: ${accuracy}%`;
      historyEl.prepend(record);

      inputEl.disabled = true;
      startBtn.disabled = false;
    }
  });

  function updateSentenceDisplay(typed) {
    let html = "";
    for (let i = 0; i < currentSentence.length; i++) {
      let char = currentSentence[i];
      if (typed[i] == null) {
        html += `<span class="default">${char}</span>`;
      } else if (typed[i] === char) {
        html += `<span class="correct">${char}</span>`;
      } else {
        html += `<span class="wrong">${char}</span>`;
      }
    }
    sentenceEl.innerHTML = html;
  }

  function calculateAccuracy(original, typed) {
    let correct = 0;
    for (let i = 0; i < original.length; i++) {
      if (typed[i] === original[i]) correct++;
    }
    return ((correct / original.length) * 100).toFixed(2);
  }

  function updateLiveStats() {
    if (!typed) return;
    const elapsed = (new Date() - startTime) / 1000;
    const wpm = Math.round((typed.trim().split(" ").length / elapsed) * 60);
    const accuracy = calculateAccuracy(currentSentence, typed);
    wpmBox.textContent = `WPM: ${wpm}`;
    accuracyBox.textContent = `Accuracy: ${accuracy}%`;
  }

  function updateProgress() {
    const progress = Math.min((typed.length / currentSentence.length) * 100, 100);
    progressEl.style.width = progress + "%";
  }
}

window.onload = showTypingTest;
