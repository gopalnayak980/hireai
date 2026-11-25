# HireAI

**AI-powered job platform** that matches your resume to jobs and helps you prepare for interviews.

**Live demo:** https://hireai-blond.vercel.app

> The backend is hosted on a free plan, so the first request may take a few seconds to wake up.

## Features

- **Job search** with live listings from the Adzuna API
- **AI Resume Matcher:** upload your resume and get a match score, strengths, missing skills and recommendations for a job
- **PDF resume upload** with text extraction using PDF.js
- **AI Interview Preparation:** role-specific interview questions generated with Gemini
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

# Backend
cd backend
npm install
cp .env.example .env     # then fill in your values
npm start

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Environment Variables

Create a `.env` in the backend folder (see `.env.example`):

```env
MONGODB_URI=
JWT_SECRET=
GEMINI_API_KEY=
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
```

## Author

**Gopal Nayak** · [Portfolio](https://gopalnayak980.github.io/gopal-portfolio) · [LinkedIn](https://www.linkedin.com/in/gopalnayak2005)

## License

MIT
