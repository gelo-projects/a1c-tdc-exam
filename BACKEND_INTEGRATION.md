# Apps Script integration contract

`code.gs` is maintained outside this repository. The static frontend calls the deployed
Apps Script URL with JSON POST requests and expects the contracts below. Keep all scoring,
attempt IDs, session tokens, classroom membership, persistence, and email delivery
server-authoritative.

## Exam and access values

The frontend sends one of these `examType` values:

| examType | sessionType | Status |
| --- | --- | --- |
| `TDC_SESSION_1` | `SESSION_1` | enabled |
| `TDC_FINAL` | `FINAL` | enabled and standalone |
| `PDC_SET_1` | `PDC_SET_1` | disabled in the UI |
| `PDC_SET_2` | `PDC_SET_2` | disabled in the UI |

`TDC_FINAL` must not check for or require a previously passed Session 1. It is a
standalone selection. PDC values must be rejected by the backend while their question
banks are unavailable.

## Authentication routes

### Individual OTP

Request:

```js
{
  action: "requestOTP",
  examType: "TDC_SESSION_1" | "TDC_FINAL",
  examSession: "SESSION_1" | "FINAL",
  accessMode: "otp",
  fullName, packageEnrolled, address, clientId, contactNumber, email
}
```

The response must include `{ success, attemptId }`. Store both `examType` and
`examSession` on the OTP attempt. `verifyOTP` exchanges that server-stored attempt for
`{ success, attemptId, sessionToken, examType, examSession }`; never accept an attempt ID,
session token, or exam type from the browser during verification. Preserve OTP resend.

### Classroom code

The frontend uses one route for both enabled TDC types:

```js
{
  action: "validateClassroomAccess",
  examType: "TDC_SESSION_1" | "TDC_FINAL",
  sessionType: "SESSION_1" | "FINAL",
  classroomCode,
  fullName, packageEnrolled, address, clientId, contactNumber, email
}
```

The backend must look up the persistent classroom record by code and reject the request
unless both the persisted `examType`/`sessionType` and the submitted selection match.
Also enforce expiry, capacity, duplicate normalized client ID, and open status under a
script lock. A successful response is:

```js
{
  success: true,
  classroomSessionId,
  attemptId,
  sessionToken,
  examType,
  examSession,
  eligibilityStatus
}
```

`attemptId` and `sessionToken` must be freshly generated server-side. Do not call
`requestOTP` from this route. Store the classroom session ID on the authenticated attempt.

Classroom creation must persist `examType`, `sessionType`, `classroomCode`, `maxStudents`,
`expiresAt`, `status`, and a `clients` object. Proctor routes remain protected by the
Google identity-token verification and authorized-email allowlist described in the
existing proctor implementation. Never use a browser-supplied email as proof of identity.

**Required patch for the external Apps Script:** update `createClassroomSession_()` to
validate and persist the submitted enabled pair (`TDC_SESSION_1`/`SESSION_1` or
`TDC_FINAL`/`FINAL`). Update the list route to return both persisted values. In
`validateClassroomAccess_()`, load the classroom record first, reject when the submitted
pair differs from the persisted pair, and return the persisted `examType` plus
`examSession` (or `sessionType`) in the success response. Do not default a missing
record value to `SESSION_1`; old records without a persisted selection must be migrated
explicitly or closed.

The answer-key PDF must retain its existing four-column template layout. In
`fillAnswerGrid_()`, write the selected answer (for example `C`) to the answer column,
the correct answer (`C`) to the correct-answer column, and only `✓` or `✗` to the result
column. Do not write combined values such as `C ✓` into the answer cell.

## Stage submission and result delivery

The exam calls:

```js
{
  action: "submitStageResult",
  stage: "SESSION_1" | "FINAL" | "PDC_SET_1" | "PDC_SET_2",
  examType,
  attemptId,
  sessionToken,
  student,
  attemptNumber,
  securityViolations,
  answers: number[] // only the selected stage's answers
}
```

