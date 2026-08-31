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

// Real LTO TDC 1st Session Questions
const session1Questions = [
  {
    question: "What type of driver is covered by the Land Transportation Code?",
    tagalog: "Anong uri ng drayber ang sakop ng Land Transportation Code?",
    image: "",
    options: [
      "A. Only Professional Drivers",
      "B. Only Non-Professional Drivers",
      "C. Any driver who has a qualification to drive a Private or For Hire Vehicle",
      "D. Student permit holders only"
    ],
    correct: 2
  },
  {
    question: "How many days does a driver have to settle/contest a traffic apprehension?",
    tagalog: "Ilang araw ang ibinibigay sa drayber upang ayusin o kumpirmahin ang huli sa trapiko?",
    image: "",
    options: [
      "A. Within 15 days",
      "B. Within 30 days",
      "C. Within 7 days",
      "D. Within 60 days"
    ],
    correct: 0
  },
  {
    question: "What is the maximum validity period of a Driver's License for a driver with no traffic violations?",
    tagalog: "Ano ang pinakamahabang panahon ng pagkakabisa ng Lisensya sa Pagmamaneho para sa drayber na walang huli?",
    image: "",
    options: [
      "A. 3 years validity",
      "B. 10 years validity",
      "C. 5 years validity",
      "D. 1 year validity"
    ],
    correct: 1
  },
  {
    question: "Is a student permit holder allowed to drive a motor vehicle without a licensed driver accompanying them?",
    tagalog: "Pinahihintulutan ba ang hawak na Student Permit na magmaneho nang walang kasamang lisensyadong drayber?",
    image: "",
    options: [
      "A. No",
      "B. Yes, if driving within designated areas",
      "C. Yes, if driving during daytime",
      "D. Yes, if driving a motorcycle"
    ],
    correct: 0
  },
  {
    question: "What is the minimum age requirement for a Non-Professional Driver's License applicant?",
    tagalog: "Ano ang pinakabatang edad na kinakailangan para sa kumuha ng Non-Professional Driver's License?",
    image: "",
    options: [
      "A. 16 years old",
      "B. 17 years old",
      "C. 18 years old",
      "D. 21 years old"
    ],
    correct: 1
  },
  {
    question: "An LTO officer may deny registration or renewal of a motor vehicle if the:",
    tagalog: "Maaaring tanggihan ng opisyal ng LTO ang rehistro o pagpapanibago ng rehistro ng sasakyan kung:",
    image: "",
    options: [
      "A. motor vehicle color is blue",
      "B. motor vehicle is found to be unsightly",
      "C. motor vehicle has tinted glass",
      "D. motor vehicle has two side mirrors"
    ],
    correct: 1
  },
  {
    question: "Where should license plates be properly displayed on a 4-wheeled motor vehicle?",
    tagalog: "Saan dapat nakalagay ang plaka ng 4-wheel na sasakyang de-motor?",
    image: "",
    options: [
      "A. one in front and one in the rear of the vehicle",
      "B. on the front windshield only",
      "C. inside the rear trunk",
      "D. on the left and right sides of the vehicle"
    ],
    correct: 0
  },
  {
    question: "What is the shape of a 'Yield Right-of-Way' road sign?",
    tagalog: "Ano ang hugis ng pambuong kalsada na sign para sa 'Yield Right-of-Way'?",
    image: "",
    options: [
      "A. inverted triangle",
      "B. octagonal",
      "C. circular",
      "D. square"
    ],
    correct: 0
  },
  {
    question: "What is the main purpose of traffic signs and road markings?",
    tagalog: "Ano ang pangunahing layunin ng mga babala at markang pantrapiko sa kalsada?",
    image: "",
    options: [
      "A. To generate income for local government",
      "B. To decorate the street corners",
      "C. To put order on the road",
      "D. To control vehicle manufacturing"
    ],
    correct: 2
  },
  {
    question: "A steady red traffic light means you must stop unless:",
    tagalog: "Ang permanenteng pulang ilaw-trapiko ay nangangahulugang huminto maliban kung:",
    image: "",
    options: [
      "A. you are driving fast",
      "B. it is nighttime",
      "C. the vehicles on the other street are stopped",
      "D. there are no police officers nearby"
    ],
    correct: 2
  },
  {
    question: "A flashing yellow traffic light means:",
    tagalog: "Ang kumikislap na kulay dilaw na ilaw-trapiko ay nangangahulugang:",
    image: "",
    options: [
      "A. slowdown and proceed with caution",
      "B. stop immediately",
      "C. speed up to cross quickly",
      "D. yield to vehicles coming from the right only"
    ],
    correct: 0
  },
  {
    question: "Parking is allowed:",
    tagalog: "Ang pagparada ay pinahihintulutan:",
    image: "",
    options: [
      "A. beyond 4 meters of a fire hydrant",
      "B. within 3 meters of a fire hydrant",
      "C. inside an intersection",
      "D. on a pedestrian crosswalk"
    ],
    correct: 0
  },
  {
    question: "On a two-lane road, passing or overtaking is normally done on the:",
    tagalog: "Sa dalawang-lane na kalsada, ang pag-overtake ay karaniwang ginagawa sa:",
    image: "",
    options: [
      "A. shoulder of the road",
      "B. right lane",
      "C. left lane",
      "D. gutter side"
    ],
    correct: 2
  },
  {
    question: "When do you need to bring your vehicle to a complete stop?",
    tagalog: "Kailan mo kailangang ganap na ihinto ang iyong sasakyan?",
    image: "",
    options: [
      "A. At a green traffic light",
      "B. At a red traffic light",
      "C. At a yellow flashing light",
      "D. When entering a highway"
    ],
    correct: 1
  },
  {
    question: "What hand signal indicates that you intend to turn right?",
    tagalog: "Anong senyas ng kamay ang nagpapahiwatig na ikaw ay liliko sa kanan?",
    image: "",
    options: [
      "A. left arm held straight pointing outward",
      "B. left arm held pointing upward",
      "C. left arm held pointing downward",
      "D. right arm held pointing downward"
    ],
    correct: 1
  },
  {
    question: "A broken white line on the road means:",
    tagalog: "Ang naputol-putol na puting linya sa kalsada ay nangangahulugang:",
    image: "",
    options: [
      "A. passing or overtaking can be made anytime",
      "B. overtaking is prohibited at all times",
      "C. lane change is prohibited",
      "D. mandatory stop zone"
    ],
    correct: 0
  },
  {
    question: "A solid double yellow line on the road means:",
    tagalog: "Ang dalawang buong dilaw na linya sa kalsada ay nangangahulugang:",
    image: "",
    options: [
      "A. overtaking is allowed during daytime",
      "B. safe to turn around",
      "C. Crossing/ traversing or overtaking is not allowed",
      "D. school zone strict braking area"
    ],
    correct: 2
  },
  {
    question: "When approaching an intersection with a flashing yellow light, you should:",
    tagalog: "Kapag papalapit sa sangandaan na may kumikislap na dilaw na ilaw, dapat mong:",
    image: "",
    options: [
      "A. maintain high speed",
      "B. slowdown, then enter the intersection when the way is clear",
      "C. come to a complete stop and wait for green light",
      "D. honk continuously"
    ],
    correct: 1
  },
  {
    question: "A driver with a Driver's License is allowed to drive:",
    tagalog: "Ang drayber na may Lisensya sa Pagmamaneho ay pinahihintulutang magmaneho ng:",
    image: "",
    options: [
      "A. any motor vehicle regardless of category",
      "B. motor vehicle/s specified in the license only",
      "C. public utility vehicles only",
      "D. heavy equipment trucks only"
    ],
    correct: 1
  },
  {
    question: "Is it allowed to use a handheld mobile phone while driving?",
    tagalog: "Ipinagbabawal ba ang paggamit ng hawak na telepono habang nagmamaneho?",
    image: "",
    options: [
      "A. Under no circumstances",
      "B. Allowed when stuck in heavy traffic",
      "C. Allowed when driving below 20 km/h",
      "D. Allowed when using loudspeaker"
    ],
    correct: 0
  },
  {
    question: "If two vehicles arrive at an uncontrolled intersection at the same time, who must yield?",
    tagalog: "Kung dalawang sasakyan ang sabay na dumating sa intersection na walang ilaw, sino ang dapat magpajubaya?",
    image: "",
    options: [
      "A. The larger vehicle",
      "B. The motorist on the left",
      "C. The motorist on the right",
      "D. The faster vehicle"
    ],
    correct: 1
  },
  {
    question: "Are drivers allowed to park within an intersection?",
    tagalog: "Pinahihintulutan ba ang pagparada sa loob ng sangandaan (intersection)?",
    image: "",
    options: [
      "A. No",
      "B. Yes, if hazard lights are turned on",
      "C. Yes, for short drop-offs",
      "D. Yes, at night"
    ],
    correct: 0
  },
  {
    question: "Which statement is TRUE regarding Driver's License codes/transmissions?",
    tagalog: "Alin sa mga sumusunod ang TAMA tungkol sa transmisyon sa Lisensya?",
    image: "",
    options: [
      "A. AT license holders can operate MT vehicles",
      "B. MT license holders can only drive manual transmission",
      "C. A DL holder with authority to drive vehicles with manual transmission (MT) is allowed to operate vehicles with automatic transmission (AT)",
      "D. Transmission restriction code does not apply to private vehicles"
    ],
    correct: 2
  },
  {
    question: "Can a student driver operate a motor vehicle alone on a public road?",
    tagalog: "Maaari bang magmaneho ang student driver nang mag-isa sa pampublikong kalsada?",
    image: "",
    options: [
      "A. Yes, if driving in residential streets",
      "B. Yes, if holding a valid student permit",
      "C. No",
      "D. Yes, during daytime"
    ],
    correct: 2
  },
  {
    question: "What does a sign showing a black curved arrow in a circle with a red slash through it mean?",
    tagalog: "Ano ang kahulugan ng pabilog na marka na may nakabaluktot na palaso at may pulang guhit sa gitna?",
    image: "",
    options: [
      "A. no u-turn",
      "B. sharp turn ahead",
      "C. winding road",
      "D. no left turn"
    ],
    correct: 0
  },
  {
    question: "What does a sign depicting two converging lines mean?",
    tagalog: "Ano ang ibig sabihin ng marka na nagpapakita ng dalawang linyang nagtatagpo?",
    image: "",
    options: [
      "A. dual highway ahead",
      "B. merge traffic zone",
      "C. road narrows ahead",
      "D. narrow bridge ahead"
    ],
    correct: 2
  },
  {
    question: "What does a regulatory sign with a horn icon inside a red circle with a slash mean?",
    tagalog: "Ano ang kahulugan ng senyas na may larawan ng busina sa loob ng pulang bilog na may slash?",
    image: "",
    options: [
      "A. no blowing of horn",
      "B. blow horn zone",
      "C. defective horn zone",
      "D. horn testing zone"
    ],
    correct: 0
  },
  {
    question: "What road feature is indicated by a circular sign with arrows pointing counter-clockwise?",
    tagalog: "Anong uri ng kalsada ang itinuturo ng pabilog na senyas na may mga palasong paikot?",
    image: "",
    options: [
      "A. Curve ahead",
      "B. Roundabout",
      "C. Dead end",
      "D. Highway ramp"
    ],
    correct: 1
  },
  {
    question: "What does a sign depicting a car with swerving tire tracks indicate?",
    tagalog: "Ano ang kahulugan ng senyas na may larawan ng sasakyan na may paikot-ikot na bakas ng gulong?",
    image: "",
    options: [
      "A. slippery road",
      "B. steep decline",
      "C. uneven road surface",
      "D. risk of land slide"
    ],
    correct: 0
  },
  {
    question: "What does a triangular warning sign with figures of two children walking indicate?",
    tagalog: "Ano ang ibig sabihin ng tatsulok na babala na may larawan ng dalawang batang naglalakad?",
    image: "",
    options: [
      "A. Playground zone",
      "B. Pedestrian crosswalk only",
      "C. Caution - School Zone",
      "D. Park entrance"
    ],
    correct: 2
  }
];

