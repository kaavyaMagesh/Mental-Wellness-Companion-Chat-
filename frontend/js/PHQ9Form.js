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
    .range-track{position:absolute;inset:0;border-radius:999px;background:linear-gradient(90deg,#5f8a4a 33%,#e8651a 66%,#c83c28 100%);}
    .range-marker{position:absolute;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:50%;background:white;border:3px solid #2a2520;box-shadow:0 1px 4px rgba(0,0,0,.18);transition:left .8s ease;}
    .tab-btn{padding:7px 14px;font-size:12px;border-radius:4px;border:none;background:transparent;cursor:pointer;color:#8c8680;font-weight:500;transition:all .15s;}
    .tab-btn.active{background:white;color:#2a2520;box-shadow:0 1px 3px rgba(0,0,0,.08);}
  `;
  document.head.appendChild(style);
}

export function renderPHQ9Form() {
  injectStyles();
  const app = document.getElementById("app");

  const questions = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the paper or watching television",
    "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
    "Thoughts that you would be better off dead or of hurting yourself in some way"
  ];

  const optionLabels = [
    { label: "Not at all", score: 0, color: "#ded9cf", tag: "Rare" },
    { label: "Several days", score: 1, color: "#c8b878", tag: "Low" },
    { label: "More than half the days", score: 2, color: "#e8a84d", tag: "Moderate" },
    { label: "Nearly every day", score: 3, color: "#c83c28", tag: "Peak" }
  ];

  const optionIcons = [
    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6"/></svg>`,
    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M8.5 14.5s1 1 3.5 1 3.5-1 3.5-1M9 9h.01M15 9h.01"/></svg>`,
    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 15s1 .5 3 0M15 15s-1 .5-3 0M9 9h.01M15 9h.01"/></svg>`,
    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M8 15s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>`
  ];

  let currentQuestion = 0;
  let answers = new Array(questions.length).fill(null);

  // Load answers if they exist
  try {
    const s = localStorage.getItem('phq9_answers');
    const q = localStorage.getItem('phq9_current');
    if (s) answers = JSON.parse(s);
    if (q) currentQuestion = parseInt(q, 10);
  } catch (e) {}

  // Render Layout
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

        <div style="padding:10px 20px; flex-shrink:0; border-bottom:1px solid #d8d3c8;">
          <a href="chat.html" class="btn-primary" style="display:block; text-align:center; text-decoration:none; font-size:11px; padding:8px 14px; width:100%; justify-content:center;">
            ← Back to Chat
          </a>
        </div>

        <nav class="flex-1 p-4 flex flex-col gap-2">
          <a href="chat.html" class="nav-item px-3 py-2 rounded-md hover:bg-orange/5 text-warm-gray hover:text-warm-dark text-sm cursor-pointer no-underline block">
            Chat Assistant
          </a>
          <a href="mental-wellness-assessments.html" class="nav-item active px-3 py-2 rounded-md bg-orange/10 text-orange font-medium text-sm cursor-pointer no-underline block">
            Assessments
          </a>
          <a href="support.html" class="nav-item px-3 py-2 rounded-md hover:bg-orange/5 text-warm-gray hover:text-warm-dark text-sm cursor-pointer no-underline block">
            Support Center
          </a>
        </nav>

        <div style="margin-top:auto; border-top:1px solid #d8d3c8; padding:10px 12px; flex-shrink:0;">
          <div style="width:100%;display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:7px;">
            <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,rgba(232,101,26,.18),rgba(240,137,77,.15));display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <svg width="13" height="13" fill="none" stroke="#e8651a" stroke-width="1.5" viewBox="0 0 16 16"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5"/></svg>
            </div>
            <div style="flex:1;min-width:0;">
              <p style="font-size:11px;font-weight:500;color:#2a2520;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Guest User</p>
              <p style="font-size:9px;color:#8c8680;">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="flex-1 overflow-y-auto bg-cream p-4 sm:p-8 md:p-12">
        <div class="max-w-2xl mx-auto">
          
          <!-- QUIZ VIEW -->
          <div id="quizView" class="w-full flex flex-col">
            <div class="mb-6">
              <h1 class="font-serif text-2xl sm:text-3xl text-warm-dark mb-1">PHQ-9 Depression Assessment</h1>
              <p class="text-sm text-warm-gray mb-5">Clinically screens for and monitors the severity of depression over the past 2 weeks.</p>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-warm-gray" id="questionCounter">Question 1 of 9</span>
                <span class="text-xs font-mono text-warm-gray" id="progressPercent">11%</span>
              </div>
              <div class="progress-track"><div class="progress-fill" id="progressFill" style="width:11%;"></div></div>
            </div>

            <div class="card p-5 mb-5">
              <p class="text-sm font-medium text-warm-dark mb-1">Over the last 2 weeks, how often have you been bothered by any of the following problems?</p>
              <p class="text-xs text-warm-gray">Select the option that best describes your experience.</p>
            </div>

            <div class="card p-5 sm:p-6 mb-6" id="questionCard">
              <div class="flex items-center justify-between mb-3">
                <p class="text-[11px] font-medium text-orange uppercase tracking-wider" id="questionLabel">Question 1</p>
              </div>
              <h2 class="font-serif text-lg sm:text-xl text-warm-dark mb-5 leading-snug" id="questionText"></h2>
              <div class="space-y-2" id="optionsList"></div>
            </div>

            <div class="flex items-center justify-between">
              <button class="btn-secondary" id="prevBtn">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                Previous
              </button>
              <button class="btn-primary" id="nextBtn" disabled>
                Next
                <svg width="14" height="14" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          <!-- COMPLETION VIEW -->
          <div id="completionView" class="hidden w-full">
            <div class="card p-8 sm:p-10 text-center">
              <div class="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-orange to-orange-light flex items-center justify-center">
                <svg width="28" height="28" fill="none" stroke="white" stroke-width="2.2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h1 class="font-serif text-2xl sm:text-3xl text-warm-dark mb-2">Assessment Complete</h1>
              <p class="text-sm text-warm-gray mb-8">Thank you for completing the PHQ-9 Depression Assessment. Your results are ready.</p>
              <button class="btn-primary" id="showResultsBtn">
                <svg width="15" height="15" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                View My Results
              </button>
            </div>
          </div>

          <!-- RESULTS VIEW -->
          <div id="resultsView" class="hidden w-full space-y-6">
            <div class="card p-6 sm:p-8 text-center flex flex-col items-center">
              <p class="text-[11px] font-medium text-warm-gray uppercase tracking-wider mb-4">Your Depression Score</p>
              <div class="relative w-36 h-36 mb-4">
                <svg viewBox="0 0 120 120" class="w-full h-full">
                  <circle class="score-ring-bg" cx="60" cy="60" r="52" fill="none" stroke-width="10"/>
                  <circle class="score-ring-fill" id="scoreRing" cx="60" cy="60" r="52" fill="none" stroke-width="10" stroke-dasharray="326.7" stroke-dashoffset="326.7"/>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="font-serif text-3xl text-warm-dark" id="scoreValue">0</span>
                  <span class="text-xs text-warm-gray">/ 27</span>
                </div>
              </div>
              <span class="badge badge-moderate mb-3" id="severityBadge">Minimal Depression</span>
              <p class="text-sm text-warm-gray leading-relaxed max-w-md" id="severityText"></p>

              <!-- Range bar -->
              <div class="mt-5 w-full max-w-xs">
                <div class="range-bar">
                  <div class="range-track" style="background: linear-gradient(90deg, #5f8a4a 33%, #e8651a 66%, #c83c28 100%);"></div>
                  <div class="range-marker" id="rangeMarker" style="left:50%;"></div>
                </div>
                <div class="flex justify-between text-[10px] text-warm-gray mt-1">
                  <span>Minimal (0–4)</span><span>Mild/Mod (5-19)</span><span>Severe (20–27)</span>
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
                <p class="text-xs text-warm-gray mb-3">Score contribution per question (maximum score is 3)</p>
                <div id="barList" class="space-y-3"></div>
              </div>

              <div id="chartRadar" class="hidden">
                <p class="text-xs text-warm-gray mb-3">Visualisation across all 9 items — outer edge = maximum (3).</p>
                <canvas id="radarCanvas" width="420" height="300" style="max-width:100%;margin:0 auto;"></canvas>
              </div>

              <div id="chartDist" class="hidden">
                <p class="text-xs text-warm-gray mb-3">Approximate PHQ-9 adult population distribution — where your score sits.</p>
                <canvas id="distCanvas" width="420" height="200" style="max-width:100%;margin:0 auto;"></canvas>
                <div class="mt-3 flex items-center gap-4 justify-center flex-wrap text-xs text-warm-gray">
                  <span class="flex items-center gap-1"><span class="inline-block w-3 h-3 rounded-sm" style="background:#d8d3c8;"></span>Population distribution</span>
                  <span class="flex items-center gap-1"><span class="inline-block w-3 h-3 rounded-sm" style="background:#e8651a;"></span>Your score</span>
                </div>
              </div>
            </div>

            <!-- Domain Breakdown -->
            <div class="card p-5 sm:p-6">
              <h3 class="font-serif text-lg text-warm-dark mb-1">Domain Breakdown</h3>
              <p class="text-xs text-warm-gray mb-4">The PHQ-9 measures both cognitive and physical signs of depression.</p>
              <div id="domainCards" class="grid grid-cols-1 sm:grid-cols-2 gap-3"></div>
            </div>

            <!-- Personalised Insights -->
            <div class="card p-5 sm:p-6">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-6 h-6 rounded bg-gradient-to-br from-orange to-orange-light flex items-center justify-center flex-shrink-0">
                  <svg width="12" height="12" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                </div>
                <h3 class="font-serif text-lg text-warm-dark">Personalised Insights</h3>
              </div>
              <p class="text-xs text-warm-gray mb-3">Based on your response pattern:</p>
              <div id="insightsList" class="space-y-2"></div>
            </div>

            <!-- Recommended Resources -->
            <div class="card p-5 sm:p-6 mb-5">
              <h3 class="font-serif text-lg text-warm-dark mb-4">Recommended Resources</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div class="resource-item">
                  <div class="resource-icon">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                  </div>
                  <div><p class="text-sm font-medium text-warm-dark">Mood Lifting Guide</p><p class="text-xs text-warm-gray">Behavioral activation strategies</p></div>
                </div>
                <div class="resource-item">
                  <div class="resource-icon">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg>
                  </div>
                  <div><p class="text-sm font-medium text-warm-dark">Thought Reframing Sheet</p><p class="text-xs text-warm-gray">Cognitive restructuring worksheets</p></div>
                </div>
                <div class="resource-item">
                  <div class="resource-icon">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </div>
                  <div><p class="text-sm font-medium text-warm-dark">Daily Activity Planner</p><p class="text-xs text-warm-gray">Structured routines for energy and motivation</p></div>
                </div>
                <div class="resource-item sm:col-span-2">
                  <div class="resource-icon">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                  </div>
                  <div><p class="text-sm font-medium text-warm-dark">Supportive Coping Skills</p><p class="text-xs text-warm-gray">Daily practices to build emotional resilience and support overall wellbeing</p></div>
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
                  <p class="text-xs font-medium text-warm-dark mb-1">About the PHQ-9</p>
                  <p class="text-xs text-warm-gray leading-relaxed">Developed by Kroenke, Spitzer &amp; Williams (2001). This is a validated psychological screening tool for depressive symptoms, not a clinical diagnosis. Scores reflect the past two weeks. If you are concerned about your mental health, please consult a qualified professional.</p>
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

  // Define actions & bindings
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
    try { localStorage.removeItem('phq9_answers'); localStorage.removeItem('phq9_current'); } catch (e) {}
    renderPHQ9Form();
  };

  document.getElementById('talkAiBtn').onclick = () => { location.href = 'chat.html'; };
  document.getElementById('trackMoodBtn').onclick = () => { location.href = 'history.html'; };

  // Switch tab buttons
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
          localStorage.setItem('phq9_answers', JSON.stringify(answers));
          localStorage.setItem('phq9_current', String(currentQuestion));
        } catch(e){}
        renderQuestion();
      };
      div.innerHTML = `
        <div class="option-radio"></div>
        <div class="option-icon">${optionIcons[idx]}</div>
        <span class="flex-1 text-sm text-warm-dark font-medium">${opt.label}</span>
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
    let t = 0;
    answers.forEach((s) => {
      if (s !== null) t += s;
    });
    return t;
  }

  function showResults() {
    const score = calculateScore();
    document.getElementById('scoreValue').textContent = score;

    const circ = 2 * Math.PI * 52;
    const offset = circ - (score / 27) * circ;
    const ring = document.getElementById('scoreRing');
    ring.setAttribute('stroke-dasharray', circ.toFixed(1));
    setTimeout(() => { ring.style.strokeDashoffset = offset.toFixed(1); }, 100);

    const badge = document.getElementById('severityBadge');
    const text  = document.getElementById('severityText');
    let level;

    if (score <= 4) {
      level = 'minimal';
      badge.className = 'badge badge-low mb-3';
      badge.innerHTML = `<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Minimal Depression`;
      text.textContent = 'Your responses suggest minimal depressive symptoms. Your mood and interest levels appear steady.';
      ring.style.stroke = '#5f8a4a';
      setTimeout(() => { document.getElementById('rangeMarker').style.left = Math.min(20, (score/4)*20)+'%'; }, 200);
    } else if (score <= 9) {
      level = 'mild';
      badge.className = 'badge badge-low mb-3';
      badge.innerHTML = `<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Mild Depression`;
      text.textContent = 'You are experiencing mild depressive symptoms. Some fatigue or mood changes might be present but manageable.';
      ring.style.stroke = '#c8b878';
      setTimeout(() => { document.getElementById('rangeMarker').style.left = (20 + ((score-5)/5)*20)+'%'; }, 200);
    } else if (score <= 14) {
      level = 'moderate';
      badge.className = 'badge badge-moderate mb-3';
      badge.innerHTML = `<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4M12 16h.01"/></svg> Moderate Depression`;
      text.textContent = 'Your responses indicate moderate depressive symptoms. It may be helpful to build structured self-care routines.';
      ring.style.stroke = '#e8a84d';
      setTimeout(() => { document.getElementById('rangeMarker').style.left = (40 + ((score-10)/5)*20)+'%'; }, 200);
    } else if (score <= 19) {
      level = 'moderately-severe';
      badge.className = 'badge badge-moderate mb-3';
      badge.innerHTML = `<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4M12 16h.01"/></svg> Moderately Severe Depression`;
      text.textContent = 'Your responses indicate moderately severe depressive symptoms. Consider speaking to a mental health professional for support.';
      ring.style.stroke = '#e8651a';
      setTimeout(() => { document.getElementById('rangeMarker').style.left = (60 + ((score-15)/5)*20)+'%'; }, 200);
    } else {
      level = 'severe';
      badge.className = 'badge badge-high mb-3';
      badge.innerHTML = `<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4M12 16h.01"/></svg> Severe Depression`;
      text.textContent = 'Your responses indicate severe depressive symptoms. We strongly advise speaking with a doctor or mental health professional.';
      ring.style.stroke = '#c83c28';
      setTimeout(() => { document.getElementById('rangeMarker').style.left = Math.min(97, 80+((score-20)/7)*17)+'%'; }, 200);
    }

    // ── Save to history ───────────────────────────────────────────────────
    const historyEntry = {
      type: 'PHQ-9',
      label: 'Depression',
      score,
      maxScore: 27,
      level,
      date: new Date().toISOString()
    };
    const phqHistory = JSON.parse(localStorage.getItem('assessment_history') || '[]');
    phqHistory.push(historyEntry);
    localStorage.setItem('assessment_history', JSON.stringify(phqHistory));
    // ─────────────────────────────────────────────────────────────────────

    buildBarChart();
    buildDomainCards();
    buildInsights(score, level);
    buildResponseReview();
    setTimeout(() => { buildDistChart(score); buildRadarChart(); }, 100);
  }

  function buildBarChart() {
    const shortQs = ["Anhedonia", "Depressed mood", "Sleep disturbance", "Fatigue", "Appetite change", "Low self-worth", "Concentration", "Psychomotor change", "Suicidal ideation"];
    const container = document.getElementById('barList');
    container.innerHTML = '';
    answers.forEach((raw, idx) => {
      const eff = raw || 0;
      const pct = (eff/3)*100;
      const cols = ['#ede9df', '#c8b878', '#e8651a', '#c83c28'];
      const barColor = cols[eff];
      const row = document.createElement('div');
      row.innerHTML = `
        <div class="flex items-center justify-between mb-1">
          <span style="font-size:11px;color:#8c8680;" class="flex items-center gap-1">
            <span style="font-family:'JetBrains Mono',monospace;font-size:10px;">Q${idx+1}</span> — ${shortQs[idx]}
          </span>
          <span style="font-size:11px;font-family:'JetBrains Mono',monospace;color:#2a2520;">${eff}/3</span>
        </div>
        <div class="bar-bg"><div class="bar-fill" style="width:${pct}%;background:${barColor};"></div></div>
      `;
      container.appendChild(row);
    });
  }

  function buildDomainCards() {
    const cogIdxs = [0, 1, 5, 8];
    const somIdxs = [2, 3, 4, 6, 7];
    const cogScore = cogIdxs.reduce((s, i) => s + (answers[i] || 0), 0);
    const somScore = somIdxs.reduce((s, i) => s + (answers[i] || 0), 0);
    const cogMax = cogIdxs.length*3;
    const somMax = somIdxs.length*3;
    document.getElementById('domainCards').innerHTML = `
      <div class="card p-4" style="background:rgba(232,101,26,.04);">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-7 h-7 rounded flex items-center justify-center" style="background:rgba(232,101,26,.12);color:#e8651a;">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4M12 16h.01"/></svg>
          </div>
          <p class="text-xs font-medium text-warm-dark">Cognitive &amp; Mood</p>
        </div>
        <p class="font-serif text-2xl text-warm-dark mb-1">${cogScore}<span class="text-sm text-warm-gray font-sans"> / ${cogMax}</span></p>
        <div class="bar-bg mt-2"><div class="bar-fill" style="width:${(cogScore/cogMax)*100}%;background:#e8651a;"></div></div>
        <p class="text-xs text-warm-gray mt-2">Mood, self-worth, pleasure levels, and thoughts</p>
      </div>
      <div class="card p-4" style="background:rgba(200,60,40,.04);">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-7 h-7 rounded flex items-center justify-center" style="background:rgba(200,60,40,.12);color:#c83c28;">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/></svg>
          </div>
          <p class="text-xs font-medium text-warm-dark">Somatic &amp; Physical</p>
        </div>
        <p class="font-serif text-2xl text-warm-dark mb-1">${somScore}<span class="text-sm text-warm-gray font-sans"> / ${somMax}</span></p>
        <div class="bar-bg mt-2"><div class="bar-fill" style="width:${(somScore/somMax)*100}%;background:#c83c28;"></div></div>
        <p class="text-xs text-warm-gray mt-2">Sleep, energy, appetite, concentration, and motor speed</p>
      </div>
    `;
  }

  function buildInsights(score, level) {
    const ins = [];
    
    // Question 9 warning check (Safety critical)
    if ((answers[8] || 0) >= 1) {
      ins.push({
        icon: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
        bg: 'rgba(220,38,38,0.15)',
        col: '#dc2626',
        text: 'Thoughts of self-harm or suicide were indicated. Please contact a professional or call the Suicide & Crisis Lifeline at 988 immediately.'
      });
    }

    if ((answers[0] || 0) >= 2 || (answers[1] || 0) >= 2) {
      ins.push({icon:`<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4M12 16h.01"/></svg>`, bg:'rgba(232,101,26,.1)', col:'#e8651a', text:'Reduced interest/pleasure and low mood reported. Try behavioral activation: schedule one small, pleasant activity daily.'});
    }
    if ((answers[2] || 0) >= 2 || (answers[3] || 0) >= 2) {
      ins.push({icon:`<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`, bg:'rgba(95,138,74,.12)', col:'#5f8a4a', text:'Sleep issues or low energy are prominent. Focus on basic sleep hygiene (limit screen time 1 hour before bed, fixed wake times).'});
    }
    if (level === 'minimal') {
      ins.push({icon:`<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`, bg:'rgba(95,138,74,.12)', col:'#5f8a4a', text:'Your depressive screening score is low. Maintain current physical activities and social bonds.'});
    }

    document.getElementById('insightsList').innerHTML = ins.map(i => `
      <div class="insight-item">
        <div class="insight-icon" style="background:${i.bg};color:${i.col};">${i.icon}</div>
        <p class="text-warm-dark">${i.text}</p>
      </div>
    `).join('');
  }

  function buildResponseReview() {
    const shortQs = ["Anhedonia", "Depressed mood", "Sleep issues", "Fatigue", "Appetite changes", "Low self-worth", "Concentration difficulties", "Psychomotor changes", "Self-harm thoughts"];
    document.getElementById('responseReview').innerHTML = answers.map((raw, idx) => {
      const opt = optionLabels[raw];
      return `
        <div class="flex items-center gap-3 py-2 border-b last:border-0" style="border-color:#ede9df;">
          <span style="font-size:11px;font-family:'JetBrains Mono',monospace;color:#8c8680;width:22px;flex-shrink:0;">Q${idx+1}</span>
          <span class="flex-1" style="font-size:12px;color:#8c8680;">${shortQs[idx]}</span>
          <span style="font-size:12px;font-weight:500;color:#2a2520;">${opt.label}</span>
        </div>
      `;
    }).join('');
  }

  function buildDistChart(userScore) {
    const canvas = document.getElementById('distCanvas');
    const ctx = canvas.getContext('2d');
    const W=canvas.width, H=canvas.height;
    const pad={top:18, right:18, bottom:32, left:32};
    const bins=[];
    for (let s=0; s<=27; s++) {
      const z=(s-3.5)/3.8;
      bins.push({score:s, freq:Math.exp(-.5*z*z)*100});
    }
    const maxF=Math.max(...bins.map(b=>b.freq));
    const cW=W-pad.left-pad.right, cH=H-pad.top-pad.bottom;
    const bW=cW/bins.length;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle='#ede9df'; ctx.lineWidth=1;
    [.25, .5, .75, 1].forEach(f => {
      const y=pad.top+cH*(1-f);
      ctx.beginPath();ctx.moveTo(pad.left, y);ctx.lineTo(pad.left+cW, y);ctx.stroke();
    });
    bins.forEach((b, i) => {
      const bh=(b.freq/maxF)*cH;
      const x=pad.left+i*bW;
      const y=pad.top+cH-bh;
      ctx.fillStyle=(b.score===userScore)?'#e8651a':'#d8d3c8';
      ctx.fillRect(x+1, y, bW-2, bh);
    });
    ctx.fillStyle='#8c8680'; ctx.font='10px DM Sans,sans-serif'; ctx.textAlign='center';
    [0, 4, 9, 14, 19, 27].forEach(s => {
      const x=pad.left+(s/27)*cW;
      ctx.fillText(s, x, H-6);
      if (s===4 || s===9 || s===14 || s===19) {
        ctx.strokeStyle='rgba(140,134,128,.4)'; ctx.lineWidth=1; ctx.setLineDash([3, 3]);
        ctx.beginPath();ctx.moveTo(x, pad.top);ctx.lineTo(x, pad.top+cH);ctx.stroke();
        ctx.setLineDash([]);
      }
    });
    const ux=pad.left+(userScore/27)*cW;
    ctx.strokeStyle='#e8651a'; ctx.lineWidth=2; ctx.setLineDash([4, 3]);
    ctx.beginPath();ctx.moveTo(ux, pad.top);ctx.lineTo(ux, pad.top+cH);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#e8651a'; ctx.font='bold 10px DM Sans,sans-serif'; ctx.textAlign='center';
    ctx.fillText('You: '+userScore, ux, pad.top+10);
  }

  function buildRadarChart() {
    const canvas = document.getElementById('radarCanvas');
    const ctx = canvas.getContext('2d');
    const W=canvas.width, H=canvas.height;
    const cx=W/2, cy=H/2, R=Math.min(W,H)/2-44;
    const axes=[
      {label:'Anhedonia', idx:0},
      {label:'Depressed mood', idx:1},
      {label:'Sleep issues', idx:2},
      {label:'Fatigue', idx:3},
      {label:'Appetite', idx:4},
      {label:'Self-worth', idx:5},
      {label:'Concentration', idx:6},
      {label:'Psychomotor', idx:7},
      {label:'Self-harm thoughts', idx:8}
    ];
    const n=axes.length;
    const aStep=(2*Math.PI)/n;

    ctx.clearRect(0, 0, W, H);
    for (let ring=1; ring<=3; ring++) {
      const r=(ring/3)*R;
      ctx.beginPath();
      for (let a=0; a<n; a++) {
        const angle=a*aStep-Math.PI/2;
        const x=cx+r*Math.cos(angle), y=cy+r*Math.sin(angle);
        a===0?ctx.moveTo(x, y):ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle=ring===3?'#c8b878':'#d8d3c8'; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle='rgba(140,134,128,.06)'; ctx.fill();
    }
    axes.forEach((_, a) => {
      const angle=a*aStep-Math.PI/2;
      ctx.beginPath();ctx.moveTo(cx, cy);
      ctx.lineTo(cx+R*Math.cos(angle), cy+R*Math.sin(angle));
      ctx.strokeStyle='#d8d3c8'; ctx.lineWidth=1; ctx.stroke();
    });
    ctx.beginPath();
    axes.forEach((ax, a) => {
      const val=answers[ax.idx] || 0, r=(val/3)*R;
      const angle=a*aStep-Math.PI/2;
      const x=cx+r*Math.cos(angle), y=cy+r*Math.sin(angle);
      a===0?ctx.moveTo(x, y):ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle='rgba(232,101,26,.14)'; ctx.fill();
    ctx.strokeStyle='#e8651a'; ctx.lineWidth=2; ctx.stroke();
    axes.forEach((ax, a) => {
      const val=answers[ax.idx] || 0, r=(val/3)*R;
      const angle=a*aStep-Math.PI/2;
      const x=cx+r*Math.cos(angle), y=cy+r*Math.sin(angle);
      ctx.beginPath();ctx.arc(x, y, 4, 0, 2*Math.PI);
      ctx.fillStyle='#e8651a'; ctx.fill();
      ctx.fillStyle='white'; ctx.beginPath();ctx.arc(x, y, 2, 0, 2*Math.PI);ctx.fill();
    });
    ctx.fillStyle='#2a2520'; ctx.font='11px DM Sans,sans-serif';
    axes.forEach((ax, a) => {
      const angle=a*aStep-Math.PI/2;
      const lx=cx+(R+28)*Math.cos(angle);
      const ly=cy+(R+28)*Math.sin(angle);
      ctx.textAlign=(lx<cx-5)?'right':(lx>cx+5)?'left':'center';
      ctx.fillText(ax.label, lx, ly+4);
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
