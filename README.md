# A1C TDC Assessment — Starter

This is the first test build of the A1C Driving Academy TDC assessment system.

## Current test features

- Student information form
- Demo OTP verification screen
- 5-minute OTP countdown
- 1 hour 30 minute exam timer
- Question navigation
- Answer selection
- Review answers
- Submit confirmation
- Demo scoring

## Important

The OTP in this starter is `123456` and is intentionally NOT secure.

Do not use this build for a real examination.

The next implementation step is a secure backend for:
- server-side OTP generation
- office-email delivery
- OTP expiration and attempt limits
- server-side verification
- exam submission
- separate TDC 1st Session / TDC Final scoring
- office email report

## Cloudflare Pages

This is a plain static HTML/CSS/JavaScript project, so no framework is required.

For a Git-connected Cloudflare Pages project:
- Production branch: `main`
- Framework preset: None
- Build command: leave blank (or `exit 0`)
- Build output directory: repository root (`/`)

Cloudflare Pages can deploy static HTML sites and automatically redeploy from connected GitHub repositories.

## Proctor dashboard and classroom access

`proctor.html` is a static dashboard for authorized proctors. Before deployment:

1. Create a Google OAuth Web client ID with the GitHub Pages origin as an authorized
   JavaScript origin, then replace `GOOGLE_CLIENT_ID` in `proctor.html`.
2. Apply the server-side routes and storage changes in
   `BACKEND_INTEGRATION.md` to the separate Apps Script `code.gs`. Put the Google client ID
   in Apps Script Script Properties, not in a secret committed to this repository.
3. Redeploy the Apps Script web app and update `PROCTOR_API_URL` / `AUTH_API_URL` only if
   the deployment URL changes.
4. Deploy the static files to GitHub Pages. The dashboard authenticates with a Google
   identity credential; the Apps Script backend must verify the token and enforce the
   authorized-email allowlist. Do not use a browser-supplied email or admin key.

Students can continue using individual OTP. For classroom access, a proctor creates an
open session, gives the displayed code to students, and closes the session when the room
is finished. The proctor must select `Day 1 — Session 1` or `Day 2 — Final Exam`; Day 2
always uses a new classroom code. Classroom validation is performed before OTP and is tied
to the server-created attempt and session token.

## Exam selection and operation

The entry flow first selects an access method (individual OTP or classroom code), then an
exam type: TDC 1st Session or TDC Final Exam. PDC Set 1 and Set 2 remain visible as disabled
“Coming soon” choices until their question banks are available. TDC Final is a standalone
exam and does not require a previously passed Session 1.

After each stage, the server-scored result is shown with the score and pass/fail status.
Failed stages offer a retake. A passed Session 1 offers **Submit and Exit** or **Submit and
Continue** to a fresh Final attempt; Final ends after submission. Every completed stage is
saved and emailed to the student and office. Apply the exact Apps Script contracts in
`BACKEND_INTEGRATION.md` to the separate `code.gs`; this repository does not contain or
deploy that file, and no secrets should be added here.
