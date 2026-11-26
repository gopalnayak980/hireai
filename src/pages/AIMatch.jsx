import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import API from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Button, Badge, Card } from '../components/ui'
import { extractTextFromPDF } from '../utils/pdfExtractor'
import { getAiErrorMessage, normalizeMatchResponse } from '../utils/aiValidation'
import {
  HiOutlineSparkles,
  HiOutlineDocumentText,
  HiOutlineBriefcase,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineLightBulb,
  HiOutlineArrowPath,
  HiOutlineExclamationTriangle,
  HiOutlineCheck,
  HiOutlineArrowUpTray,
  HiOutlineDocument,
  HiOutlinePhoto,
  HiOutlineXMark,
  HiOutlineInformationCircle,
} from 'react-icons/hi2'

const targetJobs = [
  {
    id: 1,
    title: 'Frontend Developer',
  },
  {
    id: 2,
    title: 'Backend Developer',
  },
  {
    id: 3,
    title: 'Full Stack Developer',
  },
  {
    id: 4,
    title: 'Python Developer',
  },
  {
    id: 5,
    title: 'React Developer',
  },
  {
    id: 6,
    title: 'AI/ML Engineer',
  },
]

const sampleResume = `SUMMARY:
Frontend Engineer with 2+ years of experience building modern React web applications. Proficient in JavaScript, React.js, Tailwind CSS, REST APIs, Git, and responsive design.

EXPERIENCE:
Software Engineer at TechCorp (2023 - Present)
- Developed and maintained responsive client-facing web portals using React and Tailwind CSS.
- Integrated RESTful APIs with Axios and managed state using React Context.
- Optimized bundle sizes and improved Lighthouse performance scores by 25%.

SKILLS:
Languages & Frameworks: React, JavaScript, HTML5, CSS3, Tailwind CSS, Node.js basics.
Tools: Git, GitHub, VS Code, Vite, Postman.`

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'txt']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

