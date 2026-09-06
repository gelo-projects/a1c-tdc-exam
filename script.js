/* A1C TDC EXAM ENGINE & STAGE RETAKE SYSTEM
   30-item TDC 1st Session + 120-item TDC Final Exam
   80% passing rate per section; 90-minute overall timer.
*/
const API_URL = "https://script.google.com/macros/s/AKfycbybNilmNpzeDuqmvGbzwOx6mlFNsny83D2R7hl64Zl559YhYhzFPlW67v8nZxFhNBn6Kg/exec";

if (!window.html2pdf) {
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
  document.head.appendChild(script);
}

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
let securityTerminationInProgress = false;
let suppressFullscreenViolation = false;
let resultSubmissionStarted = false;

let session1Attempts = 0;
let finalAttempts = 0;
let securityInitialized = false;
let lastSecurityEventTime = 0;

const session1Questions = [
  {
    question: "1. Who is a Professional Driver?",
    tagalog: "Sino ang propesyonal na drayber?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. An expert and experienced driver (isang eksperto at ekspiryensado sa pagmamaneho)",
      "b. Any driver who can operate a specific motor vehicle category (sinumang drayber na nakapagmamaneho ng isang uri ng sasakyang de-motor)",
      "c. Any driver who has a qualification to drive a Private or For Hire Vehicle (sinumang drayber na may kwalipikasyong magmaneho ng pribado o paupahang sasakyang de-motor)"
    ]
  },
  {
    question: "2. How many days do you need to settle a traffic violation with LTO?",
    tagalog: "Ilang araw dapat asikasuhin sa LTO ang paglabag sa batas trapiko?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Within 15 days (Sa loob ng 15 araw)",
      "b. Within 10 days (Sa loob ng 10 araw)",
      "c. Within 30 days (Sa loob ng 30 araw)"
    ]
  },
  {
    question: "3. What is the maximum validity of license that a driver may have if he/she has no traffic violation at the time of renewal?",
    tagalog: "Ilang taon ang maaaring ibigay na lisenysa sa isang drayber na walang traffic violation?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. 5 years validity",
      "b. 10 years validity",
      "c. 15 years validity"
    ]
  },
  {
    question: "4. Can a driver be given a 10-year validity license if he/she has traffic violation/s?",
    tagalog: "Maaari bang bigyan ng 10 taon na lisensya ang isang drayber kung ito ay mayroong huli o traffic violation?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. No (hindi)",
      "b. Yes (Oo)",
      "c. Yes - if all penalties are paid 15 days prior to renewal (Oo kung ang penalty ay nabayaran labinlimang araw bago mag-renew)"
    ]
  },
  {
    question: "5. What is the allowed age to apply for a Non Professional driver's license?",
    tagalog: "Ano ang tamang edad upang magkaroon ng lisensya?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. 16 years old",
      "b. 17 years old",
      "c. 20 Years old"
    ]
  },
  {
    question: "6. Registration of motor vehicle may be suspended if:",
    tagalog: "Maaaring isuspinde ang rehistro ng sasakayan kung ito ay:",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. motor vehicle is found to be in conformity with regulations (kung ang sasakyan ay maayos na nakapasa sa inspeksyon)",
      "b. motor vehicle is found to be unsightly (ang sasakyan ay hindi kaaya-aya)",
      "c. motor vehicle is not registered to the driver at the time of apprehension (ang sasakyan ay hindi rehistrado sa nagmamaneho sa oras ng pagkahuli nito)"
    ]
  },
  {
    question: "7. Where do you need to display your plate number?",
    tagalog: "Saan dapat ilagay ang plaka ng isang sasakyan?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. one in front and one in the rear of the vehicle (isa sa harap at isa sa likod ng sasakyan)",
      "b. two in front (dalawa sa harap)",
      "c. one in the front windshield and one at the back windshield (isa sa harap na windshield at isa sa likurang salamin)"
    ]
  },
  {
    question: "8. This traffic sign means \"Yield the right of way\"",
    tagalog: "Ang senyas trapiko na ito ay nangangahulugang “magbigay daan”:",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. inverted triangle (baligtad na tatsulok)",
      "b. vertical triangle (patayong tatsulok)",
      "c. horizontal triangle (pahalang na tatsulok)"
    ]
  },
  {
    question: "9. What is the main purpose of traffic laws, rules and regulations?",
    tagalog: "Ano ang pangunahing layunin ng mga batas, alituntunin at regulasyong pantrapiko?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. To generate revenues for the government (Upang kumita ng pera ang pamahalaan)",
      "b. To discipline the motorists (Disiplinahin ang mga motorista)",
      "c. To put order on the road (Magkaroon ng maayos na galaw ang mga sasakyan at ang mga tumatawid sa kalsada)"
    ]
  },
  {
    question: "10. Green light at an intersection means:",
    tagalog: "Ang kulay berdeng ilaw sa isang interseksiyon ay nangangahulugan na:",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. pedestrians are allowed to cross all pedestrian lanes (pinahihintulutang tumawid sa lahat ng tawiran ang mga tao)",
      "b. pedestrians are not allowed to cross all pedestrian lanes (hindi pinahihintulutang tumawid sa lahat ng tawiran ang mga tao)",
      "c. the vehicles on the other street are stopped (ang mga sasakyan sa kabilang kalsada ay nakahinto)"
    ]
  },
  {
    question: "11. Flashing yellow light means:",
    tagalog: "Ang kumikisap-kisap na dilaw na ilaw pantrapiko ay nangangahulugan na:",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. slowdown and proceed with caution (bagalan ang takbo at dumiretso nang may pag-iingat)",
      "b. you have the right of way over a flashing yellow light (ikaw ang may higit na karapatan kaysa sa kumikisap-kisap na dilaw na ilaw)",
      "c. vehicles will be crossing from the other side (may mga sasakyang tatawid mula sa kabila)"
    ]
  },
  {
    question: "12. Parking is allowed if the vehicle is",
    tagalog: "Pinahihintulutan ang pagparada kung ang sasakyan ay",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. beyond 4 meters of a fire hydrant (lampas 4 na metro sa boka-insendiyo)",
      "b. within 3 meters of the intersection of curve lines (nasa loob ng 3 metro ng interseksiyon ng mga linyang kurbada)",
      "c. on the intersection (nasa interseksyon)"
    ]
  },
  {
    question: "13. Normally, on a two-lane road, overtaking is allowed at the:",
    tagalog: "Sa kalsadang pandalawahang sasakyan, ang pag-overtake ay pinahihintulutan sa:",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. shoulder or pavement of the road (kanang bahagi ng kalsada o bangketa)",
      "b. blind curve with a yellow solid line (kurbada/blind curve na may buong linyang dilaw)",
      "c. left lane (kaliwang lane)"
    ]
  },
  {
    question: "14. When do you have to make a complete full stop?",
    tagalog: "Kailan ka dapat ganap na huminto?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. At a flashing yellow light (Kapag may dilaw na ilaw na kumikisap-kisap)",
      "b. At a red traffic light (Kapag pula ang ilaw trapiko)",
      "c. At an intersection (Kapag nasa interseksyon)"
    ]
  },
  {
    question: "15. The proper hand signal for a right turn is:",
    tagalog: "Ang tamang senyas ng kamay kapag kumakanan ay:",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. left arm pointing left (ang kaliwang braso nakaturo sa kaliwa)",
      "b. left arm held pointing upward (ang kaliwang braso ay nakaturo sa itaas)",
      "c. left arm held down, hand pointing at ground (ang kaliwang braso ay nakapababa, na ang kamay ay nakaturo sa ibaba)"
    ]
  },
  {
    question: "16. Single white broken line on a 2-way road means:",
    tagalog: "Ang putting putol-putol na linya sa kalsadang salubungan ay nangangahulugan na:",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. passing or overtaking can be made anytime (ang paglampas o ang pag-overtake ay maaaring gawin anumang oras)",
      "b. it separates traffic moving in opposite directions (hinihiwalay nito ang pagdaloy ng mga sasakyan sa magkabilang direksiyon)",
      "c. absolutely no crossing (talagang hindi ipinahihintulot ang pag-cross)"
    ]
  },
  {
    question: "17. What is the meaning of double solid yellow line?",
    tagalog: "Ano ang kahulugan ng dobleng linyang dilaw?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. Cross with due care (Tumawid nang maingat)",
      "b. Cross anytime (Tumawid anumang oras)",
      "c. Crossing/ traversing or overtaking is not allowed (Ang pagtawid o paglusot ay hindi pinahihintulutan)"
    ]
  },
  {
    question: "18. Upon approaching an intersection marked with a yield sign, you are required to",
    tagalog: "Kapag papalapit sa interseksiyong may karatulang nagsasabing magbigay daan (yield), kailangang",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. stop before entering the intersection (huminto bago pumasok sa interseksiyon)",
      "b. slowdown, then enter the intersection when the way is clear (bagalan ang takbo at pagkatapos ay pumasok sa interseksiyon kung ligtas)",
      "c. enter the intersection immediately (pumasok agad sa interseksiyon)"
    ]
  },
  {
    question: "19. The holder of a driver's license shall entitle him/her to operate:",
    tagalog: "Ang lisensiya ay nagpapahintulot sa drayber na magmaneho ng:",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. any kind of motor vehicle (anumang uri ng sasakyang de-motor)",
      "b. motor vehicle/s specified in the license only (mga sasakyan lamang na nakatakda sa lisensiya)",
      "c. motor vehicles for hire only (mga pampublikong sasakyan lamang)"
    ]
  },
  {
    question: "20. When may you lend your driver's license?",
    tagalog: "Kailan mo maaaring ipahiram ang iyong lisensiya?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Under no circumstances (Hindi maaari kahit kailan)",
      "b. To another person who is learning to drive (Sa indibiduwal na nag-aaral magmaneho)",
      "c. In emergencies (Sa oras ng kagipitan o emergency)"
    ]
  },
  {
    question: "21. At an intersection without stop or yield signs, two cars approach at right angles to each other at almost the same time. Which driver must yield?",
    tagalog: "Sa interseksiyon na walang mga karatulang nagsasabing huminto o magbigay ng daan, dalawang sasakyan ang sabay na dumating sa anggulong 90 digri sa isa’t isa. Sinong drayber ang dapat magbigay daan?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. The motorist on the right (Ang drayber ng sasakyan sa kanan)",
      "b. The motorist on the left (Ang drayber ng sasakyan sa kaliwa)",
      "c. Either of the driver has the first right-of-way (Alinman sa dalawa ay may unang karapatan)"
    ]
  },
  {
    question: "22. Is it allowed to drive a motorcycle in a public road pending release of the Certificate of Registration?",
    tagalog: "Maaari bang gamitin sa pampublikong daan ang motorsiklo kung ito ay wala pang rehistro?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. No (Hindi)",
      "b. Yes (Oo)",
      "c. Yes, if travel authority is given by the dealer (Oo, kung ang pagbiyahe ay may pahintulot ang dealer nito)"
    ]
  },
  {
    question: "23. Which of the following statement is true?",
    tagalog: "Alin sa mga sumusunod na pahayag ang totoo?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. A DL holder with authority to drive vehicles with manual transmission (MT) is not allowed to drive vehicles with automatic transmission (AT) (Ang isang may hawak ng DL na may awtoridad na magmaneho ng manual transmission (MT) ay hindi pinapayagan na magmaneho ng mga sasakyan na automatic transmission (AT)",
      "b. A DL holder with authority to drive vehicles with automatic transmission (AT) is allowed to drive vehicles with manual transmission (MT) (Ang drayber na may hawak na lisensya para sa atomatik na sasakyan ay pwedeng magmaneho ng sasakyang manwal.)",
      "c. A DL holder with authority to drive vehicles with manual transmission (MT) is allowed to operate vehicles with automatic transmission (AT) (Ang drayber na may hawak ng lisensya para sa manual transmission ay maaaring magmaneho ng may automatik na transmission)"
    ]
  },
  {
    question: "24. Can you drive a motorcycle if your license bears DL Code B ?",
    tagalog: "Maaari ka bang magmaneho ng motorsiklo kung ang iyong lisensya ay may DL Code B ?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. Yes (Oo)",
      "b. No, unless authorized by a traffic enforcer (Hindi maliban kung pinahintulutan ng traffic enforcer)",
      "c. No (Hindi)"
    ]
  },
  {
    question: "25. Identify this traffic sign:",
    tagalog: "Tukuyin kung anong senyas ito:",
    image: "images/s25.png",
    correct: 0,
    options: [
      "a. no u-turn (bawal mag u-turn)",
      "b. dangerous left bend (mapanganib na kaliwang likuan)",
      "c. dangerous right bend (mapanganib na kanang likuan)"
    ]
  },
  {
    question: "26. Identify this traffic sign:",
    tagalog: "Tukuyin kung anong senyas ito:",
    image: "images/s26.png",
    correct: 2,
    options: [
      "a. road widens ahead (lalapad ang kalsada sa unahan)",
      "b. slippery road ahead (madulas ang kalsada sa unahan)",
      "c. road narrows ahead (papaliit na kalsada sa unahan)"
    ]
  },
  {
    question: "27. Identify this traffic sign:",
    tagalog: "Tukuyin kung anong senyas ito:",
    image: "images/s27.png",
    correct: 0,
    options: [
      "a. no blowing of horn (bawal bumusina)",
      "b. animals crossing (may mga hayop na tumatawid)",
      "c. no entry for all types of vehicles (bawal pumasok ang lahat ng uri ng sasakyan)"
    ]
  },
  {
    question: "28. Identify this traffic sign:",
    tagalog: "Tukuyin kung anong senyas ito:",
    image: "images/s28.png",
    correct: 1,
    options: [
      "a. no entry for cars (bawal pumasok ang kotse)",
      "b. no entry for power tricycle (bawal pumasok ang mga tricycle)",
      "c. no entry for bicycle (bawal pumasok ang bisikleta)"
    ]
  },
  {
    question: "29. Identify this traffic sign:",
    tagalog: "Tukuyin kung anong senyas ito:",
    image: "images/s29.png",
    correct: 0,
    options: [
      "a. approach to intersection (papalapit sa interseksyon)",
      "b. dangerous curve (mapanganib na kurbada)",
      "c. road narrows ahead (papaliit na kalsada)"
    ]
  },
  {
    question: "30. Identify this traffic sign:",
    tagalog: "Tukuyin kung anong senyas ito:",
    image: "images/s30.png",
    correct: 2,
    options: [
      "a. give way (magbigay daan)",
      "b. stop (huminto)",
      "c. no entry for all vehicles (bawal pumasok ang lahat ng uri ng sasakyan)"
    ]
  }
];

