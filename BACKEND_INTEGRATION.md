# Apps Script integration handoff

The public GitHub Pages files intentionally do not contain an Apps Script admin key. The
attached `code.gs` currently has OTP and exam-session support, but it does not have the
classroom or proctor actions used by `proctor.html`. Apply the following server-side changes
to the deployed Apps Script project, then redeploy the web app.

## Why the dashboard cannot authenticate by email alone

A static GitHub Pages page cannot safely prove that a typed email belongs to a Google account.
Do not add the allowlisted emails, an admin key, or a shared secret as the authorization
mechanism. Configure a Google OAuth Web client ID in `proctor.html`; the backend must verify
the Google Identity Services ID token before issuing a short-lived proctor token. The email
allowlist below is still enforced on every protected action.

## Configuration

Add these constants:

```javascript
const AUTHORIZED_PROCTOR_EMAILS = new Set([
  "im.a.aves@gmail.com", "a1ctmcmain@gmail.com",
  "a1cindangbranch@gmail.com", "a1cexamsystem@gmail.com"
]);
const GOOGLE_WEB_CLIENT_ID = "SET_IN_SCRIPT_PROPERTIES";
const CLASSROOM_TTL_SECONDS = 12 * 60 * 60;
const PROCTOR_TTL_SECONDS = 60 * 60;
```

Store the real Google client ID in Script Properties as `GOOGLE_WEB_CLIENT_ID`; do not put a
client secret or admin key in the repository. Replace the placeholder in `proctor.html` with
the public Web client ID.

## `doPost` routes

Add these routes before the unknown-action response:

```javascript
if (action === "proctorLogin") return jsonResponse(proctorLogin_(data));
if (action === "createClassroomSession") return jsonResponse(createClassroomSession_(data));
if (action === "listClassroomSessions") return jsonResponse(listClassroomSessions_(data));
if (action === "closeClassroomSession") return jsonResponse(closeClassroomSession_(data));
if (action === "validateClassroomAccess") return jsonResponse(validateClassroomAccess_(data));
```

Implement the helpers below. `verifyGoogleCredential_` must call
`https://oauth2.googleapis.com/tokeninfo?id_token=...`, verify `aud` equals the configured
client ID, require `email_verified === "true"`, and check the email against
`AUTHORIZED_PROCTOR_EMAILS`. Never accept an email sent by the browser as proof of identity.
Use `CacheService` only for short-lived `PROCTOR_<token>` records. Classroom records must be
stored in the persistent `Classroom Sessions` sheet (not cache) and contain `classroomCode`,
`sessionType`, `maxStudents`, `expiresAt`, `status`, and a `clients` object keyed by normalized
`clientId`; reject duplicate client IDs and reject new students once the limit is reached. Use
`LockService.getScriptLock()` around every read-modify-write.

```javascript
function proctorLogin_(data) {
  const identity = verifyGoogleCredential_(String(data.credential || ""));
  if (!identity.success) return identity;
  const token = Utilities.getUuid();
  CacheService.getScriptCache().put("PROCTOR_" + token, JSON.stringify({
    email: identity.email, issuedAt: Date.now()
  }), PROCTOR_TTL_SECONDS);
  return { success: true, proctorToken: token, email: identity.email };
}

function requireProctor_(token) {
  const raw = CacheService.getScriptCache().get("PROCTOR_" + String(token || ""));
  if (!raw) return null;
  const record = JSON.parse(raw);
  return AUTHORIZED_PROCTOR_EMAILS.has(String(record.email).toLowerCase()) ? record : null;
}

function validateClassroomAccess_(data) {
  const code = String(data.classroomCode || "").trim().toUpperCase();
  const clientId = String(data.clientId || "").trim().toUpperCase();
  if (!code || !clientId) return { success: false, message: "Classroom code and client ID are required." };
  // Look up the classroom record by its indexed code in your persistent classroom store.
  const session = findOpenClassroomByCode_(code);
  if (!session || new Date(session.expiresAt).getTime() <= Date.now()) {
    return { success: false, message: "Classroom code is invalid or expired." };
  }
  if (session.clients[clientId]) {
    return { success: false, message: "This LTO Client ID has already joined this classroom." };
  }
  if (Object.keys(session.clients).length >= Number(session.maxStudents)) {
    return { success: false, message: "This classroom session is full." };
  }
  session.clients[clientId] = { fullName: String(data.fullName || ""), joinedAt: Date.now() };
  saveClassroom_(session);
  return { success: true, classroomSessionId: session.classroomSessionId };
}
```

