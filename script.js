/* A1C TDC EXAM STAGE 2
   30-item TDC 1st Session + 120-item TDC Final Exam
   80% passing rate per section; 90-minute overall timer.
   Dummy questions are marked clearly and can be replaced later.
*/
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
let securityTerminationInProgress = false;
let suppressFullscreenViolation = false;

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
,
  {
    question: "16. DUMMY SESSION 1 QUESTION 16 — Replace with the actual question.",
    tagalog: "DUMMY SESSION 1 QUESTION 16 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "17. DUMMY SESSION 1 QUESTION 17 — Replace with the actual question.",
    tagalog: "DUMMY SESSION 1 QUESTION 17 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "18. DUMMY SESSION 1 QUESTION 18 — Replace with the actual question.",
    tagalog: "DUMMY SESSION 1 QUESTION 18 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "19. DUMMY SESSION 1 QUESTION 19 — Replace with the actual question.",
    tagalog: "DUMMY SESSION 1 QUESTION 19 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "20. DUMMY SESSION 1 QUESTION 20 — Replace with the actual question.",
    tagalog: "DUMMY SESSION 1 QUESTION 20 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "21. DUMMY SESSION 1 QUESTION 21 — Replace with the actual question.",
    tagalog: "DUMMY SESSION 1 QUESTION 21 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "22. DUMMY SESSION 1 QUESTION 22 — Replace with the actual question.",
    tagalog: "DUMMY SESSION 1 QUESTION 22 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "23. DUMMY SESSION 1 QUESTION 23 — Replace with the actual question.",
    tagalog: "DUMMY SESSION 1 QUESTION 23 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "24. DUMMY SESSION 1 QUESTION 24 — Replace with the actual question.",
    tagalog: "DUMMY SESSION 1 QUESTION 24 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "25. DUMMY SESSION 1 QUESTION 25 — Replace with the actual question.",
    tagalog: "DUMMY SESSION 1 QUESTION 25 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "26. DUMMY SESSION 1 QUESTION 26 — Replace with the actual question.",
    tagalog: "DUMMY SESSION 1 QUESTION 26 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "27. DUMMY SESSION 1 QUESTION 27 — Replace with the actual question.",
    tagalog: "DUMMY SESSION 1 QUESTION 27 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "28. DUMMY SESSION 1 QUESTION 28 — Replace with the actual question.",
    tagalog: "DUMMY SESSION 1 QUESTION 28 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "29. DUMMY SESSION 1 QUESTION 29 — Replace with the actual question.",
    tagalog: "DUMMY SESSION 1 QUESTION 29 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "30. DUMMY SESSION 1 QUESTION 30 — Replace with the actual question.",
    tagalog: "DUMMY SESSION 1 QUESTION 30 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
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
,
  {
    question: "31. DUMMY FINAL QUESTION 31 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 31 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "32. DUMMY FINAL QUESTION 32 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 32 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "33. DUMMY FINAL QUESTION 33 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 33 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "34. DUMMY FINAL QUESTION 34 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 34 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "35. DUMMY FINAL QUESTION 35 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 35 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "36. DUMMY FINAL QUESTION 36 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 36 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "37. DUMMY FINAL QUESTION 37 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 37 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "38. DUMMY FINAL QUESTION 38 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 38 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "39. DUMMY FINAL QUESTION 39 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 39 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "40. DUMMY FINAL QUESTION 40 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 40 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "41. DUMMY FINAL QUESTION 41 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 41 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "42. DUMMY FINAL QUESTION 42 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 42 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "43. DUMMY FINAL QUESTION 43 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 43 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "44. DUMMY FINAL QUESTION 44 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 44 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "45. DUMMY FINAL QUESTION 45 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 45 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "46. DUMMY FINAL QUESTION 46 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 46 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "47. DUMMY FINAL QUESTION 47 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 47 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "48. DUMMY FINAL QUESTION 48 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 48 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "49. DUMMY FINAL QUESTION 49 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 49 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "50. DUMMY FINAL QUESTION 50 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 50 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "51. DUMMY FINAL QUESTION 51 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 51 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "52. DUMMY FINAL QUESTION 52 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 52 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "53. DUMMY FINAL QUESTION 53 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 53 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "54. DUMMY FINAL QUESTION 54 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 54 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "55. DUMMY FINAL QUESTION 55 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 55 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "56. DUMMY FINAL QUESTION 56 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 56 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "57. DUMMY FINAL QUESTION 57 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 57 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "58. DUMMY FINAL QUESTION 58 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 58 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "59. DUMMY FINAL QUESTION 59 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 59 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "60. DUMMY FINAL QUESTION 60 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 60 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "61. DUMMY FINAL QUESTION 61 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 61 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "62. DUMMY FINAL QUESTION 62 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 62 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "63. DUMMY FINAL QUESTION 63 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 63 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "64. DUMMY FINAL QUESTION 64 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 64 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "65. DUMMY FINAL QUESTION 65 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 65 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "66. DUMMY FINAL QUESTION 66 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 66 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "67. DUMMY FINAL QUESTION 67 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 67 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "68. DUMMY FINAL QUESTION 68 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 68 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "69. DUMMY FINAL QUESTION 69 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 69 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "70. DUMMY FINAL QUESTION 70 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 70 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "71. DUMMY FINAL QUESTION 71 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 71 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "72. DUMMY FINAL QUESTION 72 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 72 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "73. DUMMY FINAL QUESTION 73 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 73 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "74. DUMMY FINAL QUESTION 74 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 74 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "75. DUMMY FINAL QUESTION 75 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 75 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "76. DUMMY FINAL QUESTION 76 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 76 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "77. DUMMY FINAL QUESTION 77 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 77 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "78. DUMMY FINAL QUESTION 78 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 78 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "79. DUMMY FINAL QUESTION 79 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 79 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "80. DUMMY FINAL QUESTION 80 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 80 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "81. DUMMY FINAL QUESTION 81 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 81 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "82. DUMMY FINAL QUESTION 82 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 82 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "83. DUMMY FINAL QUESTION 83 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 83 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "84. DUMMY FINAL QUESTION 84 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 84 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "85. DUMMY FINAL QUESTION 85 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 85 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "86. DUMMY FINAL QUESTION 86 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 86 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "87. DUMMY FINAL QUESTION 87 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 87 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "88. DUMMY FINAL QUESTION 88 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 88 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "89. DUMMY FINAL QUESTION 89 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 89 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "90. DUMMY FINAL QUESTION 90 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 90 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "91. DUMMY FINAL QUESTION 91 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 91 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "92. DUMMY FINAL QUESTION 92 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 92 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "93. DUMMY FINAL QUESTION 93 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 93 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "94. DUMMY FINAL QUESTION 94 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 94 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "95. DUMMY FINAL QUESTION 95 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 95 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "96. DUMMY FINAL QUESTION 96 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 96 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "97. DUMMY FINAL QUESTION 97 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 97 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "98. DUMMY FINAL QUESTION 98 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 98 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "99. DUMMY FINAL QUESTION 99 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 99 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "100. DUMMY FINAL QUESTION 100 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 100 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "101. DUMMY FINAL QUESTION 101 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 101 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "102. DUMMY FINAL QUESTION 102 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 102 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "103. DUMMY FINAL QUESTION 103 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 103 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "104. DUMMY FINAL QUESTION 104 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 104 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "105. DUMMY FINAL QUESTION 105 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 105 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "106. DUMMY FINAL QUESTION 106 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 106 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "107. DUMMY FINAL QUESTION 107 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 107 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "108. DUMMY FINAL QUESTION 108 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 108 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "109. DUMMY FINAL QUESTION 109 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 109 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "110. DUMMY FINAL QUESTION 110 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 110 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "111. DUMMY FINAL QUESTION 111 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 111 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "112. DUMMY FINAL QUESTION 112 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 112 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "113. DUMMY FINAL QUESTION 113 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 113 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "114. DUMMY FINAL QUESTION 114 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 114 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "115. DUMMY FINAL QUESTION 115 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 115 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "116. DUMMY FINAL QUESTION 116 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 116 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "117. DUMMY FINAL QUESTION 117 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 117 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "118. DUMMY FINAL QUESTION 118 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 118 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "119. DUMMY FINAL QUESTION 119 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 119 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  },
  {
    question: "120. DUMMY FINAL QUESTION 120 — Replace with the actual question.",
    tagalog: "DUMMY FINAL QUESTION 120 — Papalitan ng aktwal na tanong.",
    image: "",
    correct: 0,
    options: [
      "a. DUMMY CORRECT ANSWER",
      "b. DUMMY OPTION",
      "c. DUMMY OPTION"
    ]
  }
];

// Security termination modal styles.

// Mobile screenshot deterrence and exam watermark.
// IMPORTANT: Normal mobile browsers do not expose a reliable "screenshot taken"
// event. Hardware screenshot buttons (Power + Volume, iOS side-button + volume,
// etc.) cannot be detected by a GitHub Pages website. The watermark makes
// screenshots traceable and the browser-level screenshot shortcuts below are
// still blocked/logged when the browser exposes the key event.
const mobileSecurityStyle = document.createElement("style");
mobileSecurityStyle.textContent = `
  html, body, #app, .exam-shell, .question-card {
    -webkit-user-select: none !important;
    user-select: none !important;
    -webkit-touch-callout: none !important;
  }

  input, textarea {
    -webkit-user-select: text !important;
    user-select: text !important;
  }

  .exam-watermark {
    position: fixed;
    inset: 0;
    z-index: 20;
    pointer-events: none;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: .10;
    font-weight: 800;
    font-size: clamp(18px, 4vw, 34px);
    line-height: 1.7;
    letter-spacing: 2px;
    text-align: center;
    transform: rotate(-25deg);
    white-space: pre-line;
  }

  .exam-watermark span {
    padding: 30px;
  }

  @media print {
    body {
      display: none !important;
    }
  }
`;
document.head.appendChild(mobileSecurityStyle);

function addExamWatermark() {
  let wm = document.getElementById("examWatermark");
  if (!wm) {
    wm = document.createElement("div");
    wm.id = "examWatermark";
    wm.className = "exam-watermark";
    document.body.appendChild(wm);
  }

  const name = esc(student.fullName || "AUTHORIZED STUDENT");
  const clientId = esc(student.clientId || student.ltoClientId || "LTO CLIENT ID");
  const attempt = esc(attemptId || "ATTEMPT");

  wm.innerHTML = `<span>A1C DRIVING ACADEMY<br>${name}<br>${clientId}<br>${attempt}</span>`;
}

const securityModalStyle = document.createElement("style");
securityModalStyle.textContent = `
  .security-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,.72);
    padding: 20px;
    box-sizing: border-box;
  }
  .security-modal-card {
    width: min(520px, 100%);
    background: #fff;
    border-radius: 18px;
    padding: 30px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,.35);
  }
  .security-modal-icon {
    font-size: 48px;
    margin-bottom: 10px;
  }
  .security-modal-card h2 {
    margin: 0 0 12px;
  }
  .security-modal-card p {
    line-height: 1.5;
  }
`;
document.head.appendChild(securityModalStyle);

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
 // In startAuthenticatedExam:
  answers = {
  session1: new Array(SESSION_1_COUNT).fill(null),
  final: new Array(FINAL_COUNT).fill(null)
};
  timer = TOTAL_TIME_SECONDS;
  securityViolations = 0;
  submitted = false;
  securityTerminationInProgress = false;
  suppressFullscreenViolation = false;

  try {
    document.documentElement.requestFullscreen?.();
  } catch (_) {}

  renderExam();
  addExamWatermark();
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
        Examination monitoring is active. Maximum security warnings: 3.
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
  getAnswers()[currentIndex] = parseInt(index, 10);
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
  
  // FIXED: Check all indices from 0 to questions.length - 1
  let unanswered = 0;
  for (let i = 0; i < questions.length; i++) {
    if (selectedAnswers[i] === undefined || selectedAnswers[i] === null) {
      unanswered++;
    }
  }

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
          <button class="${selectedAnswers[i] !== undefined && selectedAnswers[i] !== null ? "answered" : "unanswered"}"
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
  const questions = getQuestions();
  const selectedAnswers = getAnswers();
  
  let unanswered = 0;
  for (let i = 0; i < questions.length; i++) {
    if (selectedAnswers[i] === undefined || selectedAnswers[i] === null) {
      unanswered++;
    }
  }

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

function showSecurityTerminationModal() {
  if (document.getElementById("securityTerminationModal")) return;

  const modal = document.createElement("div");
  modal.id = "securityTerminationModal";
  modal.innerHTML = `
    <div class="security-modal-backdrop">
      <div class="security-modal-card" role="dialog" aria-modal="true">
        <div class="security-modal-icon">⚠</div>
        <h2>EXAMINATION TERMINATED</h2>
        <p>Three security violations have been recorded.</p>
        <p>Your examination has been submitted because the maximum number of security warnings has been reached.</p>
        <button id="securityResultButton" class="nav-btn primary">View Result</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("securityResultButton").addEventListener("click", () => {
    modal.remove();

    // Security termination ends the ENTIRE examination.
    // Do not show the Session 1 continuation button after the limit is reached.
    showFinalResult(
      calculateScore(finalQuestions, answers.final)
    );
  });
}

function recordViolation(type) {
  if (submitted || securityTerminationInProgress) return;

  securityViolations++;

  sendSecurityEvent(`${type} #${securityViolations}`);

  const banner = document.getElementById("securityBanner");

  if (banner) {
    banner.textContent =
      `⚠ Security warning ${securityViolations} of 3: ${type}`;
  }

  if (securityViolations >= 3) {
    // Mark the exam as terminating BEFORE displaying anything.
    // This prevents the fullscreenchange event caused by a dialog/modal
    // from being counted as a fourth violation.
    securityTerminationInProgress = true;
    submitted = true;
    suppressFullscreenViolation = true;
    stopTimer();

    sendSecurityEvent("EXAM_TERMINATED_SECURITY_LIMIT");
    showSecurityTerminationModal();
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
  if (suppressFullscreenViolation) return;

  if (document.getElementById("questionArea") && !document.fullscreenElement) {
    recordViolation("FULLSCREEN_EXIT");
  }
});

// Best-effort screenshot protection. Browsers cannot completely prevent
// OS-level screenshots (Snipping Tool, phone camera, external capture, etc.),
// but common screenshot shortcuts are blocked and logged as violations.
document.addEventListener("keydown", event => {
  if (!document.getElementById("questionArea") || submitted) return;

  const key = String(event.key || "").toLowerCase();
  const isPrintScreen = key === "printscreen" || event.code === "PrintScreen";
  const isWindowsSnipShortcut = event.shiftKey && key === "s" && (event.metaKey || event.getModifierState?.("Meta"));
  const isMacScreenshotShortcut = event.metaKey && event.shiftKey && ["3", "4", "5"].includes(key);
  const isOtherScreenshotShortcut = event.ctrlKey && event.shiftKey && key === "s";

  if (isPrintScreen || isWindowsSnipShortcut || isMacScreenshotShortcut || isOtherScreenshotShortcut) {
    event.preventDefault();
    event.stopPropagation();
    recordViolation("SCREENSHOT_ATTEMPT");
  }
});

document.addEventListener("keyup", event => {
  if (!document.getElementById("questionArea") || submitted) return;

  if (event.key === "PrintScreen" || event.code === "PrintScreen") {
    event.preventDefault();
    recordViolation("SCREENSHOT_ATTEMPT");
  }
});


// Browser print is another way of extracting the exam. Block it and log it.
window.addEventListener("beforeprint", () => {
  if (document.getElementById("questionArea") && !submitted) {
    recordViolation("PRINT_SCREEN_ATTEMPT");
  }
});

// Keep the watermark present if the exam UI is rerendered.
const originalRenderQuestion = renderQuestion;
renderQuestion = function() {
  originalRenderQuestion();
  addExamWatermark();
};

// Disable dragging/copying question images. This does not stop OS-level
// screenshot tools, but it prevents easy image extraction from the page.
document.addEventListener("dragstart", event => {
  if (document.getElementById("questionArea")) {
    event.preventDefault();
  }
});
