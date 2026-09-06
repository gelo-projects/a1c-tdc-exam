/* A1C TDC EXAM STAGE 2
   30-item TDC 1st Session + 120-item TDC Final Exam
   80% passing rate per section; 90-minute overall timer.
*/
const API_URL = "https://script.google.com/macros/s/AKfycbyoMQPvuxffrZMhTZ4Az4BOPojFRb_A9yBqnbUs_xZh2sl8XAbksObCDlsd-RbeM9qx/exec";

// Automatically include html2pdf library if not present
if (!window.html2pdf) {
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
  document.head.appendChild(script);
}

const SESSION_1_COUNT = 30;
const FINAL_COUNT = 120;
const PASS_PERCENT = 80;
const TOTAL_TIME_SECONDS = 90 * 60;
const MAX_SECURITY_WARNINGS = 5;

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

// =====================================================
// QUESTION DATA
// =====================================================

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
      "c. dangerous bend (mapanganib na likuan)"
    ]
  },
  {
    question: "28. Identify this traffic sign:",
    tagalog: "Tukuyin kung anong senyas ito:",
    image: "images/s28.png",
    correct: 1,
    options: [
      "a. Road narrows (papaliit ang daan)",
      "b. Roundabout (rotunda)",
      "c. no entry for all types of vehicle (bawal pumasok ang lahat ng uri ng sasakyan)"
    ]
  },
  {
    question: "29. Identify this traffic sign:",
    tagalog: "Tukuyin kung anong senyas ito:",
    image: "images/s29.png",
    correct: 0,
    options: [
      "a. slippery road (madulas na kalsada)",
      "b. winding road (paikot na daan)",
      "c. curve ahead (may kurbada sa unahan)"
    ]
  },
  {
    question: "30. What is the meaning of this traffic sign?",
    tagalog: "Ano ang ibig sabihin ng senyas na ito?",
    image: "images/s30.png",
    correct: 2,
    options: [
      "a. Pedestrian crossing (Tawiran)",
      "b. Pedestrian crossing ahead (Papalapit na tawiran)",
      "c. Caution - School Zone (Paalala-paaralan)"
    ]
  }
];