Implement `findOpenClassroomByCode_`, `saveClassroom_`, `createClassroomSession_`,
`listClassroomSessions_`, and `closeClassroomSession_` using a dedicated `Classroom Sessions`
sheet or a Script Properties index. CacheService cannot enumerate keys, so the classroom code
index must be stored persistently. The store must persist session state, use a script lock for
read-modify-write, and never rely on a client-provided session object.

## Classroom direct-auth contract

The classroom form must not call `requestOTP`. Its one request is:

```javascript
{
  action: "validateClassroomAccess",
  fullName, packageEnrolled, address, clientId, contactNumber, email,
  classroomCode
}
```

The successful response must be the same server-generated credentials used by the
authenticated exam flow:

```javascript
{
  success: true,
  classroomSessionId: "...",
  attemptId: "...",
  sessionToken: "..."
}
```

Update `validateClassroomAccess_` so it performs the existing classroom lookup, expiry,
capacity, and normalized-client-ID duplicate checks under the script lock, records the client
in the classroom session, and then creates the authenticated exam session using the existing
server-side session/attempt creation logic. Return only the generated `attemptId` and
`sessionToken` (plus the classroom session ID); never accept either credential from `data`.
Persist the classroom session ID on the authenticated session record so stage submissions
remain associated with the classroom.

Do not call `validateClassroomAccess_` from `requestOTP`; doing so would make a classroom
client consume the duplicate-client check twice. Keep the existing individual flow unchanged:
`requestOTP` creates an OTP attempt, `verifyOTP` exchanges it for the server-generated
`attemptId` and `sessionToken`, and resend remains available only for that OTP flow.

If the current Apps Script implementation has separate helpers for OTP attempts and
authenticated sessions, extract the common server-side session creation into one helper and
call it from both `verifyOTP` and `validateClassroomAccess_`. The required route remains:

```javascript
if (action === "validateClassroomAccess") {
  return jsonResponse(validateClassroomAccess_(data));
}
```

The frontend rejects a successful classroom response that does not contain both credentials,
so the Apps Script deployment must be updated before enabling classroom access.

After applying the helpers, test: expired sessions, max-student rejection, duplicate client
ID rejection, close-session rejection, an unauthorized Google account, and a normal OTP-only
student. Do not deploy or merge until the owner confirms.

## Two-day exam flow patch (paste into `code.gs`)

This patch keeps the existing individual OTP and same-day Session 1 -> Final flow. It adds
an explicit `sessionType`, creates a separate classroom code for Day 2, and stores eligibility
in a durable `Exam Stages` sheet. Do not use `CacheService` for any row written below.
The sheet is keyed by normalized LTO Client ID and is protected by the script lock.

### 1. Add constants and routes

```javascript
const EXAM_STAGES_SHEET = "Exam Stages";
const CLASSROOM_SESSIONS_SHEET = "Classroom Sessions";
const STAGE_HEADERS = [
  "recordId", "clientId", "fullName", "email", "status", "session1AttemptId",
  "session1PassedAt", "finalAttemptId", "finalCompletedAt", "classroomSessionId",
  "updatedAt", "eligibilityStatus"
];

// In doPost(data), retain all existing routes and add:
if (action === "validateFinalClassroomAccess") {
  return jsonResponse(validateFinalClassroomAccess_(data));
}
```

Update the existing classroom route to pass `sessionType` through:

