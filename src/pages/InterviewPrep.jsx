import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Button, Badge, Card, EmptyState } from '../components/ui'
import {
  HiOutlineSparkles,
  HiOutlineChatBubbleLeftRight,
  HiOutlineLightBulb,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineClipboardDocument,
  HiOutlineClipboardDocumentCheck,
  HiOutlineArrowPath,
  HiOutlineExclamationTriangle,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineRocketLaunch,
  HiOutlineCheck,
} from 'react-icons/hi2'

const jobRoles = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'React Developer',
  'Node.js Developer',
  'Python Developer',
  'AI/ML Engineer',
  'DevOps Engineer',
  'Data Scientist',
  'Mobile Developer',
]

const experienceLevels = [
  {
    value: 'fresher',
    title: 'Fresher / Entry Level',
    subtitle: '0 - 1 year of experience',
    icon: <HiOutlineAcademicCap className="w-5 h-5 text-indigo-600" />,
  },
  {
    value: 'junior',
    title: 'Junior Professional',
    subtitle: '1 - 3 years of experience',
    icon: <HiOutlineBriefcase className="w-5 h-5 text-violet-600" />,
  },
  {
    value: 'mid',
    title: 'Mid / Senior Level',
    subtitle: '3 - 5+ years of experience',
    icon: <HiOutlineRocketLaunch className="w-5 h-5 text-cyan-600" />,
  },
]