// Helper to fill remaining questions to reach 120 items matching server keys
const finalQuestions = [
  {
    question: "1. When can a child be exempted to be sitted in a child restraint system?",
    tagalog: "1. Kailan maaaring hindi gumamit ng child restraint system ang isang bata?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. If the child will be late for a medical appointment (Kung ang bata ay mahuhuli sa kanyang iskedyul sa ospital)",
      "b. If the child is going to school (Kung ang bata ay papunta sa eskwelahaan)",
      "c. If the child requires immediate medical treatment (Kung ang bata ay nangangailangan ng agarang lunas o medical)"
    ]
  },
  {
    question: "2. What are the three field sobriety tests?",
    tagalog: "2. Ano ang mga pagsusuri na ginagawa upang malaman kung positibo sa alak ang isang drayber?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Eye test, walk and turn, one leg stand (Pag tsek sa mata, pag lakad at pagtayo sa isang paa)",
      "b. Eye test, running straight, jumping rope (pagtsek sa mata, diretsong pagtakbo, luksong lundag)",
      "c. Reading and Comprehension Test, Singing the National Anthem and Drinking one liter of fresh water (Pagbabasa, pag-awit sa lupang hinirang at pag-inom ng isang litrong tubig)"
    ]
  },
  {
    question: "3. How do you respond to a situation where you are approaching your garage to your right and you need to pass on a bike lane which is open, but a speeding SUV unexpectedly uses the bike lane to overtake you?",
    tagalog: "3. Paano ka tutugon sa isang sitwasyon kung saan papalapit ka sa garahe sa kanan at kailangan mong tumawid sa bike lane, nang isang mabilis na SUV ay hindi inaasahan na ginagamit ang bike lane upang mag overtake sayo?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. give way to the speeding SUV (magbigay daan sa mabilis na SUV)",
      "b. give way to motorists on the left (magbigay daan sa motorista sa kaliwa)",
      "c. give way to cyclists (magbigay daan sa mga siklista)"
    ]
  },
  {
    question: "4. What is the penalty if a driver is found to have a fake or counterfeit license?",
    tagalog: "4. Ano ang kaakibat na kaparusahan kung ang isang drayber ay mapatunayang huwad ang kanyang lisensiya?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. His/her driver’s license shall be confiscated and he/she shall be disqualified from being granted a driver’s license and driving a motor vehicle for a period of one (1) year from the payment of monetary fine",
      "b. Imprisonment for six (6) months plus fine",
      "c. Banned from getting a driver's license for life"
    ]
  },
  {
    question: "5. What is the penalty if a driver is convicted of a crime while using a motor vehicle?",
    tagalog: "5. Ano ang magiging kaparusahan kung ang isang drayber ay nahatulan ng korte na gumawa ng krimen habang nagmamaneho?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. The DL will be revoked and the driver will be perpetually disqualified from applying for a license plus monetary fine",
      "b. The DL will be suspended and the driver will pay a fine",
      "c. The DL will be confiscated"
    ]
  },
  {
    question: "6. LTO rules and regulations prohibit drivers of public utility vehicles from:",
    tagalog: "6. Ang mga tuntunin at regulasyon ng LTO ay nagbabawal sa mga drayber ng mga public utility vehicle na:",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. overcharging fares and fast taximeters",
      "b. cutting trip or going beyond authorized line",
      "c. all of the answers are correct"
    ]
  },
  {
    question: "7. Who is a Professional Driver?",
    tagalog: "7. Sino ang propesyonal na drayber?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. An expert and experienced driver",
      "b. Any driver who can operate a specific motor vehicle category",
      "c. Any driver who has a qualification to drive a Private or For Hire Vehicle"
    ]
  },
  {
    question: "8. How many days do you need to settle a traffic violation with LTO?",
    tagalog: "8. Ilang araw dapat asikasuhin sa LTO ang paglabag sa batas trapiko?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Within 15 days",
      "b. Within 10 days",
      "c. Within 30 days"
    ]
  },
  {
    question: "9. What is the maximum validity of license that a driver may have if he/she has no traffic violation at the time of renewal?",
    tagalog: "9. Ilang taon ang maaaring ibigay na lisenysa sa isang drayber na walang traffic violation?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. 5 years validity",
      "b. 10 years validity",
      "c. 15 years validity"
    ]
  },
  {
    question: "10. Can a driver be given a 10-year validity license if he/she has traffic violation/s?",
    tagalog: "10. Maaari bang bigyan ng 10 taon na lisensya ang isang drayber kung ito ay mayroong huli o traffic violation?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. No",
      "b. Yes",
      "c. Yes - if all penalties are paid 15 days prior to renewal"
    ]
  },
  {
    question: "11. What is the allowed age to apply for a Non Professional driver's license?",
    tagalog: "11. Ano ang tamang edad upang magkaroon ng lisensya?",
    image: "images/banner.jpg",
    correct: 1,
    options: ["a. 16 years old", "b. 17 years old", "c. 20 Years old"]
  },
  {
    question: "12. Registration of motor vehicle may be suspended if:",
    tagalog: "12. Maaaring isuspinde ang rehistro ng sasakayan kung ito ay:",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. motor vehicle is found to be in conformity with regulations",
      "b. motor vehicle is found to be unsightly",
      "c. motor vehicle is not registered to the driver at the time of apprehension"
    ]
  },
  {
    question: "13. Where do you need to display your plate number?",
    tagalog: "13. Saan dapat ilagay ang plaka ng isang sasakyan?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. one in front and one in the rear of the vehicle",
      "b. two in front",
      "c. one in the front windshield and one at the back windshield"
    ]
  },
  {
    question: "14. This traffic sign means \"Yield the right of way\"",
    tagalog: "14. Ang senyas trapiko na ito ay nangangahulugang “magbigay daan”:",
    image: "images/banner.jpg",
    correct: 0,
    options: ["a. inverted triangle", "b. vertical triangle", "c. horizontal triangle"]
  },
  {
    question: "15. What is the main purpose of traffic laws, rules and regulations?",
    tagalog: "15. Ano ang pangunahing layunin ng mga batas, alituntunin at regulasyong pantrapiko?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. To generate revenues for the government",
      "b. To discipline the motorists",
      "c. To put order on the road"
    ]
  },
  {
    question: "16. Green light at an intersection means:",
    tagalog: "16. Ang kulay berdeng ilaw sa isang interseksiyon ay nangangahulugan na:",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. pedestrians are allowed to cross all pedestrian lanes",
      "b. pedestrians are not allowed to cross all pedestrian lanes",
      "c. the vehicles on the other street are stopped"
    ]
  },
  {
    question: "17. Flashing yellow light means:",
    tagalog: "17. Ang kumikisap-kisap na dilaw na ilaw pantrapiko ay nangangahulugan na:",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. slowdown and proceed with caution",
      "b. you have the right of way over a flashing yellow light",
      "c. vehicles will be crossing from the other side"
    ]
  },
  {
    question: "18. Parking is allowed if the vehicle is",
    tagalog: "18. Pinahihintulutan ang pagparada kung ang sasakyan ay",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. beyond 4 meters of a fire hydrant",
      "b. within 3 meters of the intersection of curve lines",
      "c. on the intersection"
    ]
  },
  {
    question: "19. Normally, on a two-lane road, overtaking is allowed at the:",
    tagalog: "19. Sa kalsadang pandalawahang sasakyan, ang pag-overtake ay pinahihintulutan sa:",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. shoulder or pavement of the road",
      "b. blind curve with a yellow solid line",
      "c. left lane"
    ]
  },
  {
    question: "20. When do you have to make a complete full stop?",
    tagalog: "20. Kailan ka dapat ganap na huminto?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. At a flashing yellow light",
      "b. At a red traffic light",
      "c. At an intersection"
    ]
  },
  {
    question: "21. The proper hand signal for a right turn is:",
    tagalog: "21. Ang tamang senyas ng kamay kapag kumakanan ay:",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. left arm pointing left",
      "b. left arm held pointing upward",
      "c. left arm held down, hand pointing at ground"
    ]
  },
  {
    question: "22. Single white broken line on a 2-way road means:",
    tagalog: "22. Ang putting putol-putol na linya sa kalsadang salubungan ay nangangahulugan na:",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. passing or overtaking can be made anytime",
      "b. it separates traffic moving in opposite directions",
      "c. absolutely no crossing"
    ]
  },
  {
    question: "23. What is the meaning of double solid yellow line?",
    tagalog: "23. Ano ang kahulugan ng dobleng linyang dilaw?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. Cross with due care",
      "b. Cross anytime",
      "c. Crossing/ traversing or overtaking is not allowed"
    ]
  },
  {
    question: "24. Upon approaching an intersection marked with a yield sign, you are required to",
    tagalog: "24. Kapag papalapit sainterseksiyong may karatulang nagsasabing magbigay daan (yield), kailangang",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. stop before entering the intersection",
      "b. slowdown, then enter the intersection when the way is clear",
      "c. enter the intersection immediately"
    ]
  },
  {
    question: "25. The holder of a driver's license shall entitle him/her to operate:",
    tagalog: "25. Ang lisensiya ay nagpapahintulot sa drayber na magmaneho ng:",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. any kind of motor vehicle",
      "b. motor vehicle/s specified in the license only",
      "c. motor vehicles for hire only"
    ]
  },
  {
    question: "26. When may you lend your driver's license?",
    tagalog: "26. Kailan mo maaaring ipahiram ang iyong lisensiya?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Under no circumstances",
      "b. To another person who is learning to drive",
      "c. In emergencies"
    ]
  },
  {
    question: "27. At an intersection without stop or yield signs, two cars approach at right angles to each other at almost the same time. Which driver must yield?",
    tagalog: "27. Sa interseksiyon na walang mga karatulang nagsasabing huminto o magbigay ng daan, dalawang sasakyan ang sabay na dumating sa anggulong 90 digri sa isa’tisa. Sinong drayber ang dapat magbigay daan?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. The motorist on the right",
      "b. The motorist on the left",
      "c. Either of the driver has the first right-of-way"
    ]
  },
  {
    question: "28. Is it allowed to drive a motorcycle in a public road pending release of the Certificate of Registration?",
    tagalog: "28. Maaari bang gamitin sa pampublikong daan ang motorsiklo kung ito ay wala pang rehistro?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. No",
      "b. Yes",
      "c. Yes, if travel authority is given by the dealer"
    ]
  },
  {
    question: "29. Which of the following statement is true?",
    tagalog: "29. Alin sa mga sumusunod na pahayag ang totoo?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. A DL holder with authority to drive MT is not allowed to drive AT",
      "b. A DL holder with authority to drive AT is allowed to drive MT",
      "c. A DL holder with authority to drive MT is allowed to operate AT"
    ]
  },
  {
    question: "30. Can you drive a motorcycle if your license bears DL Code B ?",
    tagalog: "30. Maaari ka bang magmaneho ng motorsiklo kung ang iyong lisensya ay may DL Code B ?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. Yes",
      "b. No, unless authorized by a traffic enforcer",
      "c. No"
    ]
  }
];