const finalQuestionsTemplate = [
  ...session1Questions,
  {
    question: "31. What should you do when approaching a pedestrian crosswalk?",
    tagalog: "Ano ang dapat mong gawin kapag papalapit sa tawiran ng tao?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Slow down and yield to pedestrians (Bagalan ang takbo at magbigay daan sa mga tumatawid)",
      "b. Accelerate to pass quickly (Bilisan upang makalampas agad)",
      "c. Blow your horn continuously (Bumusina nang tuloy-tuloy)"
    ]
  },
  {
    question: "32. What does a continuous yellow line in the center of the road mean?",
    tagalog: "Ano ang kahulugan ng patuloy na dilaw na linya sa gitna ng kalsada?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Overtaking is prohibited (Bawal ang mag-overtake)",
      "b. Overtaking is allowed anytime (Maaaring mag-overtake anumang oras)",
      "c. Speed limit is 100 km/h (Ang limitasyon sa bilis ay 100 km/h)"
    ]
  }
];

function generate120FinalQuestions() {
  const result = [];
  let templateIndex = 0;
  for (let i = 1; i <= FINAL_COUNT; i++) {
    const base = finalQuestionsTemplate[templateIndex];
    result.push({
      question: `${i}. ${base.question.replace(/^\d+\.\s*/, "")}`,
      tagalog: base.tagalog,
      image: base.image,
      correct: base.correct,
      options: [...base.options]
    });
    templateIndex = (templateIndex + 1) % finalQuestionsTemplate.length;
  }
  return result;
}