const InterviewPrep = () => {
  const { user } = useAuth()
  const [selectedRole, setSelectedRole] = useState('')
  const [experience, setExperience] = useState('fresher')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(null)
  const [copiedIndex, setCopiedIndex] = useState(null)

  const handleGenerate = async () => {
    if (!selectedRole) {
      setError('Please select a target job role before generating questions.')
      return
    }

    setError('')
    setLoading(true)
    setQuestions([])
    setActiveQuestionIndex(0)

    try {
      const res = await API.post('/ai/interview', {
        role: selectedRole,
        experience,
      })
      if (Array.isArray(res.data?.questions) && res.data.questions.length > 0) {
        setQuestions(res.data.questions)
      } else {
        setError('No questions returned from AI. Please try again.')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to generate interview questions. Please verify your connection or try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2500)
    } catch {
      // Fallback
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 py-20">
        <div className="max-w-md mx-auto px-4">
          <Card padding="lg" className="text-center shadow-card border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <HiOutlineChatBubbleLeftRight className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to Practice Interviews</h2>
            <p className="text-sm text-slate-600 mb-6">
              Log in to generate role-specific interview question sets with comprehensive model answers and expert tips.
            </p>
            <div className="flex flex-col gap-2.5">
              <Link to="/login">
                <Button variant="primary" size="lg" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="md" className="w-full">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="ai" size="sm" dot>
              <HiOutlineSparkles className="w-3.5 h-3.5 text-violet-600 mr-1" />
              Gemini AI Practice Engine
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            AI Interview Prep
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
            Select your target career path and experience level to generate targeted interview questions with model answers and tips.
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center justify-between shadow-subtle">
            <div className="flex items-center gap-2.5">
              <HiOutlineExclamationTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError('')}
              className="text-rose-500 hover:text-rose-700 text-xs font-semibold uppercase tracking-wider"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Setup Card */}
        <Card padding="lg" className="border-slate-200 shadow-card mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Step 1: Select Role (7 cols) */}
            <div className="lg:col-span-7">
              <h2 className="text-base font-bold text-slate-900 mb-1">
                Step 1: Choose Your Role
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Select the technical position you are interviewing for:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {jobRoles.map((role) => {
                  const isSelected = selectedRole === role
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`
                        p-3 rounded-xl border text-xs font-semibold transition-all text-left flex items-center justify-between
                        ${isSelected
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }
                      `}
                    >
                      <span className="truncate">{role}</span>
                      {isSelected && <HiOutlineCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-1" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Step 2: Experience Level & Trigger (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-1">
                  Step 2: Experience Level
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  AI will adjust question complexity based on your seniority:
                </p>

                <div className="space-y-2.5">
                  {experienceLevels.map((lvl) => {
                    const isSelected = experience === lvl.value
                    return (
                      <div
                        key={lvl.value}
                        onClick={() => setExperience(lvl.value)}
                        className={`
                          p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between
                          ${isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-subtle">
                            {lvl.icon}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{lvl.title}</p>
                            <p className="text-[11px] text-slate-500">{lvl.subtitle}</p>
                          </div>
                        </div>
                        {isSelected && <HiOutlineCheck className="w-4 h-4 text-indigo-600" />}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Generate CTA Button */}
              <div className="pt-2">
                <Button
                  variant="ai"
                  size="lg"
                  className="w-full shadow-btn-ai py-3"
                  isLoading={loading}
                  onClick={handleGenerate}
                  leftIcon={!loading && <HiOutlineSparkles className="w-4 h-4" />}
                >
                  {loading ? 'Generating 8 Interview Questions...' : 'Generate Interview Questions'}
                </Button>
              </div>
            </div>

          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card padding="lg" className="border-slate-200 shadow-card text-center py-16 space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin flex items-center justify-center">
                <HiOutlineChatBubbleLeftRight className="w-6 h-6 text-indigo-600 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Crafting targeted interview questions for {selectedRole}...
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
                Gemini AI is structuring technical concepts, scenario challenges, model answers, and evaluation criteria.
              </p>
            </div>
          </Card>
        )}

        {/* Generated Questions List View */}
        {!loading && questions.length > 0 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Results Title Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {questions.length} Interview Questions for {selectedRole}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target Level: <span className="font-semibold capitalize text-indigo-600">{experience}</span> • Click any question to reveal the recommended answer and tip
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                leftIcon={<HiOutlineArrowPath className="w-3.5 h-3.5" />}
                onClick={handleGenerate}
              >
                Generate New Set
              </Button>
            </div>

            {/* Questions Accordion Cards */}
            <div className="space-y-3.5">
              {questions.map((q, idx) => {
                const isOpen = activeQuestionIndex === idx
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden transition-all duration-200"
                  >
                    {/* Accordion Question Header */}
                    <button
                      type="button"
                      onClick={() => setActiveQuestionIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <div className="flex items-start gap-3.5">
                        <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100/80">
                          {idx + 1}
                        </span>
                        <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {q.question}
                        </p>
                      </div>

                      <div className="p-1 rounded-lg text-slate-400 shrink-0">
                        {isOpen ? (
                          <HiOutlineChevronUp className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <HiOutlineChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </button>

                    {/* Accordion Body: Answer + Tip + Copy Action */}
                    {isOpen && (
                      <div className="px-5 pb-6 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-4 animate-in fade-in duration-200">
                        
                        {/* Suggested Answer */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                              <HiOutlineCheck className="w-4 h-4 text-emerald-600" />
                              Suggested Model Answer
                            </span>

                            {q.answer && (
                              <button
                                type="button"
                                onClick={() => handleCopy(q.answer, idx)}
                                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                                aria-label="Copy suggested answer"
                              >
                                {copiedIndex === idx ? (
                                  <>
                                    <HiOutlineClipboardDocumentCheck className="w-4 h-4 text-emerald-600" />
                                    <span className="text-emerald-600">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <HiOutlineClipboardDocument className="w-4 h-4" />
                                    <span>Copy Answer</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          <div className="p-4 rounded-xl bg-white border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line shadow-subtle">
                            {q.answer}
                          </div>
                        </div>

                        {/* Interview Tip Callout */}
                        {q.tip && (
                          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5">
                            <HiOutlineLightBulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-xs font-bold text-amber-900 block mb-0.5">
                                Interviewer's Evaluation Tip
                              </span>
                              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                {q.tip}
                              </p>
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                )
              })}
            </div>

          </div>
        )}

        {/* Initial Empty State */}
        {!loading && questions.length === 0 && (
          <EmptyState
            title="Ready to master your technical interviews?"
            description="Select your target job role and experience level above, then click 'Generate Interview Questions' to receive AI-curated practice scenarios."
            action={
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (!selectedRole) setSelectedRole('Frontend Developer')
                  handleGenerate()
                }}
              >
                Start with Frontend Developer
              </Button>
            }
          />
        )}

      </div>
    </div>
  )
}

export default InterviewPrep