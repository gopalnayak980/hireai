import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { extractTextFromPDF } from '../utils/pdfExtractor'
import { getAiErrorMessage, normalizeInterviewEvaluation, normalizeInterviewReport, normalizeInterviewResponse } from '../utils/aiValidation'
import { Button, Badge, Card, EmptyState } from '../components/ui'
import {
  HiOutlineSparkles,
  HiOutlineChatBubbleLeftRight,
  HiOutlineExclamationTriangle,
  HiOutlineArrowPath,
  HiOutlineTrash,
  HiOutlineClipboardDocument,
  HiOutlineClipboardDocumentCheck,
} from 'react-icons/hi2'

const jobRoles = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'React Developer',
  'Node.js Developer', 'Python Developer', 'AI/ML Engineer', 'DevOps Engineer',
  'Data Scientist', 'Mobile Developer',
]
const experienceLevels = [
  { value: 'fresher', title: 'Fresher / Entry Level', subtitle: '0–1 year' },
  { value: 'junior', title: 'Junior Professional', subtitle: '1–3 years' },
  { value: 'mid', title: 'Mid / Senior Level', subtitle: '3–5+ years' },
]
const categories = [
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'hr', label: 'HR' },
]
const difficulties = ['easy', 'medium', 'hard']
const sessionLengths = [3, 5, 8, 12]
const MAX_RESUME_SIZE = 5 * 1024 * 1024
const MAX_RESUME_TEXT = 20000
const MAX_JOB_DESCRIPTION = 12000

