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
Use `CacheService` for `PROCTOR_<token>` and `CLASSROOM_<id>` records. A classroom record must
contain `classroomCode`, `maxStudents`, `expiresAt`, `status`, and a `clients` object keyed by
normalized `clientId`; reject duplicate client IDs and reject new students once the limit is
reached. Use `LockService.getScriptLock()` around every read-modify-write.

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

In `requestOTP`, after validating the normal student fields, call
`validateClassroomAccess_` when `data.accessMode === "classroom"` and reject unless it succeeds.
Persist `classroomSessionId` in the OTP record. In `verifyOTP`, copy that value into the
authenticated session record. This preserves the existing server-generated `attemptId` and
`sessionToken` for every student while allowing later stage submissions to be associated with
the classroom. Keep the existing OTP-only branch unchanged.

After applying the helpers, test: expired sessions, max-student rejection, duplicate client
ID rejection, close-session rejection, an unauthorized Google account, and a normal OTP-only
student. Do not deploy or merge until the owner confirms.