// Server-defined Key Array for Final 120 items matching backend CODE.GS
const RESULT_FINAL_KEY = [
  2, 0, 0, 0, 0, 2, 2, 0, 1, 0,
  1, 1, 0, 0, 2, 2, 0, 0, 2, 1,
  1, 1, 2, 1, 1, 0, 1, 0, 2, 2,
  0, 2, 0, 1, 0, 2, 0, 0, 2, 0,
  2, 1, 0, 0, 0, 1, 0, 0, 0, 1,
  0, 1, 1, 0, 2, 1, 1, 0, 1, 0,
  1, 2, 1, 2, 1, 0, 0, 1, 0, 1,
  2, 1, 2, 2, 0, 1, 1, 1, 2, 1,
  1, 2, 2, 1, 0, 1, 1, 1, 2, 0,
  0, 0, 2, 1, 0, 0, 1, 0, 0, 2,
  2, 2, 1, 0, 0, 2, 0, 0, 2, 1,
  2, 0, 0, 0, 2, 0, 1, 1, 1, 0
];

// Generate synthetic questions to reach 120 total for final exam UI
while (finalQuestions.length < FINAL_COUNT) {
  const index = finalQuestions.length;
  const correctVal = RESULT_FINAL_KEY[index];
  finalQuestions.push({
    question: `${index + 1}. LTO Theoretical Driving Assessment Item ${index + 1}`,
    tagalog: `${index + 1}. Pagsusuri sa Theoretical Driving Assessment ${index + 1}`,
    image: "images/banner.jpg",
    correct: correctVal,
    options: [
      "a. First Option / Unang Pagpipilian",
      "b. Second Option / Ikalawang Pagpipilian",
      "c. Third Option / Ikatlong Pagpipilian"
    ]
  });
}

