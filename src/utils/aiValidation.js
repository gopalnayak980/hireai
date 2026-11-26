const MAX_AI_TEXT_LENGTH = 8000
const MAX_AI_LIST_ITEMS = 20
const MAX_INTERVIEW_QUESTIONS = 12
const RESUME_SECTIONS = ['summary', 'skills', 'education', 'experience', 'projects']
const INTERVIEW_CATEGORIES = ['technical', 'behavioral', 'hr']

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const normalizeText = (value) => (
  typeof value === 'string' && value.trim().length <= MAX_AI_TEXT_LENGTH
    ? value.trim()
    : null
)

const normalizeOptionalList = (value) => {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value) || value.length > MAX_AI_LIST_ITEMS) return null

  const normalized = value.map(normalizeText)
  return normalized.every((item) => typeof item === 'string' && item.length > 0)
    ? normalized
    : null
}

export const normalizeMatchResponse = (data) => {
  if (!isRecord(data) || !Number.isFinite(data.matchScore) || data.matchScore < 0 || data.matchScore > 100) {
    return null
  }

  const strengths = normalizeOptionalList(data.strengths)
  const missing = normalizeOptionalList(data.missing)
  const suggestions = normalizeOptionalList(data.suggestions)
  if (!strengths || !missing || !suggestions) return null

  let verdict = ''
  if (data.verdict !== undefined && data.verdict !== null) {
    verdict = normalizeText(data.verdict)
    if (verdict === null) return null
  }

  const normalizeScore = (value) => (
    value === undefined || value === null
      ? null
      : Number.isFinite(value) && value >= 0 && value <= 100 ? value : undefined
  )
  const atsScore = normalizeScore(data.atsScore)
  if (atsScore === undefined) return null

  const atsFactors = normalizeOptionalList(data.atsFactors)
  const matchedSkills = normalizeOptionalList(data.matchedSkills)
  const missingSkills = normalizeOptionalList(data.missingSkills)
  const keywords = normalizeOptionalList(data.keywords)
  const learningRecommendations = normalizeOptionalList(data.learningRecommendations)
  const bulletRecommendations = normalizeOptionalList(data.bulletRecommendations)
  if ([atsFactors, matchedSkills, missingSkills, keywords, learningRecommendations, bulletRecommendations].some((list) => !list)) {
    return null
  }

  let matchRationale = ''
  if (data.matchRationale !== undefined && data.matchRationale !== null) {
    matchRationale = normalizeText(data.matchRationale)
    if (matchRationale === null) return null
  }

  const sectionAnalysis = {}
  if (data.sectionAnalysis !== undefined && data.sectionAnalysis !== null) {
    if (!isRecord(data.sectionAnalysis)) return null
    for (const section of RESUME_SECTIONS) {
      const value = data.sectionAnalysis[section]
      if (value === undefined || value === null) {
        sectionAnalysis[section] = { status: 'not_assessed', findings: [], suggestions: [] }
        continue
      }
      if (!isRecord(value) || !['present', 'weak', 'missing', 'not_applicable'].includes(value.status)) return null
      const findings = normalizeOptionalList(value.findings)
      const sectionSuggestions = normalizeOptionalList(value.suggestions)
      if (!findings || !sectionSuggestions) return null
      sectionAnalysis[section] = { status: value.status, findings, suggestions: sectionSuggestions }
    }
  }

  return {
    matchScore: data.matchScore,
    atsScore,
    strengths,
    missing,
    suggestions,
    verdict,
    atsFactors,
    sectionAnalysis,
    matchedSkills,
    missingSkills,
    keywords,
    matchRationale,
    learningRecommendations,
    bulletRecommendations,
  }
}

export const normalizeInterviewResponse = (data) => {
  if (!isRecord(data) || !Array.isArray(data.questions) ||
      data.questions.length < 1 || data.questions.length > MAX_INTERVIEW_QUESTIONS) {
    return null
  }

  const questions = []
  for (const item of data.questions) {
    if (!isRecord(item)) return null

    const question = normalizeText(item.question)
    const answer = normalizeText(item.answer)
    if (!question || !answer) return null

    let tip = ''
    if (item.tip !== undefined && item.tip !== null) {
      tip = normalizeText(item.tip)
      if (tip === null) return null
    }
    const category = item.category === undefined || item.category === null ? 'technical' : item.category
    if (!INTERVIEW_CATEGORIES.includes(category)) return null
    questions.push({ question, answer, tip, category })
  }

  return questions
}

export const normalizeInterviewEvaluation = (data) => {
  if (!isRecord(data) || !Number.isFinite(data.score) || data.score < 0 || data.score > 10) return null
  const whatWentWell = normalizeOptionalList(data.whatWentWell)
  const improvements = normalizeOptionalList(data.improvements)
  const missingConcepts = normalizeOptionalList(data.missingConcepts)
  const sampleAnswer = normalizeText(data.sampleAnswer)
  const scoreContext = normalizeText(data.scoreContext)
  if (!whatWentWell || !improvements || !missingConcepts || !sampleAnswer || !scoreContext) return null
  return { score: data.score, whatWentWell, improvements, sampleAnswer, missingConcepts, scoreContext }
}

export const normalizeInterviewReport = (data) => {
  if (!isRecord(data) || !Number.isFinite(data.overallScore) || data.overallScore < 0 || data.overallScore > 100) return null
  const strongestAreas = normalizeOptionalList(data.strongestAreas)
  const weakAreas = normalizeOptionalList(data.weakAreas)
  const topicsToRevise = normalizeOptionalList(data.topicsToRevise)
  const recommendations = normalizeOptionalList(data.recommendations)
  const communicationFeedback = normalizeText(data.communicationFeedback)
  const answerStructureFeedback = normalizeText(data.answerStructureFeedback)
  if (!strongestAreas || !weakAreas || !topicsToRevise || !recommendations || !communicationFeedback || !answerStructureFeedback) return null
  return { overallScore: data.overallScore, strongestAreas, weakAreas, communicationFeedback, answerStructureFeedback, topicsToRevise, recommendations }
}

export const getAiErrorMessage = (error, fallbackMessage) => {
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return 'The request timed out. Please try again.'
  }

  const status = error?.response?.status
  if (status === 401) return 'Your session may have expired. Please sign in again and retry.'
  if (status === 429) return 'You have reached the temporary AI request limit. Please wait and try again.'

  if (status === 400) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.length > 0 && message.length <= 240) return message
  }

  if (!error?.response) return 'Unable to reach HireAI. Check your connection and try again.'
  return fallbackMessage
}
