function injectStyles() {
  if (document.getElementById("assessment-wizard-styles")) return;
  const style = document.createElement("style");
  style.id = "assessment-wizard-styles";
  style.textContent = `
    @keyframes barGrow { from { width: 0; } }
    .progress-track{background:#ede9df;border-radius:999px;height:8px;overflow:hidden;}
    .progress-fill{background:linear-gradient(90deg,#e8651a,#f0894d);height:100%;border-radius:999px;transition:width .4s ease;}
    .option{display:flex;align-items:center;gap:14px;border:1px solid #d8d3c8;border-radius:6px;padding:13px 16px;cursor:pointer;transition:all .15s;background:rgba(255,255,255,.4);}
    .option:hover{border-color:#e8651a;background:rgba(232,101,26,.05);}
    .option.selected{border-color:#e8651a;background:rgba(232,101,26,.08);}
    .option-radio{width:20px;height:20px;border-radius:50%;border:2px solid #d8d3c8;flex-shrink:0;position:relative;transition:all .15s;}
    .option.selected .option-radio{border-color:#e8651a;}
    .option.selected .option-radio::after{content:'';position:absolute;inset:3px;border-radius:50%;background:#e8651a;}
    .option-icon{width:34px;height:34px;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#ede9df;color:#8c8680;transition:all .15s;}
    .option.selected .option-icon{background:rgba(232,101,26,.12);color:#e8651a;}
    .badge{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:500;letter-spacing:.02em;}
    .badge-moderate{background:rgba(232,101,26,.12);color:#e8651a;}
    .badge-low{background:rgba(120,160,100,.15);color:#5f8a4a;}
    .badge-high{background:rgba(200,60,40,.12);color:#c83c28;}
    .score-ring-bg{stroke:#ede9df;}
    .score-ring-fill{stroke:#e8651a;stroke-linecap:round;transform:rotate(-90deg);transform-origin:50% 50%;transition:stroke-dashoffset .8s ease;}
    .resource-item{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid #d8d3c8;border-radius:6px;background:rgba(255,255,255,.4);transition:all .15s;cursor:pointer;}
    .resource-item:hover{border-color:#e8651a;background:rgba(232,101,26,.05);}
    .resource-icon{width:34px;height:34px;border-radius:6px;background:rgba(232,101,26,.1);color:#e8651a;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
    .insight-item{display:flex;gap:12px;align-items:flex-start;padding:11px 0;border-bottom:1px solid #ede9df;font-size:13px;line-height:1.55;}
    .insight-item:last-child{border-bottom:none;}
    .insight-icon{width:28px;height:28px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
    .bar-bg{background:#ede9df;border-radius:3px;height:8px;overflow:hidden;}
    .bar-fill{height:100%;border-radius:3px;animation:barGrow .7s ease-out;}
    .range-bar{position:relative;height:10px;border-radius:999px;overflow:visible;margin:6px 0 14px;}
    .range-track{position:absolute;inset:0;border-radius:999px;background:linear-gradient(90deg,#c83c28 28%,#e8651a 50%,#5f8a4a 100%);}
    .range-marker{position:absolute;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:50%;background:white;border:3px solid #2a2520;box-shadow:0 1px 4px rgba(0,0,0,.18);transition:left .8s ease;}
    .tab-btn{padding:7px 14px;font-size:12px;border-radius:4px;border:none;background:transparent;cursor:pointer;color:#8c8680;font-weight:500;transition:all .15s;}
    .tab-btn.active{background:white;color:#2a2520;box-shadow:0 1px 3px rgba(0,0,0,.08);}
  `;
  document.head.appendChild(style);
}

