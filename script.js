const API_URL = "https://script.google.com/macros/s/AKfycbyoMQPvuxffrZMhTZ4Az4BOPojFRb_A9yBqnbUs_xZh2sl8XAbksObCDlsd-RbeM9qx/exec";

const SESSION_1_COUNT = 30;
const FINAL_COUNT = 120;
const PASS_PERCENT = 80;
const TOTAL_TIME_SECONDS = 90 * 60;

let student = {};
let attemptId = "";
let sessionToken = "";
let timer = TOTAL_TIME_SECONDS;
let timerInterval = null;
let currentSection = 1;
let currentIndex = 0;
let answers = { session1: [], final: [] };
let securityViolations = 0;
let submitted = false;

function makeDummyQuestion(n, section) {
  return {
    question: `DUMMY QUESTION ${n}: Which is the correct answer for this test item?`,
    tagalog: `DUMMY QUESTION ${n}: Alin ang tamang sagot para sa test item na ito?`,
    image: "", // Add image filename later, e.g. "images/q01.jpg"
    options: [
      "A. First choice",
      "B. Second choice",
      "C. Third choice",
      "D. Fourth choice"
    ],
    correct: n % 4
  };
}

const session1Questions = Array.from(
  { length: SESSION_1_COUNT },
  (_, i) => makeDummyQuestion(i + 1, 1)
);

const finalQuestions = Array.from(
  { length: FINAL_COUNT },
  (_, i) => makeDummyQuestion(i + 1, 2)
);

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[c]));
}

window.startAuthenticatedExam = function(data) {
  student = data.student || {};
  attemptId = data.attemptId || "";
  sessionToken = data.sessionToken || "";
  currentSection = 1;
  currentIndex = 0;
  answers = { session1: [], final: [] };
  timer = TOTAL_TIME_SECONDS;
  securityViolations = 0;
  submitted = false;

  try {
    document.documentElement.requestFullscreen?.();
  } catch (_) {}

  renderExam();
};

function renderExam() {
  document.getElementById("app").innerHTML = `
    <div class="exam-shell">
      <header class="exam-header">
        <div>
          <div class="brand">A1C DRIVING ACADEMY</div>
          <h1 id="sectionTitle">TDC 1st Session Exam</h1>
        </div>
        <div class="timer-box">
          <small>OVERALL TIME LEFT</small>
          <strong id="timer">90:00</strong>
        </div>
      </header>

      <div class="student-strip">
        <span><b>${esc(student.fullName)}</b></span>
        <span>Attempt: ${esc(attemptId)}</span>
      </div>

      <div id="securityBanner" class="security-banner">
        Examination monitoring is active.
      </div>

      <main id="questionArea"></main>
      <div id="navArea"></div>
    </div>
  `;

  renderQuestion();
  startTimer();
}

function getQuestions() {
  return currentSection === 1 ? session1Questions : finalQuestions;
}

function getAnswers() {
  return currentSection === 1 ? answers.session1 : answers.final;
}

function renderQuestion() {
  const questions = getQuestions();
  const selectedAnswers = getAnswers();
  const q = questions[currentIndex];
  const selected = selectedAnswers[currentIndex];

  document.getElementById("sectionTitle").textContent =
    currentSection === 1
      ? "TDC 1st Session Exam — 30 Items"
      : "TDC Final Exam — 120 Items";

  const imageHtml = q.image
    ? `<img class="question-image" src="${esc(q.image)}" alt="Question image">`
    : `<div class="image-placeholder">QUESTION IMAGE<br><small>Will be added later</small></div>`;

  document.getElementById("questionArea").innerHTML = `
    <div class="progress">Question ${currentIndex + 1} of ${questions.length}</div>

    <section class="question-card">
      ${imageHtml}
      <h2>${esc(q.question)}</h2>
      <p class="tagalog">${esc(q.tagalog)}</p>

      <div class="options">
        ${q.options.map((option, i) => `
          <button class="option ${selected === i ? "selected" : ""}"
                  onclick="selectAnswer(${i})">
            ${esc(option)}
          </button>
        `).join("")}
      </div>
    </section>

    <div class="question-grid">
      ${questions.map((_, i) => `
        <button
          class="${selectedAnswers[i] !== undefined ? "answered" : ""} ${i === currentIndex ? "current" : ""}"
          onclick="goTo(${i})">${i + 1}</button>
      `).join("")}
    </div>
  `;

  document.getElementById("navArea").innerHTML = `
    <div class="nav-row">
      <button class="nav-btn" onclick="previousQuestion()" ${currentIndex === 0 ? "disabled" : ""}>
        Previous
      </button>

      ${
        currentIndex < questions.length - 1
          ? `<button class="nav-btn primary" onclick="nextQuestion()">Next</button>`
          : `<button class="nav-btn submit" onclick="reviewSection()">Review & Submit</button>`
      }
    </div>
  `;
}

