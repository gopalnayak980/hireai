# HireAI Career Assistant Skill

An agent skill for grounded job discovery, resume-to-role analysis, interview preparation, and application tracking using the existing HireAI backend when an authorized API connection is available.

## Package contents

- `SKILL.md` — skill metadata, boundaries, safety rules, workflows, and examples.
- `references/api-reference.md` — verified HireAI endpoints, authentication expectations, and response shapes.
- `LICENSE` — the HireAI repository's MIT license.

This is an instruction package. It does not include application code, scripts, dependencies, credentials, or a private API connection. It does not install or connect to Agensi on the user's behalf.

## Use

Install this folder as a skill in an agent that supports the SKILL.md format, or submit the ZIP to Agensi for its review. Ask the agent for job-search, resume-matching, interview-practice, or application-tracking help.

For live backend access, an authorized HTTP integration must provide the HireAI API base URL and the current user's bearer token securely. Do not paste tokens or passwords into chat, place them in this package, or retrieve them from browser storage. If the agent has no authorized API connection, it can still help with user-provided text; use the signed-in HireAI frontend for live account actions.

Resume and job-description analysis sends the supplied text through HireAI to its configured Gemini provider. The Skill directs the agent to disclose this and obtain affirmative consent before the request. Interview history saves written answers and feedback only after user confirmation.

## Backend configuration

For an operator self-hosting HireAI, the backend uses these environment variables:

- `MONGO_URI`
- `JWT_SECRET` (at least 32 characters)
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional)
- `ADZUNA_APP_ID`
- `ADZUNA_APP_KEY`
- `FRONTEND_URL` or `FRONTEND_URLS` (exact allowed origins; HTTPS in production)
- `TRUST_PROXY` (the trusted proxy hop count)
- `NODE_ENV` and `PORT`

Keep values in the backend deployment's secret manager or ignored `.env` file. Never put backend values in this Skill or in frontend `VITE_*` variables. Public search uses Adzuna; AI analysis and interview endpoints use the backend's configured Gemini credentials. Setup and deployment details are operator responsibilities and are not bundled as executable scripts.

## Agensi submission checklist

- ZIP layout has one top-level `hireai-career-assistant/` directory and `SKILL.md` inside it.
- Enter a unique name (60 characters or fewer), summary (300 characters or fewer), accurate description, compatibility note, up to three categories, tags, use cases, and permissions in Agensi's submission form.
- Describe the Skill as instruction-driven and disclose that live backend actions require an authorized HTTP integration.
- Keep buyer-facing listing copy free of links to external websites, repositories, hosted services, or downloads, as required by Agensi's current listing terms.
- Include a real, consent-safe demo request and result; do not invent HireAI output or claim a live backend demonstration that was not run.
- Review Agensi's security scan and listing preview. Complete creator account requirements yourself. This package has not been uploaded or submitted.
