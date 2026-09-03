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
    image: "images/1st/25.png",
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
    image: "images/1st/26.png",
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
    image: "images/1st/27.png",
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
    image: "images/1st/28.png",
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
    image: "images/1st/29.png",
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
    image: "images/1st/30.png",
    correct: 2,
    options: [
      "a. Pedestrian crossing (Tawiran)",
      "b. Pedestrian crossing ahead (Papalapit na tawiran)",
      "c. Caution - School Zone (Paalala-paaralan)"
    ]
  }
];

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
      "a. His/her driver’s license shall be confiscated and he/she shall be disqualified from being granted a driver’s license and driving a motor vehicle for a period of one (1) year from the payment of monetary fine (Ang kaniyang lisensiya ay kukumpiskahin at hindi siya makakukuha ng lisensiya at makakapagmaneho ng sasakyang de-motor sa loob ng isang (1) taon matapos bayaran ang multa)",
      "b. Imprisonment for six (6) months plus fine (Siya ay ikukulong sa loob ng anim (6) na buwan at pagmumultahin)",
      "c. Banned from getting a driver's license for life (Habambuhay nang hindi makakukuha ng lisensiya)"
    ]
  },
  {
    question: "5. What is the penalty if a driver is convicted of a crime while using a motor vehicle?",
    tagalog: "5. Ano ang magiging kaparusahan kung ang isang drayber ay nahatulan ng korte na gumawa ng krimen habang nagmamaneho?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. The DL will be revoked and the driver will be perpetually disqualified from applying for a license plus monetary fine (Multa at habambuhay na diskwalipikasyon sa pagkuha ng lisensya)",
      "b. The DL will be suspended and the driver will pay a fine (Sususpindihin ang lisensya at siya ay pagmumultahin)",
      "c. The DL will be confiscated (Ang lisensya ay kukumpiskahin)"
    ]
  },
  {
    question: "6. LTO rules and regulations prohibit drivers of public utility vehicles from:",
    tagalog: "6. Ang mga tuntunin at regulasyon ng LTO ay nagbabawal sa mga drayber ng mga public utility vehicle na:",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. overcharging fares and fast taximeters (sumingil ng labis na pamasahe at magkaroon ng mabilis na metro ng taxi)",
      "b. cutting trip or going beyond authorized line (cutting trip o wala sa ipinahihintulot na linya/ruta)",
      "c. all of the answers are correct (lahat ng sagot ay tama)"
    ]
  },
  {
    question: "7. Who is a Professional Driver?",
    tagalog: "7. Sino ang propesyonal na drayber?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. An expert and experienced driver (isang eksperto at ekspiryensado sa pagmamaneho)",
      "b. Any driver who can operate a specific motor vehicle category (sinumang drayber na nakapagmamaneho ng isang uri ng sasakyang de-motor)",
      "c. Any driver who has a qualification to drive a Private or For Hire Vehicle (sinumang drayber na may kwalipikasyong magmaneho ng pribado o paupahang sasakyang de-motor)"
    ]
  },
  {
    question: "8. How many days do you need to settle a traffic violation with LTO?",
    tagalog: "8. Ilang araw dapat asikasuhin sa LTO ang paglabag sa batas trapiko?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Within 15 days (Sa loob ng 15 araw)",
      "b. Within 10 days (Sa loob ng 10 araw)",
      "c. Within 30 days (Sa loob ng 30 araw)"
    ]
  },
  {
    question: "9. What is the maximum validity of license that a driver may have if he/she has no traffic violation at the time of renewal?",
    tagalog: "9. Ilang taon ang maaaring ibigay na lisenysa sa isang drayber na walang traffic violation?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. 5 years validity (5 taong kwalipikasyon)",
      "b. 10 years validity (10 taong kwalipikasyon)",
      "c. 15 years validity (15 taong kwalipikasyon)"
    ]
  },
  {
    question: "10. Can a driver be given a 10-year validity license if he/she has traffic violation/s?",
    tagalog: "10. Maaari bang bigyan ng 10 taon na lisensya ang isang drayber kung ito ay mayroong huli o traffic violation?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. No (Hindi)",
      "b. Yes (Oo)",
      "c. Yes - if all penalties are paid 15 days prior to renewal (Oo kung ang penalty ay nabayaran labin-limang araw bago mag-renew)"
    ]
  },
  {
    question: "11. What is the allowed age to apply for a Non Professional driver's license?",
    tagalog: "11. Ano ang tamang edad upang magkaroon ng lisensya?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. 16 years old (16 taong gulang)",
      "b. 17 years old (17 taong gulang)",
      "c. 20 Years old (20 taong gulang)"
    ]
  },
  {
    question: "12. Registration of motor vehicle may be suspended if:",
    tagalog: "12. Maaaring isuspinde ang rehistro ng sasakayan kung ito ay:",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. motor vehicle is found to be in conformity with regulations (kung ang sasakyan ay maayos na nakapasa sa inspeksyon)",
      "b. motor vehicle is found to be unsightly (ang sasakyan ay hindi kaaya-aya)",
      "c. motor vehicle is not registered to the driver at the time of apprehension (ang sasakyan ay hindi rehistrado sa nagmamaneho sa oras ng pagkahuli nito)"
    ]
  },
  {
    question: "13. Where do you need to display your plate number?",
    tagalog: "13. Saan dapat ilagay ang plaka ng isang sasakyan?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. one in front and one in the rear of the vehicle (isa sa harap at isa sa likod ng sasakyan)",
      "b. two in front (dalawa sa harap)",
      "c. one in the front windshield and one at the back windshield (isa sa harap na windshield at isa sa likurang salamin)"
    ]
  },
  {
    question: "14. This traffic sign means \"Yield the right of way\"",
    tagalog: "14. Ang senyas trapiko na ito ay nangangahulugang “magbigay daan”:",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. inverted triangle (baligtad na tatsulok)",
      "b. vertical triangle (patayong tatsulok)",
      "c. horizontal triangle (pahalang na tatsulok)"
    ]
  },
  {
    question: "15. What is the main purpose of traffic laws, rules and regulations?",
    tagalog: "15. Ano ang pangunahing layunin ng mga batas, alituntunin at regulasyong pantrapiko?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. To generate revenues for the government (Upang kumita ng pera ang pamahalaan)",
      "b. To discipline the motorists (Disiplinahin ang mga motorista)",
      "c. To put order on the road (Magkaroon ng maayos na galaw ang mga sasakyan at ang mga tumatawid sa kalsada)"
    ]
  },
  {
    question: "16. Green light at an intersection means:",
    tagalog: "16. Ang kulay berdeng ilaw sa isang interseksiyon ay nangangahulugan na:",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. pedestrians are allowed to cross all pedestrian lanes (pinahihintulutang tumawid sa lahat ng tawiran ang mga tao)",
      "b. pedestrians are not allowed to cross all pedestrian lanes (hindi pinahihintulutang tumawid sa lahat ng tawiran ang mga tao)",
      "c. the vehicles on the other street are stopped (ang mga sasakyan sa kabilang kalsada ay nakahinto)"
    ]
  },
  {
    question: "17. Flashing yellow light means:",
    tagalog: "17. Ang kumikisap-kisap na dilaw na ilaw pantrapiko ay nangangahulugan na:",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. slowdown and proceed with caution (bagalan ang takbo at dumiretso nang may pag-iingat)",
      "b. you have the right of way over a flashing yellow light (ikaw ang may higit na karapatan kaysa sa kumikisap-kisap na dilawna ilaw)",
      "c. vehicles will be crossing from the other side (may mga sasakyang tatawid mula sa kabila)"
    ]
  },
  {
    question: "18. Parking is allowed if the vehicle is",
    tagalog: "18. Pinahihintulutan ang pagparada kung ang sasakyan ay",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. beyond 4 meters of a fire hydrant (lampas 4 na metro sa boka-insendiyo)",
      "b. within 3 meters of the intersection of curve lines (nasa loob ng 3 metro ng interseksiyon ng mga linyang kurbada)",
      "c. on the intersection (nasa interseksyon)"
    ]
  },
  {
    question: "19. Normally, on a two-lane road, overtaking is allowed at the:",
    tagalog: "19. Sa kalsadang pandalawahang sasakyan, ang pag-overtake ay pinahihintulutan sa:",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. shoulder or pavement of the road (kanang bahagi ng kalsada o bangketa)",
      "b. blind curve with a yellow solid line (kurbada/blind curve na may buong linyang dilaw)",
      "c. left lane (kaliwang lane)"
    ]
  },
  {
    question: "20. When do you have to make a complete full stop?",
    tagalog: "20. Kailan ka dapat ganap na huminto?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. At a flashing yellow light (Kapag may dilaw na ilaw na kumikisap-kisap)",
      "b. At a red traffic light (Kapag pula ang ilaw trapiko)",
      "c. At an intersection (Kapag nasa interseksyon)"
    ]
  },
  {
    question: "21. The proper hand signal for a right turn is:",
    tagalog: "21. Ang tamang senyas ng kamay kapag kumakanan ay:",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. left arm pointing left (ang kaliwang braso nakaturo sa kaliwa)",
      "b. left arm held pointing upward (ang kaliwang braso ay nakaturo sa itaas)",
      "c. left arm held down, hand pointing at ground (ang kaliwang braso ay nakapababa, na ang kamay ay nakaturo saibaba)"
    ]
  },
  {
    question: "22. Single white broken line on a 2-way road means:",
    tagalog: "22. Ang putting putol-putol na linya sa kalsadang salubungan ay nangangahulugan na:",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. passing or overtaking can be made anytime (ang paglampas o ang pag-overtake ay maaaring gawin anumang oras)",
      "b. it separates traffic moving in opposite directions (hinihiwalay nito ang pagdaloy ng mga sasakyan sa magkabilang direksiyon)",
      "c. absolutely no crossing (talagang hindi ipinahihintulot ang pag-cross)"
    ]
  },
  {
    question: "23. What is the meaning of double solid yellow line?",
    tagalog: "23. Ano ang kahulugan ng dobleng linyang dilaw?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. Cross with due care (Tumawid nang maingat)",
      "b. Cross anytime (Tumawid anumang oras)",
      "c. Crossing/ traversing or overtaking is not allowed (Ang pagtawid o paglusot ay hindi pinahihintulutan)"
    ]
  },
  {
    question: "24. Upon approaching an intersection marked with a yield sign, you are required to",
    tagalog: "24. Kapag papalapit sainterseksiyong may karatulang nagsasabing magbigay daan (yield), kailangang",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. stop before entering the intersection (huminto bago pumasok sa interseksiyon)",
      "b. slowdown, then enter the intersection when the way is clear (bagalan ang takbo at pagkatapos ay pumasok sa interseksiyon kung ligtas)",
      "c. enter the intersection immediately (pumasok agad sa interseksiyon)"
    ]
  },
  {
    question: "25. The holder of a driver's license shall entitle him/her to operate:",
    tagalog: "25. Ang lisensiya ay nagpapahintulot sa drayber na magmaneho ng:",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. any kind of motor vehicle (anumang uri ng sasakyang de-motor)",
      "b. motor vehicle/s specified in the license only (mga sasakyan lamang na nakatakda sa lisensiya)",
      "c. motor vehicles for hire only (mga pampublikong sasakyan lamang)"
    ]
  },
  {
    question: "26. When may you lend your driver's license?",
    tagalog: "26. Kailan mo maaaring ipahiram ang iyong lisensiya?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Under no circumstances (Hindi maaari kahit kailan)",
      "b. To another person who is learning to drive (Sa indibiduwal na nag-aaral magmaneho)",
      "c. In emergencies (Sa oras ng kagipitan o emergency)"
    ]
  },
  {
    question: "27. At an intersection without stop or yield signs, two cars approach at right angles to each other at almost the same time. Which driver must yield?",
    tagalog: "27. Sa interseksiyon na walang mga karatulang nagsasabing huminto o magbigay ng daan, dalawang sasakyan ang sabay na dumating sa anggulong 90 digri sa isa’tisa. Sinong drayber ang dapat magbigay daan?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. The motorist on the right (Ang drayber ng sasakyan sa kanan)",
      "b. The motorist on the left (Ang drayber ng sasakyan sa kaliwa)",
      "c. Either of the driver has the first right-of-way (Alinman sa dalawa ay may unang karapatan)"
    ]
  },
  {
    question: "28. Is it allowed to drive a motorcycle in a public road pending release of the Certificate of Registration?",
    tagalog: "28. Maaari bang gamitin sa pampublikong daan ang motorsiklo kung ito ay wala pang rehistro?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. No (Hindi)",
      "b. Yes (Oo)",
      "c. Yes, if travel authority is given by the dealer (Oo, kung ang pagbiyahe ay may pahintulot ang dealer nito)"
    ]
  },
  {
    question: "29. Which of the following statement is true?",
    tagalog: "29. Alin sa mga sumusunod na pahayag ang totoo?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. A DL holder with authority to drive vehicles with manual transmission (MT) is not allowed to drive vehicles with automatic transmission (AT) (Ang isang may hawak ng DL na may awtoridad na magmaneho ng manual transmission (MT) ay hindi pinapayagan na magmaneho ng mga sasakyan na automatic transmission (AT))",
      "b. A DL holder with authority to drive vehicles with automatic transmission (AT) is allowed to drive vehicles with manual transmission (MT) (Ang drayber na may hawak na lisensya para sa atomatik na sasakyan ay pwedeng magmaneho ng sasakyang manwal.)",
      "c. A DL holder with authority to drive vehicles with manual transmission (MT) is allowed to operate vehicles with automatic transmission (AT) (Ang drayber na may hawak ng lisensya para sa manual transmission ay maaaring magmaneho ng may automatik na transmission)"
    ]
  },
  {
    question: "30. Can you drive a motorcycle if your license bears DL Code B ?",
    tagalog: "30. Maaari ka bang magmaneho ng motorsiklo kung ang iyong lisensya ay may DL Code B ?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. Yes (Oo)",
      "b. No, unless authorized by a traffic enforcer (Hindi, maliban kung pinahintulutan ng traffic enforcer)",
      "c. No (Hindi)"
    ]
  },
  {
    question: "31. Identify this traffic sign:",
    tagalog: "31. Tukuyin kung anong senyas ito:",
    image: "images/final/31.png",
    correct: 0,
    options: [
      "a. no u-turn (bawal mag u-turn)",
      "b. dangerous left bend (mapanganib na kaliwang likuan)",
      "c. dangerous right bend (mapanganib na kanang likuan)"
    ]
  },
  {
    question: "32. Identify this traffic sign:",
    tagalog: "32. Tukuyin kung anong senyas ito:",
    image: "images/final/32.png",
    correct: 2,
    options: [
      "a. road widens ahead (lalapad ang kalsada sa unahan)",
      "b. slippery road ahead (madulas ang kalsada sa unahan)",
      "c. road narrows ahead (papaliit na kalsada sa unahan)"
    ]
  },
  {
    question: "33. Identify this traffic sign:",
    tagalog: "33. Tukuyin kung anong senyas ito:",
    image: "images/final/33.png",
    correct: 0,
    options: [
      "a. no blowing of horn (bawal bumusina)",
      "b. animals crossing (may mga hayop na tumatawid)",
      "c. dangerous bend (mapanganib na likuan)"
    ]
  },
  {
    question: "34. Identify this traffic sign:",
    tagalog: "34. Tukuyin kung anong senyas ito:",
    image: "images/final/34.png",
    correct: 1,
    options: [
      "a. Road narrows (papaliit ang daan)",
      "b. Roundabout (rotunda)",
      "c. no entry for all types of vehicle (bawal pumasok ang lahat nguri ng sasakyan)"
    ]
  },
  {
    question: "35. Identify this traffic sign:",
    tagalog: "35. Tukuyin kung anong senyas ito:",
    image: "images/final/35.png",
    correct: 0,
    options: [
      "a. slippery road (madulas na kalsada)",
      "b. winding road (paikot na daan)",
      "c. curve ahead (may kurbada sa unahan)"
    ]
  },
  {
    question: "36. What is the meaning of this traffic sign?",
    tagalog: "36. Ano ang ibig sabihin ng senyas na ito?",
    image: "images/final/36.png",
    correct: 2,
    options: [
      "a. Pedestrian crossing (Tawiran)",
      "b. Pedestrian crossing ahead (Papalapit na tawiran)",
      "c. Caution - School Zone (Paalala-paaralan)"
    ]
  },
  {
    question: "37. Drinking alcohol before driving is one of the major causes of vehicular road crash because when a driver is drunk, he/she is:",
    tagalog: "37. Ang pag-inom ng mga inuming nakalalasing bago magmaneho ay isa sa mga pangunahing sanhi ng aksidente ng mga sasakyan sapagkat kapag lasing ang isang drayber, siya ay:",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. arrogant, talkative and doesn't have the judgement and the reflexes to perform things safely (mayabang, madaldal, wala sa tamang desisyon at hindi makakikilos nang tama at ligtas)",
      "b. calm, relaxed and able to perform things accordingly (kalmado at nakagagawa ng nararapat)",
      "c. able to talk intelligently and coherently, and give every appearance of sobriety (matalino, kalmado at nakakakilos nang nararapat o naaayon)"
    ]
  },
  {
    question: "38. The Temporary Operator's Permit (TOP) authorizes the apprehended driver to operate motor vehicle for a period not exceeding:",
    tagalog: "38. Pinahihintulutan ng Temporary Operator's Permit (TOP) ang nahuling drayber na magmaneho ng sasakyan sa loob ng:",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. 72 hours (72 oras)",
      "b. 1 week (1 linggo)",
      "c. 15 days (15 araw)"
    ]
  },
  {
    question: "39. What is the maximum penalty for driving under the influence of liquor or prohibited drugs?",
    tagalog: "39. Ano ang pinakamabigat na kaparusahan sa pagmamaneho nang nakainom o naka-droga?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. 6 months suspension (6 na buwan na suspensiyon)",
      "b. 1-year suspension (1 taóng suspensiyon)",
      "c. Perpetual revocation of license (Pang habambuhay na pagkakabawi ng lisensiya)"
    ]
  },
  {
    question: "40. What is the meaning of a blue traffic light?",
    tagalog: "40. Ano ang kahulugan ng asul na ilaw trapiko?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. None, no blue traffic light (Walang kulay asul na ilaw trapiko)",
      "b. Informative sign (Nagbibigay impormasyon)",
      "c. Proceed (Tumuloy)"
    ]
  },
  {
    question: "41. Motorcycle riders must consider safety and exercise due care. To do so, they are required to wear",
    tagalog: "41. Ang mga nagmamaneho ng motorsiklo ay dapat na laging isinasaalangalang ang lubos na pag-iingat at kaligtasan. Kaya kailangan nilang magsuot ng",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. a policeman cap or gloves (sombrero o guwantes ng pulis)",
      "b. helmets intended for construction works (helmet na pang-construction)",
      "c. standard protective helmet (naaangkop at aprubadong pang-motorsiklong helmet)"
    ]
  },
  {
    question: "42. What should you do when another vehicle is following you too close?",
    tagalog: "42. Ano ang gagawin mo kung ang sumusunod na sasakyan sa iyo ay masyadong nakatutok?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. Speed up to start a road race (Bilisan pa ang takbo at makipagkarerahan)",
      "b. Slow down gradually and give him the signal to overtake you ((Unti-unti mong bagalan ang takbo at senyasan siyang mag-overtake)",
      "c. Slam on your brakes (Biglang magpreno)"
    ]
  },
  {
    question: "43. Before changing lanes in traffic, aside from giving signal and checking your side and rearview mirrors, what else do you need to do?",
    tagalog: "43. Bago lumipat ng lane, bukod sa dapat munang sumenyas, tumingin sa mga gilid at rear view mirror, ano pa ang dapat mong gawin?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Turn your head to check other vehicles beside your car (Tingnan ang mga katabing sasakyan)",
      "b. Sound your horn (Bumusina)",
      "c. Blink your headlights (Pailawin ang mga headlights)"
    ]
  },
  {
    question: "44. When approaching a sharp curve of the highway, you should:",
    tagalog: "44. Kapag papalapit sa isang biglaang pagliko/kurbada, dapat:",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. reduce speed before entering the curve (bagalan ang takbo bago lumiko)",
      "b. increase speed while negotiating the curve (bilisan ang takbo habang lumiliko)",
      "c. apply your brakes abruptly while taking the curve (biglang magpreno habang lumiliko)"
    ]
  },
  {
    question: "45. Night driving is difficult. We should do the following when a vehicle comes towards us at night:",
    tagalog: "45. Mahirap magmaneho kung gabi kaya dapat gawin ang sumusunod kapag may kasalubong na sasakyan:",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. dim your lights by switching to low beam (hinaan ang ilaw sa pamamagitan ng pagsindi sa low beam)",
      "b. brighten your light by switching to high beam (lakasan ang ilaw sa pamamagitan ng pagsindi sa high beam)",
      "c. switch on your headlights intermittently (sindihan ang mga headlight, on and off)"
    ]
  },
  {
    question: "46. At night, when approaching a curve or intersection with poor visibility, be sure to:",
    tagalog: "46. Sa gabi, kapag papalapit sa isang kurbada o interseksiyon na mahirap makita ang kasalubong, siguraduhing:",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. switch off your headlights to enable oncoming motorists to see you (patayin ang headlight upang makita ng mga motorista ang iyong sasakyan)",
      "b. flash your headlights to let pedestrians and oncoming motorists know that you are heading into the curve or intersection (sumenyas sa pamamagitan ng pagpatay-sindi ng headlight upang malaman ng mga tao at mga kasalubong na motorista na papalapit ka sa kurbada o interseksiyon)",
      "c. switch on your interior lights to enable oncoming vehicles to see your vehicle (i-switch ng mg ilaw sa loob ng sasakyan upang makita ng mga makakasalubong ang iyong sasakyan)"
    ]
  },
  {
    question: "47. What is the best safety rule when driving a motor vehicle?",
    tagalog: "47. Ano ang pinakaligtas na alituntunin habang ikaw ay nagmamaneho?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Never insist on your right-of-way (Huwag ipilit ang karapatan sa daan)",
      "b. Blow your horn to assert your right-of-way (Bumusina upang maigiit ang iyong karapatan sa daan)",
      "c. Always demand for the right-of-way (laging igiit ang karapatan sa daan)"
    ]
  },
  {
    question: "48. A blind spot is either at your right or left that you do not see on your side mirror. What should you do before backing-up?",
    tagalog: "48. Ang blind spot ay nasa awing kanan o kaliwa na hindi mo nakikita sa iyong side mirror. Ano ang dapat mong gawin bago umatras?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Turn your head to see that the way is clear (Lumingon upang matiyak na walang nakaharang sa daan)",
      "b. Turn your wheel all the way to the right and pull up (Ipaling nang sagad ang gulong sa kanan bago huminto)",
      "c. Turn your wheel all the way to the left and pull up (Ipaling nang sagad ang gulong sa kaliwa bago huminto)"
    ]
  },
  {
    question: "49. Road crash can be avoided if the drivers:",
    tagalog: "49. Maiiwasan ang mga road crash kung:",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. follow traffic signs and pertinent traffic rules and regulations (susundin ang mga senyas pantrapiko at mga alintuntunin at regulasyon ng batas trapiko)",
      "b. totally disobey traffic laws (ganap na hindi susundin ang mga batas trapiko)",
      "c. are ignorant of traffic laws (ang mga drayber ay walang alam sa batas trapiko)"
    ]
  },
  {
    question: "50. What should you do whenever you are driving on a highway with a lot of potholes?",
    tagalog: "50. Ano ang dapat mong gawin kapag nagmamaneho sa highway na maraming lubak?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. Increase speed (Bilisan ang takbo)",
      "b. Reduce speed (Bagalan ang takbo)",
      "c. Always change lane (Palaging lumipat ng lane)"
    ]
  },
  {
    question: "51. Sometimes, a driver passes through a busy street with so many pedestrians. Which of the following should a driver do?",
    tagalog: "51. Kung minsan, dumaraan ang drayber sa isang kalye na maraming sasakyan at maraming tao. Alin sa mga sumusunod ang dapat niyang gawin?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Slowdown and check for safety when passing through (Bagalan ang takbo at tingnan kung ligtas ang pagdaan)",
      "b. Proceed with usual speed (Magpatuloy sa normal na takbo)",
      "c. Stop at all cost (Huminto anuman ang mangyari)"
    ]
  },
  {
    question: "52. Driving in heavy rains can be extremely dangerous due to limited visibility. What should you do?",
    tagalog: "52. Ang pagmamaneho kapag malakas ang ulan ay lubhang mapanganib dahil hindi makakakita ng maigi. Ano ang dapat mong gawin?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. When you cannot see more than 20 meters in front of you, turn on your hazard lights / headlights and look for a safe place to park (Kapag hindi makakita nang mahigit sa 20 metro sa harapan mo, i- switch ang hazard lights / headlight at maghanap ng ligtas na mapaparadahan)",
      "b. Turn on your headlights and slow down or park at a safe place if situation is risky (I-switch ang headlights at bagalan ang takbo o di kaya naman ay huminto sa isang ligtas na lugar kung ang sitwasyon ay mapanganib)",
      "c. Turn on your hazard lights, blow your horn and continue driving (I-switch ang hazard lights, bumusina at magpatuloy sa pagmamaneho)"
    ]
  },
  {
    question: "53. If you see a ball coming from behind a parked vehicle, it is more likely that a kid is following it. What will you do?",
    tagalog: "53. Kung may nakita kang bola na mula sa likuran ng isang nakaparadang sasakyan sa isang kalye, malamang na may batang sumusunod ditto. Ano ang gagawin mo?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. Increase your speed (Bilisan ang takbo)",
      "b. Slow down (Bagalan ang takbo)",
      "c. Blow your horn and maintain your speed (Bumusina at panatilihin ang bilis ng takbo)"
    ]
  },
  {
    question: "54. What should do when you see a traffic sign \"ACCIDENT PRONE AREA\"?",
    tagalog: "54. Ano ang dapat mong gawin kung nakakita ka ng senyas trapiko na nagsasabing “ACCIDENT PRONE AREA”?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Slow down and be more alert than usual (Bagalan ang takbo at higit na maging alisto)",
      "b. Increase your speed (Bilisan ang takbo)",
      "c. Blow your horn and resume your normal speed (Bumusina at panatilihin ang normal mong bilis)"
    ]
  },
  {
    question: "55. Which of the following is not a safe place to overtake?",
    tagalog: "55. Alin sa mga sumusunod ang hindi ligtas na lugar sa pagovertake/paglusot?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. When approaching a crest or upon a curve (Kapag papalapit sa paahon na lugar o kurbada)",
      "b. At an intersection (Sa interseksyon)",
      "c. All of the answers (Lahat ng sagot)"
    ]
  },
  {
    question: "56. Disregarding traffic lights during late hours of the night could:",
    tagalog: "56. Ang pagwawalang-bahala sa mga ilaw trapiko kapag gabi na ay:",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. make you a good driver (makatutulong upang higit kang maging magaling na drayber)",
      "b. involve you in a fatal road crash (maaari kang maaksidente at mamatay)",
      "c. decrease your fuel consumption (makatitipid sa konsumo ng gasolina o krudo)"
    ]
  },
  {
    question: "57. A good driver must meet one's social responsibilities of caring for others by:",
    tagalog: "57. Angmaayos na drayber ay matutugunan ang responsabilidad sa lipunan sa pamamagitan nang:",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. driving noisily to attract the attention of residents along the road (pagmaneho nang maingay upang mapansin ng mga nadadaanang residente)",
      "b. exercising care for other pedestrians and vehicles around (laging pagsasaalang-alang sa mga tumatawid sa kalsada at sa mga sasakyang nakapaligid)",
      "c. blowing one's horn every now and then to scare passers-by (maya’t mayang pagbusina upang takutin ang mga naglalakad)"
    ]
  },
  {
    question: "58. When the vehicle you are driving runs off the road or hits an electric post or a parked car, the most probable reason is:",
    tagalog: "58. Kapag ang minamaneho mong sasakyan ay lumihis sa kalsada otumama sa poste ng kuryente o nakaparadang sasakyan, malamang na ang dahilan nito ay:",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. you are driving too fast and you lost control of your vehicle (mabilis ang iyong pagpapatakbo at nawalan ka ng kontrol sa iyong sasakyan)",
      "b. you lost brake (nawalan ka ng preno)",
      "c. you are trying to overtake (mag-o-overtake ka sana)"
    ]
  },
  {
    question: "59. If your vehicle broke down on the road, what should you do?",
    tagalog: "59. Kapag nasiraan ka ng sasakyan sa daan, ano ang gagawin mo?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. Leave the vehicle and call for a mechanic (Iwan ang sasakyan at tumawag ka ng mekaniko)",
      "b. Switch on the hazard warning lights and display an Early Warning Device (EWD) at least four (4) meters behind the stalled vehicle (Pailawin ang hazard warning light at maglagay ng EWD apat (4) na metro man lamang sa likuran ng nakahintong sasakyan)",
      "c. Turn off the engine and call for a mechanic (Patayin ang makina at tumawag ng mekaniko)"
    ]
  },
  {
    question: "60. What is the primary responsibility of a driver in times of a road crash?",
    tagalog: "60. Ano ang pangunahing responsibilidad ng isang drayber sa isang aksidente?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Aid the victim (Tulungan ang naaksidente)",
      "b. Run and hide (Tumakbo at magtago)",
      "c. Ask for victim's identification card (Tanungin ang mga biktima nang pagkakakilanlan)"
    ]
  },
  {
    question: "61. Which of the following is a quality of a defensive driver?",
    tagalog: "61. Alin sa mga sumusunod ang kwalipikasyon ng isang maayos na drayber?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. drivers who knows how to properly use clutch and brake pedals while driving (mga drayber na marunong gumamit ng clutch at preno habang nagmamaneho)",
      "b. drivers that are using the basic knowledge of vehicle maintenance (Mga drayber na may kaalaman sa pagmintina ng sasakyan)",
      "c. driver who continues to drive even with flat tires to avoid an impounding ticket (Mga drayber na nagpapatuloy sa pagbiyahe kahit na flat ang gulong para maiwasang ma impound)"
    ]
  },
  {
    question: "62. Which one is correct road discipline?",
    tagalog: "62. Alin ang tamang disiplina sa kalsada?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. hiding from traffic enforcers during oplan sita (magtago sa mga enforcers sa panahon ng oplan sita)",
      "b. following the advise of the elderly (Sundin ang mga payo ng mga matatanda)",
      "c. knowing and abiding by the traffic rules and regulations (Alamin at sundin ang mga batas trapiko)"
    ]
  },
  {
    question: "63. How can you overcome stress?",
    tagalog: "63. Paano mo malalampasan ang stress o tensyon?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. stopping, getting out of the vehicle, shouting at anybody who inquires and then engaging in a fight (paghinto, pagbaba sa sasakyan, pagsigaw kahit kanino at maghamon ng away sa mga nagtatanong)",
      "b. taking a deep breath, sitting comfortably, listening to soothing music, allowing enough space in front and providing extra travel time (Huminga ng malalim, maupo ng maayos, makinig sa mga nakakaaliw na tugtog, pagbigay nang tamang distansiya sa harap at pagbigay ng karagdagang oras sa biyahe)",
      "c. driving faster than allowed, listen to loud music, shouting at passengers and provoke other motorists to a fight (Pagmaneho nang mas mabilis, pagkinig sa maiingay na tugtog, pagsigaw sa mga iba pang motorista at paghamon ng away)"
    ]
  },
  {
    question: "64. What may happen if a driver failed to overcome stress?",
    tagalog: "64. Ano ang maaaring mangyari kung ang isang drayber ay hindi malampasan ang stress o tensyon?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. proper changing lanes (tamang paglipat ng lane o pwesto)",
      "b. smooth braking (Maayos na pagpreno)",
      "c. road rage (Away sa kalsada)"
    ]
  },
  {
    question: "65. Which of the following actions may result to road rage?",
    tagalog: "65. Alin sa mga sumusunod ang maaaring mag resulta sa away kalsada?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. following a vehicle with enough space to maneuver (pagsunod sa isang sasakyan ng may tamang agwat)",
      "b. cutting off other vehicles or following too close (Pag-cut sa ibang motorista at pagtutok sa mga ito)",
      "c. allowing other motorists to overtake with ease (Pagbigay daan sa mga motorista para makapag-overtake nang maayos)"
    ]
  },
  {
    question: "66. What is the ultimate result of a road rage?",
    tagalog: "66. Ano ang pinakamasamang mangyayari sa isang away kalsada?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Death (kamatayan)",
      "b. more friends (Mas maraming kaibigan)",
      "c. refreshment (pampalamig)"
    ]
  },
  {
    question: "67. If you feel drowsy while driving, it is important that you:",
    tagalog: "67. Kung nakakaramdam ka ng pagka-antok habang nagmamaneho, mahalaga na ikaw ay:",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. park at a safe place, and take a short break before proceeding (magparada sa ligtas na lugar at magpahinga bago magpatuloy)",
      "b. speed up to reach your destination faster (bilisan ang takbo upang makarating ng mabilis sa destinasyon)",
      "c. stop driving, switch on the hazard lights and take a nap (huminto sa pagmamaneho, iswitch ang mga hazard lights at magpahinga)"
    ]
  },
  {
    question: "68. Can a driver allow a cyclist to hitch on his vehicle?",
    tagalog: "68. Maaari bang pahintulutan ng drayber ang siklista na sumabit sa kanyang sasakyan?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. No, especially without permission from an enforcer (Hindi, lalo at walang permiso sa traffic enforcer)",
      "b. No, road crash may happen (Hindi, maaaring magka-aksidente)",
      "c. No (Hindi)"
    ]
  },
  {
    question: "69. What is the first thing to do if you experience a tire blowout?",
    tagalog: "69. Ano ang una mong dapat gawin kung ikaw ay nakaranas ng tire blowout?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Don't step on the brakes, focus on the steering wheel (huwag tapakan ang preno, at magpokus sa manibela)",
      "b. Step on your brakes immediately to avoid hitting the motor vehicle in front of you (agad na tapakan ang brakes upang maiwasan ang pagbangga sa mga sasakyan na nasa iyong Harapan)",
      "c. Switch off the engine (patayin ang makina)"
    ]
  },
  {
    question: "70. What is the main purpose of having a vehicle undergo regular vehicle maintenance inspection?",
    tagalog: "70. Ano ang pangunahing layunin ng regular na pag inspeksyon ng isang sasakyan?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. to verify the chassis and engine numbers of the vehicle (Para siyasatin ang mga numero ng chassis at motor ng sasakyan)",
      "b. to check the roadworthiness of the vehicle (Para tingnan ang kaayusan ng sasakyan)",
      "c. to check the driver's performance (Para tingnan ang pagganap ng drayber sa kanyang pagmamaneho)"
    ]
  },
  {
    question: "71. When do you need to follow the traffic rules and regulations?",
    tagalog: "71. Kailan mo dapat sundin ang mga batas trapiko?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. when avoiding an enforcer (Kung umiiwas sa isang enforcer)",
      "b. when parked (Habang nagpaparada)",
      "c. while at the steering wheel (Habang nasa manibela)"
    ]
  },
  {
    question: "72. Under R.A. 8750, Children must be properly restraint if they are:",
    tagalog: "72. Ayon sa R.A. 8750, Ang mga bata ay dapat nakaupo sa aprobadong child restraint kung sila ay:",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. 10 years old (10 taóng gulang)",
      "b. 6 years old and below (6 na taóng gulang at pababa)",
      "c. 7 years old (7 taóng gulang)"
    ]
  },
  {
    question: "73. In driving, the most important sense the driver needs is:",
    tagalog: "73. Sa pagmamaneho, ang pinakamahalagang pandama na kailangan ng drayber ay:",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. hearing (pandinig)",
      "b. smelling (pang-amoy)",
      "c. seeing (paningin)"
    ]
  },
  {
    question: "74. Identify this traffic sign:",
    tagalog: "74. Tukuyin kung anong senyas ito:",
    image: "images/speed_limit_30.jpg",
    correct: 2,
    options: [
      "a. driving speed to beat the traffic (bilis ng pagtakbo upang maiwasan ang trapik)",
      "b. distance of the next intersection is 30 km (distansiya ng susunod na interseksyon ay 30 km)",
      "c. required speed limit is 30kph (hanggang 30kph lang ang bilis ng pagtakbo)"
    ]
  },
  {
    question: "75. Identify this traffic sign:",
    tagalog: "75. Tukuyin kung anong senyas ito:",
    image: "images/give_way.jpg",
    correct: 0,
    options: [
      "a. you must give right-of-way (dapat kang magbigay daan)",
      "b. you have the right-of-way (ikaw ay may karapatan sa daan)",
      "c. early warning device (early warning device)"
    ]
  },
  {
    question: "76. What is the meaning of yellow painted curb?",
    tagalog: "76. Ano ang ibig sabihin ng nakapintang dilaw?",
    image: "images/yellow_curb.jpg",
    correct: 1,
    options: [
      "a. No loading/Unloading (Bawal ang magbaba at magsakay)",
      "b. No Parking (Bawal pumarada)",
      "c. No waiting (Bawal maghintay)"
    ]
  },
  {
    question: "77. What do you need to do upon parking and getting out of the vehicle?",
    tagalog: "77. Ano ang dapat mong gawin pagkatapos mag-park at bago bumaba ng sasakyan?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. lock all the doors (Isara lahat ng mga pintuan)",
      "b. engage the parking brake (I-switch ang parking brake)",
      "c. blow horn (Bumusina)"
    ]
  },
  {
    question: "78. What do rumble strips on the road indicate?",
    tagalog: "78. Ano ang layunin ng rumble strips sa kalsada?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. To stop at once and wait for a go signal upon reaching an intersection (Huminto agad at maghintay ng go signal pagkarating sa interseksyon)",
      "b. To be aware of the speed approaching obstructions or intersections (Para malaman ang speed parating sa obstruction o intersection)",
      "c. To be more aggressive (Para mas agresibo)"
    ]
  },
  {
    question: "79. What is the required color of headlights?",
    tagalog: "79. Ano ang dapat na kulay ng headlight?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. any color may do (kahit anong kulay ay maaari)",
      "b. red (Pula)",
      "c. white or yellowish white (Puti o Dilawang puti)"
    ]
  },
  {
    question: "80. What is the required color of brake lights?",
    tagalog: "80. Ano ang dapat na kulay ng ilaw ng preno?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. White (puti)",
      "b. bright red (kumikinang na pula)",
      "c. yellow (Dilaw)"
    ]
  },
  {
    question: "81. What are the requirements for motor vehicle registration?",
    tagalog: "81. Ano ang mga kailangan para sa pagpaparehistro ng sasakyan?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. Anti-carnapping clearance (Anti-carnapping clearance)",
      "b. LTO inspection of the vehicle and emission test compliance (Inspeksiyon ng sasakyan at emision test sa LTO)",
      "c. District Traffic Enforcement Clearance (District Traffic Enforcement Clearance)"
    ]
  },
  {
    question: "82. When do you need to use your seat belt?",
    tagalog: "82. Kailan mo kailangan dapat gamitin ang seat belt?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. When driving on a national road (Kung magmamaneho sa malalaking pang publikong daan)",
      "b. When driving above 10 kph (Kung nagmamaneho ng 10 kph pataas)",
      "c. While the engine is running and before moving off (Bago umabante)"
    ]
  },
  {
    question: "83. What is the primary objective of the Seat Belt Act?",
    tagalog: "83. Ano ang pangunahing layunin ng batas patungkol sa paggamit ng seat belt?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. To restrict the driver in times of road rage (Upang mapigil ang isang drayber na masangkot sa away kalsada)",
      "b. To complete the practical driving course (Para kumpletuhin ang practical driving course)",
      "c. To secure and safeguard the passengers and drivers of a motor vehicles (Para sa seguridad ng mga pasahero at mga drayber)"
    ]
  },
  {
    question: "84. What is the maximum height that a driver can install his mobile phone from the base of the dashboard?",
    tagalog: "84. Ilang pulgada maaaring maglagay ng telephono mula sa dashboard ng sasakyan?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. 2 inches (Dalawang pulgada)",
      "b. 4 inches (Apat na pulgada)",
      "c. 6 inches (Anim na pulgada)"
    ]
  },
  {
    question: "85. Under R.A. No. 11229, What is the allowable age that a child may sit in front passenger seat of a car?",
    tagalog: "85. Anong edad maaaring sumakay sa harapan ang isang bata na naaayon sa RA 11229?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. more than 12 years old (12 taong gulang pataas)",
      "b. 16 years old and above (16 na taon pataas)",
      "c. 18 years old and above (18 na taon pataas)"
    ]
  },
  {
    question: "86. What is the height requirement for a child to be exempted to use a child restraint system?",
    tagalog: "86. Ano ang taas ng isang bata upang ito ay hindi na kailangang gumamit ng child restraint system?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. 100 cms and above (100 sentimetro pataas)",
      "b. 150 cms and above (150 sentimetro pataas)",
      "c. 180 cms and above (180 sentimetro pataas)"
    ]
  },
  {
    question: "87. Can an expired child restraint system be used when it still looks in good shape?",
    tagalog: "87. Maaari bang gamitin ang isang child restraint system kung ito ay expired na kahit maayos pa ang kondisyon?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. Yes (Oo)",
      "b. No (Hindi)",
      "c. Yes, provided that it is allowed by traffic enforcers (Oo, basta't ito ay pinapayagan ng traffic enforcer)"
    ]
  },
  {
    question: "88. When does a driver need to wear a helmet when riding a motorcycle?",
    tagalog: "88. Kailan dapat gamitin ng drayber ang kanyang helmet?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. For long and short drives (Sa mahaba o maiksing byahe)",
      "b. For long or short drives and in any type of road or highway (Para sa mahaba o maigsing biyahe at anumang uri ng kalsada)",
      "c. For national road only (Para sa pangkalahatang kalsada lamang)"
    ]
  },
  {
    question: "89. What type of helmet should a rider must use?",
    tagalog: "89. Anong klaseng helmet ang dapat gamitin ng rider ng motorsiklo?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. Standard motorcycle helmet compliant to specifications of LTO (Standard motorcycle helmet na sumunod sa regulasyon ng LTO)",
      "b. Standard motorcycle helmet compliant to specifications of DENR (Standard motorcycle helmet na sumunod sa panuntunan ng DENR)",
      "c. Standard motorcycle helmet compliant to specifications of DTI (Standard motorcycle helmet na naaayon sa panuntunan ng DTI)"
    ]
  },
  {
    question: "90. Who are responsible if a motorcycle was used in the commission of a crime?",
    tagalog: "90. Sino ang may pananagutan kung ang isang motorsiklo ay ginamit sa krimen?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. owner, driver and backrider (may ari, drayber, backrider)",
      "b. driver only (Drayber lamang)",
      "c. backrider and driver (Drayber at sakay nito)"
    ]
  },
  {
    question: "91. Under the Children's Safety on Motorcycles Act, a child below 18 years old can't ride in a two wheeled motorcycle on public roads unless:",
    tagalog: "91. Ayon sa Children's Safety on Motorcycles Act, ang isang batang wala pang 18 taong gulang ay hindi maaaring sumakay ng motorsiklo sa mga pampublikong kalsada maliban kung",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. The child can comfortably reach his/her feet on the standard foot peg of the motorcycle, his/her arms can reach around and grasp the waist of the motorcycle driver, and he/she is wearing the standard protective helmet. (Ang bata ay komportable na maabot nang kanyang mga paa ang foot peg ng motorsiklo, ang kanyang mga kamay ay maaring masalikop ang katawan ng drayber, at siya ay may suot na karaniwang proteksiyon na helmet.)",
      "b. There is a high density of fast moving vehicles or where a speed limit of more than 60 kph is imposed. (Nasa maraming mga sasakyang mabibilis o ang pinataw na pinakamabilis na takbo ay lagpas sa 60 kph.)",
      "c. The driver can grasp the waist of the child sitting in front of the driver and when the child is wearing the standard protective helmet. (Ang drayber ay pwedeng mayakap ang baywang ng batang nakaupo sa harapan ng drayber at ang bata ay nakasuot ng karaniwang helmet.)"
    ]
  },
  {
    question: "92. What is the violation of a driver overtaking at an intersection having a one lane direction?",
    tagalog: "92. Ano ang maaaring maging traffic violation ng isang drayber na nag overtake sa isang interseksyon na may isang lane lamang papunta sa iisang direksyon?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Overtaking at an intersection (pag overtake sa isang interseksyon)",
      "b. Obstruction (Obstruction)",
      "c. Disregarding traffic signals (Pagbalewala sa senyas trapiko)"
    ]
  },
  {
    question: "93. When are you allowed to pick up passengers at a pedestrian lane?",
    tagalog: "93. Kailan ka maaaring magsakay ng pasahero sa isang pook tawiran?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. When traffic enforcers are not looking (Kung hindi nakalingon ang mga traffic enforcers)",
      "b. When a passenger is already waiting (Kung naghihintay na ang pasahero)",
      "c. Loading and unloading passengers at a pedestrian lane is not allowed (Ang pagsakay at pagbaba ng mga pasahero sa pook tawiran ay kailanman hindi pinahihintulutan)"
    ]
  },
  {
    question: "94. Is a driver allowed to load cargo more than the vehicle's registered load capacity?",
    tagalog: "94. Maaari bang magkarga ng kargamento na lampas sa itinakdang timbang ng sasakyan?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. Yes (Oo)",
      "b. No (Hindi)",
      "c. Yes, if the cargo is fragile or perishable (Oo, kung ang karga ay madaling mabasag o nabubulok)"
    ]
  },
  {
    question: "95. Where can you contest an alleged traffic violation?",
    tagalog: "95. Saan mo maaaring ireklamo o i-contest ang pagkakahuli sa iyo?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. at the traffic adjudication office concerned (Sa tanggapan ng adyudikasyon)",
      "b. on the street, before the traffic enforcer leaves (Sa kalsada, bago umalis ang enforcer)",
      "c. at any adjudication office (Sa alin mang tanggapan ng adyudikasyon)"
    ]
  },
  {
    question: "96. Who has the authority to confiscate a driver's license during a normal traffic violation?",
    tagalog: "96. Sa normal na traffic violation, sino ang maaaring kumumpiska ng lisensya?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. LTO Law Enforcement Officers or LTO Deputized Agents (Ang mga ahente o enforcer lamang na itinalaga ng LTO)",
      "b. Anybody, for as long as the violation is within the provisions of R.A. No. 4136 (Kahit sino, basta ang paglabag ay nakapaloob sa R.A. No. 4136)",
      "c. Anybody, for as long as the traffic enforcer is a permanent employee of the government (Kahit sino, basta ang enforcer ay permanenteng empleyado ng gobyerno)"
    ]
  },
  {
    question: "97. A 30-day suspension of the driver's license shall be imposed if:",
    tagalog: "97. Ang 30-araw na suspensyon ng lisensya sa pagmamaneho ay ipapataw kung:",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. The traffic violation committed is grave (kung ang paglabag sa trapiko ay mabigat)",
      "b. The driver fails to pay the corresponding penalty of the apprehension within 15 days (kung nabigo ang drayber na bayaran ang kaukulang multa sa loob ng 15 araw)",
      "c. The driver fails to pay the fine within 72 hours (kung nabigo ang drayber na bayaran ang kaukulang multa sa loob ng 72 na oras)"
    ]
  },
  {
    question: "98. What does this hand signal mean when you are coming from the roadside and your signal is malfunctioning?",
    tagalog: "98. Ano ang ibig sabihin ng senyas kamay na ito?",
    image: "images/left_hand_signal.jpg",
    correct: 0,
    options: [
      "a. You are turning left. (Kakaliwa)",
      "b. You are turning right. (Kakanan)",
      "c. You are going to stop. (Hihinto)"
    ]
  },
  {
    question: "99. What should be the appropriate action when you see this traffic sign?",
    tagalog: "99. Ano ang dapat mong gawin kung makikita ang karatulang ito?",
    image: "images/accident_prone.jpg",
    correct: 0,
    options: [
      "a. Slow down and be more alert than usual (Magmabagal at maging handa)",
      "b. Increase your speed (Bilisan)",
      "c. Blow your horn and resume your normal speed (Bumusina at ituloy ang bilis)"
    ]
  },
  {
    question: "100. Where do you usually see this traffic sign?",
    tagalog: "100. Saan madalas makita ang mga ganitong senyas trapiko?",
    image: "images/chevron.jpg",
    correct: 2,
    options: [
      "a. Before the bridge (Bago umabot sa tulay)",
      "b. Before changing lane (Bago magpalit ng lane)",
      "c. At the column of a foot bridge (Sa poste na tawiran ng tao)"
    ]
  },
  {
    question: "101. What should a law enforcer do upon seizing a motorcycle from a traffic offender?",
    tagalog: "101. Ano ang dapat gawin ng isang law enforcer kung makumpiska ang isang motorsiklo?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. Use the motorcycle temporarily (Gamitin ang motorsiklo pansamantala)",
      "b. Surrender the motorcycle to authorities (I-surrender ang motorsiklo sa awtoridad)",
      "c. Send the motorycle to the impounding area (Dalhin ang motorsiklo sa pinakamalapit na impounding area)"
    ]
  },
  {
    question: "102. What does the law require you to do upon approaching an intersection with a STOP sign?",
    tagalog: "102. Ayon sa batas, ano ang dapat mong gawin sa sandaling makarating sa isang interseksyon na may senyas na huminto?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. Slow down and proceed when it is safe (Bagalan ang takbo at dumiretso kung ligtas na itong gawin)",
      "b. Yield the right-of-way if necessary, to vehicles approaching from left to right (Magbigay ng daan kung kinakailangan sa mga paparatíng na sasakyang nanggagaling sa kaliwa na kakanan)",
      "c. Stop and proceed when it is safe (Huminto at dumiretso lamang kung ligtas na itong gawin)"
    ]
  },
  {
    question: "103. After passing or overtaking another vehicle, you can safely move back into your original lane if:",
    tagalog: "103. Kapag nalampasan na o nakapag-overtake ang isang sasakyan, maaari nang bumalik sa orihinal na linya kung:",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. the driver you passed honks his horn (bumusina ang drayber na nilampasan mo)",
      "b. you can see in the rear-view mirror the overtaken car (natatanaw mo sa rear-view mirror ang sasakyang nilampasan)",
      "c. you can see in the side-view mirror the overtaken car (natatanaw mo sa side-view mirror ang nilampasang sasakyan)"
    ]
  },
  {
    question: "104. Drivers moving slower than other motorists should use the:",
    tagalog: "104. Ang mga motorista na mabagal kaysa iba ay dapat na nasa:",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. outer lane (lane sa gawing labas o dulong kanan)",
      "b. center lane (lane sa gitna)",
      "c. inner lane (lane sa gawing loob o dulong kaliwa)"
    ]
  },
  {
    question: "105. Some signs are called “lane-use” signs. They appear to direct you into the correct lane as you reach the actual intersection. They are usually seen:",
    tagalog: "105. Ang ilang karatula ng senyas ay tinatawag na lane use sign. Ang mga ito ay naroon upang gabayan ka sa tamang lane habang papalapit ka sa aktuwal na interseksiyon. Ang mga ito ay kadalasang nakikita:",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. before an intersection (bago dumating sa interseksiyon)",
      "b. after an intersection (pagkatapos ng interseksiyon)",
      "c. on an intersection (sa interseksiyon)"
    ]
  },
  {
    question: "106. If you encounter an emergency vehicle (ambulance, fire trucks, police) with sirens on, what should you do?",
    tagalog: "106. Kapag nakasabay mo ang isang sasakyang pang-emergency na nakabukas ang sirena, ano ang dapat mong gawin?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. Obstruct their passage and never allow them to pass through (Harangan ang kanilang daanan at huwag silang padaanin)",
      "b. Just ignore (Huwag pansinin)",
      "c. Pull over to the left or right side of the road and give way (Tumabi sa kaliwa o kanan at magbigy daan)"
    ]
  },
  {
    question: "107. A driver while on a highway shall yield the right of way to:",
    tagalog: "107. Kapag nasa highway, magpapadaan ang drayber sa:",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. pedestrians crossing within a crosswalk (mga tumatawid sa tawiran)",
      "b. pedestrians crossing at intersection where the movement of traffic is being regulated by a traffic enforcer (mga tumatawid sa interseksiyon na may nagtatrapik na traffic enforcer)",
      "c. vehicles about to enter the highway (mga sasakyang papasok sa highway)"
    ]
  },
  {
    question: "108. With Anti-lock Braking System (ABS) installed on your vehicle, what should you do while driving with maximum speed and you have to stop suddenly?",
    tagalog: "108. Kapag nagpapatakbo ng sasakyan na may ABS, sa pinakamabilis na takbo at kailangan mong biglaang huminto, ano ang dapat mong gawin?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Slam the brake pedal (Biglang magpreno)",
      "b. Apply brakes gently with steady pressure (Unti-unting magpreno nang may steady pressure)",
      "c. Pump the brake pedal (Bombahin ang preno sa pamamagitan ng pagtapak-tapak sa preno)"
    ]
  },
  {
    question: "109. Your speed while driving at night should depend on:",
    tagalog: "109. Ang bilis ng pagmamaneho sa gabi ay nakasalalay sa:",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. the physical, mental condition and skill of the driver (pisikal, tamang kaisipan at kakayahan ng drayber)",
      "b. the roadworthiness of the motor vehicle and weather condition (kaayusan ng sasakyan sa kanyang kabuuan at lagay ng panahon)",
      "c. all of the answers are correct (lahat ng sagot ay tama)"
    ]
  },
  {
    question: "110. The most effective way to deal with a tailgater is to:",
    tagalog: "110. Ang pinakamabisang gawin sa isang tumututok ay:",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. ignore him but do not allow him to get away (huwag siyang pansinin ngunit huwag siyang hayaang makalayo)",
      "b. slow down and let him pass (bagalan ang takbo at bigyan daan ang nasa likod)",
      "c. increase your speed and be alert on your brakes (bilisan ang takbo at maging alisto sa pagpreno)"
    ]
  },
  {
    question: "111. What should you do when an incoming vehicle is forced to cross the centerline to avoid hitting another vehicle which suddenly changed lane?",
    tagalog: "111. Ano ang dapat mong gawin kung ang isang paparating na sasakyan ay napilitang tumawid sa gitnang linya upang hindi mabangga ang isa pang sasakyan na biglang lumipat mula sa kaniyang linya",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. Ignore it because you have the right-of-way (Huwag itong pansinin sapagkat ikaw ang may karapatan sa daan)",
      "b. Blow your horn and turn on your headlight (Bumusina at buksan ang headlight)",
      "c. Be alert, be prepared to slow down, and give way (Maging alisto, maghandang bagalan ang takbo at magbigay ng daan)"
    ]
  },
  {
    question: "112. What may happen if the driver deliberately disregard a regulatory traffic sign?",
    tagalog: "112. Ano ang maaaring mangyari kung ipagwalang bahala ng drayber ang senyas trapiko?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Road Crash (Aksidente o road crash)",
      "b. Nothing (Wala)",
      "c. Passengers will be happy (Sasaya ang mga pasahero)"
    ]
  },
  {
    question: "113. When you want to change or shift to higher gear to speed up, and a car in the opposite direction crosses quickly to your lane, what will you do?",
    tagalog: "113. Kapag nais mong magpalit o lumipat sa mas mataas na gear upang mas bumilis, at ang isang sasakyan sa kasalungat na direksyon ay mabilis na tumatawid sa iyong linya, ano ang iyong gagawin mo?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. be alert, stop and give way to the car crossing (maging alerto, huminto at magbigay daan sa pagtawid ng mga sasakyan)",
      "b. insist on your right-of-way (igiit ang iyong karapatan sa daan)",
      "c. turn left immediately (agad na kumaliwa)"
    ]
  },
  {
    question: "114. Who will win between two parties if they failed to overcome stress?",
    tagalog: "114. Sino ang mananalo kung ang bawat partido ay hindi malampasan ang stress o tensyon?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. neither the agressor nor the victim (wala sa agresibo o sa biktima)",
      "b. adjudication officer (Opisyal ng adyudikasyon)",
      "c. insurance company (Insurance company)"
    ]
  },
  {
    question: "115. Driving along an open road, a PWD in a wheel chair abruptly crosses the road. How do you prevent yourself hitting the PWD?",
    tagalog: "115. Nagmamaneho ka sa isang kalsada, at ang PWD na naka wheel chair ay biglang tumawid sa kalsada, paano mo maiiwasang tamaan ang PWD?",
    image: "images/banner.jpg",
    correct: 2,
    options: [
      "a. move fast (bilisan ang pagmamaneho)",
      "b. hold on to steering wheel and shift to an open space to avoid the PWD (lumipat sa ligtas na lane o lugar upang maiwasan ang PWD)",
      "c. Prepare to stop (maghanda sa paghinto)"
    ]
  },
  {
    question: "116. Can a driver who had the opportunity to avoid a road crash and neglected to avoid such road crash be jointly held liable?",
    tagalog: "116. May pananagutan ba ang isang drayber na nagkaroon ng pagkakataon na maiwasan ang isang aksidente sa kalsada ngunit ito ay hindi niya ginawa?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Yes (Oo)",
      "b. No (Hindi)",
      "c. None of the above (wala sa nabanggit)"
    ]
  },
  {
    question: "117. When parking, how many meters is allowed from the location of a fire hydrant?",
    tagalog: "117. Ilang metro ang layo na maaaring pumarada ang isang sasakyan sa fire hydrant?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. more than one meter of the fire hydrant (Higit sa isang metro mula sa boka insenyo o fire hydrant)",
      "b. more than four meters of the fire hydrant (Lagpas apat na metro mula sa fire hydrant)",
      "c. there is no regulation as to where to park around the fire hydrant (Walang regulasyon kung saan pumarada sa gilid ng fire hydrant)"
    ]
  },
  {
    question: "118. Driving a car, which lane should you use in a three (3) lane expressway during normal situation?",
    tagalog: "118. Anong linya ang dapat mong gamitin sa three-lane na expressway kung ikaw ay nagmamaneho ng kotse?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. 1st lane (sa unang lane)",
      "b. 2nd lane (Pangalawang lane)",
      "c. 3rd lane (Pangatlong lane)"
    ]
  },
  {
    question: "119. Is a driver allowed to drive on the transition lines?",
    tagalog: "119. Maaari bang magmaneho sa mga transition lines sa kalsada?",
    image: "images/banner.jpg",
    correct: 1,
    options: [
      "a. Yes (Oo)",
      "b. No (Hindi)",
      "c. Yes, if traffic flow is heavy (oo, kung ang trapiko ay mabigat)"
    ]
  },
  {
    question: "120. What should you do if a pedestrian is crossing a nonsignalized pedestrian lane?",
    tagalog: "120. Ano ang dapat mong gawin kung may tumatawid sa isang tawiran na walang senyas trapiko?",
    image: "images/banner.jpg",
    correct: 0,
    options: [
      "a. Stop and let the pedestrian cross (Huminto at hayaang makatawid sa tawiran)",
      "b. Stop and blow horn (Huminto at bumusina)",
      "c. Drive faster and do not wait for the pedestrian to cross (Magmaneho ng mabilis at huwag hintaying makatawid ang mga tao)"
    ]
  }
];