Validate the token, attempt, stage, and classroom binding. Score from the server-side
question bank; do not trust browser scores. Persist the submitted stage result before
attempting delivery and make duplicate submissions idempotent.

On every successful stage submission, email both the student and office. The office email
must include the answer key and exactly one generated PDF for the submitted stage. For
`SESSION_1`, generate only the Session 1 PDF; for `FINAL`, generate only the Final PDF.
Do not create a combined report with empty arrays for the other stage. Include pass/fail,
score, percentage, attempt ID, student details, and exam type in both emails. Record
delivery attempts and errors in the backend log/result record.

Return an explicit delivery status:

```js
{
  success: true,
  saved: true,
  stage: "SESSION_1",
  score: 24,
  total: 30,
  percent: 80,
  passed: true,
  emailDelivery: {
    success: true,
    student: { success: true },
    office: { success: true }
  }
}
```

If persistence succeeds but either email fails, return `success: true`, `saved: true`,
and `emailDelivery.success: false` with a clear `message` and per-recipient errors. The
frontend intentionally does not claim completion when that flag is false; the backend
should allow a safe, idempotent delivery retry without creating a second result.

For a passed `SESSION_1`, record the stage status for reporting only. Do not use it as a
prerequisite for a direct `TDC_FINAL` attempt. A passed Session 1 may continue to Final
only because the student explicitly chose **Submit and Continue** in the UI; that action
must create a fresh Final attempt. **Submit and Exit** ends the current stage. Final has no
continue action.

Retake requests must use the existing authenticated attempt-creation route and return
fresh server-generated credentials. PDC retakes and submissions remain disabled until the
question banks are deployed.

## Required backend checks

Before deployment, test: a normal individual OTP for each enabled TDC type; a classroom
code used with the wrong exam type; expired, closed, full, and duplicate-client classroom
access; standalone Final access without a Session 1 record; failed and passed stage
submissions; retake idempotency; student-email failure; office-email failure; and that
each office message contains only the relevant stage PDF and answer key.

Keep secrets, OAuth configuration, and Apps Script admin credentials in Script Properties,
not in this repository. Redeploy the web app after applying these contracts.

## Paste-ready Apps Script additions

The following sections are for the external `code.gs` only. They are intentionally
separate from the static repository because the deployed Apps Script is not tracked here.
Paste the route branches into `doPost(e)` before the unknown-action response, and paste
the helper functions alongside the existing proctor helpers. All routes must continue to
verify the Google identity credential at the server and must never trust a browser-supplied
email address.

### Restore the professional office result email

Use the legacy source's existing `sendExamResultEmail_()` call from the stage-submit
handler, passing the already-scored, persisted result and only the PDF attachment for the
submitted stage:

```js
const emailResult = sendExamResultEmail_(result, stageAttachments);
if (!emailResult || !emailResult.emailSent) {
  throw new Error("Result saved, but office/student email delivery did not complete.");
}
```

Restore these existing helpers from the legacy source without changing the PDF code:
`sendExamResultEmail_`, `buildExamResultEmailHtml_`, `buildStudentResultEmailHtml_`,
`buildExamResultPlainText_`, `buildStudentResultPlainText_`, and `answerTableHtml_`.
`buildExamResultEmailHtml_(result, true)` is the office copy and must render the LTO
header, student information, examination results table, overall result, passing rate,
completion status, security-violation count, attempt ID, and the full answer records.
`answerTableHtml_(answers, key)` must keep the four columns exactly as `No.`, `Answer`,
`Correct`, and `Result`, with one row per key entry and only `✓` or `✗` in `Result`.

The result object passed to those helpers must be stage-aware and contain real values,
not empty defaults for the other stage:

