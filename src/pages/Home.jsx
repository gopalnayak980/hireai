import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Badge, Card } from '../components/ui'
import {
  HiOutlineSparkles,
  HiOutlineMagnifyingGlass,
  HiOutlineChatBubbleLeftRight,
  HiOutlineBookmark,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineCheck,
} from 'react-icons/hi2'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white via-slate-50/80 to-slate-50 border-b border-slate-200/60">
        {/* Subtle background ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-violet-500/10 to-cyan-500/10 blur-3xl pointer-events-none -z-10 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="flex justify-center lg:justify-start">
                <Badge variant="ai" size="md" dot>
                  <HiOutlineSparkles className="w-3.5 h-3.5 text-violet-600 mr-1" />
                  Next-Gen AI Career Platform
                </Badge>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Find Jobs.{' '}
                <span className="text-gradient-ai block sm:inline">Match Smarter.</span>{' '}
                Get Hired.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                AI-powered tools to discover relevant jobs, understand your resume match, and prepare for interviews with real-time feedback.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start">
                <Link to="/real-jobs">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto shadow-btn-primary"
                    rightIcon={<HiOutlineArrowRight className="w-4 h-4" />}
                  >
                    Find Jobs
                  </Button>
                </Link>

                <Link to="/ai-match">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto"
                    leftIcon={<HiOutlineSparkles className="w-4 h-4 text-violet-600" />}
                  >
                    Analyze My Resume
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <HiOutlineCheck className="w-4 h-4 text-emerald-600" />
                  <span>Real-time Live Job Feed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HiOutlineCheck className="w-4 h-4 text-emerald-600" />
                  <span>Instant ATS Resume Analysis</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HiOutlineCheck className="w-4 h-4 text-emerald-600" />
                  <span>Free to get started</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive AI UI Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Main Hero Card Container */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-card-hover p-6 sm:p-7 relative overflow-hidden backdrop-blur-sm">
                  
                  {/* Top Bar / Job Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                        <HiOutlineBriefcase className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Frontend Engineer</h2>
                        <p className="text-xs text-indigo-600 font-medium">Google • Bangalore</p>
                      </div>
                    </div>
                    <Badge variant="success" size="sm" dot>
                      Live Job
                    </Badge>
                  </div>

                  {/* AI Match Gauge & Score Section */}
                  <div className="my-5 p-4 rounded-xl bg-gradient-to-br from-indigo-50/70 via-violet-50/50 to-cyan-50/40 border border-indigo-100/80">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <HiOutlineSparkles className="w-4 h-4 text-violet-600" />
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          AI Resume Match
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        High Match
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight">94%</span>
                      <span className="text-xs text-slate-500 font-medium">Strong profile fit</span>
                    </div>

                    <div className="w-full bg-slate-200/80 rounded-full h-2 mt-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-600 to-emerald-500 h-2 rounded-full w-[94%]" />
                    </div>
                  </div>

                  {/* Skills Matched Chips */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-600">Matched Core Competencies</p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="primary" size="sm">React.js</Badge>
                      <Badge variant="primary" size="sm">JavaScript</Badge>
                      <Badge variant="primary" size="sm">Tailwind CSS</Badge>
                      <Badge variant="neutral" size="sm">REST APIs</Badge>
                    </div>
                  </div>

                  {/* Simulated Action */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">12 - 18 LPA • Full Time</span>
                    <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                      Ready to Apply <HiOutlineArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Floating Micro-Card: Interview Guidance */}
                <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-card p-3.5 items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <HiOutlineCheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">AI Interview Prep</p>
                    <p className="text-[11px] text-slate-500">10 Role-specific Q&As ready</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. TRUST / PRODUCT STATS */}
      <section className="relative z-10 -mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <Card padding="md" className="text-center shadow-subtle hover:shadow-card">
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 tracking-tight">3,800+</p>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">Live Job Openings</p>
          </Card>

          <Card padding="md" className="text-center shadow-subtle hover:shadow-card">
            <p className="text-2xl sm:text-3xl font-extrabold text-violet-600 tracking-tight">Instant</p>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">AI Resume Matching</p>
          </Card>

          <Card padding="md" className="text-center shadow-subtle hover:shadow-card">
            <p className="text-2xl sm:text-3xl font-extrabold text-cyan-600 tracking-tight">10+ Roles</p>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">AI Interview Practice</p>
          </Card>

          <Card padding="md" className="text-center shadow-subtle hover:shadow-card">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">100%</p>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">Secure & Private</p>
          </Card>
        </div>
      </section>

      {/* 3. FEATURE SECTION */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="primary" size="md" className="mb-3">
            Comprehensive Suite
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Everything you need to get hired
          </h2>
          <p className="text-base text-slate-600 mt-3.5 leading-relaxed">
            From discovering live openings to cracking technical interviews, HireAI gives you the tools to land your next opportunity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <Card hover padding="lg" className="flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
                <HiOutlineMagnifyingGlass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Real-Time Job Search</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Discover live opportunities using integrated job data with role, location, and salary filtering.
              </p>
            </div>
            <div className="pt-6">
              <Link to="/real-jobs" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">
                Explore live jobs <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          {/* Card 2 */}
          <Card hover padding="lg" className="flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center mb-5">
                <HiOutlineSparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI Resume Match</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                See how closely your resume matches a job and identify skill gaps with deep ATS recommendations.
              </p>
            </div>
            <div className="pt-6">
              <Link to="/ai-match" className="text-xs font-semibold text-violet-600 hover:text-violet-700 inline-flex items-center gap-1">
                Analyze resume <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          {/* Card 3 */}
          <Card hover padding="lg" className="flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                <HiOutlineChatBubbleLeftRight className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI Interview Prep</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Practice role-specific interview questions with AI-generated guidance, answers, and expert tips.
              </p>
            </div>
            <div className="pt-6">
              <Link to="/interview-prep" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
                Practice interview <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          {/* Card 4 */}
          <Card hover padding="lg" className="flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mb-5">
                <HiOutlineBookmark className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Application Tracking</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Keep track of saved jobs and your application progress all in one unified candidate dashboard.
              </p>
            </div>
            <div className="pt-6">
              <Link to="/dashboard" className="text-xs font-semibold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1">
                View dashboard <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

        </div>
      </section>

      {/* 4. HOW HIREAI WORKS */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="neutral" size="md" className="mb-3">
              Streamlined Workflow
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              How HireAI Works
            </h2>
            <p className="text-base text-slate-600 mt-3.5">
              Three straightforward steps to accelerate your career progression.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-200/70 relative">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-md shadow-indigo-500/20 mb-5">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Discover</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Search thousands of real job opportunities matching your target tech stack, salary expectations, and location.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-200/70 relative">
              <div className="w-12 h-12 rounded-full bg-violet-600 text-white font-bold text-base flex items-center justify-center shadow-md shadow-violet-500/20 mb-5">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Match</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Use AI to understand your resume and job compatibility with skill gap analysis and actionable recommendations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-200/70 relative">
              <div className="w-12 h-12 rounded-full bg-cyan-600 text-white font-bold text-base flex items-center justify-center shadow-md shadow-cyan-500/20 mb-5">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Prepare</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Practice role-specific interview questions and answers generated by AI to maximize your confidence.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. AI CAPABILITIES SECTION */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-2xl relative overflow-hidden">
          
          {/* Ambient glow accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-4">
              <HiOutlineSparkles className="w-3.5 h-3.5 text-indigo-400" />
              Intelligent Career Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Your AI-powered career companion
            </h2>
            <p className="text-base text-slate-300 mt-4 leading-relaxed font-normal">
              HireAI combines live marketplace data with generative AI to give candidates a competitive edge at every stage of their search.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <HiOutlineDocumentText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Resume Match</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Analyze your resume against any job description to uncover keyword density, strengths, and missing requirements.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center mb-4">
                <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Interview Preparation</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Generate targeted technical, conceptual, and behavioral questions customized to your experience level.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <HiOutlineChartBar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Career Guidance</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Receive practical suggestions and skill recommendations to refine your resume and improve match rates.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. JOB SEARCH CTA */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-50 via-violet-50 to-slate-50 border border-indigo-100 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-card">
          <div className="max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Ready to find your next opportunity?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Explore live job openings and find roles that match your skills.
            </p>
          </div>
          <Link to="/real-jobs" className="shrink-0">
            <Button
              variant="primary"
              size="lg"
              className="shadow-btn-primary"
              rightIcon={<HiOutlineArrowRight className="w-4 h-4" />}
            >
              Explore Jobs
            </Button>
          </Link>
        </div>
      </section>

      {/* 7. FINAL DYNAMIC CTA */}
      <section className="py-16 lg:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {user ? (
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Continue your career journey, {user.name}.
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Jump back into your dashboard, review your saved jobs, or run a new AI resume match.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center pt-2">
              <Link to="/dashboard">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/real-jobs">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Browse Live Jobs
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Start your job search with HireAI.
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto leading-relaxed">
              Create your account to save jobs, track applications, and unlock AI-powered resume matching.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center pt-2">
              <Link to="/register">
                <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-btn-primary">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>

    </div>
  )
}

export default Home