// Real LTO TDC Final Exam Questions
const finalQuestions = [
  {
    question: "Under RA 10666 (Children's Safety on Motorcycles Act), when is a child allowed to ride on a motorcycle without satisfying foot/arm reach requirements?",
    tagalog: "Sa ilalim ng RA 10666, kailan pinapayagan ang bata na sumakay sa motorsiklo kahit hindi abot ang foot peg?",
    image: "",
    options: ["A. During emergency situations", "B. When accompanied by both parents", "C. If the child requires immediate medical treatment", "D. During school pickup hours"],
    correct: 2
  },
  {
    question: "What field sobriety tests are administered to a driver suspected of driving under the influence of alcohol or drugs?",
    tagalog: "Anu-anong pagsusuri sa kalsada ang ginagawa sa drayber na pinaghihinalaang nakainom o nakadroga?",
    image: "",
    options: ["A. Eye test, walk and turn, one leg stand", "B. Breathalyzer test only", "C. Blood test and urine sample", "D. Straight line driving and reflex test"],
    correct: 0
  },
  {
    question: "When turning left at an intersection, a driver must yield and:",
    tagalog: "Kapag liliko sa kaliwa sa sangandaan, ang drayber ay dapat magbigay-daan at:",
    image: "",
    options: ["A. blow horn continuously", "B. accelerate quickly", "C. give way to cyclists", "D. stop in the middle of the box"],
    correct: 2
  },
  {
    question: "What is the penalty for a driver caught driving without a valid Driver's License for the first offense?",
    tagalog: "Ano ang parusa sa drayber na nahuling nagmamaneho nang walang lisensya sa unang pagkakataon?",
    image: "",
    options: [
      "A. His/her driver’s license shall be confiscated and he/she shall be disqualified from being granted a driver’s license and driving a motor vehicle for a period of one (1) year from the payment of monetary fine",
      "B. Mandatory imprisonment for 6 months",
      "C. Impounding of vehicle for 30 days only",
      "D. Warning ticket only"
    ],
    correct: 0
  },
  {
    question: "What is the consequence if a driver causes a serious accident resulting in death while under the influence of alcohol or prohibited drugs?",
    tagalog: "Ano ang kahihinatnan kung ang drayber ay nagdulot ng aksidente na nakamatay habang nakainom o nakadroga?",
    image: "",
    options: [
      "A. The DL will be revoked and the driver will be perpetually disqualified from applying for a license plus monetary fine",
      "B. Suspension of DL for 1 year",
      "C. Payment of medical bills only",
      "D. Community service for 3 months"
    ],
    correct: 0
  },
  {
    question: "What are the duties of a driver involved in a road transport accident?",
    tagalog: "Ano ang mga tungkulin ng drayber na nasangkot sa aksidente sa kalsada?",
    image: "",
    options: ["A. Report to the nearest police station", "B. Help the injured victims", "C. all of the answers are correct", "D. Show license to responding law enforcers"],
    correct: 2
  },
  {
    question: "Who is classified as a driver under Philippine land transportation laws?",
    tagalog: "Sino ang itinuturing na drayber ayon sa batas sa transportasyon sa Pilipinas?",
    image: "",
    options: ["A. Vehicle owners only", "B. Mechanics testing cars", "C. Any driver who has a qualification to drive a Private or For Hire Vehicle", "D. Passengers steering from side seat"],
    correct: 2
  },
  {
    question: "Within how many days must an apprehension or citation ticket be settled at the LTO?",
    tagalog: "Sa loob ng ilang araw dapat ayusin ang citation ticket sa LTO?",
    image: "",
    options: ["A. Within 15 days", "B. Within 30 days", "C. Within 7 days", "D. Within 10 days"],
    correct: 0
  },
  {
    question: "What is the validity period for a renewal of a driver's license with zero demerit points?",
    tagalog: "Ano ang panahon ng pagkakabisa ng panibagong lisensya na walang demerit point?",
    image: "",
    options: ["A. 5 years validity", "B. 10 years validity", "C. 3 years validity", "D. Lifetime validity"],
    correct: 1
  },
  {
    question: "Can a driver operate a motor vehicle registered under a different owner without consent?",
    tagalog: "Maaari bang imaneho ng drayber ang sasakyang nakarehistro sa iba nang walang pahintulot?",
    image: "",
    options: ["A. No", "B. Yes, if related", "C. Yes, in emergency", "D. Yes, if driving within town"],
    correct: 0
  },
  {
    question: "What is the minimum age to apply for a Non-Professional Driver's License in the Philippines?",
    tagalog: "Ano ang pinakabatang edad upang kumuha ng Non-Professional License?",
    image: "",
    options: ["A. 16 years old", "B. 17 years old", "C. 18 years old", "D. 20 years old"],
    correct: 1
  },
  {
    question: "In what situation can the LTO refuse registration of a motor vehicle?",
    tagalog: "Sa anong sitwasyon maaaring tanggihan ng LTO ang rehistro ng sasakyan?",
    image: "",
    options: ["A. Color is modified", "B. motor vehicle is found to be unsightly", "C. Age is over 10 years", "D. Aircon is defective"],
    correct: 1
  },
  {
    question: "Where should license plates be mounted on a standard motor vehicle?",
    tagalog: "Saan dapat nakakabit ang plaka ng sasakyan?",
    image: "",
    options: ["A. one in front and one in the rear of the vehicle", "B. Front windshield inside", "C. Rear window inside", "D. Roof rack side"],
    correct: 0
  },
  {
    question: "What geometric shape is reserved exclusively for a Yield sign?",
    tagalog: "Anong hugis ang nakalaan para sa Yield sign?",
    image: "",
    options: ["A. inverted triangle", "B. circle", "C. square", "D. diamond"],
    correct: 0
  },
  {
    question: "What is the primary function of traffic management systems and regulations?",
    tagalog: "Ano ang pangunahing layunin ng sistema at regulasyon sa trapiko?",
    image: "",
    options: ["A. Increase road taxes", "B. Monitor driver license fees", "C. To put order on the road", "D. Speed up highway transit"],
    correct: 2
  },
  {
    question: "When is turning right on a red light allowed at an intersection?",
    tagalog: "Kailan pinapayagang kumaliwa/kumuman sa pulang ilaw sa intersection?",
    image: "",
    options: ["A. Anytime with horn", "B. When traffic is light", "C. the vehicles on the other street are stopped", "D. At night only"],
    correct: 2
  },
  {
    question: "What action should you take when faced with a flashing yellow light?",
    tagalog: "Ano ang gagawin kapag nakakita ng kumikislap na dilaw na ilaw?",
    image: "",
    options: ["A. slowdown and proceed with caution", "B. Stop immediately", "C. Full speed ahead", "D. Turn off lights"],
    correct: 0
  },
  {
    question: "Where is it legally permissible to park your vehicle relative to a fire hydrant?",
    tagalog: "Saan legal na maaaring pumarada kaugnay ng boka-insendiyo (fire hydrant)?",
    image: "",
    options: ["A. beyond 4 meters of a fire hydrant", "B. Beside the hydrant", "C. Within 2 meters", "D. Directly in front"],
    correct: 0
  },
  {
    question: "Which lane should be used when overtaking on a multi-lane roadway?",
    tagalog: "Anong lane ang gagamitin kapag mag-oovertake sa maraming lane na kalsada?",
    image: "",
    options: ["A. Right lane", "B. Emergency lane", "C. left lane", "D. Middle shoulder"],
    correct: 2
  },
  {
    question: "Under what traffic light signal must you bring your vehicle to a complete stop?",
    tagalog: "Sa anong ilaw-trapiko kailangang ihinto nang tuluyan ang sasakyan?",
    image: "",
    options: ["A. Green light", "B. At a red traffic light", "C. Yellow light", "D. Flashing green"],
    correct: 1
  },
  {
    question: "What hand signal is used by a driver to indicate an upcoming right turn?",
    tagalog: "Anong senyas ng kamay ang gamit sa pagliko sa kanan?",
    image: "",
    options: ["A. Arm straight out", "B. left arm held pointing upward", "C. Arm pointing down", "D. Waving hand"],
    correct: 1
  },
  {
    question: "What is indicated by a broken white centerline on a highway?",
    tagalog: "Ano ang ibig sabihin ng naputol na puting linya sa gitna ng highway?",
    image: "",
    options: ["A. passing or overtaking can be made anytime", "B. Do not cross", "C. Stop zone", "D. One way traffic"],
    correct: 0
  },
  {
    question: "What is the meaning of a solid double yellow line down the center of the road?",
    tagalog: "Ano ang kahulugan ng dalawang buong dilaw na linya sa gitna ng kalsada?",
    image: "",
    options: ["A. Overtake with caution", "B. Reverse allowed", "C. Crossing/ traversing or overtaking is not allowed", "D. Pedestrian zone"],
    correct: 2
  },
  {
    question: "How should a driver approach a flashing red traffic light?",
    tagalog: "Paano dapat lumapit ang drayber sa kumikislap na pulang ilaw?",
    image: "",
    options: ["A. Accelerate", "B. slowdown, then enter the intersection when the way is clear", "C. Ignore if empty", "D. Turn off engine"],
    correct: 1
  },
  {
    question: "What category of motor vehicle can a license holder operate?",
    tagalog: "Anong kategorya ng sasakyan ang pwedeng imaneho ng may lisensya?",
    image: "",
    options: ["A. Any vehicle on the road", "B. motor vehicle/s specified in the license only", "C. Only motorcycles", "D. All public vehicles"],
    correct: 1
  },
  {
    question: "When is text messaging or calling on a cell phone permitted while holding the steering wheel?",
    tagalog: "Kailan pinapayagan ang pag-text habang hawak ang manibela?",
    image: "",
    options: ["A. Under no circumstances", "B. In red lights", "C. Below 30kph", "D. Hands-free only"],
    correct: 0
  },
  {
    question: "At an intersection with no traffic lights or signs, which vehicle must yield the right of way?",
    tagalog: "Sa sangandaan na walang sign, sinong sasakyan ang dapat magpajubaya?",
    image: "",
    options: ["A. Vehicle on the right", "B. The motorist on the left", "C. Heavy vehicle", "D. Faster car"],
    correct: 1
  },
  {
    question: "Is parking allowed on a pedestrian crosswalk?",
    tagalog: "Pinapayagan ba ang pagparada sa tawiran ng tao?",
    image: "",
    options: ["A. No", "B. Yes, for 5 minutes", "C. Yes, at night", "D. Yes, if hazard lights are on"],
    correct: 0
  },
  {
    question: "What rule applies regarding transmission restriction codes on a driver's license?",
    tagalog: "Ano ang alituntunin tungkol sa transmisyon sa lisensya?",
    image: "",
    options: ["A. AT can drive MT", "B. MT cannot drive AT", "C. A DL holder with authority to drive vehicles with manual transmission (MT) is allowed to operate vehicles with automatic transmission (AT)", "D. No rules exist"],
    correct: 2
  },
  {
    question: "Is a student driver allowed to carry paying passengers on a public highway?",
    tagalog: "Pinapayagan ba ang student driver na magsakay ng nagbabayad na pasahero?",
    image: "",
    options: ["A. Yes", "B. Yes, with instructor", "C. No", "D. Yes, during off-peak hours"],
    correct: 2
  },
  {
    question: "What does a road sign displaying a curved arrow reversed with a red strike-through indicate?",
    tagalog: "Ano ang kahulugan ng senyas na may curved arrow at pulang slash?",
    image: "",
    options: ["A. no u-turn", "B. no left turn", "C. curve ahead", "D. keep right"],
    correct: 0
  },
  {
    question: "What is indicated by a warning sign depicting a road narrowing ahead?",
    tagalog: "Ano ang ibig sabihin ng senyas ng papaliit na kalsada?",
    image: "",
    options: ["A. Bridge ahead", "B. Steep hill", "C. road narrows ahead", "D. Landslide hazard"],
    correct: 2
  },
  {
    question: "What traffic sign restricts the use of vehicle horns in a designated zone?",
    tagalog: "Anong senyas ang nagbabawal ng pagbusina sa isang lugar?",
    image: "",
    options: ["A. no blowing of horn", "B. quiet area sign", "C. slow speed sign", "D. school sign"],
    correct: 0
  },
  {
    question: "What traffic feature requires vehicles to travel around a central island in a counter-clockwise direction?",
    tagalog: "Anong balangkas sa kalsada ang nangangailangan ng pag-ikot sa gitnang isla?",
    image: "",
    options: ["A. Intersection", "B. Roundabout", "C. Highway exit", "D. Flyover"],
    correct: 1
  },
  {
    question: "What warning sign is indicated by a vehicle symbol with wavy lines underneath?",
    tagalog: "Ano ang ibig sabihin ng senyas ng sasakyan na may alon-alon na linya sa ilalim?",
    image: "",
    options: ["A. slippery road", "B. flood zone", "C. rough road", "D. steep grade"],
    correct: 0
  },
  {
    question: "What sign warns drivers that children may be crossing the street near an educational facility?",
    tagalog: "Anong senyas ang nagbabala sa drayber na may mga batang tumatawid malapit sa paaralan?",
    image: "",
    options: ["A. Hospital zone", "B. Bus stop", "C. Caution - School Zone", "D. Park ahead"],
    correct: 2
  },
  {
    question: "What are the primary characteristics of an intoxicated driver?",
    tagalog: "Ano ang pangunahing katangian ng drayber na nakainom ng alak?",
    image: "",
    options: ["A. arrogant, talkative and doesn't have the judgement and the reflexes to perform things safely", "B. Very sleepy and silent", "C. Overly cautious and slow", "D. Normal reflexes"],
    correct: 0
  },
  {
    question: "How long is a temporary operator's permit (TOP) valid as a temporary license after apprehension?",
    tagalog: "Gaano katagal tumpak na nagagamit ang TOP bilang pansamantalang lisensya matapos mahuli?",
    image: "",
    options: ["A. 72 hours", "B. 24 hours", "C. 7 days", "D. 15 days"],
    correct: 0
  },
  {
    question: "What is the maximum penalty for a 3rd offense under RA 10586 (Anti-Drunk and Drugged Driving Act)?",
    tagalog: "Ano ang pinakamataas na parusa sa ikatlong paglabag sa ilalim ng RA 10586?",
    image: "",
    options: ["A. 1 year suspension", "B. Community service", "C. Perpetual revocation of license", "D. Warning letter"],
    correct: 2
  },
  {
    question: "What is the rule regarding a blue traffic light in Philippine traffic control systems?",
    tagalog: "Ano ang tuntunin hinggil sa kulay bughaw na ilaw-trapiko sa sistema sa Pilipinas?",
    image: "",
    options: ["A. None, no blue traffic light", "B. Special lane open", "C. Emergency vehicle priority", "D. Pedestrian cross signal"],
    correct: 0
  },
  {
    question: "What headgear must be worn by all motorcycle riders under RA 10054?",
    tagalog: "Anong sombrero o proteksyon sa ulo ang dapat isuot ng nagmomotorsiklo sa ilalim ng RA 10054?",
    image: "",
    options: ["A. Cap", "B. Bicycle helmet", "C. standard protective helmet", "D. Construction hardhat"],
    correct: 2
  },
  {
    question: "What should you do if a driver behind you signals an intention to overtake?",
    tagalog: "Ano ang dapat mong gawin kung ang drayber sa likod mo ay nagpahiwatig na mag-oovertake?",
    image: "",
    options: ["A. Speed up", "B. Slow down gradually and give him the signal to overtake you", "C. Block the path", "D. Swerve to left"],
    correct: 1
  },
  {
    question: "What must you do before changing lanes to check blind spots that mirrors cannot reveal?",
    tagalog: "Ano ang dapat gawin bago magpalit ng lane upang suriin ang blind spot na hindi nakikita sa salamin?",
    image: "",
    options: ["A. Turn your head to check other vehicles beside your car", "B. Honk horn", "C. Adjust rear view mirror", "D. Turn on hazard lights"],
    correct: 0
  },
  {
    question: "What is the correct procedure when negotiating a sharp curve on a highway?",
    tagalog: "Ano ang tamang hakbang kapag lumiliko sa matarik o matalim na kurba sa kalsada?",
    image: "",
    options: ["A. reduce speed before entering the curve", "B. Brake hard inside the curve", "C. Accelerate into the curve", "D. Neutral gear"],
    correct: 0
  },
  {
    question: "When driving at night with high beams, what should you do when meeting an oncoming vehicle?",
    tagalog: "Kapag nagmamaneho sa gabi na nakataas ang ilaw, ano ang gagawin kapag may salubong na sasakyan?",
    image: "",
    options: ["A. dim your lights by switching to low beam", "B. Keep high beam on", "C. Turn off headlights completely", "D. Flash high beam repeatedly"],
    correct: 0
  },
  {
    question: "How should a driver alert others when approaching a blind curve or intersection at night?",
    tagalog: "Paano magbabala sa iba kapag papalapit sa blind curve sa gabi?",
    image: "",
    options: ["A. Continuous horn", "B. flash your headlights to let pedestrians and oncoming motorists know that you are heading into the curve or intersection", "C. Hazard lights", "D. Stop completely"],
    correct: 1
  },
  {
    question: "What is the golden rule of defensive driving regarding right-of-way?",
    tagalog: "Ano ang gintong tuntunin ng defensive driving ukol sa right-of-way?",
    image: "",
    options: ["A. Never insist on your right-of-way", "B. Always claim right of way", "C. Larger vehicle goes first", "D. First to arrive goes first always"],
    correct: 0
  },
  {
    question: "Before backing up or reversing your vehicle, what action should you take?",
    tagalog: "Bago yumatras ng sasakyan, anong hakbang ang dapat mong gawin?",
    image: "",
    options: ["A. Turn your head to see that the way is clear", "B. Honk horn twice only", "C. Check side mirror only", "D. Step on gas quickly"],
    correct: 0
  },
  {
    question: "To ensure safe driving on public highways, every driver must:",
    tagalog: "Upang matiyak ang ligtas na pagmamaneho sa pampublikong kalsada, ang bawat drayber ay dapat:",
    image: "",
    options: ["A. follow traffic signs and pertinent traffic rules and regulations", "B. Drive fast to avoid traffic", "C. Memorize all street names", "D. Modify vehicle for speed"],
    correct: 0
  },
  {
    question: "What is the safest action to take when approaching an intersection with a yellow traffic light?",
    tagalog: "Ano ang pinakaligtas na gawin kapag papalapit sa sangandaan na may dilaw na ilaw?",
    image: "",
    options: ["A. Accelerate", "B. Reduce speed", "C. Overtake front car", "D. Sound horn"],
    correct: 1
  },
  {
    question: "When approaching a railway crossing with no warning devices, a driver must:",
    tagalog: "Kapag papalapit sa tawiran ng tren na walang babala, ang drayber ay dapat:",
    image: "",
    options: ["A. Slowdown and check for safety when passing through", "B. Maintain speed", "C. Overtake slow vehicles", "D. Stop and wait for 5 minutes"],
    correct: 0
  },
  {
    question: "What is the proper procedure when driving in heavy rain or dense fog?",
    tagalog: "Ano ang tamang hakbang kapag nagmamaneho sa malakas na ulan o makapal na hamog?",
    image: "",
    options: ["A. Drive fast to leave rain", "B. Turn on your headlights and slow down or park at a safe place if situation is risky", "C. High beam on", "D. Tailgate front car"],
    correct: 1
  },
  {
    question: "What should a driver do when entering a school zone or residential area?",
    tagalog: "Ano ang dapat gawin ng drayber kapag pumasok sa school zone o residential area?",
    image: "",
    options: ["A. Maintain 60 kph", "B. Slow down", "C. Honk horn continuously", "D. Turn on hazard"],
    correct: 1
  },
  {
    question: "What does a driver need to do when approaching a pedestrian crosswalk?",
    tagalog: "Ano ang kailangang gawin ng drayber kapag papalapit sa tawiran ng tao?",
    image: "",
    options: ["A. Slow down and be more alert than usual", "B. Speed up before pedestrians step in", "C. Flash high beam", "D. Change lane"],
    correct: 0
  },
  {
    question: "When driving, what factors affect your stopping distance?",
    tagalog: "Kapag nagmamaneho, anong mga salik ang nakakaapekto sa layo ng paghinto?",
    image: "",
    options: ["A. Speed and tire condition", "B. Road surface and weather", "C. All of the answers", "D. Brake condition"],
    correct: 2
  },
  {
    question: "Driving under the influence of alcohol or drugs will likely:",
    tagalog: "Ang pagmamaneho sa ilalim ng impluwensya ng alak o droga ay malamang na:",
    image: "",
    options: ["A. Improve reaction time", "B. involve you in a fatal road crash", "C. Save fuel", "D. Increase focus"],
    correct: 1
  },
  {
    question: "Defensive driving means:",
    tagalog: "Ang defensive driving ay nangangahulugang:",
    image: "",
    options: ["A. Driving aggressively", "B. exercising care for other pedestrians and vehicles around", "C. Insisting right of way", "D. Driving at maximum speed"],
    correct: 1
  },
  {
    question: "Skidding on a slippery road usually indicates that:",
    tagalog: "Ang pagpulasit o pag-iskid sa madulas na kalsada ay karaniwang nagpapakita na:",
    image: "",
    options: ["A. you are driving too fast and you lost control of your vehicle", "B. Tires are brand new", "C. Brakes are too soft", "D. Road is under construction"],
    correct: 0
  },
  {
    question: "If your motor vehicle breaks down on the highway, what should you do immediately?",
    tagalog: "Kung nasiraan ang iyong sasakyan sa highway, ano ang dapat mong gawin agad?",
    image: "",
    options: ["A. Leave vehicle in lane", "B. Switch on the hazard warning lights and display an Early Warning Device (EWD) at least four (4) meters behind the stalled vehicle", "C. Wait inside without lights", "D. Flag down passing cars"],
    correct: 1
  },
  {
    question: "What is your first duty as a driver if you are involved in a traffic accident resulting in injury?",
    tagalog: "Ano ang iyong unang tungkulin kung nasangkot sa aksidente na may nasaktan?",
    image: "",
    options: ["A. Aid the victim", "B. Run away", "C. Call insurance", "D. Hide the vehicle"],
    correct: 0
  },
  {
    question: "Which drivers are less likely to experience unexpected mechanical breakdowns on the road?",
    tagalog: "Sinong mga drayber ang hindi gaanong nakakaranas ng di-inaasahang aberya sa kalsada?",
    image: "",
    options: ["A. Drivers of new luxury cars only", "B. drivers that are using the basic knowledge of vehicle maintenance", "C. Drivers who speed", "D. Drivers who never inspect their car"],
    correct: 1
  },
  {
    question: "What is the foundation of becoming a responsible driver?",
    tagalog: "Ano ang pundasyon ng pagiging isang responsableng drayber?",
    image: "",
    options: ["A. Fast driving skills", "B. Having expensive car", "C. knowing and abiding by the traffic rules and regulations", "D. Knowing shortcut routes"],
    correct: 2
  },
  {
    question: "How can a driver prevent or reduce stress and emotional tension before driving?",
    tagalog: "Paano maiiwasan o mababawasan ng drayber ang stress bago magmaneho?",
    image: "",
    options: ["A. Drinking coffee quickly", "B. taking a deep breath, sitting comfortably, listening to soothing music, allowing enough space in front and providing extra travel time", "C. Driving fast to arrive early", "D. Using horn frequently"],
    correct: 1
  },
  {
    question: "Uncontrolled anger or aggressive behavior displayed by a driver on the road is known as:",
    tagalog: "Ang hindi kontroladong galit o agresibong pag-uugali ng drayber sa kalsada ay tinatawag na:",
    image: "",
    options: ["A. Drag racing", "B. Tailgating", "C. road rage", "D. Reckless speeding"],
    correct: 2
  },
  {
    question: "What driving behavior is considered an aggressive driving habit?",
    tagalog: "Anong gawi sa pagmamaneho ang itinuturing na agresibo?",
    image: "",
    options: ["A. Yielding right of way", "B. cutting off other vehicles or following too close", "C. Using turn signals", "D. Driving at speed limit"],
    correct: 1
  },
  {
    question: "What is the worst possible outcome of driving under the influence of alcohol or drugs?",
    tagalog: "Ano ang pinakamalalang posibleng kahihinatnan ng pagmamaneho nang nakainom o nakadroga?",
    image: "",
    options: ["A. Death", "B. Traffic ticket", "C. Car scratch", "D. Flat tire"],
    correct: 0
  },
  {
    question: "What is the safest step to take if you feel sleepy or fatigued while driving?",
    tagalog: "Ano ang pinakaligtas na hakbang kung nakakaramdam ng antok o pagod habang nagmamaneho?",
    image: "",
    options: ["A. park at a safe place, and take a short break before proceeding", "B. Open windows and drive faster", "C. Drink water while driving fast", "D. Turn loud music on"],
    correct: 0
  },
  {
    question: "Is it safe to drive after taking medications that cause drowsiness?",
    tagalog: "Ligtas bang magmaneho pagkatapos uminom ng gamot na nakakaantok?",
    image: "",
    options: ["A. Yes, with coffee", "B. No, road crash may happen", "C. Yes, if short distance", "D. Yes, during daytime"],
    correct: 1
  },
  {
    question: "If your vehicle suffers a tire blowout while driving at high speed, you should:",
    tagalog: "Pumutok ang gulong habang mabilis ang takbo, ano ang dapat mong gawin?",
    image: "",
    options: ["A. Don't step on the brakes, focus on the steering wheel", "B. Slam the brakes hard immediately", "C. Pull handbrake instantly", "D. Turn steering wheel sharply"],
    correct: 0
  },
  {
    question: "Why is doing a walk-around inspection (BLOWBAGETS) important before a trip?",
    tagalog: "Bakit mahalaga ang inspeksyon (BLOWBAGETS) bago bumiyahe?",
    image: "",
    options: ["A. To waste time", "B. to check the roadworthiness of the vehicle", "C. To check car paint shine", "D. Requirement for passenger fee"],
    correct: 1
  },
  {
    question: "When should a driver perform a quick visual check of the instrument cluster and gauges?",
    tagalog: "Kailan dapat mabilis na suriin ng drayber ang instrument cluster at mga guhit ng meter?",
    image: "",
    options: ["A. Only when engine breaks down", "B. Once a month", "C. while at the steering wheel", "D. When car is parked for days"],
    correct: 2
  },
  {
    question: "Under RA 10666, a child is NOT allowed to sit on a motorcycle behind the driver unless they are at least:",
    tagalog: "Sa ilalim ng RA 10666, ang bata ay HINDI pinapayagang sumakay sa likod ng motorsiklo maliban kung sila ay:",
    image: "",
    options: ["A. 10 years old", "B. 6 years old and below", "C. 12 years old", "D. 18 years old"],
    correct: 1
  },
  {
    question: "Which sense is most vital and provides up to 90% of the information needed while driving?",
    tagalog: "Anong pandama ang pinakamahalaga at nagbibigay ng hanggang 90% ng impormasyon sa pagmamaneho?",
    image: "",
    options: ["A. Hearing", "B. Touch", "C. seeing", "D. Smell"],
    correct: 2
  },
  {
    question: "What does a round speed limit sign displaying '30' mean?",
    tagalog: "Ano ang kahulugan ng pabilog na marka ng tulin na may nakasulat na '30'?",
    image: "",
    options: ["A. minimum speed 30kph", "B. recommended speed 30kph", "C. required speed limit is 30kph", "D. highway exit 30 meters"],
    correct: 2
  },
  {
    question: "What does an inverted triangle regulatory sign indicate to an approaching driver?",
    tagalog: "Ano ang itinuturo ng baligtad na tatsulok na senyas sa papalapit na drayber?",
    image: "",
    options: ["A. you must give right-of-way", "B. stop immediately", "C. no entry", "D. one way road"],
    correct: 0
  },
  {
    question: "What does a circular red sign with a blue background and a red diagonal cross mean?",
    tagalog: "Ano ang ibig sabihin ng pabilog na pulang senyas na may kulay bughaw na background at pulang cross?",
    image: "",
    options: ["A. No stopping", "B. No Parking", "C. No entry", "D. End of priority"],
    correct: 1
  },
  {
    question: "When parking an automatic transmission vehicle on an incline, what should you do first after stopping?",
    tagalog: "Kapag ipinaparada ang automatic na sasakyan sa ahon, ano ang dapat gawin bago mag-P?",
    image: "",
    options: ["A. Shift to Park directly", "B. engage the parking brake", "C. Turn off engine", "D. Release brake pedal"],
    correct: 1
  },
  {
    question: "What is the main reason for maintaining a safe distance behind the vehicle ahead?",
    tagalog: "Ano ang pangunahing dahilan ng pagpapanatili ng ligtas na distansya sa kasunod na sasakyan?",
    image: "",
    options: ["A. To save gas", "B. To be aware of the speed approaching obstructions or intersections", "C. To overtake easily", "D. To avoid dust"],
    correct: 1
  },
  {
    question: "What is the required color of front headlights on motor vehicles under LTO regulations?",
    tagalog: "Ano ang kinakailangang kulay ng pangunahing ilaw sa harap (headlights) ng sasakyan?",
    image: "",
    options: ["A. Red or blue", "B. Pure blue", "C. white or yellowish white", "D. Green"],
    correct: 2
  },
  {
    question: "What is the required color of rear brake lights on motor vehicles?",
    tagalog: "Ano ang kinakailangang kulay ng ilaw ng preno sa likod ng sasakyan?",
    image: "",
    options: ["A. Yellow", "B. bright red", "C. White", "D. Orange"],
    correct: 1
  },
  {
    question: "What requirement must be completed before an LTO motor vehicle registration can be renewed?",
    tagalog: "Anong kinakailangan ang dapat matapos bago ma-renew ang rehistro sa LTO?",
    image: "",
    options: ["A. Driver physical test", "B. LTO inspection of the vehicle and emission test compliance", "C. Comprehensive insurance policy only", "D. Barangay clearance"],
    correct: 1
  },
  {
    question: "When should a driver adjust side mirrors and the rear-view mirror?",
    tagalog: "Kailan dapat i-adjust ng drayber ang side mirror at rear-view mirror?",
    image: "",
    options: ["A. While driving fast on highway", "B. While stopping at traffic light", "C. While the engine is running and before moving off", "D. After finishing the trip"],
    correct: 2
  },
  {
    question: "What is the main objective of mandatory seat belt usage under RA 8750?",
    tagalog: "Ano ang pangunahing layunin ng mandatoryong paggamit ng seat belt sa ilalim ng RA 8750?",
    image: "",
    options: ["A. Avoid police fines", "B. Make car comfortable", "C. To secure and safeguard the passengers and drivers of a motor vehicles", "D. Reduce car noise"],
    correct: 2
  },
  {
    question: "What is the minimum thread depth required for motor vehicle tires?",
    tagalog: "Ano ang pinakamababang lalim ng gulong na kinakailangan sa sasakyan?",
    image: "",
    options: ["A. 1 mm", "B. 4 inches", "C. 10 mm", "D. Smooth surface allowed"],
    correct: 1
  },
  {
    question: "According to Republic Act 11229 (Child Safety in Motor Vehicles Act), a child must be secured in a child restraint system unless they are:",
    tagalog: "Ayon sa RA 11229, ang bata ay dapat nakakabit sa child restraint system maliban kung sila ay:",
    image: "",
    options: ["A. more than 12 years old", "B. 5 years old", "C. 8 years old", "D. 10 years old"],
    correct: 0
  },
  {
    question: "Under RA 11229, a child must reach what minimum height to sit in the front seat using a standard seatbelt?",
    tagalog: "Sa ilalim ng RA 11229, anong taas ang kailangan ng bata upang makaupo sa harap gamit ang seatbelt?",
    image: "",
    options: ["A. 100 cms", "B. 150 cms and above", "C. 120 cms", "D. 135 cms"],
    correct: 1
  },
  {
    question: "Can a child under 12 years old sit in the front passenger seat of a moving motor vehicle?",
    tagalog: "Maaari bang umupo sa harap ang batang wala pang 12 taong gulang?",
    image: "",
    options: ["A. Yes, if holding an adult", "B. No", "C. Yes, during daytime", "D. Yes, if wearing helmet"],
    correct: 1
  },
  {
    question: "When must seat belts be used by drivers and front-seat passengers?",
    tagalog: "Kailan dapat gamitin ang seatbelt ng drayber at pasahero sa harap?",
    image: "",
    options: ["A. Expressways only", "B. For long or short drives and in any type of road or highway", "C. Night driving only", "D. When rain is heavy"],
    correct: 1
  },
  {
    question: "Under RA 10054, motorcycle helmets must bear which official seal of compliance?",
    tagalog: "Anong opisyal na tatak ang dapat taglayin ng helmet ng nagmomotorsiklo sa ilalim ng RA 10054?",
    image: "",
    options: ["A. LTO Seal", "B. DOT Seal only", "C. Standard motorcycle helmet compliant to specifications of DTI", "D. MMDA sticker"],
    correct: 2
  },
  {
    question: "Who can be held liable if a motorcycle backrider does not wear an approved protective helmet?",
    tagalog: "Sino ang mapapanagot kung ang angkas ng motorsiklo ay walang helmet?",
    image: "",
    options: ["A. owner, driver and backrider", "B. Driver only", "C. Backrider only", "D. Helmet manufacturer"],
    correct: 0
  },
  {
    question: "A child may ride on a motorcycle on public roads ONLY if:",
    tagalog: "Ang bata ay makakasakay lamang sa motorsiklo sa pampublikong kalsada KUNG:",
    image: "",
    options: [
      "A. The child can comfortably reach his/her feet on the standard foot peg of the motor cycle, his/her arms can reach around and grasp the waist of the motorcycle driver, and he/she is wearing the standard protective helmet.",
      "B. The child is holding the front handlebars",
      "C. The driver holds the child with one arm",
      "D. The motorcycle is driven below 20 kph"
    ],
    correct: 0
  },
  {
    question: "Which of the following is considered a traffic violation related to overtaking?",
    tagalog: "Alin sa mga sumusunod ang itinuturing na paglabag sa pag-overtake?",
    image: "",
    options: ["A. Overtaking at an intersection", "B. Overtaking on broken white line", "C. Overtaking on left lane", "D. Overtaking slow car with signal"],
    correct: 0
  },
  {
    question: "Which statement regarding pedestrian crosswalks is TRUE?",
    tagalog: "Alin sa mga pahayag ukol sa tawiran ng tao ang TAMA?",
    image: "",
    options: ["A. Parking on crosswalk is allowed for 1 minute", "B. Honking on pedestrians is mandatory", "C. Loading and unloading passengers at a pedestrian lane is not allowed", "D. Crosswalks are for bicycles only"],
    correct: 2
  },
  {
    question: "Is parking within 5 meters of a fire hydrant allowed?",
    tagalog: "Pinapayagan ba ang pagparada sa loob ng 5 metro mula sa boka-insendiyo?",
    image: "",
    options: ["A. Yes", "B. No", "C. Yes, if driver stays inside", "D. Yes, at night"],
    correct: 1
  },
  {
    question: "Where can a driver contest a traffic violation ticket issued by an LTO officer?",
    tagalog: "Saan maaaring kumpirmahin o i-apela ng drayber ang huli sa trapiko mula sa LTO?",
    image: "",
    options: ["A. at the traffic adjudication office concerned", "B. Barangay Hall", "C. Police station", "D. Supreme Court directly"],
    correct: 0
  },
  {
    question: "Who is authorized to confiscate driver's licenses for traffic violations on national roads?",
    tagalog: "Sino ang may awtoridad na kumuha ng lisensya ng drayber sa pambansang kalsada?",
    image: "",
    options: ["A. LTO Law Enforcement Officers or LTO Deputized Agents", "B. Barangay Tanod", "C. Private security guards", "D. Any towing company worker"],
    correct: 0
  },
  {
    question: "When will an un-settled traffic apprehension lead to the suspension of a driver's license?",
    tagalog: "Kailan magiging dahilan ng suspensyon ng lisensya ang hindi naayos na huli?",
    image: "",
    options: ["A. After 1 year", "B. The driver fails to pay the corresponding penalty of the apprehension within 15 days", "C. Immediately after 24 hours", "D. Upon license renewal date only"],
    correct: 1
  },
  {
    question: "What does extending your left arm out the window and pointing it straight out mean?",
    tagalog: "Ano ang ibig sabihin ng pag-unat ng kaliwang braso nang direkta palabas sa bintana?",
    image: "",
    options: ["A. You are turning left.", "B. You are turning right", "C. You are stopping", "D. You are reversing"],
    correct: 0
  },
  {
    question: "How should a driver act when approaching an intersection with a yield sign?",
    tagalog: "Paano dapat kumilos ang drayber sa sangandaan na may Yield sign?",
    image: "",
    options: ["A. Slow down and be more alert than usual", "B. Accelerate across", "C. Honk horn and maintain speed", "D. Stop for 3 minutes"],
    correct: 0
  },
  {
    question: "Where is parking strictly prohibited?",
    tagalog: "Saan mahigpit na ipinagbabawal ang pagparada?",
    image: "",
    options: ["A. Inside a private garage", "B. Designated parking slot", "C. At the column of a foot bridge", "D. Open empty field"],
    correct: 2
  },
  {
    question: "What penalty applies if a motorcycle rider operates an unregistered motorcycle?",
    tagalog: "Anong parusa ang ipinapataw kung ang motorsiklo ay walang rehistro habang ginagamit?",
    image: "",
    options: ["A. Warning ticket", "B. Payment of road tax only", "C. Send the motorycle to the impounding area", "D. Community clean up"],
    correct: 2
  },
  {
    question: "When facing a red flashing light at a railroad crossing, what must you do?",
    tagalog: "Ano ang dapat mong gawin kapag nakakita ng kumikislap na pulang ilaw sa tawiran ng tren?",
    image: "",
    options: ["A. Cross quickly before train comes", "B. Slow down only", "C. Stop and proceed when it is safe", "D. Honk and pass"],
    correct: 2
  },
  {
    question: "After passing or overtaking another vehicle, when is it safe to return to your original lane?",
    tagalog: "Pagkatapos mag-overtake, kailan ligtas na bumalik sa dating lane?",
    image: "",
    options: ["A. Immediately after passing bumper", "B. you can see in the rear-view mirror the overtaken car", "C. When the other car honks", "D. After 1 kilometer"],
    correct: 1
  },
  {
    question: "On a multi-lane highway, slow-moving vehicles should stay on the:",
    tagalog: "Sa highway na maraming lane, ang mabagal na sasakyan ay dapat manatili sa:",
    image: "",
    options: ["A. outer lane", "B. inner lane", "C. middle lane", "D. shoulder lane"],
    correct: 0
  },
  {
    question: "Where is passing or overtaking strictly prohibited?",
    tagalog: "Saan mahigpit na ipinagbabawal ang pag-overtake?",
    image: "",
    options: ["A. before an intersection", "B. On a straight expressway", "C. On a broken white line", "D. On a clear dual lane"],
    correct: 0
  },
  {
    question: "What must a driver do upon hearing the siren or seeing the flashing lights of an emergency vehicle?",
    tagalog: "Ano ang dapat gawin ng drayber kapag nakarinig ng wang-wang o nakakita ng emergency vehicle?",
    image: "",
    options: ["A. Speed up ahead of emergency car", "B. Maintain speed in lane", "C. Pull over to the left or right side of the road and give way", "D. Stop immediately in center of lane"],
    correct: 2
  },
  {
    question: "Who always has the right of way at an unmarked crosswalk?",
    tagalog: "Sino ang laging may karapatan sa daan sa crosswalk?",
    image: "",
    options: ["A. pedestrians crossing within a crosswalk", "B. Fast moving private cars", "C. Public utility buses", "D. Motorcycles"],
    correct: 0
  },
  {
    question: "How should you brake in an emergency situation if your car is equipped with an Anti-lock Braking System (ABS)?",
    tagalog: "Paano magpreno sa emergency kung ang sasakyan ay may ABS?",
    image: "",
    options: ["A. Slam the brake pedal", "B. Pump the brake pedal repeatedly", "C. Pull handbrake slowly", "D. Shift gear to neutral first"],
    correct: 0
  },
  {
    question: "What factors must be considered to maintain a safe braking distance?",
    tagalog: "Anong mga salik ang dapat isaalang-alang para sa ligtas na distansya sa pagpreno?",
    image: "",
    options: ["A. Vehicle speed and weight", "B. Road surface conditions", "C. all of the answers are correct", "D. Brake and tire condition"],
    correct: 2
  },
  {
    question: "What should you do if another driver tries to overtake your vehicle on a two-lane road?",
    tagalog: "Ano ang dapat mong gawin kung ang ibang drayber ay nagtatangkang mag-overtake sa iyo?",
    image: "",
    options: ["A. Speed up to block him", "B. slow down and let him pass", "C. Move closer to center line", "D. Honk repeatedly"],
    correct: 1
  },
  {
    question: "What is the proper reaction when a pedestrian steps onto the street outside a designated crosswalk?",
    tagalog: "Ano ang tamang reaksyon kapag may pedestrian na bumaba sa kalsada sa labas ng tawiran?",
    image: "",
    options: ["A. Honk continuous horn to scold him", "B. Maintain speed since he is wrong", "C. Be alert, be prepared to slow down, and give way", "D. Swerve quickly without checking mirror"],
    correct: 2
  },
  {
    question: "In traffic terminology, an unexpected collision involving motor vehicles is officially referred to as a:",
    tagalog: "Sa terminolohiya sa trapiko, ang aksidente sa sasakyan ay opisyal na tinatawag na:",
    image: "",
    options: ["A. Road Crash", "B. Traffic mistake", "C. Unexpected hit", "D. Car failure"],
    correct: 0
  },
  {
    question: "When turning right at an intersection, what should you do if another vehicle is crossing from the left?",
    tagalog: "Kapag liliko sa kanan, ano ang gagawin kung may sasakyang tumatawid mula sa kaliwa?",
    image: "",
    options: ["A. be alert, stop and give way to the car crossing", "B. Accelerate fast", "C. Honk horn and push through", "D. Flash headlights"],
    correct: 0
  },
  {
    question: "In a road rage incident, a defensive driver should be:",
    tagalog: "Sa insidente ng road rage, ang defensive driver ay dapat na:",
    image: "",
    options: ["A. neither the agressor nor the victim", "B. Aggressive to protect self", "C. Angry responder", "D. Loud arguer"],
    correct: 0
  },
  {
    question: "What is the correct action to take when approaching a solid yellow traffic light?",
    tagalog: "Ano ang tamang aksyon kapag papalapit sa kulay dilaw na ilaw-trapiko?",
    image: "",
    options: ["A. Speed up before red", "B. Stop in middle of intersection", "C. Prepare to stop", "D. Honk horn"],
    correct: 2
  },
  {
    question: "Is overtaking allowed on an elevated highway or bridge?",
    tagalog: "Pinapayagan ba ang pag-overtake sa tulay o mataas na kalsada?",
    image: "",
    options: ["A. Yes", "B. No, never", "C. Only during daytime", "D. Only for motorcycles"],
    correct: 0
  },
  {
    question: "Parking is legally allowed at what distance from a fire hydrant?",
    tagalog: "Ano ang legal na distansya ng pagparada mula sa boka-insendiyo?",
    image: "",
    options: ["A. 1 meter", "B. more than four meters of the fire hydrant", "C. 2 meters", "D. Exactly 3 meters"],
    correct: 1
  },
  {
    question: "On a 3-lane expressway, which lane should be used by vehicles traveling at normal cruising speed?",
    tagalog: "Sa 3-lane expressway, anong lane ang dapat gamitin ng sasakyang nasa katamtamang bilis?",
    image: "",
    options: ["A. 1st lane (Leftmost)", "B. 2nd lane", "C. Shoulder lane", "D. Any lane"],
    correct: 1
  },
  {
    question: "Can a driver use hazard lights while driving through heavy rain if the vehicle is moving normally?",
    tagalog: "Maaari bang gumamit ng hazard lights habang umaandar sa ulan?",
    image: "",
    options: ["A. Yes", "B. No", "C. Yes, if driving fast", "D. Yes, if headlight is broken"],
    correct: 1
  },
  {
    question: "What is the proper response when a pedestrian carrying a white cane is crossing the street?",
    tagalog: "Ano ang tamang aksyon kapag may tumatawid na taong may hawak na puting tungkod (may kapansanan sa paningin)?",
    image: "",
    options: ["A. Stop and let the pedestrian cross", "B. Honk horn to warn him", "C. Drive around him", "D. Flash high beam"],
    correct: 0
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
