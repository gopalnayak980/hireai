const MAX_AI_TEXT_LENGTH = 8000
const MAX_AI_LIST_ITEMS = 20
const MAX_INTERVIEW_QUESTIONS = 12

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

  return { matchScore: data.matchScore, strengths, missing, suggestions, verdict }
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
    questions.push({ question, answer, tip })
  }

  return questions
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