const InterviewPrep = () => {
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  const requestInFlight = useRef(false)
  const [selectedRole, setSelectedRole] = useState('')
  const [experience, setExperience] = useState('fresher')
  const [category, setCategory] = useState('technical')
  const [difficulty, setDifficulty] = useState('medium')
  const [sessionLength, setSessionLength] = useState(5)
  const [jobDescription, setJobDescription] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [resumeName, setResumeName] = useState('')
  const [resumeError, setResumeError] = useState('')
  const [isExtractingResume, setIsExtractingResume] = useState(false)
  const [questions, setQuestions] = useState([])
  const [responses, setResponses] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [evaluation, setEvaluation] = useState(null)
  const [report, setReport] = useState(null)
  const [phase, setPhase] = useState('setup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [historyPage, setHistoryPage] = useState(1)
  const [historyHasMore, setHistoryHasMore] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')
  const [historyDetails, setHistoryDetails] = useState(null)
  const [historyDetailLoading, setHistoryDetailLoading] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const [sessionSaveError, setSessionSaveError] = useState('')
  const [historySaving, setHistorySaving] = useState(false)
  const [copiedAnswer, setCopiedAnswer] = useState(false)

  useEffect(() => {
    let isCurrent = true
    if (!user) {
      setHistory([])
      setHistoryLoading(false)
      return () => { isCurrent = false }
    }
    setHistoryLoading(true)
    setHistoryError('')
    API.get('/interview-sessions', { params: { page: historyPage } })
      .then((response) => {
        if (isCurrent && Array.isArray(response.data?.sessions)) {
          setHistory(response.data.sessions)
          setHistoryHasMore(response.data.hasMore === true)
        }
        else if (isCurrent) setHistoryError('Interview history response was unexpected.')
      })
      .catch(() => { if (isCurrent) setHistoryError('Unable to load interview history.') })
      .finally(() => { if (isCurrent) setHistoryLoading(false) })
    return () => { isCurrent = false }
  }, [user, historyPage])

  const handleResumeFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setResumeError('')
    setResumeText('')
    setResumeName('')
    if (file.size <= 0 || file.size > MAX_RESUME_SIZE) {
      setResumeError('Choose a non-empty PDF or TXT file up to 5 MB.')
      return
    }
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'txt'].includes(extension)) {
      setResumeError('Interview resume upload supports text-based PDF and TXT files.')
      return
    }
    setIsExtractingResume(true)
    try {
      const extracted = extension === 'pdf'
        ? await extractTextFromPDF(await file.arrayBuffer())
        : await file.text()
      const text = typeof extracted === 'string' ? extracted.trim() : ''
      if (!text) {
        setResumeError('No selectable text was found. Paste resume text below instead.')
      } else if (text.length > MAX_RESUME_TEXT) {
        setResumeError('Extracted resume text exceeds the 20,000-character limit. Paste a shorter version.')
      } else {
        setResumeText(text)
        setResumeName(file.name)
      }
    } catch {
      setResumeError('Unable to extract this file. Paste resume text below instead.')
    } finally {
      setIsExtractingResume(false)
    }
  }

  const resetSession = () => {
    requestInFlight.current = false
    setQuestions([])
    setResponses([])
    setCurrentIndex(0)
    setAnswer('')
    setEvaluation(null)
    setReport(null)
    setSessionSaveError('')
    setError('')
    setPhase('setup')
    setLoading(false)
  }

  const generateSession = async () => {
    if (requestInFlight.current || loading || isExtractingResume) return
    if (!selectedRole) {
      setError('Choose a target role to start your interview session.')
      return
    }
    if (resumeText.length > MAX_RESUME_TEXT || jobDescription.length > MAX_JOB_DESCRIPTION) {
      setError('Resume text or job description exceeds the allowed length.')
      return
    }
    resetSession()
    requestInFlight.current = true
    setLoading(true)
    setError('')
    try {
      const response = await API.post('/ai/interview', {
        role: selectedRole,
        experience,
        category,
        difficulty,
        length: sessionLength,
        ...(jobDescription.trim() ? { jobDescription: jobDescription.trim() } : {}),
        ...(resumeText.trim() ? { resumeText: resumeText.trim() } : {}),
      })
      const normalizedQuestions = normalizeInterviewResponse(response.data)
      if (!normalizedQuestions || normalizedQuestions.length !== sessionLength) {
        setError('The AI returned an incomplete question set. Please try again.')
        return
      }
      setQuestions(normalizedQuestions)
      setPhase('answer')
    } catch (requestError) {
      setError(getAiErrorMessage(requestError, 'Unable to generate this interview. Please try again.'))
    } finally {
      requestInFlight.current = false
      setLoading(false)
    }
  }

  const saveSessionRecord = async (completedResponses, completedReport) => {
    const savedResponse = await API.post('/interview-sessions', {
      role: selectedRole,
      experience,
      category,
      difficulty,
      responses: completedResponses.map((item) => ({
        question: item.question,
        answer: item.answer,
        category: item.category,
        evaluation: item.evaluation,
      })),
      report: completedReport,
    })
    const savedSession = savedResponse.data
    setHistoryPage(1)
    setHistory((current) => [{
      _id: savedSession._id,
      role: savedSession.role,
      experience: savedSession.experience,
      category: savedSession.category,
      difficulty: savedSession.difficulty,
      report: { overallScore: savedSession.report?.overallScore },
      createdAt: savedSession.createdAt,
    }, ...current].slice(0, 20))
    setSessionSaveError('')
  }

  const completeSession = async (completedResponses) => {
    if (!completedResponses.length) {
      setError('Answer and evaluate at least one question before finishing the session.')
      return
    }
    const response = await API.post('/ai/interview/report', {
      role: selectedRole,
      experience,
      category,
      difficulty,
      ...(jobDescription.trim() ? { jobDescription: jobDescription.trim() } : {}),
      responses: completedResponses.map((item) => ({
        question: item.question,
        answer: item.answer,
        score: item.evaluation.score,
        whatWentWell: item.evaluation.whatWentWell,
        improvements: item.evaluation.improvements,
        missingConcepts: item.evaluation.missingConcepts,
      })),
    })
    const normalizedReport = normalizeInterviewReport(response.data)
    if (!normalizedReport) throw new Error('The AI returned an incomplete final report.')
    setResponses(completedResponses)
    setReport(normalizedReport)
    setPhase('report')
    setSessionSaveError('')
    try {
      await saveSessionRecord(completedResponses, normalizedReport)
    } catch {
      setSessionSaveError('Your report is ready, but this session could not be saved to history.')
    }
  }

  const retrySessionSave = async () => {
    if (historySaving || !report || !responses.length) return
    setHistorySaving(true)
    try {
      await saveSessionRecord(responses, report)
    } catch {
      setSessionSaveError('The session still could not be saved. Please try again later.')
    } finally {
      setHistorySaving(false)
    }
  }

  const evaluateAnswer = async () => {
    if (requestInFlight.current || !answer.trim()) {
      if (!answer.trim()) setError('Write an answer before requesting feedback.')
      return
    }
    if (answer.length > 8000) {
      setError('Keep your answer under 8,000 characters.')
      return
    }
    requestInFlight.current = true
    setLoading(true)
    setError('')
    try {
      const question = questions[currentIndex]
      const response = await API.post('/ai/interview/evaluate', {
        role: selectedRole,
        experience,
        category: question.category,
        difficulty,
        question: question.question,
        answer: answer.trim(),
        ...(jobDescription.trim() ? { jobDescription: jobDescription.trim() } : {}),
      })
      const normalizedEvaluation = normalizeInterviewEvaluation(response.data)
      if (!normalizedEvaluation) {
        setError('The AI returned an incomplete evaluation. Please try again.')
        return
      }
      setEvaluation(normalizedEvaluation)
      setPhase('feedback')
    } catch (requestError) {
      setError(getAiErrorMessage(requestError, 'Unable to evaluate your answer. Please try again.'))
    } finally {
      requestInFlight.current = false
      setLoading(false)
    }
  }

  const finalizeSession = async (completedResponses) => {
    if (requestInFlight.current) return
    requestInFlight.current = true
    setLoading(true)
    setError('')
    try {
      await completeSession(completedResponses)
    } catch (requestError) {
      setError(getAiErrorMessage(requestError, requestError.message || 'Unable to create the final report. Please try again.'))
    } finally {
      requestInFlight.current = false
      setLoading(false)
    }
  }

  const advanceSession = async (finishNow = false) => {
    if (requestInFlight.current || !evaluation || !questions[currentIndex]) return
    const completedResponses = [...responses, {
      question: questions[currentIndex].question,
      answer: answer.trim(),
      category: questions[currentIndex].category,
      evaluation,
    }]
    const isLast = currentIndex >= questions.length - 1
    if (finishNow || isLast) {
      await finalizeSession(completedResponses)
      return
    }
    setResponses(completedResponses)
    setCurrentIndex((index) => index + 1)
    setAnswer('')
    setEvaluation(null)
    setError('')
    setPhase('answer')
  }

  const viewHistorySession = async (id) => {
    if (historyDetails?._id === id) {
      setHistoryDetails(null)
      return
    }
    setHistoryDetailLoading(true)
    setHistoryError('')
    try {
      const response = await API.get(`/interview-sessions/${encodeURIComponent(id)}`)
      setHistoryDetails(response.data)
    } catch {
      setHistoryError('Unable to load that interview session.')
    } finally {
      setHistoryDetailLoading(false)
    }
  }

  const deleteHistorySession = async (id) => {
    setDeletingId(id)
    try {
      await API.delete(`/interview-sessions/${encodeURIComponent(id)}`)
      setHistory((current) => current.filter((session) => session._id !== id))
      if (historyDetails?._id === id) setHistoryDetails(null)
      setPendingDeleteId('')
    } catch {
      setHistoryError('Unable to delete that interview session. Please try again.')
    } finally {
      setDeletingId('')
    }
  }

  const copySampleAnswer = async () => {
    try {
      await navigator.clipboard.writeText(evaluation.sampleAnswer)
      setCopiedAnswer(true)
      window.setTimeout(() => setCopiedAnswer(false), 2000)
    } catch {
      setError('Unable to copy the sample answer in this browser.')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 py-20">
        <div className="max-w-md mx-auto px-4">
          <Card padding="lg" className="text-center shadow-card border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4"><HiOutlineChatBubbleLeftRight className="w-7 h-7" /></div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Sign in to Practice Interviews</h1>
            <p className="text-sm text-slate-600 mb-6">Interview practice and session history are available to signed-in users.</p>
            <div className="flex flex-col gap-2.5">
              <Button as={Link} to="/login" variant="primary" size="lg" className="w-full">Sign In</Button>
              <Button as={Link} to="/register" variant="secondary" size="md" className="w-full">Create Free Account</Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = questions.length ? Math.round((responses.length + (phase === 'feedback' ? 1 : 0)) / questions.length * 100) : 0

  return (
    <main className="min-h-screen bg-slate-50 py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-7">
          <Badge variant="ai" size="sm" dot><HiOutlineSparkles className="mr-1 h-3.5 w-3.5 text-violet-600" /> Gemini AI Practice Engine</Badge>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">AI Interview Prep</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">Practice role-specific questions one at a time and get constructive feedback on each answer.</p>
        </header>

        {error && <div role="alert" className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><HiOutlineExclamationTriangle className="h-5 w-5 shrink-0" />{error}</div>}

        {phase === 'setup' && !loading && (
          <Card padding="lg" className="mb-8 border-slate-200 shadow-card">
            <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
              <section>
                <h2 className="text-base font-bold text-slate-900">Choose your target role</h2>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {jobRoles.map((role) => <button key={role} type="button" onClick={() => setSelectedRole(role)} aria-pressed={selectedRole === role} className={`rounded-xl border p-3 text-left text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${selectedRole === role ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>{role}</button>)}
                </div>
                <label className="mt-5 block text-xs font-semibold text-slate-700" htmlFor="interview-experience">Experience level</label>
                <select id="interview-experience" value={experience} onChange={(event) => setExperience(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm">
                  {experienceLevels.map((level) => <option key={level.value} value={level.value}>{level.title} ({level.subtitle})</option>)}
                </select>
                <label className="mt-4 block text-xs font-semibold text-slate-700" htmlFor="interview-category">Interview category</label>
                <select id="interview-category" value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm">
                  {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </section>

              <section className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label htmlFor="interview-difficulty" className="block text-xs font-semibold text-slate-700">Difficulty</label><select id="interview-difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm">{difficulties.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></div>
                  <div><label htmlFor="interview-length" className="block text-xs font-semibold text-slate-700">Questions</label><select id="interview-length" value={sessionLength} onChange={(event) => setSessionLength(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm">{sessionLengths.map((length) => <option key={length} value={length}>{length} questions</option>)}</select></div>
                </div>
                <div>
                  <label htmlFor="interview-job-description" className="block text-xs font-semibold text-slate-700">Job description <span className="font-normal text-slate-400">(optional)</span></label>
                  <textarea id="interview-job-description" rows={4} maxLength={MAX_JOB_DESCRIPTION} value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste a job description to tailor the questions." className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm" />
                  <p className="mt-1 text-right text-[11px] text-slate-400">{jobDescription.length.toLocaleString()} / {MAX_JOB_DESCRIPTION.toLocaleString()}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="interview-resume-file" className="block text-xs font-semibold text-slate-700">Resume context <span className="font-normal text-slate-400">(optional)</span></label>
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isExtractingResume} className="text-xs font-semibold text-indigo-700 hover:underline">{isExtractingResume ? 'Extracting…' : 'Upload PDF or TXT'}</button>
                  </div>
                  <input ref={fileInputRef} id="interview-resume-file" type="file" accept=".pdf,.txt,application/pdf,text/plain" onChange={handleResumeFile} className="sr-only" />
                  {resumeName && <p className="mt-1 text-xs text-emerald-700">Text extracted from {resumeName}. Resume text is used for generation only and is not saved to session history.</p>}
                  <textarea value={resumeText} maxLength={MAX_RESUME_TEXT} onChange={(event) => { setResumeText(event.target.value); setResumeName(''); setResumeError('') }} rows={4} placeholder="Or paste resume text here for more personalized questions." className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm" aria-label="Optional resume text" />
                  <p className="mt-1 text-right text-[11px] text-slate-400">{resumeText.length.toLocaleString()} / {MAX_RESUME_TEXT.toLocaleString()}</p>
                  {resumeError && <p role="alert" className="mt-1 text-xs text-rose-700">{resumeError}</p>}
                </div>
              </section>
            </div>
            <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">AI feedback is practice guidance and may not reflect every interviewer’s judgment.</p>
              <Button variant="ai" isLoading={loading || isExtractingResume} onClick={generateSession} leftIcon={!loading && <HiOutlineSparkles className="h-4 w-4" />}>Start interview</Button>
            </div>
          </Card>
        )}

        {loading && <Card padding="lg" role="status" aria-live="polite" className="mb-6 text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /><p className="mt-3 text-sm font-semibold text-slate-700">{phase === 'feedback' ? 'Preparing your report…' : phase === 'answer' ? 'Evaluating your answer…' : 'Preparing your interview…'}</p></Card>}

        {phase === 'answer' && currentQuestion && !loading && (
          <Card padding="lg" className="mb-8 border-slate-200 shadow-card">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div><Badge variant="primary" size="sm">{currentQuestion.category}</Badge><p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Question {currentIndex + 1} of {questions.length} · {difficulty}</p></div>
              <Button variant="ghost" size="sm" onClick={resetSession} leftIcon={<HiOutlineArrowPath className="h-4 w-4" />}>Restart</Button>
            </div>
            <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} /></div>
            <h2 className="text-xl font-bold leading-relaxed text-slate-900">{currentQuestion.question}</h2>
            <label htmlFor="interview-answer" className="mt-6 block text-sm font-semibold text-slate-700">Your answer</label>
            <textarea id="interview-answer" value={answer} maxLength={8000} onChange={(event) => setAnswer(event.target.value)} rows={8} placeholder="Write how you would answer this in an interview…" className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            <div className="mt-1 text-right text-[11px] text-slate-400">{answer.length.toLocaleString()} / 8,000</div>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              {responses.length > 0
                ? <Button variant="ghost" onClick={() => void finalizeSession(responses)} isLoading={loading}>Finish with {responses.length} completed answer{responses.length === 1 ? '' : 's'}</Button>
                : <Button variant="ghost" onClick={resetSession}>Discard session</Button>}
              <Button variant="ai" onClick={evaluateAnswer} isLoading={loading}>Get answer feedback</Button>
            </div>
          </Card>
        )}

        {phase === 'feedback' && currentQuestion && evaluation && !loading && (
          <div className="mb-8 space-y-5">
            <Card padding="lg" className="border-indigo-100 shadow-card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><Badge variant="primary" size="sm">Question {currentIndex + 1} · {currentQuestion.category}</Badge><h2 className="mt-3 text-lg font-bold text-slate-900">{currentQuestion.question}</h2></div><div className="shrink-0 text-center"><p className="text-3xl font-black text-indigo-700">{evaluation.score}<span className="text-base">/10</span></p><p className="text-[10px] text-slate-500">Practice score</p></div></div>
              <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">{evaluation.scoreContext}</p>
            </Card>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card padding="md"><h3 className="text-sm font-bold text-emerald-800">What went well</h3><ListItems items={evaluation.whatWentWell} empty="No specific strengths were returned." /></Card>
              <Card padding="md"><h3 className="text-sm font-bold text-amber-800">What to improve</h3><ListItems items={evaluation.improvements} empty="No specific improvement points were returned." /></Card>
              <Card padding="md"><h3 className="text-sm font-bold text-violet-800">Concepts to revisit</h3><ListItems items={evaluation.missingConcepts} empty="No additional concepts were identified." /></Card>
              {currentQuestion.answer && <Card padding="md"><h3 className="text-sm font-bold text-slate-900">Reference answer</h3><p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{currentQuestion.answer}</p>{currentQuestion.tip && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900"><span className="font-bold">Practice tip: </span>{currentQuestion.tip}</p>}</Card>}
              <Card padding="md"><div className="flex items-center justify-between gap-2"><h3 className="text-sm font-bold text-slate-900">A stronger sample answer</h3><button type="button" onClick={copySampleAnswer} className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700" aria-label="Copy sample answer">{copiedAnswer ? <HiOutlineClipboardDocumentCheck className="h-4 w-4" /> : <HiOutlineClipboardDocument className="h-4 w-4" />}{copiedAnswer ? 'Copied' : 'Copy'}</button></div><p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{evaluation.sampleAnswer}</p><p className="mt-3 text-[11px] text-slate-500">Use your own accurate experience and wording when adapting this example.</p></Card>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={resetSession}>Restart session</Button>
              {currentIndex < questions.length - 1 && <Button variant="ghost" onClick={() => advanceSession(true)} isLoading={loading}>Finish with {responses.length + 1} answer{responses.length === 0 ? '' : 's'}</Button>}
              <Button variant="ai" onClick={() => advanceSession(false)} isLoading={loading}>{currentIndex === questions.length - 1 ? 'Finish & view report' : 'Continue to next question'}</Button>
            </div>
          </div>
        )}

        {phase === 'report' && report && (
          <div className="mb-8 space-y-5">
            <Card padding="lg" className="border-indigo-100 shadow-card">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left"><div><Badge variant="ai" size="sm">Interview report</Badge><h2 className="mt-2 text-2xl font-extrabold text-slate-900">Practice session complete</h2><p className="mt-1 text-sm text-slate-600">{selectedRole} · {experience} · {category}</p></div><div className="text-4xl font-black text-indigo-700">{report.overallScore}<span className="text-lg">/100</span></div></div>
              <p className="mt-4 text-xs text-slate-500">This score summarizes practice feedback. It is not an objective measure or a hiring prediction.</p>
            </Card>
            {sessionSaveError && <div role="status" className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between"><span>{sessionSaveError}</span><Button variant="secondary" size="sm" isLoading={historySaving} onClick={() => void retrySessionSave()}>Retry saving</Button></div>}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card padding="md"><h3 className="text-sm font-bold text-emerald-800">Strongest areas</h3><ListItems items={report.strongestAreas} empty="No clear strength pattern was identified." /></Card>
              <Card padding="md"><h3 className="text-sm font-bold text-amber-800">Areas to strengthen</h3><ListItems items={report.weakAreas} empty="No repeated weakness was identified." /></Card>
              <Card padding="md"><h3 className="text-sm font-bold text-slate-900">Communication</h3><p className="mt-2 text-sm leading-relaxed text-slate-700">{report.communicationFeedback}</p></Card>
              <Card padding="md"><h3 className="text-sm font-bold text-slate-900">Answer structure</h3><p className="mt-2 text-sm leading-relaxed text-slate-700">{report.answerStructureFeedback}</p></Card>
              <Card padding="md"><h3 className="text-sm font-bold text-violet-800">Topics to revise</h3><ListItems items={report.topicsToRevise} empty="No specific revision topics were returned." /></Card>
              <Card padding="md"><h3 className="text-sm font-bold text-indigo-800">Preparation recommendations</h3><ListItems items={report.recommendations} empty="No additional recommendations were returned." /></Card>
            </div>
            <div className="flex justify-end"><Button variant="ai" onClick={resetSession} leftIcon={<HiOutlineArrowPath className="h-4 w-4" />}>Start another session</Button></div>
          </div>
        )}

        <section className="mt-10" aria-label="Interview session history">
          <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-slate-900">Session history</h2><p className="mt-1 text-xs text-slate-500">Only completed sessions are saved. Resume text and job descriptions are not stored.</p></div>{historyLoading && <span role="status" className="text-xs text-slate-500">Loading…</span>}</div>
          {historyError && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{historyError}<button type="button" onClick={() => setHistoryError('')} className="ml-3 underline">Dismiss</button></div>}
          {historyLoading ? null : history.length === 0 ? <EmptyState title="No completed sessions yet" description="Finish an AI interview practice session to see its score and feedback here." /> : (
            <div className="space-y-3">
              {history.map((session) => <Card key={session._id} padding="md" className="border-slate-200"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-bold text-slate-900">{session.role} · {session.category}</h3><p className="mt-1 text-xs text-slate-500">{session.experience} · {session.difficulty} · {new Date(session.createdAt).toLocaleDateString()}</p></div><div className="flex flex-wrap items-center gap-2"><span className="mr-1 font-bold text-indigo-700">{session.report?.overallScore ?? '—'}/100</span><Button variant="secondary" size="sm" onClick={() => void viewHistorySession(session._id)}>{historyDetails?._id === session._id ? 'Hide details' : 'View details'}</Button>{pendingDeleteId === session._id ? <><Button variant="danger" size="sm" isLoading={deletingId === session._id} onClick={() => void deleteHistorySession(session._id)}>Confirm delete</Button><Button variant="ghost" size="sm" onClick={() => setPendingDeleteId('')}>Cancel</Button></> : <Button variant="ghost" size="sm" className="text-rose-700" aria-label={`Delete ${session.role} session`} onClick={() => setPendingDeleteId(session._id)}><HiOutlineTrash className="h-4 w-4" /></Button>}</div></div>{historyDetails?._id === session._id && <HistoryDetails session={historyDetails} />}</Card>)}
              {historyDetailLoading && <Card padding="md" role="status">Loading session details…</Card>}
              <div className="flex justify-center gap-3"><Button variant="secondary" size="sm" disabled={historyPage <= 1 || historyLoading} onClick={() => setHistoryPage((page) => Math.max(1, page - 1))}>Previous sessions</Button><span className="self-center text-xs text-slate-500">Page {historyPage}</span><Button variant="secondary" size="sm" disabled={!historyHasMore || historyLoading} onClick={() => setHistoryPage((page) => page + 1)}>Next sessions</Button></div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

const ListItems = ({ items, empty }) => (
  items.length ? <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-700">{items.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p className="mt-3 text-sm text-slate-500">{empty}</p>
)

const HistoryDetails = ({ session }) => (
  <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
    {session.report && <div className="grid gap-3 sm:grid-cols-2"><div><h4 className="text-xs font-bold text-slate-700">Communication feedback</h4><p className="mt-1 text-sm text-slate-600">{session.report.communicationFeedback}</p></div><div><h4 className="text-xs font-bold text-slate-700">Answer structure</h4><p className="mt-1 text-sm text-slate-600">{session.report.answerStructureFeedback}</p></div></div>}
    {session.responses?.map((response, index) => <div key={`${index}-${response.question}`} className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-indigo-700">Question {index + 1} · {response.category} · {response.evaluation?.score}/10</p><h4 className="mt-2 text-sm font-semibold text-slate-900">{response.question}</h4><p className="mt-2 whitespace-pre-wrap text-sm text-slate-600"><span className="font-semibold">Your answer: </span>{response.answer}</p><ListItems items={response.evaluation?.improvements || []} empty="No improvement notes." /></div>)}
  </div>
)

export default InterviewPrep