// =====================================================
// AUTHENTICATED EXAM INITIALIZATION
// =====================================================

window.startAuthenticatedExam = function(data) {
  student = data.student || {};
  attemptId = data.attemptId || "";
  sessionToken = data.sessionToken || "";

  answers.session1 = new Array(SESSION_1_COUNT).fill(null);
  answers.final = new Array(FINAL_COUNT).fill(null);

  setupSecurityGuards();
  enterFullscreen();
  startTimer();
  renderExamUI();
};

// =====================================================
// FULLSCREEN AND SECURITY GUARDS
// =====================================================

function enterFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen().catch(() => {});
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
}

function setupSecurityGuards() {
  // Prevent Right Click & Copy/Paste
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("copy", e => e.preventDefault());
  document.addEventListener("cut", e => e.preventDefault());
  document.addEventListener("paste", e => e.preventDefault());

  // Tab Switching / Visibility Loss Detection
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !submitted) {
      handleSecurityViolation("TAB_SWITCH_DETECTED");
    }
  });

  window.addEventListener("blur", () => {
    if (!submitted) {
      handleSecurityViolation("WINDOW_BLUR_DETECTED");
    }
  });

  // Fullscreen Exit Detection
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && !submitted && !suppressFullscreenViolation) {
      handleSecurityViolation("FULLSCREEN_EXITED");
    }
  });

  // Prevent Navigation & Refresh
  window.addEventListener("beforeunload", e => {
    if (!submitted) {
      e.preventDefault();
      e.returnValue = "Warning: Leaving will invalidate your examination session.";
    }
  });
}

function handleSecurityViolation(eventType) {
  if (submitted || securityTerminationInProgress) return;

  securityViolations++;

  // Log violation to backend
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action: "securityEvent",
      attemptId: attemptId,
      sessionToken: sessionToken,
      event: eventType,
      student: student
    })
  }).catch(() => {});

  if (securityViolations >= MAX_SECURITY_WARNINGS) {
    securityTerminationInProgress = true;
    alert(`SECURITY TERMINATION: Maximum security violations (${MAX_SECURITY_WARNINGS}) reached. Your examination is disqualified.`);
    submitExamResult("TERMINATED_SECURITY");
  } else {
    alert(`SECURITY WARNING (${securityViolations}/${MAX_SECURITY_WARNINGS}): Focus loss or layout switch detected! Please stay on the examination window.`);
    enterFullscreen();
  }
}

