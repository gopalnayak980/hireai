# HireAI API reference for this Skill

This reference was checked against the backend route mounts and route handlers in HireAI. Base URLs are deployment-specific; set the API base to the backend origin and append `/api` to each listed path. Do not place a real token or API key in examples, prompts, logs, or package files.

## Authentication and user scoping

- Public routes: `GET /api/jobs/search`, `GET /api/jobs`, `GET /api/jobs/:id`.
- Authenticated routes require `Authorization: Bearer <user JWT>`.
- Saved jobs, applications, and interview sessions apply the authenticated user ID to every private-record query. Never accept a user ID from the Skill request to choose whose records to access.
- Obtain authorization through a user-approved secure integration. The Skill must not ask for or read passwords, JWTs, `.env` files, browser storage, or deployment secrets. The interactive login endpoint exists, but this Skill must not collect credentials or perform sign-in.
- Public registration creates a `jobseeker`; recruiter job creation requires the recruiter role and is outside this Skill's supported write actions.
- Safe API errors generally return a JSON `{ "message": "..." }`; do not expose backend internals or retry destructive actions based on ambiguous errors.
- `POST /api/auth/login` accepts `email` and `password`, then returns `{ token, user }`; public registration is `POST /api/auth/register` and always creates a `jobseeker`. These endpoints are not a credential collection flow for this Skill: the user should sign in through HireAI or use an approved secure authorization connector.
- Current IP limits include login (30 per 15 minutes), registration (10 per hour), public job search (120 per 15 minutes), and AI calls (account and IP limits). Limits are process-local and may be enforced differently by the deployment gateway.

## Job discovery

### `GET /api/jobs/search`

Public Adzuna-backed search. Query parameters:

| Parameter | Requirement |
| --- | --- |
| `what` | Optional keyword, 1–200 characters. The Skill should ask for it rather than rely on the API default. |
| `where` | Optional location, 1–200 characters. The Skill should ask for it rather than rely on the API default. |
| `page` | Optional integer 1–100. |

Returns `{ jobs, total, page, pageSize, hasMore }`. Each mapped job contains `id`, `source: "adzuna"`, `title`, `company`, `location`, `salary`, `description`, `url`, and `created`. Treat description and URL as provider data. `url` may be absent or invalid; validate HTTP(S) before offering to open it. There is no HireAI Adzuna detail endpoint.

### `GET /api/jobs`

Public recruiter listings. Optional `page` integer 1–10000; 50 rows per page. The body remains an array of job records with `source: "recruiter"`; pagination metadata is in `X-Total-Count`, `X-Has-More`, and `X-Page` headers. `postedBy` is excluded.

### `GET /api/jobs/:id`

Public detail for a MongoDB recruiter job only. Invalid IDs and missing records return 404. Do not use this endpoint for Adzuna or sample IDs.

## Resume analysis and interview AI

All endpoints below require the user's bearer token and are rate-limited. Resume text and job descriptions are sent to the configured Gemini provider through the backend. Get the user's consent before sending them.

### `POST /api/ai/match`

Required JSON fields: `resumeText` (up to 20,000 characters), `jobTitle` (up to 200), and `jobDescription` (up to 12,000). Optional `skills` is a string up to 2,000 characters or an array of up to 50 strings (each up to 100).

Returns `matchScore`, `atsScore`, `strengths`, `missing`, `suggestions`, `verdict`, `atsFactors`, `sectionAnalysis`, `matchedSkills`, `missingSkills`, `keywords`, `matchRationale`, `learningRecommendations`, and `bulletRecommendations`. Scores are model-generated guidance, not guarantees. Do not represent suggestions as facts about the candidate.

### `POST /api/ai/interview`

Required: `role`, `experience`. Optional: `jobDescription` (up to 12,000 characters), `resumeText` (up to 20,000), `category` (`technical`, `behavioral`, `hr`; default `technical`), `difficulty` (`easy`, `medium`, `hard`; default `medium`), and `length` (integer 3–12; default 8).