function selectAnswer(index) {
  getAnswers()[currentIndex] = index;
  renderQuestion();
}

function nextQuestion() {
  if (currentIndex < getQuestions().length - 1) {
    currentIndex++;
    renderQuestion();
  }
}

function previousQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
}

function goTo(index) {
  currentIndex = index;
  renderQuestion();
}

function reviewSection() {
  const questions = getQuestions();
  const selectedAnswers = getAnswers();
  const unanswered = selectedAnswers.filter(x => x === undefined).length;

  document.getElementById("questionArea").innerHTML = `
    <section class="review-card">
      <h2>Review Your Answers</h2>
      <p>
        ${currentSection === 1 ? "TDC 1st Session" : "TDC Final Exam"}
        — ${questions.length} items
      </p>

      <div class="review-status">
        <b>${questions.length - unanswered}</b> answered
        &nbsp; | &nbsp;
        <b>${unanswered}</b> unanswered
      </div>

      <div class="review-grid">
        ${questions.map((_, i) => `
          <button class="${selectedAnswers[i] !== undefined ? "answered" : "unanswered"}"
                  onclick="goTo(${i})">${i + 1}</button>
        `).join("")}
      </div>

      <div class="nav-row">
        <button class="nav-btn" onclick="renderQuestion()">Return to Questions</button>
        <button class="nav-btn submit" onclick="confirmSubmitSection()">Submit Section</button>
      </div>
    </section>
  `;

  document.getElementById("navArea").innerHTML = "";
}

function confirmSubmitSection() {
  const unanswered = getAnswers().filter(x => x === undefined).length;

  const message = unanswered
    ? `You still have ${unanswered} unanswered item(s). Submit anyway?`
    : "Submit this section? Your answers cannot be changed afterward.";

  if (confirm(message)) {
    submitSection();
  }
}

function calculateScore(questions, selectedAnswers) {
  return questions.reduce(
    (score, question, index) =>
      score + (selectedAnswers[index] === question.correct ? 1 : 0),
    0
  );
}

function submitSection() {
  const questions = getQuestions();
  const score = calculateScore(questions, getAnswers());

  if (currentSection === 1) {
    showSession1Result(score);
  } else {
    showFinalResult(score);
  }
}

function showSession1Result(score) {
  const percent = (score / SESSION_1_COUNT) * 100;
  const passed = percent >= PASS_PERCENT;

  document.getElementById("questionArea").innerHTML = `
    <section class="result-card">
      <h2>TDC 1st Session Result</h2>
      <div class="big-score">${score} / ${SESSION_1_COUNT}</div>
      <div class="percent">${percent.toFixed(2)}%</div>
      <div class="${passed ? "pass" : "fail"}">
        ${passed ? "PASSED" : "FAILED"}
      </div>
      <p>Passing rate: ${PASS_PERCENT}%</p>

      <button class="nav-btn primary" onclick="startFinalExam()">
        Continue to TDC Final Exam
      </button>
    </section>
  `;

  document.getElementById("navArea").innerHTML = "";
}