// Security termination modal styles & deterrence
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

const resultEmailStyle = document.createElement("style");
resultEmailStyle.textContent = `.result-table small{display:block;margin-top:6px;font-weight:800;}`;
document.head.appendChild(resultEmailStyle);

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

window.startAuthenticatedExam = function(data) {
  student = data.student || {};
  attemptId = data.attemptId || "";
  sessionToken = data.sessionToken || "";
  currentSection = 1;
  currentIndex = 0;
  answers = {
    session1: new Array(SESSION_1_COUNT).fill(null),
    final: new Array(FINAL_COUNT).fill(null)
  };
  timer = TOTAL_TIME_SECONDS;
  securityViolations = 0;
  submitted = false;
  securityTerminationInProgress = false;
  suppressFullscreenViolation = false;
  resultSubmissionStarted = false;

  try {
    document.documentElement.requestFullscreen?.();
  } catch (_) {}

  renderExam();
  addExamWatermark();
  attachSecurityListeners();
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

  const titleElem = document.getElementById("sectionTitle");
  if (titleElem) {
    titleElem.textContent = currentSection === 1
      ? "TDC 1st Session Exam — 30 Items"
      : "TDC Final Exam — 120 Items";
  }

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
          class="grid-item ${selectedAnswers[i] !== null ? "answered" : ""} ${currentIndex === i ? "current" : ""}"
          onclick="goToQuestion(${i})">
          ${i + 1}
        </button>
      `).join("")}
    </div>
  `;

  renderNavButtons();
}

