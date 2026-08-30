// ============================================================
// A1C TDC ASSESSMENT — STARTER BUILD
// This version is for UI/testing only.
// OTP is intentionally DEMO-ONLY and is NOT secure yet.
// The real OTP will be handled by a server/backend later.
// ============================================================

const DEMO_OTP = "123456";

const demoQuestions = [
  {
    section: "TDC 1ST SESSION",
    question: "DEMO QUESTION 1: What should a driver do before starting a trip?",
    tagalog: "DEMO: Ano ang dapat gawin ng driver bago magsimula sa biyahe?",
    options: [
      "A. Check the vehicle and surroundings",
      "B. Immediately accelerate",
      "C. Ignore the vehicle condition"
    ],
    correct: 0
  },
  {
    section: "TDC 1ST SESSION",
    question: "DEMO QUESTION 2: What does a red traffic light generally require?",
    tagalog: "DEMO: Ano ang karaniwang ibig sabihin ng pulang traffic light?",
    options: [
      "A. Proceed immediately",
      "B. Stop",
      "C. Overtake"
    ],
    correct: 1
  },
  {
    section: "TDC FINAL EXAM",
    question: "DEMO QUESTION 3: What is a safe driving practice?",
    tagalog: "DEMO: Ano ang isang ligtas na gawain sa pagmamaneho?",
    options: [
      "A. Maintain proper attention to the road",
      "B. Use a phone while driving",
      "C. Drive aggressively"
    ],
    correct: 0
  }
];

const state = {
  student: {},
  otpVerified: false,
  currentQuestion: 0,
  answers: Array(demoQuestions.length).fill(null),
  timeRemaining: 90 * 60,
  timerId: null
};

const $ = id => document.getElementById(id);

function showScreen(id) {
  document.querySelectorAll(".card").forEach(el => el.classList.add("hidden"));
  $(id).classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showMessage(id, text, type = "error") {
  const el = $(id);
  el.textContent = text;
  el.className = `message ${type}`;
}

function clearMessage(id) {
  $(id).className = "message hidden";
}

function collectStudentInfo() {
  return {
    fullName: $("fullName").value.trim(),
    packageEnrolled: $("packageEnrolled").value.trim(),
    address: $("address").value.trim(),
    clientId: $("clientId").value.trim(),
    contactNumber: $("contactNumber").value.trim(),
    email: $("email").value.trim()
  };
}

$("registrationForm").addEventListener("submit", event => {
  event.preventDefault();
  clearMessage("registrationMessage");

  const student = collectStudentInfo();
  const missing = Object.entries(student).filter(([, value]) => !value);

  if (missing.length) {
    showMessage("registrationMessage", "Please complete all required fields.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
    showMessage("registrationMessage", "Please enter a valid email address.");
    return;
  }

  state.student = student;

  // DEMO ONLY:
  // Replace this with a secure backend request later.
  showMessage(
    "registrationMessage",
    "Demo OTP requested. In this test build, use 123456. The production version will send the OTP to the office email.",
    "success"
  );

  startOtpCountdown();
  showScreen("otpScreen");
  $("otp").focus();
});

let otpRemaining = 300;
let otpTimerId = null;

function startOtpCountdown() {
  clearInterval(otpTimerId);
  otpRemaining = 300;
  updateOtpTimer();

  otpTimerId = setInterval(() => {
    otpRemaining--;
    updateOtpTimer();

    if (otpRemaining <= 0) {
      clearInterval(otpTimerId);
      showMessage("otpMessage", "OTP expired. Request a new OTP.");
    }
  }, 1000);
}

function updateOtpTimer() {
  const min = String(Math.floor(otpRemaining / 60)).padStart(2, "0");
  const sec = String(otpRemaining % 60).padStart(2, "0");
  $("otpTimer").textContent = `OTP expires in ${min}:${sec}`;
}

$("verifyOtp").addEventListener("click", () => {
  clearMessage("otpMessage");

  const otp = $("otp").value.trim();

  if (otpRemaining <= 0) {
    showMessage("otpMessage", "OTP expired. Request a new OTP.");
    return;
  }

  if (!/^\d{6}$/.test(otp)) {
    showMessage("otpMessage", "Enter the 6-digit OTP.");
    return;
  }

  if (otp !== DEMO_OTP) {
    showMessage("otpMessage", "Invalid OTP. Please check the code with the proctor.");
    return;
  }

  state.otpVerified = true;
  clearInterval(otpTimerId);
  showScreen("examIntroScreen");
});

$("backToRegistration").addEventListener("click", () => {
  showScreen("registrationScreen");
});

$("resendOtp").addEventListener("click", () => {
  // DEMO ONLY.
  showMessage("otpMessage", "Demo OTP renewed. Use 123456. Production will generate a new server-side OTP.", "success");
  startOtpCountdown();
});

$("startDemo").addEventListener("click", () => {
  if (!state.otpVerified) return;
  startExam();
});

function startExam() {
  state.currentQuestion = 0;
  state.answers = Array(demoQuestions.length).fill(null);
  state.timeRemaining = 90 * 60;

  showScreen("examScreen");
  renderQuestion();
  startExamTimer();
}

function startExamTimer() {
  clearInterval(state.timerId);
  updateExamTimer();

  state.timerId = setInterval(() => {
    state.timeRemaining--;
    updateExamTimer();

    if (state.timeRemaining <= 0) {
      clearInterval(state.timerId);
      submitExam(true);
    }
  }, 1000);
}

function updateExamTimer() {
  const h = Math.floor(state.timeRemaining / 3600);
  const m = Math.floor((state.timeRemaining % 3600) / 60);
  const s = state.timeRemaining % 60;

  $("examTimer").textContent =
    `${String(h).padStart(2, "0")}:` +
    `${String(m).padStart(2, "0")}:` +
    `${String(s).padStart(2, "0")}`;
}

function renderQuestion() {
  const q = demoQuestions[state.currentQuestion];
  const number = state.currentQuestion + 1;

  $("sectionLabel").textContent = q.section;
  $("questionNumber").textContent = `Question ${number} of ${demoQuestions.length}`;
  $("questionText").textContent = q.question;
  $("tagalogText").textContent = q.tagalog;

  const imageWrap = $("questionImageWrap");
  if (q.image) {
    $("questionImage").src = q.image;
    imageWrap.classList.remove("hidden");
  } else {
    imageWrap.classList.add("hidden");
  }

  const options = $("options");
  options.innerHTML = "";

  q.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option";
    button.textContent = option;

    if (state.answers[state.currentQuestion] === index) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      state.answers[state.currentQuestion] = index;
      renderQuestion();
    });

    options.appendChild(button);
  });

  $("prevQuestion").disabled = state.currentQuestion === 0;
  $("nextQuestion").textContent =
    state.currentQuestion === demoQuestions.length - 1 ? "FINISH REVIEW" : "NEXT";

  const progress = (number / demoQuestions.length) * 100;
  $("progressBar").style.width = `${progress}%`;
}