```javascript
if (action === "validateClassroomAccess") {
  return jsonResponse(validateClassroomAccess_(data));
}
```

`createClassroomSession_` must normalize `sessionType` to `SESSION_1` or `FINAL`, persist
it in `Classroom Sessions`, and return it in the response. Reject any other value. A Day 2
proctor must create a new session rather than reuse a Day 1 code.

### 2. Durable stage-store helpers

```javascript
function ensureExamStagesSheet_() {
  const ss = SpreadsheetApp.openById(RESULTS_SPREADSHEET_ID);
  let sheet = ss.getSheetByName(EXAM_STAGES_SHEET);
  if (!sheet) sheet = ss.insertSheet(EXAM_STAGES_SHEET);
  if (sheet.getLastRow() === 0) sheet.appendRow(STAGE_HEADERS);
  return sheet;
}

function normalizeClientId_(value) {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
}

function readStageRecord_(clientId) {
  const id = normalizeClientId_(clientId);
  if (!id) return null;
  const sheet = ensureExamStagesSheet_();
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (normalizeClientId_(values[i][1]) === id) {
      return { row: i + 1, values: values[i] };
    }
  }
  return null;
}

function upsertStageRecord_(data) {
  const sheet = ensureExamStagesSheet_();
  const now = new Date().toISOString();
  const clientId = normalizeClientId_(data.clientId);
  const existing = readStageRecord_(clientId);
  const row = existing ? existing.values.slice() : new Array(STAGE_HEADERS.length).fill("");
  if (!row[0]) row[0] = Utilities.getUuid();
  row[1] = clientId;
  row[2] = String(data.fullName || row[2] || "");
  row[3] = String(data.email || row[3] || "");
  Object.keys(data).forEach(function(key) {
    const index = STAGE_HEADERS.indexOf(key);
    if (index >= 0 && data[key] !== undefined) row[index] = data[key];
  });
  row[10] = now;
  if (existing) sheet.getRange(existing.row, 1, 1, STAGE_HEADERS.length).setValues([row]);
  else sheet.appendRow(row);
  return row;
}

function recordSession1Pass_(data, result) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    return upsertStageRecord_({
      clientId: data.student.clientId,
      fullName: data.student.fullName,
      email: data.student.email,
      status: "SESSION_1_PASSED",
      eligibilityStatus: "FINAL_ELIGIBLE",
      session1AttemptId: data.attemptId,
      session1PassedAt: new Date().toISOString()
    });
  } finally {
    lock.releaseLock();
  }
}
```

### 3. Day 2 eligibility and attempt creation

`createAuthenticatedExamSession_` below is the existing server-side helper used by
`verifyOTP_` and classroom validation. It must generate a fresh `attemptId` and
`sessionToken`; never accept either value from the browser.