```js
const result = {
  student: persisted.student,
  attemptId: persisted.attemptId,
  submittedAt: persisted.submittedAt || new Date(),
  examType: persisted.examType,
  completionStatus: persisted.completionStatus,
  securityViolations: Number(persisted.securityViolations || 0),
  overallPassed: Boolean(persisted.passed),
  session1Score: stage === "SESSION_1" ? score : null,
  session1Percent: stage === "SESSION_1" ? percent : null,
  session1Passed: stage === "SESSION_1" ? passed : null,
  session1Answers: stage === "SESSION_1" ? persisted.answers : [],
  finalScore: stage === "FINAL" ? score : null,
  finalPercent: stage === "FINAL" ? percent : null,
  finalPassed: stage === "FINAL" ? passed : null,
  finalAnswers: stage === "FINAL" ? persisted.answers : []
};
```

Do not alter `fillAnswerGrid_()` or either LTO PDF template while restoring this email
HTML. The email is an independent HTML representation of the scored answer records.

### Retrieve and display live security violations

Add these branches to `doPost(e)`:

```js
if (action === "listLiveSecurityViolations") {
  return jsonResponse(listLiveSecurityViolations_(data));
}
if (action === "deleteClassroomSession") {
  return jsonResponse(deleteClassroomSession_(data));
}
```

Store every `securityEvent` with a server timestamp, attempt ID, normalized student name,
violation type, and classroom session ID in a dedicated `Security Events` sheet (or an
equivalent server-side store). The route used by `proctor.html` is:

```js
function listLiveSecurityViolations_(data) {
  requireAuthorizedProctor_(data.proctorToken);
  const limit = Math.min(Math.max(Number(data.limit || 100), 1), 200);
  const sheet = getRequiredSheet_("Security Events",
    ["Timestamp", "Attempt ID", "Student Name", "Violation Type", "Classroom Session ID"]);
  const values = sheet.getDataRange().getValues();
  const rows = values.slice(1).filter(row => row[0]).slice(-limit).reverse();
  return {
    success: true,
    violations: rows.map(row => ({
      timestamp: new Date(row[0]).toISOString(),
      attemptId: String(row[1] || ""),
      studentName: String(row[2] || "Unknown student"),
      violationType: String(row[3] || "Security event"),
      classroomSessionId: String(row[4] || "")
    }))
  };
}
```

Update `logSecurityEvent` (or its shared logger) to append the same five fields
atomically under a script lock. The frontend displays only the server response:
student name, violation type, and timestamp. Return `{success:false,message}` for missing
or inaccessible storage; do not return an empty success-shaped fallback.

### Safely delete past classroom sessions

Deletion is deliberately restricted to closed/expired sessions and requires an explicit
confirmation field from the dashboard. Add this server helper:

```js
function deleteClassroomSession_(data) {
  requireAuthorizedProctor_(data.proctorToken);
  if (data.confirm !== true) {
    return { success: false, message: "Explicit deletion confirmation is required." };
  }
  if (!data.classroomSessionId) {
    return { success: false, message: "Classroom session ID is required." };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sessions = getClassroomSessionStore_();
    const record = sessions.get(data.classroomSessionId);
    if (!record) return { success: false, message: "Classroom session was not found." };
    if (String(record.status || "").toUpperCase() === "OPEN") {
      return { success: false, message: "Close the classroom session before deleting it." };
    }
    sessions.delete(data.classroomSessionId);
    logProctorAction_("DELETE_CLASSROOM_SESSION", data.classroomSessionId);
    return { success: true, classroomSessionId: data.classroomSessionId };
  } finally {
    lock.releaseLock();
  }
}
```

`getClassroomSessionStore_()` and `logProctorAction_()` above are placeholders for the
existing persistent store and audit logger in `code.gs`; use those existing functions
rather than browser storage. If sessions are stored in Sheets, delete only the matching
record row under the same lock and retain an audit row containing the proctor identity,
timestamp, session ID, and action. `listClassroomSessions` must return `status`,
`classroomSessionId`, `sessionName`, `classroomCode`, `activeStudents`, `maxStudents`,
and `expiresAt`, so the UI offers deletion only for non-`OPEN` sessions.