function selectAnswer(index) {
  if (submitted) return;
  const currentAnswers = getAnswers();
  currentAnswers[currentIndex] = index;
  renderQuestion();
}

function goToQuestion(index) {
  if (submitted) return;
  currentIndex = index;
  renderQuestion();
}

function renderNavButtons() {
  const questions = getQuestions();
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  let nextBtnText = "Next";
  let nextAction = "nextQuestion()";

  if (isLast) {
    if (currentSection === 1) {
      nextBtnText = "Proceed to Final Exam";
      nextAction = "proceedToFinalExam()";
    } else {
      nextBtnText = "Submit Examination";
      nextAction = "confirmSubmitExam()";
    }
  }

  document.getElementById("navArea").innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-top:15px;">
      <button ${isFirst ? "disabled" : ""} onclick="prevQuestion()" class="btn-nav">Previous</button>
      <button onclick="${nextAction}" class="btn-nav primary">${nextBtnText}</button>
    </div>
  `;
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
}

function nextQuestion() {
  const questions = getQuestions();
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    renderQuestion();
  }
}

function proceedToFinalExam() {
  const unanswered = answers.session1.filter(a => a === null).length;
  if (unanswered > 0) {
    if (!confirm(`You have ${unanswered} unanswered question(s) in Section 1. Are you sure you want to proceed to the Final Exam?`)) {
      return;
    }
  }
  currentSection = 2;
  currentIndex = 0;
  renderQuestion();
}

function confirmSubmitExam() {
  const unanswered1 = answers.session1.filter(a => a === null).length;
  const unanswered2 = answers.final.filter(a => a === null).length;
  const totalUnanswered = unanswered1 + unanswered2;

  let msg = "Are you sure you want to submit your examination now?";
  if (totalUnanswered > 0) {
    msg = `You have ${totalUnanswered} total unanswered question(s). Are you sure you want to submit?`;
  }

  if (confirm(msg)) {
    submitExam("COMPLETE");
  }
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (submitted) return;
    timer--;
    const timerElem = document.getElementById("timer");
    if (timerElem) {
      const m = Math.floor(timer / 60);
      const s = timer % 60;
      timerElem.textContent = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }

    if (timer <= 0) {
      clearInterval(timerInterval);
      alert("Time is up! Your examination will now be submitted automatically.");
      submitExam("TIMEOUT");
    }
  }, 1000);
}

function attachSecurityListeners() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !submitted) {
      handleSecurityViolation("Switched tab or minimized window");
    }
  });

  window.addEventListener("blur", () => {
    if (!submitted) {
      handleSecurityViolation("Focus lost from window");
    }
  });

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && !submitted && !suppressFullscreenViolation) {
      handleSecurityViolation("Exited fullscreen mode");
    }
  });

  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("keydown", e => {
    if (e.key === "F12" || (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) || (e.ctrlKey && e.key === "U")) {
      e.preventDefault();
      handleSecurityViolation("Attempted developer tools access");
    }
  });
}

function handleSecurityViolation(reason) {
  if (submitted || securityTerminationInProgress) return;
  securityViolations++;

  const banner = document.getElementById("securityBanner");
  if (banner) {
    banner.textContent = `SECURITY WARNING (${securityViolations}/3): ${reason}`;
    banner.style.background = "#d9534f";
    banner.style.color = "#fff";
  }

  if (securityViolations >= 3) {
    securityTerminationInProgress = true;
    showSecurityModalAndTerminate();
  }
}

function showSecurityModalAndTerminate() {
  const modal = document.createElement("div");
  modal.className = "security-modal-backdrop";
  modal.innerHTML = `
    <div class="security-modal-card">
      <div class="security-modal-icon">⚠️</div>
      <h2>EXAM TERMINATED</h2>
      <p>Multiple security violations detected (3/3). Your exam session has been invalidated and auto-submitted.</p>
    </div>
  `;
  document.body.appendChild(modal);

  setTimeout(() => {
    submitExam("SECURITY_TERMINATED");
  }, 3000);
}

function calculateResults() {
  let score1 = 0;
  session1Questions.forEach((q, idx) => {
    if (answers.session1[idx] === q.correct) score1++;
  });

  let score2 = 0;
  finalQuestions.forEach((q, idx) => {
    if (answers.final[idx] === q.correct) score2++;
  });

  const pct1 = Math.round((score1 / SESSION_1_COUNT) * 100);
  const pct2 = Math.round((score2 / FINAL_COUNT) * 100);

  const pass1 = pct1 >= PASS_PERCENT;
  const pass2 = pct2 >= PASS_PERCENT;
  const passed = pass1 && pass2;

  return { score1, score2, pct1, pct2, pass1, pass2, passed };
}

function generatePDFBase64(results) {
  return new Promise((resolve) => {
    const timeSpentSeconds = TOTAL_TIME_SECONDS - timer;
    const mins = Math.floor(timeSpentSeconds / 60);
    const secs = timeSpentSeconds % 60;

    const printableContainer = document.createElement("div");
    printableContainer.style.padding = "30px";
    printableContainer.style.fontFamily = "Arial, sans-serif";
    printableContainer.style.color = "#333";
    printableContainer.innerHTML = `
      <div style="text-align: center; border-bottom: 3px solid #1a365d; padding-bottom: 15px; margin-bottom: 25px;">
        <h1 style="margin: 0; color: #1a365d; font-size: 26px;">A1C DRIVING ACADEMY</h1>
        <h3 style="margin: 5px 0 0; color: #4a5568; font-weight: normal;">OFFICIAL TDC EXAMINATION RESULT</h3>
      </div>

      <div style="margin-bottom: 25px; background: #f7fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px; font-weight: bold;">Student Name:</td>
            <td style="padding: 6px;">${esc(student.fullName || "N/A")}</td>
            <td style="padding: 6px; font-weight: bold;">Attempt ID:</td>
            <td style="padding: 6px;">${esc(attemptId)}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold;">LTO Client ID:</td>
            <td style="padding: 6px;">${esc(student.clientId || student.ltoClientId || "N/A")}</td>
            <td style="padding: 6px; font-weight: bold;">Time Spent:</td>
            <td style="padding: 6px;">${mins}m ${secs}s</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold;">Violations:</td>
            <td style="padding: 6px;">${securityViolations} / 3</td>
            <td style="padding: 6px; font-weight: bold;">Date:</td>
            <td style="padding: 6px;">${new Date().toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px;">
        <thead>
          <tr style="background: #1a365d; color: #fff;">
            <th style="padding: 10px; text-align: left;">Exam Section</th>
            <th style="padding: 10px; text-align: center;">Score</th>
            <th style="padding: 10px; text-align: center;">Percentage</th>
            <th style="padding: 10px; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px;">Section 1: 1st Session (30 Items)</td>
            <td style="padding: 10px; text-align: center;">${results.score1} / ${SESSION_1_COUNT}</td>
            <td style="padding: 10px; text-align: center;">${results.pct1}%</td>
            <td style="padding: 10px; text-align: center; font-weight: bold; color: ${results.pass1 ? '#2e7d32' : '#c62828'};">
              ${results.pass1 ? 'PASSED' : 'FAILED'}
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px;">Section 2: Final Exam (120 Items)</td>
            <td style="padding: 10px; text-align: center;">${results.score2} / ${FINAL_COUNT}</td>
            <td style="padding: 10px; text-align: center;">${results.pct2}%</td>
            <td style="padding: 10px; text-align: center; font-weight: bold; color: ${results.pass2 ? '#2e7d32' : '#c62828'};">
              ${results.pass2 ? 'PASSED' : 'FAILED'}
            </td>
          </tr>
        </tbody>
      </table>

      <div style="text-align: center; margin-top: 30px; padding: 20px; border-radius: 8px; background: ${results.passed ? '#e8f5e9' : '#ffebee'}; border: 2px solid ${results.passed ? '#2e7d32' : '#c62828'};">
        <h2 style="margin: 0; color: ${results.passed ? '#2e7d32' : '#c62828'};">
          OVERALL VERDICT: ${results.passed ? 'PASSED' : 'FAILED'}
        </h2>
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `Exam_Result_${student.fullName || 'Student'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
      window.html2pdf().from(printableContainer).set(opt).outputPdf('datauristring').then(pdfDataUri => {
        const base64 = pdfDataUri.split(',')[1] || "";
        resolve(base64);
      }).catch(() => resolve(""));
    } else {
      resolve("");
    }
  });
}

async function sendResultWithPdf(payload, results) {
  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbzTxrrutvgAlRsBP7QU6F1MSQJwQ6y-jEQEddXaJzWrAJx9qGHhhusRQa26NnK64JGI/exec", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const resData = await response.json();
    console.log("Apps Script Response:", resData);
    return resData;
  } catch (err) {
    console.error("Result submission error:", err);
  }
}

async function submitExam(submissionType = "COMPLETE") {
  if (submitted || resultSubmissionStarted) return;
  resultSubmissionStarted = true;
  submitted = true;
  clearInterval(timerInterval);

  const results = calculateResults();
  const timeSpent = TOTAL_TIME_SECONDS - timer;

  // ----------------------------------------------------
  // CONVERT ANSWERS TO FLAT ARRAYS BEFORE SENDING
  // ----------------------------------------------------
  let session1Array = [];
  let finalArray = [];

  // Case A: If answers is an object like { session1: {...}, final: {...} } or { session1: [...], final: [...] }
  if (answers && typeof answers === "object" && !Array.isArray(answers)) {
    if (answers.session1 || answers.final) {
      session1Array = Array.from({ length: 30 }, (_, i) => 
        answers.session1 && answers.session1[i] !== undefined && answers.session1[i] !== null 
          ? Number(answers.session1[i]) 
          : null
      );
      finalArray = Array.from({ length: 120 }, (_, i) => 
        answers.final && answers.final[i] !== undefined && answers.final[i] !== null 
          ? Number(answers.final[i]) 
          : null
      );
    } else {
      // Case B: If answers is a flat object indexed by integers { 0: ans, 1: ans, ... 149: ans }
      session1Array = Array.from({ length: 30 }, (_, i) => 
        answers[i] !== undefined && answers[i] !== null ? Number(answers[i]) : null
      );
      finalArray = Array.from({ length: 120 }, (_, i) => 
        answers[i + 30] !== undefined && answers[i + 30] !== null ? Number(answers[i + 30]) : null
      );
    }
  } else if (Array.isArray(answers)) {
    // Case C: If answers is already a flat 150-item Array
    session1Array = answers.slice(0, 30);
    finalArray = answers.slice(30, 150);
  }

  const payload = {
    action: "submitResult",
    attemptId,
    sessionToken,
    student,
    submissionType,
    timeSpentSeconds: timeSpent,
    securityViolations,
    session1Answers: session1Array, // Array of 30 integers
    finalAnswers: finalArray,       // Array of 120 integers
    results,
    answers
  };

  const app = document.getElementById("app");
  if (app) {
    app.innerHTML = `
      <div style="text-align:center; padding: 50px 20px;">
        <h2>Submitting Exam Results...</h2>
        <p>Please wait while your official record and result certificate are being generated and sent to the office email.</p>
      </div>
    `;
  }

  // Send payload to Apps Script Web App
  await sendResultWithPdf(payload, results);

  renderResultScreen(results, submissionType);
}

function renderResultScreen(results, submissionType) {
  const app = document.getElementById("app");
  if (!app) return;

  const statusText = results.passed ? "PASSED" : "FAILED";
  const statusColor = results.passed ? "#2e7d32" : "#c62828";

  app.innerHTML = `
    <div class="exam-shell" style="max-width: 650px; margin: 40px auto; text-align: center;">
      <header class="exam-header" style="justify-content: center;">
        <h1>EXAMINATION RESULT</h1>
      </header>

      <div style="padding: 30px; background: #fff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-top: 20px;">
        <p>Student Name: <strong>${esc(student.fullName)}</strong></p>
        <p>Attempt ID: <strong>${esc(attemptId)}</strong></p>

        ${submissionType === "SECURITY_TERMINATED" ? `
          <div style="color: #c62828; font-weight: bold; margin: 15px 0; padding: 10px; background: #ffebee; border-radius: 6px;">
            ⚠️ Session was terminated due to security violations.
          </div>
        ` : ""}

        <div style="font-size: 28px; font-weight: bold; color: ${statusColor}; margin: 20px 0;">
          ${statusText}
        </div>

        <div style="text-align: left; background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p><strong>Section 1 (30 items):</strong> ${results.score1} / ${SESSION_1_COUNT} (${results.pct1}%) - 
            <span style="color:${results.pass1 ? '#2e7d32' : '#c62828'}">${results.pass1 ? 'PASS' : 'FAIL'}</span>
          </p>
          <p><strong>Section 2 (120 items):</strong> ${results.score2} / ${FINAL_COUNT} (${results.pct2}%)- 
            <span style="color:${results.pass2 ? '#2e7d32' : '#c62828'}">${results.pass2 ? 'PASS' : 'FAIL'}</span>
          </p>
        </div>

        <p style="color: #666; font-size: 14px;">
          A copy of your PDF exam certificate has been generated and transmitted to the office email.
        </p>
      </div>
    </div>
  `;
}
