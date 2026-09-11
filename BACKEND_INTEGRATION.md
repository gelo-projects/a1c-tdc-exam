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