$("prevQuestion").addEventListener("click", () => {
  if (state.currentQuestion > 0) {
    state.currentQuestion--;
    renderQuestion();
  }
});

$("nextQuestion").addEventListener("click", () => {
  if (state.currentQuestion < demoQuestions.length - 1) {
    state.currentQuestion++;
    renderQuestion();
  } else {
    openReview();
  }
});

$("reviewButton").addEventListener("click", openReview);

function openReview() {
  renderReview();
  showScreen("reviewScreen");
}

function renderReview() {
  const grid = $("reviewGrid");
  grid.innerHTML = "";

  demoQuestions.forEach((_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "review-item";

    if (state.answers[index] !== null) button.classList.add("answered");
    if (index === state.currentQuestion) button.classList.add("current");

    button.textContent = index + 1;
    button.title = state.answers[index] === null ? "Unanswered" : "Answered";

    button.addEventListener("click", () => {
      state.currentQuestion = index;
      renderQuestion();
      showScreen("examScreen");
    });

    grid.appendChild(button);
  });
}

$("backToExam").addEventListener("click", () => {
  renderQuestion();
  showScreen("examScreen");
});

$("submitExam").addEventListener("click", () => submitExam(false));

function submitExam(autoSubmitted = false) {
  clearInterval(state.timerId);

  if (!autoSubmitted) {
    const unanswered = state.answers.filter(answer => answer === null).length;

    if (unanswered > 0) {
      const proceed = confirm(
        `${unanswered} question(s) are unanswered. Submit anyway?`
      );
      if (!proceed) {
        startExamTimer();
        return;
      }
    }

    const confirmed = confirm(
      "Are you sure you want to submit the examination? You will not be able to change your answers."
    );

    if (!confirmed) {
      startExamTimer();
      return;
    }
  }

  // Demo scoring only.
  const score = state.answers.reduce((total, answer, index) => {
    return total + (answer === demoQuestions[index].correct ? 1 : 0);
  }, 0);

  const percentage = (score / demoQuestions.length) * 100;
  const passed = percentage >= 80;

  $("resultContent").innerHTML = `
    <div class="result-block">
      <div class="result-row"><strong>Name</strong><span>${escapeHtml(state.student.fullName)}</span></div>
      <div class="result-row"><strong>Package</strong><span>${escapeHtml(state.student.packageEnrolled)}</span></div>
    </div>
    <div class="result-block">
      <div class="result-row"><strong>Demo Exam Score</strong><span>${score}/${demoQuestions.length}</span></div>
      <div class="result-row"><strong>Percentage</strong><span>${percentage.toFixed(2)}%</span></div>
      <div class="result-row"><strong>Passing Rate</strong><span>80%</span></div>
      <div class="result-row"><strong>Result</strong><span class="${passed ? "pass" : "fail"}">${passed ? "PASSED" : "FAILED"}</span></div>
    </div>
    <div class="notice">
      This is only the starter build. The production version will separately score the 30-item TDC 1st Session and 120-item TDC Final Exam and will send the completed record to the office backend.
    </div>
  `;

  showScreen("resultScreen");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