function startFinalExam() {
  currentSection = 2;
  currentIndex = 0;
  renderQuestion();
}

function showFinalResult(finalScore) {
  submitted = true;
  stopTimer();

  const session1Score = calculateScore(session1Questions, answers.session1);
  const session1Percent = (session1Score / SESSION_1_COUNT) * 100;
  const finalPercent = (finalScore / FINAL_COUNT) * 100;

  const session1Passed = session1Percent >= PASS_PERCENT;
  const finalPassed = finalPercent >= PASS_PERCENT;
  const overallPassed = session1Passed && finalPassed;

  document.getElementById("questionArea").innerHTML = `
    <section class="result-card">
      <h2>EXAMINATION COMPLETE</h2>

      <div class="result-table">
        <div>
          <span>TDC 1st Session</span>
          <b>${session1Score} / ${SESSION_1_COUNT}</b>
          <strong>${session1Percent.toFixed(2)}%</strong>
        </div>

        <div>
          <span>TDC Final Exam</span>
          <b>${finalScore} / ${FINAL_COUNT}</b>
          <strong>${finalPercent.toFixed(2)}%</strong>
        </div>
      </div>

      <div class="${overallPassed ? "pass" : "fail"}">
        ${overallPassed ? "PASSED" : "FAILED"}
      </div>

      <p>Passing rate for each section: ${PASS_PERCENT}%</p>
      <p class="small">
        TEST VERSION — dummy questions are currently being used.
      </p>
    </section>
  `;

  document.getElementById("navArea").innerHTML = "";

  sendSecurityEvent("EXAM_COMPLETED");
}

function startTimer() {
  stopTimer();
  updateTimer();

  timerInterval = setInterval(() => {
    timer--;
    updateTimer();

    if (timer <= 0) {
      stopTimer();

      alert("The 90-minute examination time has ended. The exam will be submitted.");

      if (currentSection === 1) {
        showSession1Result(
          calculateScore(session1Questions, answers.session1)
        );
      } else {
        showFinalResult(
          calculateScore(finalQuestions, answers.final)
        );
      }
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimer() {
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const element = document.getElementById("timer");

  if (element) {
    element.textContent =
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
}

function sendSecurityEvent(event) {
  if (!attemptId) return;

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action: "securityEvent",
      attemptId,
      student,
      event
    })
  }).catch(() => {});
}

function recordViolation(type) {
  if (submitted) return;

  securityViolations++;

  sendSecurityEvent(`${type} #${securityViolations}`);

  const banner = document.getElementById("securityBanner");

  if (banner) {
    banner.textContent =
      `⚠ Security warning ${securityViolations}: ${type}`;
  }

  if (securityViolations >= 3) {
    alert(
      "Three security violations have been recorded. " +
      "The examination will be submitted."
    );

    if (currentSection === 1) {
      showSession1Result(
        calculateScore(session1Questions, answers.session1)
      );
    } else {
      showFinalResult(
        calculateScore(finalQuestions, answers.final)
      );
    }
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) recordViolation("TAB_OR_WINDOW_LEFT");
});

document.addEventListener("copy", event => {
  if (document.getElementById("questionArea")) {
    event.preventDefault();
    recordViolation("COPY_ATTEMPT");
  }
});

document.addEventListener("cut", event => {
  if (document.getElementById("questionArea")) {
    event.preventDefault();
    recordViolation("CUT_ATTEMPT");
  }
});

document.addEventListener("paste", event => {
  if (document.getElementById("questionArea")) {
    event.preventDefault();
    recordViolation("PASTE_ATTEMPT");
  }
});

document.addEventListener("contextmenu", event => {
  if (document.getElementById("questionArea")) {
    event.preventDefault();
    recordViolation("RIGHT_CLICK");
  }
});

document.addEventListener("fullscreenchange", () => {
  if (document.getElementById("questionArea") && !document.fullscreenElement) {
    recordViolation("FULLSCREEN_EXIT");
  }
});