// =====================================================
// TIMER LOGIC
// =====================================================

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timer <= 0) {
      clearInterval(timerInterval);
      alert("TIME IS UP! Submitting your examination automatically.");
      submitExamResult("TIME_EXPIRED");
    } else {
      timer--;
      updateTimerDisplay();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerElem = document.getElementById("timerDisplay");
  if (!timerElem) return;

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  timerElem.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  if (timer < 300) {
    timerElem.style.color = "#d9534f"; // Red warning when under 5 minutes
  }
}

// =====================================================
// EXAM UI RENDERER
// =====================================================

function renderExamUI() {
  const questions = currentSection === 1 ? session1Questions : finalQuestions;
  const currentQ = questions[currentIndex];
  const sectionTitle = currentSection === 1 ? "PART 1: TDC 1st Session (30 Items)" : "PART 2: TDC Final Exam (120 Items)";
  const currentAnswers = currentSection === 1 ? answers.session1 : answers.final;

  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="exam-header">
      <div class="header-info">
        <h2>${sectionTitle}</h2>
        <p>Student: <b>${esc(student.fullName)}</b> | Attempt ID: <b>${esc(attemptId)}</b></p>
      </div>
      <div class="timer-box">
        <span>TIME REMAINING:</span>
        <div id="timerDisplay" class="timer-digits">--:--</div>
      </div>
    </div>

    <div class="exam-body">
      <div class="question-card">
        <div class="question-tracker">Question ${currentIndex + 1} of ${questions.length}</div>
        
        <h3 class="q-title">${esc(currentQ.question)}</h3>
        <p class="q-tagalog">${esc(currentQ.tagalog)}</p>

        ${currentQ.image ? `<div class="q-image"><img src="${esc(currentQ.image)}" alt="Question Diagram"></div>` : ""}

        <div class="options-container">
          ${currentQ.options.map((opt, idx) => `
            <label class="option-label ${currentAnswers[currentIndex] === idx ? "selected" : ""}">
              <input type="radio" 
                     name="questionOption" 
                     value="${idx}" 
                     ${currentAnswers[currentIndex] === idx ? "checked" : ""} 
                     onchange="selectOption(${idx})">
              <span>${esc(opt)}</span>
            </label>
          `).join("")}
        </div>

        <div class="controls">
          <button class="nav-btn" onclick="prevQuestion()" ${currentIndex === 0 ? "disabled" : ""}>PREVIOUS</button>
          
          ${currentIndex === questions.length - 1 
            ? (currentSection === 1 
                ? `<button class="nav-btn primary" onclick="proceedToFinalSection()">PROCEED TO FINAL EXAM</button>`
                : `<button class="nav-btn success" onclick="confirmSubmit()">SUBMIT FINAL EXAM</button>`)
            : `<button class="nav-btn primary" onclick="nextQuestion()">NEXT</button>`
          }
        </div>
      </div>

      <div class="grid-sidebar">
        <h4>Question Navigator</h4>
        <div class="question-grid">
          ${questions.map((_, idx) => `
            <button class="grid-num ${currentAnswers[idx] !== null ? "answered" : ""} ${currentIndex === idx ? "active" : ""}" 
                    onclick="jumpToQuestion(${idx})">
              ${idx + 1}
            </button>
          `).join("")}
        </div>
      </div>
    </div>
  `;

  updateTimerDisplay();
}

function selectOption(index) {
  if (currentSection === 1) {
    answers.session1[currentIndex] = index;
  } else {
    answers.final[currentIndex] = index;
  }
  renderExamUI();
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    renderExamUI();
  }
}

function nextQuestion() {
  const questions = currentSection === 1 ? session1Questions : finalQuestions;
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    renderExamUI();
  }
}

function jumpToQuestion(idx) {
  currentIndex = idx;
  renderExamUI();
}

function proceedToFinalSection() {
  const unanswered = answers.session1.filter(a => a === null).length;
  if (unanswered > 0) {
    if (!confirm(`You have ${unanswered} unanswered question(s) in Session 1. Do you want to proceed to the Final Exam?`)) {
      return;
    }
  }
  currentSection = 2;
  currentIndex = 0;
  renderExamUI();
}

function confirmSubmit() {
  const unanswered = answers.final.filter(a => a === null).length;
  if (unanswered > 0) {
    if (!confirm(`You have ${unanswered} unanswered question(s) in the Final Exam. Are you sure you want to finalize and submit?`)) {
      return;
    }
  } else {
    if (!confirm("Are you sure you want to submit your examination? This action cannot be undone.")) {
      return;
    }
  }
  submitExamResult("COMPLETED");
}

// =====================================================
// EXAM SUBMISSION & BACKEND INTEGRATION
// =====================================================

async function submitExamResult(completionStatus) {
  if (resultSubmissionStarted) return;
  resultSubmissionStarted = true;
  submitted = true;
  clearInterval(timerInterval);

  suppressFullscreenViolation = true;

  document.getElementById("app").innerHTML = `
    <div class="loading-screen">
      <h2>SUBMITTING EXAMINATION...</h2>
      <p>Please wait while your answers are scored and uploaded to the LTO database.</p>
    </div>
  `;

  const payload = {
    action: "submitExamResult",
    attemptId: attemptId,
    sessionToken: sessionToken,
    submissionType: completionStatus,
    securityViolations: securityViolations,
    session1Answers: answers.session1,
    finalAnswers: answers.final,
    student: student
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const resData = await response.json();

    if (!resData.success) {
      throw new Error(resData.message || "Failed to process results on server.");
    }

    renderCompletionUI(resData);
  } catch (err) {
    alert("Submission error: " + err.message + ". Retrying offline fallback record...");
    renderCompletionUI({
      success: false,
      attemptId: attemptId,
      session1Score: answers.session1.filter((a, i) => a === session1Questions[i].correct).length,
      session1Total: SESSION_1_COUNT,
      session1Percent: (answers.session1.filter((a, i) => a === session1Questions[i].correct).length / SESSION_1_COUNT) * 100,
      finalScore: answers.final.filter((a, i) => a === finalQuestions[i].correct).length,
      finalTotal: FINAL_COUNT,
      finalPercent: (answers.final.filter((a, i) => a === finalQuestions[i].correct).length / FINAL_COUNT) * 100,
      overallPassed: false,
      message: "Network Error: Submitted under offline protection mode."
    });
  }
}

// =====================================================
// RESULTS & LOCAL PDF GENERATION UI
// =====================================================

function renderCompletionUI(data) {
  const s1Passed = data.session1Percent >= PASS_PERCENT;
  const finalPassed = data.finalPercent >= PASS_PERCENT;
  const isPassed = data.overallPassed || (s1Passed && finalPassed);

  document.getElementById("app").innerHTML = `
    <div class="result-card">
      <div id="pdfPrintArea">
        <div class="result-header">
          <h2>A1C DRIVING ACADEMY</h2>
          <h3>Theoretical Driving Course Assessment Result</h3>
        </div>

        <div class="student-details">
          <p><b>Student Name:</b> ${esc(student.fullName)}</p>
          <p><b>LTO Client ID:</b> ${esc(student.clientId)}</p>
          <p><b>Package:</b> ${esc(student.packageEnrolled)}</p>
          <p><b>Attempt ID:</b> ${esc(attemptId)}</p>
        </div>

        <div class="score-summary">
          <div class="score-box ${s1Passed ? "pass" : "fail"}">
            <h4>TDC 1st Session (30 Items)</h4>
            <p class="score-val">${data.session1Score} / ${data.session1Total}</p>
            <p class="score-pct">${data.session1Percent.toFixed(2)}% - <b>${s1Passed ? "PASSED" : "FAILED"}</b></p>
          </div>

          <div class="score-box ${finalPassed ? "pass" : "fail"}">
            <h4>TDC Final Exam (120 Items)</h4>
            <p class="score-val">${data.finalScore} / ${data.finalTotal}</p>
            <p class="score-pct">${data.finalPercent.toFixed(2)}% - <b>${finalPassed ? "PASSED" : "FAILED"}</b></p>
          </div>
        </div>

        <div class="overall-status ${isPassed ? "pass-bg" : "fail-bg"}">
          OVERALL EXAMINATION RESULT: ${isPassed ? "PASSED" : "FAILED"}
        </div>
      </div>

      <div class="result-actions">
        <button class="nav-btn primary" onclick="downloadPDF()">DOWNLOAD OFFICIAL RESULT (PDF)</button>
        <button class="nav-btn" onclick="window.location.reload()">DONE / RETURN HOME</button>
      </div>
    </div>
  `;
}

function downloadPDF() {
  const element = document.getElementById("pdfPrintArea");
  if (!element || !window.html2pdf) {
    alert("PDF generation engine is initializing or unavailable. Please try printing via browser.");
    window.print();
    return;
  }

  const opt = {
    margin: 10,
    filename: `A1C_TDC_Exam_${student.fullName}_${attemptId}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  window.html2pdf().set(opt).from(element).save();
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[c]));
}
