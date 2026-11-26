# HireAI

**AI-powered job platform** that matches your resume to jobs and helps you prepare for interviews.

**Live demo:** https://hireai-blond.vercel.app

> The backend is hosted on a free plan, so the first request may take a few seconds to wake up.

## Features

- **Job search** with live listings from the Adzuna API
- **AI Resume Matcher:** upload your resume and get a match score, strengths, missing skills and recommendations for a job
- **PDF resume upload** with text extraction using PDF.js
- **AI Interview Preparation:** role-specific interview questions generated with Gemini
- **Application tracker:** record application status, notes, and history
- **Authentication:** JWT login and signup with protected routes
- **Personalised dashboard** for each user

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB |
| AI | Google Gemini |
| APIs | Adzuna Jobs API |
| Auth | JWT |
| Deployment | Vercel (frontend), Render (backend) |

## Run Locally

```bash
git clone https://github.com/gopalnayak980/hireai.git
cd hireai
npm install
npm run lint
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` in the frontend repository root and set `VITE_API_URL` to the backend origin (with or without the `/api` suffix). Local development defaults to `http://localhost:5000/api`. Production builds require `VITE_API_URL`; configure it in the frontend hosting provider's build environment. This value is public browser configuration and must never contain a secret.

The backend is a separate repository. Follow its README to configure MongoDB, JWT, Gemini, Adzuna, CORS, and its production start command. The frontend deployment must use HTTPS and its exact origin must be listed in the backend `FRONTEND_URL` or `FRONTEND_URLS` configuration.

## Production checks

Run `npm run lint` and `npm run build` before deployment. Configure `VITE_API_URL` before the production build, and verify the backend readiness endpoint (`/health/ready`) after deployment. Never put backend credentials in `VITE_*` variables.

## Author

**Gopal Nayak** · [Portfolio](https://gopalnayak980.github.io/gopal-portfolio) · [LinkedIn](https://www.linkedin.com/in/gopalnayak2005)

## License

MIT