export function renderWHO5Form() {
  injectStyles();
  const app = document.getElementById("app");

  const questions = [
    "I have felt cheerful and in good spirits",
    "I have felt calm and relaxed",
    "I have felt active and vigorous",
    "I woke up feeling fresh and rested",
    "My daily life has been filled with things that interest me"
  ];

  const optionLabels = [
    { label: "At no time", score: 0, tag: "None" },
    { label: "Some of the time", score: 1, tag: "Low" },
    { label: "Less than half the time", score: 2, tag: "Moderate" },
    { label: "More than half the time", score: 3, tag: "Good" },
    { label: "Most of the time", score: 4, tag: "Very Good" },
    { label: "All of the time", score: 5, tag: "Excellent" }
  ];

  const optionIcons = [
    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6"/></svg>`,
    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M8.5 14.5s1 1 3.5 1 3.5-1 3.5-1M9 9h.01M15 9h.01"/></svg>`,
    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 15s1 .5 3 0M15 15s-1 .5-3 0M9 9h.01M15 9h.01"/></svg>`,
    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M8 15s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>`,
    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M8 13s1.5 3 4 3 4-3 4-3M9 9h.01M15 9h.01"/></svg>`,
    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707"/></svg>`
  ];

  let currentQuestion = 0;
  let answers = new Array(questions.length).fill(null);

  try {
    const s = localStorage.getItem('who5_answers');
    const q = localStorage.getItem('who5_current');
    if (s) answers = JSON.parse(s);
    if (q) currentQuestion = parseInt(q, 10);
  } catch (e) {}

  app.innerHTML = `
    <div class="flex h-screen w-screen overflow-hidden">
      <!-- SIDEBAR -->
      <aside id="sidebar" class="flex flex-col border-r border-cream-border w-64 bg-cream flex-shrink-0">
        <div style="border-bottom:1px solid #d8d3c8; padding:16px 20px; flex-shrink:0;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
            <div style="width:32px;height:32px;border-radius:6px;background:linear-gradient(135deg,#e8651a,#f0894d);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2C8 2 4 4 4 8C4 10.2 5.8 12 8 12C10.2 12 12 10.2 12 8C12 5 9.5 3 8 2Z" fill="white" opacity=".9"/>
                <path d="M6 8.5C6.5 9.2 7.2 9.5 8 9.5" stroke="white" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>
                <circle cx="8" cy="14" r="1" fill="white" opacity=".5"/>
              </svg>
            </div>
            <div>
              <p style="font-weight:500;font-size:12px;color:#2a2520;letter-spacing:-.3px;">InnerWhispers</p>
              <p style="font-size:9px;color:#8c8680;">Wellness Companion</p>
            </div>
          </div>
        </div>
        <nav class="flex-1 overflow-y-auto p-4 space-y-1">
          <button class="nav-item w-full py-2 px-3 flex items-center gap-3 text-xs font-medium text-warm-dark active" onclick="location.href='assessments.html'">
            <span>← Back to Assessments</span>
          </button>
        </nav>
      </aside>

      <!-- MAIN CONTAINER -->
      <main class="flex-1 flex flex-col h-full bg-[#fcfbfa] overflow-y-auto">
        <div class="max-w-2xl mx-auto w-full px-4 py-8 sm:px-6 sm:py-12">
          
          <!-- QUIZ VIEW -->
          <div id="quizView" class="space-y-6">
            <div class="flex items-center justify-between border-b border-cream-border pb-4">
              <div>
                <h2 class="font-serif text-2xl text-warm-dark leading-tight">Well-Being Index (WHO-5)</h2>
                <p class="text-xs text-warm-gray mt-1">WHO-5 Questionnaire (Past 2 Weeks)</p>
              </div>
              <div class="text-right">
                <span class="text-xs font-medium text-warm-gray" id="questionCounter">Question 1 of 5</span>
                <div class="flex items-center gap-2 mt-1">
                  <div class="progress-track w-24"><div class="progress-fill" id="progressFill" style="width: 20%;"></div></div>
                  <span class="text-[10px] font-mono font-medium text-warm-dark" id="progressPercent">20%</span>
                </div>
              </div>
            </div>

            <div class="card p-5 sm:p-6 mb-6" id="questionCard">
              <div class="flex items-center justify-between mb-4">
                <span class="text-[10px] font-medium uppercase tracking-wider text-orange" id="questionLabel">Question 1</span>
              </div>
              <h3 class="font-serif text-lg sm:text-xl text-warm-dark leading-snug mb-6" id="questionText">I have felt cheerful and in good spirits</h3>
              <div class="space-y-2" id="optionsList"></div>
            </div>

            <div class="flex items-center justify-between pt-2">
              <button class="btn-secondary flex items-center gap-2" id="prevBtn" disabled>
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                Previous
              </button>
              <button class="btn-primary flex items-center gap-2" id="nextBtn" disabled>
                Next
                <svg width="14" height="14" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          <!-- COMPLETION VIEW -->
          <div id="completionView" class="hidden text-center space-y-6 py-12">
            <div class="card p-8 sm:p-10 text-center">
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-orange to-orange-light flex items-center justify-center mx-auto mb-6 shadow-md shadow-orange/20">
                <svg width="28" height="28" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h1 class="font-serif text-2xl sm:text-3xl text-warm-dark mb-2">Assessment Complete</h1>
              <p class="text-sm text-warm-gray mb-8">Your results are ready.</p>
              <button class="btn-primary" id="showResultsBtn">
                View My Results
              </button>
            </div>
          </div>

          <!-- RESULTS VIEW -->
          <div id="resultsView" class="hidden w-full space-y-6">
            <div class="card p-6 sm:p-8 text-center flex flex-col items-center">
              <p class="text-[11px] font-medium text-warm-gray uppercase tracking-wider mb-4">Your Well-Being Index</p>
              <div class="relative w-36 h-36 mb-4">
                <svg viewBox="0 0 120 120" class="w-full h-full">
                  <circle class="score-ring-bg" cx="60" cy="60" r="52" fill="none" stroke-width="10"/>
                  <circle class="score-ring-fill" id="scoreRing" cx="60" cy="60" r="52" fill="none" stroke-width="10" stroke-dasharray="326.7" stroke-dashoffset="326.7"/>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="font-serif text-3xl text-warm-dark" id="scoreValue">0</span>
                  <span class="text-xs text-warm-gray">%</span>
                </div>
              </div>
              <span class="badge badge-low mb-3" id="severityBadge">Poor Well-Being</span>
              <p class="text-sm text-warm-gray leading-relaxed max-w-md" id="severityText"></p>

              <!-- Range bar -->
              <div class="mt-5 w-full max-w-xs">
                <div class="range-bar">
                  <div class="range-track"></div>
                  <div class="range-marker" id="rangeMarker" style="left:50%;"></div>
                </div>
                <div class="flex justify-between text-[10px] text-warm-gray mt-1">
                  <span>Likely Depression (0-28)</span><span>Poor (29-50)</span><span>Good (51-100)</span>
                </div>
              </div>
            </div>

            <!-- Analysis Canvas Tabs -->
            <div class="card p-5 sm:p-6">
              <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 class="font-serif text-lg text-warm-dark">Score Analysis</h3>
                <div class="flex gap-1 rounded-md p-1" style="background:#ede9df;">
                  <button class="tab-btn active" id="tabBar">Per Question</button>
                  <button class="tab-btn" id="tabRadar">Radar</button>
                  <button class="tab-btn" id="tabDist">Distribution</button>
                </div>
              </div>

              <div id="chartBar">
                <p class="text-xs text-warm-gray mb-3">Score contribution per question (maximum score is 5)</p>
                <div id="barList" class="space-y-3"></div>
              </div>

              <div id="chartRadar" class="hidden">
                <p class="text-xs text-warm-gray mb-3">Visualisation across items — outer edge = maximum (5).</p>
                <canvas id="radarCanvas" width="420" height="300" style="max-width:100%;margin:0 auto;"></canvas>
              </div>

              <div id="chartDist" class="hidden">
                <p class="text-xs text-warm-gray mb-3">Approximate population well-being distribution — where your score sits.</p>
                <canvas id="distCanvas" width="420" height="200" style="max-width:100%;margin:0 auto;"></canvas>
              </div>
            </div>

            <!-- Personalised Insights -->
            <div class="card p-5 sm:p-6">
              <h3 class="font-serif text-lg text-warm-dark mb-3">Personalised Insights</h3>
              <p class="text-xs text-warm-gray mb-3">Based on your responses:</p>
              <div id="insightsList"></div>
            </div>

            <!-- Recommended Resources -->
            <div class="card p-5 sm:p-6 mb-5">
              <h3 class="font-serif text-lg text-warm-dark mb-4">Recommended Resources</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div class="resource-item">
                  <div class="resource-icon">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                  </div>
                  <div><p class="text-sm font-medium text-warm-dark">Well-Being Guide</p><p class="text-xs text-warm-gray">Positive psychology exercises</p></div>
                </div>
                <div class="resource-item">
                  <div class="resource-icon">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg>
                  </div>
                  <div><p class="text-sm font-medium text-warm-dark">Resilience Building</p><p class="text-xs text-warm-gray">Daily practices to elevate life satisfaction</p></div>
                </div>
              </div>
            </div>

            <!-- About Assessment -->
            <div class="card p-5 mb-5" style="background:rgba(232,101,26,.04);">
              <div class="flex gap-3 items-start">
                <div class="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style="background:rgba(232,101,26,.12);color:#e8651a;">
                  <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <p class="text-xs font-medium text-warm-dark mb-1">About the WHO-5</p>
                  <p class="text-xs text-warm-gray leading-relaxed">The WHO-5 Well-Being Index is a short questionnaire to measure positive psychological well-being over the past two weeks. It is widely used internationally and serves as an initial wellness indicator rather than a diagnostic clinical decision tool.</p>
                </div>
              </div>
            </div>

            <!-- Actions buttons -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <button class="btn-primary w-full justify-center flex items-center gap-2" id="talkAiBtn">
                <svg width="15" height="15" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                Talk to AI Companion
              </button>
              <button class="btn-secondary w-full justify-center flex items-center gap-2" id="trackMoodBtn">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                Track My Mood
              </button>
              <button class="btn-secondary w-full justify-center flex items-center gap-2" id="restartBtn">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                Retake Assessment
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  `;

  // Bindings
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const showResultsBtn = document.getElementById("showResultsBtn");
  const restartBtn = document.getElementById("restartBtn");

  prevBtn.onclick = () => {
    if (currentQuestion > 0) { currentQuestion--; renderQuestion(); }
  };

  nextBtn.onclick = () => {
    if (answers[currentQuestion] === null) return;
    if (currentQuestion < questions.length - 1) { 
      currentQuestion++; 
      renderQuestion(); 
    } else { 
      document.getElementById('quizView').classList.add('hidden');
      document.getElementById('completionView').classList.remove('hidden');
    }
  };

  showResultsBtn.onclick = () => {
    document.getElementById('completionView').classList.add('hidden');
    document.getElementById('resultsView').classList.remove('hidden');
    showResults();
  };

  restartBtn.onclick = () => {
    try { localStorage.removeItem('who5_answers'); localStorage.removeItem('who5_current'); } catch (e) {}
    renderWHO5Form();
  };

  document.getElementById('talkAiBtn').onclick = () => { location.href = 'chat.html'; };
  document.getElementById('trackMoodBtn').onclick = () => { location.href = 'history.html'; };

  if (document.getElementById("tabBar")) {
    document.getElementById("tabBar").onclick = () => switchTab('bar');
  }
  document.getElementById("tabRadar").onclick = () => switchTab('radar');
  document.getElementById("tabDist").onclick = () => switchTab('dist');

  function renderQuestion() {
    const total = questions.length;
    const qNum = currentQuestion + 1;
    document.getElementById('questionCounter').textContent = `Question ${qNum} of ${total}`;
    const pct = Math.round((qNum/total)*100);
    document.getElementById('progressPercent').textContent = `${pct}%`;
    document.getElementById('progressFill').style.width = `${pct}%`;
    document.getElementById('questionLabel').textContent = `Question ${qNum}`;
    document.getElementById('questionText').textContent = questions[currentQuestion];

    const list = document.getElementById('optionsList');
    list.innerHTML = '';
    optionLabels.forEach((opt, idx) => {
      const sel = answers[currentQuestion] === opt.score;
      const div = document.createElement('div');
      div.className = 'option' + (sel ? ' selected' : '');
      div.onclick = () => {
        answers[currentQuestion] = opt.score;
        try {
          localStorage.setItem('who5_answers', JSON.stringify(answers));
          localStorage.setItem('who5_current', String(currentQuestion));
        } catch(e){}
        renderQuestion();
      };
      div.innerHTML = `
        <div class="option-radio"></div>
        <div class="option-icon">${optionIcons[idx % optionIcons.length]}</div>
        <span class="flex-1 text-sm text-warm-dark font-medium">${opt.label}</span>
        <span style="font-size:11px;color:#8c8680;font-family:'JetBrains Mono',monospace;">${opt.tag}</span>
      `;
      list.appendChild(div);
    });

    prevBtn.disabled = currentQuestion === 0;
    nextBtn.disabled = answers[currentQuestion] === null;
    if (currentQuestion === total - 1) {
      nextBtn.innerHTML = `Finish <svg width="14" height="14" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;
    } else {
      nextBtn.innerHTML = `Next <svg width="14" height="14" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>`;
    }
  }

  function calculateScore() {
    const raw = answers.reduce((sum, val) => sum + (val || 0), 0);
    return raw * 4;
  }

  function showResults() {
    const score = calculateScore();
    document.getElementById('scoreValue').textContent = score;

    const circ = 2 * Math.PI * 52;
    const offset = circ - (score / 100) * circ;
    const ring = document.getElementById('scoreRing');
    ring.setAttribute('stroke-dasharray', circ.toFixed(1));
    setTimeout(() => { ring.style.strokeDashoffset = offset.toFixed(1); }, 100);

    const badge = document.getElementById('severityBadge');
    const text  = document.getElementById('severityText');
    let level;

    if (score <= 28) {
      level = 'likely depression';
      badge.className = 'badge badge-high mb-3';
      badge.innerHTML = `<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4M12 16h.01"/></svg> Likely Depression`;
      text.textContent = 'Your score suggests reduced emotional well-being that may be consistent with depressive symptoms. We recommend talking to a health professional.';
      ring.style.stroke = '#c83c28';
      setTimeout(() => { document.getElementById('rangeMarker').style.left = (score/28)*28 + '%'; }, 200);
    } else if (score <= 50) {
      level = 'poor well-being';
      badge.className = 'badge badge-moderate mb-3';
      badge.innerHTML = `<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4M12 16h.01"/></svg> Poor Well-Being`;
      text.textContent = 'Your responses show lower overall satisfaction and mood. Monitoring your energy and practicing self-care can be helpful.';
      ring.style.stroke = '#e8651a';
      setTimeout(() => { document.getElementById('rangeMarker').style.left = (28 + ((score-29)/22)*22) + '%'; }, 200);
    } else {
      level = 'good well-being';
      badge.className = 'badge badge-low mb-3';
      badge.innerHTML = `<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Good Well-Being`;
      text.textContent = 'Your score indicates healthy psychological well-being. Keep up your current routines and positive practices!';
      ring.style.stroke = '#5f8a4a';
      setTimeout(() => { document.getElementById('rangeMarker').style.left = (50 + ((score-51)/50)*48) + '%'; }, 200);
    }

    // Save history
    const entry = {
      type: 'WHO-5',
      label: 'Well-being',
      score,
      maxScore: 100,
      level,
      date: new Date().toISOString()
    };
    const hist = JSON.parse(localStorage.getItem('assessment_history') || '[]');
    hist.push(entry);
    localStorage.setItem('assessment_history', JSON.stringify(hist));

    buildBarChart();
    buildInsights(score);
    setTimeout(() => { buildDistChart(score); buildRadarChart(); }, 100);
  }

  function buildInsights(score) {
    const ins = [];
    if (score <= 50) {
      ins.push({ icon: `🌱`, bg: 'rgba(232,101,26,.1)', col: '#e8651a', text: "Consider starting a simple gratitude journal or daily mood check-in to trace triggers." });
    } else {
      ins.push({ icon: `✨`, bg: 'rgba(95,138,74,.1)', col: '#5f8a4a', text: "Your well-being is in a good range. Focus on maintaining social connections and physical exercise." });
    }
    document.getElementById('insightsList').innerHTML = ins.map(i => `
      <div class="insight-item">
        <div class="insight-icon" style="background:${i.bg};color:${i.col};font-size:12px;">${i.icon}</div>
        <p class="text-warm-dark text-xs">${i.text}</p>
      </div>
    `).join('');
  }

  function buildResponseReview() {
    const shortQs = ["Cheerful & spirits", "Calm & relaxed", "Active & vigorous", "Fresh & rested", "Daily interest"];
    document.getElementById('responseReview').innerHTML = answers.map((raw, idx) => {
      const opt = optionLabels.find(o => o.score === raw) || { label: "N/A" };
      return `
        <div class="flex items-center gap-3 py-2 border-b last:border-0" style="border-color:#ede9df;">
          <span style="font-size:11px;font-family:'JetBrains Mono',monospace;color:#8c8680;width:22px;flex-shrink:0;">Q${idx+1}</span>
          <span class="flex-1" style="font-size:12px;color:#8c8680;">${shortQs[idx]}</span>
          <span style="font-size:12px;font-weight:500;color:#2a2520;">${opt.label}</span>
        </div>
      `;
    }).join('');
  }

  function buildBarChart() {
    const shortQs = ["Cheerful & spirits", "Calm & relaxed", "Active & vigorous", "Fresh & rested", "Daily interest"];
    const container = document.getElementById('barList');
    if (!container) return;
    container.innerHTML = '';
    answers.forEach((raw, idx) => {
      const pct = (raw / 5) * 100;
      const cols = ['#ede9df', '#c8b878', '#e8a84d', '#e8651a', '#e8651a', '#5f8a4a'];
      const barColor = cols[raw];
      const row = document.createElement('div');
      row.innerHTML = `
        <div class="flex items-center justify-between mb-1">
          <span style="font-size:11px;color:#8c8680;" class="flex items-center gap-1">
            <span style="font-family:'JetBrains Mono',monospace;font-size:10px;">Q${idx+1}</span> — ${shortQs[idx]}
          </span>
          <span style="font-size:11px;font-family:'JetBrains Mono',monospace;color:#2a2520;">${raw}/5</span>
        </div>
        <div class="bar-bg"><div class="bar-fill" style="width:${pct}%;background:${barColor};"></div></div>
      `;
      container.appendChild(row);
    });
  }

  function buildRadarChart() {
    const canvas = document.getElementById('radarCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W=canvas.width, H=canvas.height;
    const cx=W/2, cy=H/2, R=Math.min(W,H)/2-44;
    const domains = [
      { label: "Cheerful & spirits", val: answers[0], max: 5 },
      { label: "Calm & relaxed", val: answers[1], max: 5 },
      { label: "Active & vigorous", val: answers[2], max: 5 },
      { label: "Fresh & rested", val: answers[3], max: 5 },
      { label: "Daily interest", val: answers[4], max: 5 }
    ];
    const n = domains.length;
    const aStep = (2 * Math.PI) / n;

    ctx.clearRect(0, 0, W, H);
    for (let ring = 1; ring <= 4; ring++) {
      const r = (ring / 4) * R;
      ctx.beginPath();
      for (let a = 0; a < n; a++) {
        const angle = a * aStep - Math.PI / 2;
        const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle);
        a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = ring === 4 ? '#c8b878' : '#d8d3c8'; ctx.stroke();
      ctx.fillStyle = 'rgba(140,134,128,.06)'; ctx.fill();
    }
    domains.forEach((_, a) => {
      const angle = a * aStep - Math.PI / 2;
      ctx.beginPath();ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
      ctx.strokeStyle = '#d8d3c8'; ctx.stroke();
    });
    ctx.beginPath();
    domains.forEach((d, a) => {
      const pct = d.val / d.max;
      const r = pct * R;
      const angle = a * aStep - Math.PI / 2;
      const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle);
      a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(232,101,26,.14)'; ctx.fill();
    ctx.strokeStyle = '#e8651a'; ctx.lineWidth = 2; ctx.stroke();

    ctx.fillStyle = '#2a2520'; ctx.font = '11px DM Sans,sans-serif';
    domains.forEach((d, a) => {
      const angle = a * aStep - Math.PI / 2;
      const lx = cx + (R + 24) * Math.cos(angle);
      const ly = cy + (R + 24) * Math.sin(angle);
      ctx.textAlign = lx < cx - 5 ? 'right' : lx > cx + 5 ? 'left' : 'center';
      ctx.fillText(`${d.label} (${d.val}/${d.max})`, lx, ly + 4);
    });
  }

  function switchTab(tab) {
    ['bar', 'radar', 'dist'].forEach(t => {
      const key = t.charAt(0).toUpperCase()+t.slice(1);
      const chartEl = document.getElementById('chart'+key);
      const tabEl = document.getElementById('tab'+key);
      if (chartEl) chartEl.classList.toggle('hidden', t!==tab);
      if (tabEl) tabEl.classList.toggle('active', t===tab);
    });
    if (tab==='radar') { setTimeout(buildRadarChart, 50); }
    if (tab==='dist')  { setTimeout(() => buildDistChart(calculateScore()), 50); }
  }

  renderQuestion();
}
