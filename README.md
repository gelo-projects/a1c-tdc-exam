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