const finalQuestions = generate120FinalQuestions();

function generateNewAttemptId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(100000 + Math.random() * 900000);
  return "A1C-" + year + month + day + "-" + random;
}

window.startAuthenticatedExam = function(authData) {
  student = authData.student || {};
  attemptId = authData.attemptId || generateNewAttemptId();
  sessionToken = authData.sessionToken || "";

  currentSection = 1;
  currentIndex = 0;
  session1Attempts = 1;
  finalAttempts = 0;
  answers = {
    session1: new Array(SESSION_1_COUNT).fill(null),
    final: new Array(FINAL_COUNT).fill(null)
  };

  startMainExamTimer();
  initSecurityMonitoring();
  renderExamUI();
};

function startMainExamTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timer = TOTAL_TIME_SECONDS;
  timerInterval = setInterval(() => {
    timer--;
    updateTimerDisplay();
    if (timer <= 0) {
      clearInterval(timerInterval);
      alert("Time is up! Submitting your current exam stage automatically.");
      submitStage();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const el = document.getElementById("timerDisplay");
  if (!el) return;
  const m = Math.floor(timer / 60);
  const s = timer % 60;
  el.textContent = `Time Remaining: ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function initSecurityMonitoring() {
  if (securityInitialized) return;
  securityInitialized = true;

  window.addEventListener("visibilitychange", handleSecurityEvent);
  window.addEventListener("blur", handleSecurityEvent);
  document.addEventListener("contextmenu", preventDefaultSecurity);
  document.addEventListener("copy", preventDefaultSecurity);
  document.addEventListener("paste", preventDefaultSecurity);
  document.addEventListener("selectstart", preventDefaultSecurity);
}

function preventDefaultSecurity(e) {
  e.preventDefault();
  registerSecurityViolation("Prohibited user action (Copy/Paste/Context Menu)");
}

function handleSecurityEvent(e) {
  if (submitted || securityTerminationInProgress) return;
  const now = Date.now();
  if (now - lastSecurityEventTime < 1500) return;
  lastSecurityEventTime = now;

  registerSecurityViolation("Tab switch or focus lost");
}

function registerSecurityViolation(reason) {
  if (submitted || securityTerminationInProgress) return;

  securityViolations++;
  updateSecurityUI();

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action: "securityEvent",
      attemptId: attemptId,
      student: student,
      event: `${reason} (Violation #${securityViolations})`
    })
  }).catch(e => console.error(e));

  if (securityViolations >= MAX_SECURITY_WARNINGS && !securityTerminationInProgress) {
    securityTerminationInProgress = true;
    alert("SECURITY TERMINATION: You have reached the maximum allowed security warnings (5). Your exam is being submitted immediately.");
    submitStage(true);
  } else {
    alert(`SECURITY WARNING (${securityViolations}/${MAX_SECURITY_WARNINGS}): Focus loss or prohibited action detected.`);
  }
}