const AIMatch = () => {
  const { user } = useAuth()
  const [resumeText, setResumeText] = useState('')
  const [selectedJob, setSelectedJob] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Uploaded resume file state
  const fileInputRef = useRef(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const processingFile = useRef(false)
  const matchRequestId = useRef(0)

  const invalidateMatchRequest = () => {
    matchRequestId.current += 1
    setResult(null)
    setError('')
    setLoading(false)
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const processFile = async (file) => {
    if (!file || processingFile.current) return

    setFileError('')

    // 1. Validate file size (<= 5MB)
    if (file.size > MAX_FILE_SIZE) {
      setFileError('File size exceeds the 5 MB limit. Please upload a smaller resume file.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (file.size === 0) {
      setFileError('This file is empty. Please choose a resume file with content.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // 2. Validate file extension
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setFileError('Unsupported file format. Please upload a PDF, DOC, DOCX, PNG, JPG, or TXT file.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    processingFile.current = true
    setIsProcessingFile(true)
    setResumeText('')
    invalidateMatchRequest()

    // 3. Update uploaded file state
    setUploadedFile({
      name: file.name,
      size: formatFileSize(file.size),
      ext: extension,
      isExtracted: false,
    })

    try {
      // 4. Safe client-side extraction for plain text files
      if (extension === 'txt') {
        const text = await file.text()
        if (text && text.trim()) {
          setResumeText(text.trim())
          setUploadedFile((prev) => (prev ? { ...prev, isExtracted: true } : null))
        } else {
          setFileError('This text file is empty. Please paste your resume text manually.')
        }
      }

      // 5. Client-side PDF extraction using pdfjs-dist
      if (extension === 'pdf') {
        setIsExtracting(true)
        const arrayBuffer = await file.arrayBuffer()
        const extractedText = await extractTextFromPDF(arrayBuffer)
        if (extractedText && extractedText.trim()) {
          setResumeText(extractedText.trim())
          setUploadedFile((prev) => (prev ? { ...prev, isExtracted: true } : null))
        } else {
          setFileError('This PDF contains no selectable text (it may be a scanned image). Please paste your resume text manually below.')
        }
      }
    } catch (err) {
      if (extension === 'pdf') {
        if (err?.name === 'PasswordException') {
          setFileError('This PDF is password protected. Please upload an unlocked PDF or paste your resume text.')
        } else {
          setFileError('Unable to extract text from this PDF. Please verify the file or paste your resume text manually.')
        }
      } else {
        setFileError('Unable to read text from file. Please paste your resume text manually.')
      }
    } finally {
      setIsExtracting(false)
      processingFile.current = false
      setIsProcessingFile(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) {
      processFile(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleRemoveFile = () => {
    if (processingFile.current) return
    setUploadedFile(null)
    setResumeText('')
    invalidateMatchRequest()
    setFileError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleMatch = async () => {
    if (processingFile.current) {
      setError('Please wait for resume processing to finish before analyzing.')
      return
    }
    if (!resumeText.trim()) {
      setError('Please paste or provide your resume text before running the analysis.')
      return
    }
    if (!selectedJob) {
      setError('Please select a target job position to compare against.')
      return
    }
    if (!jobDescription.trim()) {
      setError('Paste the target job description before running the analysis.')
      return
    }
    if (resumeText.length > 20000) {
      setError('Resume text must be 20,000 characters or fewer. Please shorten it before analyzing.')
      return
    }
    if (jobDescription.trim().length > 12000) {
      setError('Job description must be 12,000 characters or fewer.')
      return
    }

    const requestId = ++matchRequestId.current
    setError('')
    setLoading(true)
    setResult(null)

    try {
      const res = await API.post('/ai/match', {
        resumeText: resumeText.trim(),
        jobTitle: selectedJob.title,
        jobDescription: jobDescription.trim(),
        skills: [],
      })
      if (requestId !== matchRequestId.current) return

      const normalizedResult = normalizeMatchResponse(res.data)
      if (!normalizedResult) {
        setError('The AI returned an unexpected analysis. Please try again.')
        return
      }
      setResult(normalizedResult)
    } catch (err) {
      if (requestId === matchRequestId.current) {
        setError(getAiErrorMessage(err, 'AI analysis failed. Please try again.'))
      }
    } finally {
      if (requestId === matchRequestId.current) {
        setLoading(false)
      }
    }
  }

  const handleLoadSampleResume = () => {
    if (processingFile.current) return
    setResumeText(sampleResume)
    setUploadedFile(null)
    invalidateMatchRequest()
    setFileError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (!selectedJob) {
      setSelectedJob(targetJobs[0])
    }
  }

  const handleReset = () => {
    invalidateMatchRequest()
  }

  const handleResumeTextChange = (text) => {
    setResumeText(text)
    invalidateMatchRequest()
    setUploadedFile((previous) => previous ? { ...previous, isExtracted: false } : null)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 py-20">
        <div className="max-w-md mx-auto px-4">
          <Card padding="lg" className="text-center shadow-card border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <HiOutlineSparkles className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to use AI Match</h2>
            <p className="text-sm text-slate-600 mb-6">
              Create an account or log in to unlock AI-powered resume matching and personalized skill gap analysis.
            </p>
            <div className="flex flex-col gap-2.5">
              <Button as={Link} to="/login" variant="primary" size="lg" className="w-full">
                Sign In
              </Button>
              <Button as={Link} to="/register" variant="secondary" size="md" className="w-full">
                Create Free Account
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Determine score color semantics
  const getScoreTheme = (score) => {
    if (score >= 70) {
      return {
        text: 'text-emerald-700',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        bar: 'from-indigo-600 to-emerald-500',
        label: 'Strong Match',
      }
    }
    if (score >= 50) {
      return {
        text: 'text-amber-700',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        bar: 'from-indigo-600 to-amber-500',
        label: 'Good Match',
      }
    }
    return {
      text: 'text-rose-700',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      bar: 'from-indigo-600 to-rose-500',
      label: 'Needs Skill Alignment',
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="ai" size="sm" dot>
              <HiOutlineSparkles className="w-3.5 h-3.5 text-violet-600 mr-1" />
              Gemini AI Engine
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            AI Resume Match
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
            See how well your resume matches a target job and discover actionable suggestions to improve your compatibility.
          </p>
        </div>

        {/* 4-Step Workflow Bar */}
        <div className="mb-8 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hidden sm:grid grid-cols-4 gap-4 text-center">
          <div className="flex items-center gap-2.5 justify-center">
            <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${resumeText ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-600 text-white'}`}>
              1
            </span>
            <span className="text-xs font-semibold text-slate-700">Provide Resume</span>
          </div>
          <div className="flex items-center gap-2.5 justify-center border-l border-slate-100">
            <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${selectedJob ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
              2
            </span>
            <span className="text-xs font-semibold text-slate-700">Select Job</span>
          </div>
          <div className="flex items-center gap-2.5 justify-center border-l border-slate-100">
            <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${loading ? 'bg-violet-600 text-white animate-pulse' : 'bg-slate-200 text-slate-600'}`}>
              3
            </span>
            <span className="text-xs font-semibold text-slate-700">AI Analysis</span>
          </div>
          <div className="flex items-center gap-2.5 justify-center border-l border-slate-100">
            <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${result ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              4
            </span>
            <span className="text-xs font-semibold text-slate-700">View Match</span>
          </div>
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

        {/* Main Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input Form (5 cols) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Step 1: Resume Input & Upload */}
            <Card padding="lg" className="border-slate-200 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <HiOutlineDocumentText className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">Step 1: Your Resume</h2>
                </div>
                
                <button
                  type="button"
                  onClick={handleLoadSampleResume}
                  disabled={isProcessingFile}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Load Sample
                </button>
              </div>

              {/* Upload Resume Area */}
              <div className="mb-4">
                {!uploadedFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !isProcessingFile && fileInputRef.current?.click()}
                    className={`
                      border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 select-none
                      ${isDragging
                        ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-indigo-50/30 hover:border-indigo-300'
                      }
                    `}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 shadow-xs">
                      <HiOutlineArrowUpTray className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      <span className="text-indigo-600 hover:text-indigo-700 underline">Choose File</span> or drag & drop here
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      PDF, DOC, DOCX, PNG, JPG, JPEG, TXT (Max 5 MB)
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 transition-all">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center shrink-0">
                          {['png', 'jpg', 'jpeg'].includes(uploadedFile.ext) ? (
                            <HiOutlinePhoto className="w-5 h-5" />
                          ) : (
                            <HiOutlineDocument className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-900 truncate max-w-[170px] sm:max-w-[220px]">
                              {uploadedFile.name}
                            </p>
                            <Badge variant="primary" size="sm">
                              {uploadedFile.ext.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{uploadedFile.size}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isProcessingFile}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          disabled={isProcessingFile}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Remove file"
                        >
                          <HiOutlineXMark className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Extraction status & feedback */}
                    {isExtracting && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[11px] text-indigo-800 flex items-center gap-2">
                        <svg className="animate-spin h-3.5 w-3.5 text-indigo-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="font-medium">Extracting readable text from PDF resume...</span>
                      </div>
                    )}

                    {!isExtracting && uploadedFile.ext === 'pdf' && uploadedFile.isExtracted && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800 flex items-center gap-2">
                        <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>PDF text extracted successfully into editor ({resumeText.trim().split(/\s+/).filter(Boolean).length} words).</span>
                      </div>
                    )}

                    {uploadedFile.ext === 'txt' && uploadedFile.isExtracted && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800 flex items-center gap-2">
                        <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Resume text loaded successfully into editor.</span>
                      </div>
                    )}

                    {['doc', 'docx'].includes(uploadedFile.ext) && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[11px] text-indigo-900 flex items-start gap-2">
                        <HiOutlineInformationCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <span>
                          File <strong>{uploadedFile.name}</strong> selected. Binary extraction from {uploadedFile.ext.toUpperCase()} requires a dedicated document parser. Please verify or paste your text in the box below to run ATS matching.
                        </span>
                      </div>
                    )}

                    {['png', 'jpg', 'jpeg'].includes(uploadedFile.ext) && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                        <HiOutlineInformationCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          Image <strong>{uploadedFile.name}</strong> selected. Image OCR extraction requires an OCR library (e.g. Tesseract / Gemini Vision). Please paste your resume text below.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* File Error Notification */}
                {fileError && (
                  <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HiOutlineExclamationTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{fileError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFileError('')}
                      className="text-rose-500 hover:text-rose-700 p-0.5"
                    >
                      <HiOutlineXMark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Section Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-200/80" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <span className="bg-white px-2.5">Or Paste Resume Text</span>
                </div>
              </div>

              <textarea
                id="resume-text"
                rows={7}
                value={resumeText}
                onChange={(e) => handleResumeTextChange(e.target.value)}
                disabled={isProcessingFile}
                aria-label="Resume text"
                placeholder="Paste resume content here (e.g. Work experience, skills, projects, education)..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all resize-y font-mono"
              />

              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                <span>{resumeText.trim().split(/\s+/).filter(Boolean).length} words</span>
                {resumeText && (
                  <button
                    type="button"
                    onClick={() => handleResumeTextChange('')}
                    className="text-rose-500 hover:underline"
                  >
                    Clear text
                  </button>
                )}
              </div>
            </Card>

            {/* Step 2: Target Job Selection */}
            <Card padding="lg" className="border-slate-200 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                  <HiOutlineBriefcase className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Step 2: Target Role & Job Description</h2>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Choose a role focus, then paste the actual job description for a grounded comparison:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {targetJobs.map((job) => {
                  const isSelected = selectedJob?.id === job.id
                  return (
                    <button
                      type="button"
                      key={job.id}
                      onClick={() => {
                        setSelectedJob(job)
                        setJobDescription('')
                        invalidateMatchRequest()
                      }}
                      className={`
                        p-3.5 rounded-xl border cursor-pointer transition-all text-left flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                        ${isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-500/20'
                          : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                        }
                      `}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="text-xs font-bold text-slate-900 leading-tight">
                            {job.title}
                          </h3>
                          {isSelected && (
                            <HiOutlineCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-indigo-600 mt-0.5">Role focus</p>
                      </div>

                    </button>
                  )
                })}
              </div>

              <div className="mt-5">
                <label htmlFor="job-description" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target job description <span className="text-rose-600">(required)</span>
                </label>
                <textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(event) => {
                    setJobDescription(event.target.value)
                    invalidateMatchRequest()
                  }}
                  maxLength={12000}
                  rows={7}
                  placeholder="Paste the job description you want to compare your resume with. Avoid including personal contact details."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  aria-describedby="job-description-count"
                />
                <div id="job-description-count" className="mt-1 text-right text-[11px] text-slate-400">
                  {jobDescription.length.toLocaleString()} / 12,000 characters
                </div>
              </div>
            </Card>

            {/* Action Button */}
            <Button
              variant="ai"
              size="lg"
              className="w-full shadow-btn-ai py-3.5"
              isLoading={loading}
              onClick={handleMatch}
              leftIcon={!loading && <HiOutlineSparkles className="w-5 h-5" />}
            >
              {loading ? 'Analyzing with Gemini AI...' : 'Analyze Resume Compatibility'}
            </Button>
          </div>

          {/* Right Column: AI Analysis Output (6 cols) */}
          <div className="lg:col-span-6">
            
            {/* Initial Empty State */}
            {!result && !loading && (
              <Card padding="lg" className="border-slate-200 shadow-card text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-50 via-violet-50 to-cyan-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4 shadow-subtle">
                  <HiOutlineSparkles className="w-8 h-8 text-violet-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Ready to analyze your resume
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed mb-6">
                  Paste your resume and select a target job position to review AI-generated compatibility insights.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLoadSampleResume}
                  leftIcon={<HiOutlineDocumentText className="w-4 h-4 text-slate-500" />}
                >
                  Load Example Resume & Job
                </Button>
              </Card>
            )}

            {/* Loading State */}
            {loading && (
              <Card padding="lg" className="border-slate-200 shadow-card text-center py-16 space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 animate-spin opacity-20" />
                  <div className="w-20 h-20 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin flex items-center justify-center">
                    <HiOutlineSparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Analyzing your resume...
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
                    Gemini AI is comparing your experience, skills, and keywords against <strong className="text-slate-700">{selectedJob?.title}</strong> requirements.
                  </p>
                </div>
              </Card>
            )}

            {/* Real AI Result Display */}
            {result && !loading && (
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* 1. Match Score Card */}
                {typeof result.matchScore === 'number' && (
                  <Card padding="lg" className="border-slate-200 shadow-card text-center relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Job Description Match Score
                      </span>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <HiOutlineArrowPath className="w-3.5 h-3.5" /> Re-analyze
                      </button>
                    </div>

                    <div className="my-4">
                      <div className={`text-6xl font-black tracking-tight ${getScoreTheme(result.matchScore).text}`}>
                        {result.matchScore}%
                      </div>
                      
                      <div className="w-full bg-slate-100 rounded-full h-3 max-w-md mx-auto mt-4 overflow-hidden border border-slate-200/60">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${getScoreTheme(result.matchScore).bar} transition-all duration-700`}
                          style={{ width: `${Math.min(100, Math.max(0, result.matchScore))}%` }}
                        />
                      </div>

                      <div className="mt-3">
                        <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full border ${getScoreTheme(result.matchScore).badge}`}>
                          {getScoreTheme(result.matchScore).label}
                        </span>
                      </div>
                    </div>

                    {result.verdict && (
                      <p className="text-sm font-semibold text-slate-700 bg-slate-50 rounded-xl p-3 border border-slate-100 mt-4 leading-relaxed">
                        "{result.verdict}"
                      </p>
                    )}
                  </Card>
                )}

                {typeof result.atsScore === 'number' && (
                  <Card padding="lg" className="border-slate-200 shadow-card">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">ATS Readiness Estimate</h3>
                        <p className="mt-1 text-xs text-slate-500">A practical formatting and content estimate, not a guarantee for any specific ATS.</p>
                      </div>
                      <div className="text-3xl font-black text-indigo-700">{result.atsScore}<span className="text-lg">/100</span></div>
                    </div>
                    {result.atsFactors.length > 0 && (
                      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                        {result.atsFactors.map((factor, idx) => (
                          <li key={idx} className="rounded-lg bg-indigo-50/60 px-3 py-2 text-xs text-slate-700">{factor}</li>
                        ))}
                      </ul>
                    )}
                  </Card>
                )}

                {Object.values(result.sectionAnalysis).some((section) => section.status !== 'not_assessed') && (
                  <Card padding="lg" className="border-slate-200 shadow-card">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Resume Section Review</h3>
                    <div className="space-y-3">
                      {Object.entries(result.sectionAnalysis).map(([sectionName, section]) => (
                        <div key={sectionName} className="rounded-xl border border-slate-100 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="text-xs font-bold capitalize text-slate-800">{sectionName}</h4>
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold capitalize text-slate-600">
                              {section.status.replaceAll('_', ' ')}
                            </span>
                          </div>
                          {section.findings.length > 0 && <p className="mt-2 text-xs text-slate-600">{section.findings.join(' ')}</p>}
                          {section.suggestions.length > 0 && (
                            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-indigo-700">
                              {section.suggestions.map((suggestion, idx) => <li key={idx}>{suggestion}</li>)}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {result.matchRationale && (
                  <Card padding="lg" className="border-slate-200 shadow-card">
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Why this match score?</h3>
                    <p className="text-sm leading-relaxed text-slate-700">{result.matchRationale}</p>
                  </Card>
                )}

                {result.matchedSkills.length > 0 && (
                  <Card padding="lg" className="border-slate-200 shadow-card">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Skills found in your resume</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills.map((skill, idx) => <span key={idx} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">{skill}</span>)}
                    </div>
                  </Card>
                )}

                {result.missingSkills.length > 0 && (
                  <Card padding="lg" className="border-slate-200 shadow-card">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Job skills not evidenced in the resume</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills.map((skill, idx) => <span key={idx} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-800">{skill}</span>)}
                    </div>
                  </Card>
                )}

                {result.keywords.length > 0 && (
                  <Card padding="lg" className="border-slate-200 shadow-card">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Relevant job keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map((keyword, idx) => <span key={idx} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800">{keyword}</span>)}
                    </div>
                  </Card>
                )}

                {/* 2. Strengths Section */}
                {Array.isArray(result.strengths) && result.strengths.length > 0 && (
                  <Card padding="lg" className="border-slate-200 shadow-card">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <HiOutlineCheckCircle className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Matching Strengths ({result.strengths.length})
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {result.strengths.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-xs sm:text-sm text-slate-700 bg-emerald-50/60 border border-emerald-100/80 rounded-xl p-3 flex items-start gap-2.5"
                        >
                          <HiOutlineCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* 3. Missing Skills Section */}
                {Array.isArray(result.missing) && result.missing.length > 0 && (
                  <Card padding="lg" className="border-slate-200 shadow-card">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                        <HiOutlineXCircle className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Missing Skills & Requirements ({result.missing.length})
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {result.missing.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-xs sm:text-sm text-slate-700 bg-rose-50/50 border border-rose-100/80 rounded-xl p-3 flex items-start gap-2.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* 4. Actionable AI Recommendations */}
                {Array.isArray(result.suggestions) && result.suggestions.length > 0 && (
                  <Card padding="lg" className="border-slate-200 shadow-card">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <HiOutlineLightBulb className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Actionable AI Suggestions ({result.suggestions.length})
                      </h3>
                    </div>
                    <ul className="space-y-2.5">
                      {result.suggestions.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-xs sm:text-sm text-slate-700 bg-indigo-50/40 border border-indigo-100/80 rounded-xl p-3 flex items-start gap-2.5"
                        >
                          <span className="text-xs font-bold text-indigo-600 shrink-0">#{idx + 1}</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {result.learningRecommendations.length > 0 && (
                  <Card padding="lg" className="border-slate-200 shadow-card">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Skills to consider learning</h3>
                    <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700">
                      {result.learningRecommendations.map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  </Card>
                )}

                {result.bulletRecommendations.length > 0 && (
                  <Card padding="lg" className="border-slate-200 shadow-card">
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Resume bullet improvements</h3>
                    <p className="mb-3 text-xs text-slate-500">Use these as editing guidance and keep every claim accurate to your experience.</p>
                    <ul className="space-y-2">
                      {result.bulletRecommendations.map((item, idx) => <li key={idx} className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-slate-700">{item}</li>)}
                    </ul>
                  </Card>
                )}

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  )
}

export default AIMatch
