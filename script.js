const API_URL = "https://script.google.com/macros/s/AKfycbyoMQPvuxffrZMhTZ4Az4BOPojFRb_A9yBqnbUs_xZh2sl8XAbksObCDlsd-RbeM9qx/exec";

const SESSION_1_COUNT = 15;
const FINAL_COUNT = 30;
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

const session1Questions = [
  {
    question: "1. Who is a Professional Driver?",
    tagalog: "Sino ang propesyonal na drayber?",
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
    correct: 1,
    options: [
      "a. left arm pointing left (ang kaliwang braso nakaturo sa kaliwa)",
      "b. left arm held pointing upward (ang kaliwang braso ay nakaturo sa itaas)",
      "c. left arm held down, hand pointing at ground (ang kaliwang braso ay nakapababa, na ang kamay ay nakaturo sa ibaba)"
    ]
  }
];

const finalQuestions = [
  {
    question: "1. When can a child be exempted to be sitted in a child restraint system?",
    tagalog: "Kailan maaaring hindi gumamit ng child restraint system ang isang bata?",
    image: "",
    correct: 2,
    options: [
      "a. If the child will be late for a medical appointment (Kung ang bata ay mahuhuli sa kanyang iskedyul sa ospital)",
      "b. If the child is going to school (Kung ang bata ay papunta sa eskwelahaan)",
      "c. If the child requires immediate medical treatment (Kung ang bata ay nangangailangan ng agarang lunas o medical)"
    ]
  },
  {
    question: "2. What are the three field sobriety tests?",
    tagalog: "Ano ang mga pagsusuri na ginagawa upang malaman kung positibo sa alak ang isang drayber?",
    image: "",
    correct: 0,
    options: [
      "a. Eye test, walk and turn, one leg stand (Pag tsek sa mata, pag lakad at pagtayo sa isang paa)",
      "b. Eye test, running straight, jumping rope (pagtsek sa mata, diretsong pagtakbo, luksong lundag)",
      "c. Reading and Comprehension Test, Singing the National Anthem and Drinking one liter of fresh water (Pagbabasa, pag-awit sa lupang hinirang at pag-inom ng isang litrong tubig)"
    ]
  },
  {
    question: "3. How do you respond to a situation where you are approaching your garage to your right and you need to pass on a bike lane which is open, but a speeding SUV unexpectedly uses the bike lane to overtake you?",
    tagalog: "Paano ka tutugon sa isang sitwasyon kung saan papalapit ka sa garahe sa kanan at kailangan mong tumawid sa bike lane, nang isang mabilis na SUV ay hindi inaasahan na ginagamit ang bike lane upang mag overtake sayo?",
    image: "",
    correct: 0,
    options: [
      "a. give way to the speeding SUV (magbigay daan sa mabilis na SUV)",
      "b. give way to motorists on the left (magbigay daan sa motorista sa kaliwa)",
      "c. give way to cyclists (magbigay daan sa mga siklista)"
    ]
  },
  {
    question: "4. What is the penalty if a driver is found to have a fake or counterfeit license?",
    tagalog: "Ano ang kaakibat na kaparusahan kung ang isang drayber ay mapatunayang huwad ang kanyang lisensiya?",
    image: "",
    correct: 0,
    options: [
      "a. His/her driver’s license shall be confiscated and he/she shall be disqualified from being granted a driver’s license and driving a motor vehicle for a period of one (1) year from the payment of monetary fine (Ang kaniyang lisensiya ay kukumpiskahin at hindi siya makakukuha ng lisensiya at makakapagmaneho ng sasakyang de-motor sa loob ng isang (1) taon matapos bayaran ang multa)",
      "b. Imprisonment for six (6) months plus fine (Siya ay ikukulong sa loob ng anim (6) na buwan at pagmumultahin)",
      "c. Banned from getting a driver's license for life (Habambuhay nang hindi makakukuha ng lisensiya)"
    ]
  },
  {
    question: "5. What is the penalty if a driver is convicted of a crime while using a motor vehicle?",
    tagalog: "Ano ang magiging kaparusahan kung ang isang drayber ay nahatulan ng korte na gumawa ng krimen habang nagmamaneho?",
    image: "",
    correct: 0,
    options: [
      "a. The DL will be revoked and the driver will be perpetually disqualified from applying for a license plus monetary fine (Multa at habambuhay na diskwalipikasyon sa pagkuha ng lisensya)",
      "b. The DL will be suspended and the driver will pay a fine (Sususpindihin ang lisensya at siya ay pagmumultahin)",
      "c. The DL will be confiscated (Ang lisensya ay kukumpiskahin)"
    ]
  },
  {
    question: "6. LTO rules and regulations prohibit drivers of public utility vehicles from:",
    tagalog: "Ang mga tuntunin at regulasyon ng LTO ay nagbabawal sa mga drayber ng mga public utility vehicle na:",
    image: "",
    correct: 2,
    options: [
      "a. overcharging fares and fast taximeters (sumingil ng labis na pamasahe at magkaroon ng mabilis na metro ng taxi)",
      "b. cutting trip or going beyond authorized line (cutting trip o wala sa ipinahihintulot na linya/ruta)",
      "c. all of the answers are correct (lahat ng sagot ay tama)"
    ]
  },
  {
    question: "7. Who is a Professional Driver?",
    tagalog: "Sino ang propesyonal na drayber?",
    image: "",
    correct: 2,
    options: [
      "a. An expert and experienced driver (isang eksperto at ekspiryensado sa pagmamaneho)",
      "b. Any driver who can operate a specific motor vehicle category (sinumang drayber na nakapagmamaneho ng isang uri ng sasakyang de-motor)",
      "c. Any driver who has a qualification to drive a Private or For Hire Vehicle (sinumang drayber na maykwalipikasyong magmaneho ng pribado o paupahang sasakyang de-motor)"
    ]
  },
  {
    question: "8. How many days do you need to settle a traffic violation with LTO?",
    tagalog: "Ilang araw dapat asikasuhin sa LTO ang paglabag sa batas trapiko?",
    image: "",
    correct: 0,
    options: [
      "a. Within 15 days (Sa loob ng 15 araw)",
      "b. Within 10 days (Sa loob ng 10 araw)",
      "c. Within 30 days (Sa loob ng 30 araw)"
    ]
  },
  {
    question: "9. What is the maximum validity of license that a driver may have if he/she has no traffic violation at the time of renewal?",
    tagalog: "Ilang taon ang maaaring ibigay na lisenysa sa isang drayber na walang traffic violation?",
    image: "",
    correct: 1,
    options: [
      "a. 5 years validity",
      "b. 10 years validity",
      "c. 15 years validity"
    ]
  },
  {
    question: "10. Can a driver be given a 10-year validity license if he/she has traffic violation/s?",
    tagalog: "Maaari bang bigyan ng 10 taon na lisensya ang isang drayber kung ito ay mayroong huli o traffic violation?",
    image: "",
    correct: 0,
    options: [
      "a. No (hindi)",
      "b. Yes (Oo)",
      "c. Yes - if all penalties are paid 15 days prior to renewal (Oo kung ang penalty ay nabayaran labinlimang araw bago mag-renew)"
    ]
  },
  {
    question: "11. What is the allowed age to apply for a Non Professional driver's license?",
    tagalog: "Ano ang tamang edad upang magkaroon ng lisensya?",
    image: "",
    correct: 1,
    options: [
      "a. 16 years old",
      "b. 17 years old",
      "c. 20 Years old"
    ]
  },
  {
    question: "12. Registration of motor vehicle may be suspended if:",
    tagalog: "Maaaring isuspinde ang rehistro ng sasakayan kung ito ay:",
    image: "",
    correct: 1,
    options: [
      "a. motor vehicle is found to be in conformity with regulations (kung ang sasakyan ay maayos na nakapasa sa inspeksyon)",
      "b. motor vehicle is found to be unsightly (ang sasakyan ay hindi kaaya-aya)",
      "c. motor vehicle is not registered to the driver at the time of apprehension (ang sasakyan ay hindi rehistrado sa nagmamaneho sa oras ng pagkahuli nito)"
    ]
  },
  {
    question: "13. Where do you need to display your plate number?",
    tagalog: "Saan dapat ilagay ang plaka ng isang sasakyan?",
    image: "",
    correct: 0,
    options: [
      "a. one in front and one in the rear of the vehicle (isa sa harap at isa sa likod ng sasakyan)",
      "b. two in front (dalawa sa harap)",
      "c. one in the front windshield and one at the back windshield (isa sa harap na windshield at isa sa likurang salamin)"
    ]
  },
  {
    question: "14. This traffic sign means \"Yield the right of way\"",
    tagalog: "Ang senyas trapiko na ito ay nangangahulugang “magbigay daan”:",
    image: "",
    correct: 0,
    options: [
      "a. inverted triangle (baligtad na tatsulok)",
      "b. vertical triangle (patayong tatsulok)",
      "c. horizontal triangle (pahalang na tatsulok)"
    ]
  },
  {
    question: "15. What is the main purpose of traffic laws, rules and regulations?",
    tagalog: "Ano ang pangunahing layunin ng mga batas, alituntunin at regulasyong pantrapiko?",
    image: "",
    correct: 2,
    options: [
      "a. To generate revenues for the government (Upang kumita ng pera ang pamahalaan)",
      "b. To discipline the motorists (Disiplinahin ang mga motorista)",
      "c. To put order on the road (Magkaroon ng maayos na galaw ang mga sasakyan at ang mga tumatawid sa kalsada)"
    ]
  },
  {
    question: "16. Green light at an intersection means:",
    tagalog: "Ang kulay berdeng ilaw sa isang interseksiyon ay nangangahulugan na:",
    image: "",
    correct: 2,
    options: [
      "a. pedestrians are allowed to cross all pedestrian lanes (pinahihintulutang tumawid sa lahat ng tawiran ang mga tao)",
      "b. pedestrians are not allowed to cross all pedestrian lanes (hindi pinahihintulutang tumawid sa lahat ng tawiran ang mga tao)",
      "c. the vehicles on the other street are stopped (ang mga sasakyan sa kabilang kalsada ay nakahinto)"
    ]
  },
  {
    question: "17. Flashing yellow light means:",
    tagalog: "Ang kumikisap-kisap na dilaw na ilaw pantrapiko ay nangangahulugan na:",
    image: "",
    correct: 0,
    options: [
      "a. slowdown and proceed with caution (bagalan ang takbo at dumiretso nang may pag-iingat)",
      "b. you have the right of way over a flashing yellow light (ikaw ang may higit na karapatan kaysa sa kumikisap-kisap na dilawna ilaw)",
      "c. vehicles will be crossing from the other side (may mga sasakyang tatawid mula sa kabila)"
    ]
  },
  {
    question: "18. Parking is allowed if the vehicle is",
    tagalog: "Pinahihintulutan ang pagparada kung ang sasakyan ay",
    image: "",
    correct: 0,
    options: [
      "a. beyond 4 meters of a fire hydrant (lampas 4 na metro sa boka-insendiyo)",
      "b. within 3 meters of the intersection of curve lines (nasa loob ng 3 metro ng interseksiyon ng mga linyang kurbada)",
      "c. on the intersection (nasa interseksyon)"
    ]
  },
  {
    question: "19. Normally, on a two-lane road, overtaking is allowed at the:",
    tagalog: "Sa kalsadang pandalawahang sasakyan, ang pag-overtake ay pinahihintulutan sa:",
    image: "",
    correct: 2,
    options: [
      "a. shoulder or pavement of the road (kanang bahagi ng kalsada o bangketa)",
      "b. blind curve with a yellow solid line (kurbada/blind curve na may buong linyang dilaw)",
      "c. left lane (kaliwang lane)"
    ]
  },
  {
    question: "20. When do you have to make a complete full stop?",
    tagalog: "Kailan ka dapat ganap na huminto?",
    image: "",
    correct: 1,
    options: [
      "a. At a flashing yellow light (Kapag may dilaw na ilaw na kumikisap-kisap)",
      "b. At a red traffic light (Kapag pula ang ilaw trapiko)",
      "c. At an intersection (Kapag nasa interseksyon)"
    ]
  },
  {
    question: "21. The proper hand signal for a right turn is:",
    tagalog: "Ang tamang senyas ng kamay kapag kumakanan ay:",
    image: "",
    correct: 1,
    options: [
      "a. left arm pointing left (ang kaliwang braso nakaturo sa kaliwa)",
      "b. left arm held pointing upward (ang kaliwang braso ay nakaturo sa itaas)",
      "c. left arm held down, hand pointing at ground (ang kaliwang braso ay nakapababa, na ang kamay ay nakaturo saibaba)"
    ]
  },
  {
    question: "22. Single white broken line on a 2-way road means:",
    tagalog: "Ang putting putol-putol na linya sa kalsadang salubungan ay nangangahulugan na:",
    image: "",
    correct: 1,
    options: [
      "a. passing or overtaking can be made anytime (ang paglampas o ang pag-overtake ay maaaring gawin anumang oras)",
      "b. it separates traffic moving in opposite directions (hinihiwalay nito ang pagdaloy ng mga sasakyan sa magkabilang direksiyon)",
      "c. absolutely no crossing (talagang hindi ipinahihintulot ang pag-cross)"
    ]
  },
  {
    question: "23. What is the meaning of double solid yellow line?",
    tagalog: "Ano ang kahulugan ng dobleng linyang dilaw?",
    image: "",
    correct: 2,
    options: [
      "a. Cross with due care (Tumawid nang maingat)",
      "b. Cross anytime (Tumawid anumang oras)",
      "c. Crossing/ traversing or overtaking is not allowed (Ang pagtawid o paglusot ay hindi pinahihintulutan)"
    ]
  },
  {
    question: "24. Upon approaching an intersection marked with a yield sign, you are required to",
    tagalog: "Kapag papalapit sa interseksiyong may karatulang nagsasabing magbigay daan (yield), kailangang",
    image: "",
    correct: 1,
    options: [
      "a. stop before entering the intersection (huminto bago pumasok sa interseksiyon)",
      "b. slowdown, then enter the intersection when the way is clear (bagalan ang takbo at pagkatapos ay pumasok sa interseksiyon kung ligtas)",
      "c. enter the intersection immediately (pumasok agad sa interseksiyon)"
    ]
  },
  {
    question: "25. The holder of a driver's license shall entitle him/her to operate:",
    tagalog: "Ang lisensiya ay nagpapahintulot sa drayber na magmaneho ng:",
    image: "",
    correct: 1,
    options: [
      "a. any kind of motor vehicle (anumang uri ng sasakyang de-motor)",
      "b. motor vehicle/s specified in the license only (mga sasakyan lamang na nakatakda sa lisensiya)",
      "c. motor vehicles for hire only (mga pampublikong sasakyan lamang)"
    ]
  },
  {
    question: "26. When may you lend your driver's license?",
    tagalog: "Kailan mo maaaring ipahiram ang iyong lisensiya?",
    image: "",
    correct: 0,
    options: [
      "a. Under no circumstances (Hindi maaari kahit kailan)",
      "b. To another person who is learning to drive (Sa indibiduwal na nag-aaral magmaneho)",
      "c. In emergencies (Sa oras ng kagipitan o emergency)"
    ]
  },
  {
    question: "27. At an intersection without stop or yield signs, two cars approach at right angles to each other at almost the same time. Which driver must yield?",
    tagalog: "Sa interseksiyon na walang mga karatulang nagsasabing huminto o magbigay ng daan, dalawang sasakyan ang sabay na dumating sa anggulong 90 digri sa isa’tisa. Sinong drayber ang dapat magbigay daan?",
    image: "",
    correct: 1,
    options: [
      "a. The motorist on the right (Ang drayber ng sasakyan sa kanan)",
      "b. The motorist on the left (Ang drayber ng sasakyan sa kaliwa)",
      "c. Either of the driver has the first right-of-way (Alinman sa dalawa ay may unang karapatan)"
    ]
  },
  {
    question: "28. Is it allowed to drive a motorcycle in a public road pending release of the Certificate of Registration?",
    tagalog: "Maaari bang gamitin sa pampublikong daan ang motorsiklo kung ito ay wala pang rehistro?",
    image: "",
    correct: 0,
    options: [
      "a. No (Hindi)",
      "b. Yes (Oo)",
      "c. Yes, if travel authority is given by the dealer (Oo, kung ang pagbiyahe ay may pahintulot ang dealer nito)"
    ]
  },
  {
    question: "29. Which of the following statement is true?",
    tagalog: "Alin sa mga sumusunod na pahayag ang totoo?",
    image: "",
    correct: 2,
    options: [
      "a. A DL holder with authority to drive vehicles with manual transmission (MT) is not allowed to drive vehicles with automatic transmission (AT) (Ang isang may hawak ng DL na may awtoridad na magmaneho ng manual transmission (MT) ay hindi pinapayagan na magmaneho ng mga sasakyan na automatic transmission (AT))",
      "b. A DL holder with authority to drive vehicles with automatic transmission (AT) is allowed to drive vehicles with manual transmission (MT) (Ang drayber na may hawak na lisensya para sa atomatik na sasakyan ay pwedeng magmaneho ng sasakyang manwal.)",
      "c. A DL holder with authority to drive vehicles with manual transmission (MT) is allowed to operate vehicles with automatic transmission (AT) (Ang drayber na may hawak ng lisensya para sa manual transmission ay maaaring magmaneho ng may automatik na transmission)"
    ]
  },
  {
    question: "30. Can you drive a motorcycle if your license bears DL Code B ?",
    tagalog: "Maaari ka bang magmaneho ng motorsiklo kung ang iyong lisensya ay may DL Code B ?",
    image: "",
    correct: 2,
    options: [
      "a. Yes (Oo)",
      "b. No, unless authorized by a traffic enforcer (Hindi, maliban kung pinahintulutan ng traffic enforcer)",
      "c. No (Hindi)"
    ]
  }
];

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
      ? "TDC 1st Session Exam — 15 Items"
      : "TDC Final Exam — 30 Items";

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