```javascript
function validateFinalClassroomAccess_(data) {
  const code = String(data.classroomCode || "").trim().toUpperCase();
  const clientId = normalizeClientId_(data.clientId);
  if (!code || !clientId) {
    return { success: false, message: "Final Exam classroom code and LTO Client ID are required." };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const classroom = findOpenClassroomByCode_(code);
    if (!classroom || classroom.sessionType !== "FINAL" ||
        new Date(classroom.expiresAt).getTime() <= Date.now()) {
      return { success: false, message: "This is not an open Final Exam classroom session." };
    }

    const stage = readStageRecord_(clientId);
    if (!stage) {
      return { success: false, message: "No passed Session 1 record was found for this LTO Client ID." };
    }
    const status = String(stage.values[4] || "");
    const eligibility = String(stage.values[11] || "");
    if (status !== "SESSION_1_PASSED" || eligibility !== "FINAL_ELIGIBLE") {
      return { success: false, message: "The student is not eligible for the Final Exam." };
    }
    if (stage.values[8]) {
      return { success: false, message: "This student has already completed the Final Exam." };
    }
    if (classroom.clients[clientId]) {
      return { success: false, message: "This LTO Client ID has already joined this classroom." };
    }
    if (Object.keys(classroom.clients || {}).length >= Number(classroom.maxStudents)) {
      return { success: false, message: "This classroom session is full." };
    }

    const expectedName = String(stage.values[2] || "").trim().toUpperCase();
    if (expectedName && expectedName !== String(data.fullName || "").trim().toUpperCase()) {
      return { success: false, message: "The identifying details do not match the Session 1 record." };
    }

    const auth = createAuthenticatedExamSession_(data, "FINAL", classroom.classroomSessionId);
    classroom.clients[clientId] = {
      fullName: String(data.fullName || ""),
      attemptId: auth.attemptId,
      joinedAt: new Date().toISOString()
    };
    saveClassroom_(classroom);
    upsertStageRecord_({
      clientId: clientId,
      fullName: data.fullName,
      email: data.email,
      status: "FINAL_ATTEMPT_CREATED",
      eligibilityStatus: "FINAL_ELIGIBLE",
      finalAttemptId: auth.attemptId,
      classroomSessionId: classroom.classroomSessionId
    });
    return {
      success: true,
      classroomSessionId: classroom.classroomSessionId,
      attemptId: auth.attemptId,
      sessionToken: auth.sessionToken,
      examSession: "FINAL",
      eligibilityStatus: "FINAL_ELIGIBLE"
    };
  } finally {
    lock.releaseLock();
  }
}
```

In `validateClassroomAccess_`, branch on the persisted classroom type before the existing
same-day behavior:

```javascript
if (String(session.sessionType || "SESSION_1") === "FINAL") {
  return validateFinalClassroomAccess_(data);
}
```

The frontend sends `sessionType: "FINAL"` and expects the same server-generated
`attemptId`/`sessionToken` contract. Individual OTP Day 2 requests must apply the same
eligibility check and call `createAuthenticatedExamSession_(data, "FINAL", "")` after
`readStageRecord_`; do not issue an OTP or attempt before eligibility is confirmed. Add this
guard at the start of the existing `requestOTP_`:

```javascript
if (String(data.examSession || "SESSION_1") === "FINAL") {
  const stage = readStageRecord_(data.clientId);
  if (!stage || String(stage.values[4]) !== "SESSION_1_PASSED" ||
      String(stage.values[11]) !== "FINAL_ELIGIBLE" || stage.values[8]) {
    return { success: false, message: "The student is not eligible for the Final Exam." };
  }
}
```

Store `examSession` on the OTP attempt. In `verifyOTP_`, use the stored value (never a
browser-supplied value) when calling `createAuthenticatedExamSession_`, and include
`examSession` and `eligibilityStatus` in the response. This preserves the existing OTP
resend and expiration limits while preventing an ineligible Day 2 OTP from consuming an
exam attempt.

### 4. Record status transitions in existing stage submission

In the existing `submitStageResult_` (after authoritative server-side scoring and duplicate
protection), add:

```javascript
if (String(data.stage) === "SESSION_1" && result.passed === true) {
  recordSession1Pass_(data, result);
}
if (String(data.stage) === "FINAL" && result.success === true) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    upsertStageRecord_({
      clientId: data.student.clientId,
      fullName: data.student.fullName,
      email: data.student.email,
      status: "FINAL_COMPLETED",
      finalAttemptId: data.attemptId,
      finalCompletedAt: new Date().toISOString()
    });
  } finally {
    lock.releaseLock();
  }
}
```

Return `eligibilityStatus: "FINAL_ELIGIBLE"` when Session 1 passes. The existing final
report route should accept `examSession: "FINAL"` with an empty Session 1 answer array and
link the final report to `session1AttemptId` from `Exam Stages`; do not trust browser scores.
Keep all existing token checks, server scoring, idempotency keys, retake rules, security-event
logging, timer handling, and office-email reporting. Test expired/wrong-type classroom codes,
missing or mismatched identity, duplicate classroom joins, already-completed finals, a normal
Day 1 pass, overnight Day 2 entry, failed Session 1, and existing same-day OTP/classroom flow.