function updateSecurityUI() {
  const el = document.getElementById("securityCounter");
  if (el) {
    el.textContent = `Security Warnings: ${securityViolations} / ${MAX_SECURITY_WARNINGS}`;
  }
}

function renderExamUI() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <div class="exam-header">
      <div>
        <h2>A1C DRIVING ACADEMY — TDC EXAM</h2>
        <p>Student: <b>${esc(student.fullName)}</b> | Attempt ID: <b>${esc(attemptId)}</b></p>
      </div>
      <div style="text-align:right;">
        <div id="timerDisplay" style="font-weight:bold; font-size:1.1rem; color:#e74c3c;"></div>
        <div id="securityCounter" style="font-size:0.85rem; color:#666; margin-top:4px;">
          Security Warnings: ${securityViolations} / ${MAX_SECURITY_WARNINGS}
        </div>
      </div>
    </div>

    <div class="stage-indicator" style="margin: 15px 0; padding:10px; background:#f0f4f8; border-radius:6px; font-weight:bold;">
      ${currentSection === 1 ? "STAGE 1: TDC 1st Session (Questions 1 to 30)" : "STAGE 2: TDC Final Exam (Questions 1 to 120)"}
    </div>

    <div id="questionContainer"></div>

    <div class="nav-controls" style="margin-top:20px; display:flex; justify-content:space-between;">
      <button class="nav-btn secondary" onclick="prevQuestion()" id="prevBtn">Previous</button>

      <div>
        <button class="nav-btn secondary" onclick="showReviewScreen()">Review Answers</button>
        <button class="nav-btn primary" onclick="nextQuestion()" id="nextBtn">Next</button>
      </div>
    </div>
  `;

  updateTimerDisplay();
  renderQuestion();
}

function renderQuestion() {
  const container = document.getElementById("questionContainer");
  if (!container) return;

  const questionsList = currentSection === 1 ? session1Questions : finalQuestions;
  const q = questionsList[currentIndex];
  const currentAnswers = currentSection === 1 ? answers.session1 : answers.final;

  document.getElementById("prevBtn").disabled = (currentIndex === 0);
  document.getElementById("nextBtn").textContent = (currentIndex === questionsList.length - 1) ? "Review & Submit" : "Next";

  let optionsHtml = "";
  q.options.forEach((opt, idx) => {
    const checked = currentAnswers[currentIndex] === idx ? "checked" : "";
    optionsHtml += `
      <label class="option-label" style="display:block; margin: 10px 0; padding: 12px; border:1px solid #ccc; border-radius:6px; cursor:pointer;">
        <input type="radio" name="opt" value="${idx}" ${checked} onchange="selectAnswer(${idx})">
        ${esc(opt)}
      </label>
    `;
  });

  container.innerHTML = `
    <div class="question-card" style="background:#fff; padding:20px; border-radius:8px; border:1px solid #e0e0e0;">
      <h3>Question ${currentIndex + 1} of ${questionsList.length}</h3>
      <p style="font-size:1.1rem; font-weight:600; margin-top:10px;">${esc(q.question)}</p>
      <p style="font-size:0.95rem; color:#555; font-style:italic;">${esc(q.tagalog)}</p>
      
      ${q.image && q.image !== "images/banner.jpg" ? `<img src="${q.image}" style="max-width:200px; margin:15px 0; display:block;">` : ""}

      <div style="margin-top:20px;">
        ${optionsHtml}
      </div>
    </div>
  `;
}

function selectAnswer(val) {
  if (currentSection === 1) {
    answers.session1[currentIndex] = val;
  } else {
    answers.final[currentIndex] = val;
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
}

function nextQuestion() {
  const questionsList = currentSection === 1 ? session1Questions : finalQuestions;
  if (currentIndex < questionsList.length - 1) {
    currentIndex++;
    renderQuestion();
  } else {
    showReviewScreen();
  }
}

function showReviewScreen() {
  const app = document.getElementById("app");
  const questionsList = currentSection === 1 ? session1Questions : finalQuestions;
  const currentAnswers = currentSection === 1 ? answers.session1 : answers.final;

  let gridHtml = "";
  questionsList.forEach((q, idx) => {
    const answered = currentAnswers[idx] !== null && currentAnswers[idx] !== undefined;
    const btnClass = answered ? "answered" : "unanswered";
    gridHtml += `
      <button class="grid-btn ${btnClass}" onclick="jumpToQuestion(${idx})" style="width:40px; height:40px; margin:4px; border-radius:4px; border:1px solid #ccc; background:${answered ? '#27ae60' : '#e74c3c'}; color:#fff; font-weight:bold;">
        ${idx + 1}
      </button>
    `;
  });

  app.innerHTML = `
    <div class="auth-card" style="max-width:800px; text-align:left;">
      <h2>Review Your Answers — ${currentSection === 1 ? "Session 1" : "Final Exam"}</h2>
      <p>Click any question number below to jump back and edit your answer.</p>

      <div style="margin:20px 0; display:flex; flex-wrap:wrap; gap:4px;">
        ${gridHtml}
      </div>

      <div style="margin-top:25px; display:flex; gap:15px;">
        <button class="nav-btn secondary" onclick="renderExamUI()">Back to Exam</button>
        <button class="nav-btn primary" onclick="submitStage()" id="finalSubmitBtn">Submit Stage Result</button>
      </div>
    </div>
  `;
}

function jumpToQuestion(idx) {
  currentIndex = idx;
  renderExamUI();
}

async function submitStage(isSecurityTermination = false) {
  if (resultSubmissionStarted) return;
  resultSubmissionStarted = true;

  const submitBtn = document.getElementById("finalSubmitBtn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
  }

  const payload = {
    action: "submitExamResult",
    attemptId: attemptId,
    sessionToken: sessionToken,
    stage: currentSection,
    attemptNumber: currentSection === 1 ? session1Attempts : finalAttempts,
    session1Answers: answers.session1,
    finalAnswers: answers.final,
    securityViolations: securityViolations,
    completionStatus: isSecurityTermination ? "TERMINATED_SECURITY" : "COMPLETED"
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    resultSubmissionStarted = false;

    if (!data.success) {
      throw new Error(data.message || "Failed to record stage result.");
    }

    handleStageResultResponse(data);

  } catch (err) {
    resultSubmissionStarted = false;
    alert("Submission Error: " + err.message);
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Stage Result";
    }
  }
}

function handleStageResultResponse(data) {
  const app = document.getElementById("app");

  if (currentSection === 1) {
    const passed = data.session1Passed && data.securityViolations < MAX_SECURITY_WARNINGS;

    if (passed) {
      app.innerHTML = `
        <div class="auth-card">
          <div class="brand">A1C DRIVING ACADEMY</div>
          <h1>SESSION 1 RESULT</h1>
          
          <div style="margin:20px 0; padding:20px; background:#e8f8f5; border-radius:8px;">
            <h2 style="color:#27ae60; margin:0;">PASSED ✓</h2>
            <p style="font-size:1.5rem; font-weight:bold; margin:10px 0;">${data.session1Score} / 30 (${data.session1Percent.toFixed(1)}%)</p>
            <p>You may now proceed to the Final Exam.</p>
          </div>

          <button class="nav-btn primary" onclick="proceedToFinalExam()">PROCEED TO FINAL EXAM</button>
        </div>
      `;
    } else {
      app.innerHTML = `
        <div class="auth-card">
          <div class="brand">A1C DRIVING ACADEMY</div>
          <h1>SESSION 1 RESULT</h1>
          
          <div style="margin:20px 0; padding:20px; background:#fadbd8; border-radius:8px;">
            <h2 style="color:#c0392b; margin:0;">FAILED</h2>
            <p style="font-size:1.5rem; font-weight:bold; margin:10px 0;">${data.session1Score} / 30 (${data.session1Percent.toFixed(1)}%)</p>
            <p>You need at least 80% (24/30) to proceed to the Final Exam.</p>
            ${data.securityViolations >= MAX_SECURITY_WARNINGS ? '<p style="color:#c0392b; font-weight:bold;">Security Warning Threshold Exceeded.</p>' : ''}
          </div>

          <button class="nav-btn primary" onclick="retakeSession1()">RETAKE SESSION 1</button>
        </div>
      `;
    }

  } else {
    const passed = data.finalPassed && data.securityViolations < MAX_SECURITY_WARNINGS;

    if (passed) {
      submitted = true;
      if (timerInterval) clearInterval(timerInterval);

      app.innerHTML = `
        <div class="auth-card">
          <div class="brand">A1C DRIVING ACADEMY</div>
          <h1>FINAL EXAM RESULT</h1>
          
          <div style="margin:20px 0; padding:20px; background:#e8f8f5; border-radius:8px;">
            <h2 style="color:#27ae60; margin:0;">PASSED ✓</h2>
            <p style="font-size:1.5rem; font-weight:bold; margin:10px 0;">${data.finalScore} / 120 (${data.finalPercent.toFixed(1)}%)</p>
            <p>Congratulations! You have completed both stages successfully.</p>
            <p style="font-size:0.85rem; color:#666; margin-top:10px;">Official PDF Answer Sheets have been generated and dispatched to the office email.</p>
          </div>
        </div>
      `;
    } else {
      app.innerHTML = `
        <div class="auth-card">
          <div class="brand">A1C DRIVING ACADEMY</div>
          <h1>FINAL EXAM RESULT</h1>
          
          <div style="margin:20px 0; padding:20px; background:#fadbd8; border-radius:8px;">
            <h2 style="color:#c0392b; margin:0;">FAILED</h2>
            <p style="font-size:1.5rem; font-weight:bold; margin:10px 0;">${data.finalScore} / 120 (${data.finalPercent.toFixed(1)}%)</p>
            <p>You need at least 80% (96/120) to pass the course.</p>
            ${data.securityViolations >= MAX_SECURITY_WARNINGS ? '<p style="color:#c0392b; font-weight:bold;">Security Warning Threshold Exceeded.</p>' : ''}
          </div>

          <button class="nav-btn primary" onclick="retakeFinalExam()">RETAKE FINAL EXAM</button>
        </div>
      `;
    }
  }
}

function retakeSession1() {
  session1Attempts++;
  attemptId = generateNewAttemptId();
  currentIndex = 0;
  answers.session1 = new Array(SESSION_1_COUNT).fill(null);
  
  startMainExamTimer();
  renderExamUI();
}

function proceedToFinalExam() {
  currentSection = 2;
  currentIndex = 0;
  finalAttempts = 1;
  answers.final = new Array(FINAL_COUNT).fill(null);

  startMainExamTimer();
  renderExamUI();
}

function retakeFinalExam() {
  finalAttempts++;
  attemptId = generateNewAttemptId();
  currentIndex = 0;
  answers.final = new Array(FINAL_COUNT).fill(null);

  startMainExamTimer();
  renderExamUI();
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}