Returns `{ questions: [{ question, answer, tip, category }] }` with exactly the requested question count.

### `POST /api/ai/interview/evaluate`

Required: `role`, `experience`, `category`, `difficulty`, `question` (up to 2,000), and `answer` (up to 8,000). Optional `jobDescription` (up to 12,000). Returns `score` (0–10), `whatWentWell`, `improvements`, `sampleAnswer`, `missingConcepts`, and `scoreContext`. The score is subjective coaching feedback.

### `POST /api/ai/interview/report`

Required: `role`, `experience`, `category`, `difficulty`, and `responses` (1–12 entries). Each response contains `question`, `answer`, `score` (0–10), `whatWentWell`, `improvements`, and `missingConcepts`. Optional `jobDescription` is up to 12,000 characters. Returns `overallScore`, `strongestAreas`, `weakAreas`, `communicationFeedback`, `answerStructureFeedback`, `topicsToRevise`, and `recommendations`.

## Saved jobs

All saved-job routes require authentication and are scoped to the current user.

- `GET /api/saved?page=N`: returns an array, 50 per page. Pagination metadata uses the same `X-*` headers as recruiter listings.
- `POST /api/saved`: required `jobId` (string or finite number), `title`, `company`; optional `source` (`adzuna`, `recruiter`, `sample`), `location`, `salary`, and `url`. Returns the created saved record. The response includes a user reference; do not display or forward that field.
- `DELETE /api/saved/:jobId`: deletes the current user's saved record by job ID and returns `{ message }`. The legacy unique key and delete operation are not source-aware. Do not assume source disambiguation where two providers reuse an ID.

## Application tracker

All routes require authentication and records are scoped to the current user.

- `GET /api/applications?page=N&status=...&search=...`: returns `{ applications, total, filteredTotal, counts, page, pageSize, hasMore }`; page size is 50. Valid statuses: `Interested`, `Applied`, `Assessment`, `Interview`, `Offer`, `Rejected`, `Withdrawn`.
- `POST /api/applications`: required `title`, `company`; optional `source` (`adzuna`, `recruiter`, `sample`, `manual`; default `manual`), `jobId` for non-manual sources, `location`, `jobUrl`, `applicationDate`, `notes`, and `status` (default `Interested`). URLs, when present, must be HTTP(S). Duplicate source/job IDs for one user return 409 where applicable.
- `GET /api/applications/:id`: returns one current-user record.
- `PATCH /api/applications/:id`: accepts only `title`, `company`, `location`, `jobUrl`, `applicationDate`, `notes`, and `status`.
- `DELETE /api/applications/:id`: deletes one current-user record. Confirm before use.

Application tracking records are not employer submissions. Never tell a user an application was sent through these routes.

## Interview history

All routes require authentication and records are scoped to the current user.

- `GET /api/interview-sessions?page=N`: returns `{ sessions, total, page, pageSize, hasMore }` (20 per page). List records contain role, experience, category, difficulty, report score, and creation date.
- `POST /api/interview-sessions`: saves a completed session. Required `role`, `experience`, session `category`, `difficulty`, and `responses` (1–12). Each response has `question`, `answer`, `category`, and `evaluation` with `score` (0–10), `whatWentWell`, `improvements`, `sampleAnswer`, `missingConcepts`, and `scoreContext`. The required `report` contains `overallScore` (0–100), `strongestAreas`, `weakAreas`, `communicationFeedback`, `answerStructureFeedback`, `topicsToRevise`, and `recommendations`. It stores written answers and feedback. Obtain explicit user confirmation first.
- `GET /api/interview-sessions/:id`: returns one current-user session including responses and feedback.
- `DELETE /api/interview-sessions/:id`: deletes one current-user session. Confirm before use.

The backend does not store resume text or job descriptions in interview-session records. Do not include them in extra fields; unknown fields are not part of the API contract.
