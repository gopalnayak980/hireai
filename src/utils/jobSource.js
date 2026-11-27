import getSafeExternalUrl from './safeExternalUrl.js'

const JOB_SOURCES = new Set(['adzuna', 'recruiter', 'sample'])

export const getJobDetailPath = (source, jobId) => {
  if (!JOB_SOURCES.has(source) || jobId === undefined || jobId === null || String(jobId).trim() === '') {
    return null
  }

  return `/jobs/${source}/${encodeURIComponent(String(jobId))}`
}

export const getSavedJobSource = (savedJob) => {
  if (JOB_SOURCES.has(savedJob?.source)) return savedJob.source

  const legacySamplePath = typeof savedJob?.url === 'string'
    ? savedJob.url.match(/^\/jobs\/([^/?#]+)$/)
    : null
  if (legacySamplePath && legacySamplePath[1] === String(savedJob?.jobId)) return 'sample'

  if (getSafeExternalUrl(savedJob?.url)) return 'adzuna'
  return null
}

export const getSavedJobCountry = (savedJob) => {
  if (typeof savedJob?.country === 'string' && savedJob.country) return savedJob.country
  return getSavedJobSource(savedJob) === 'adzuna' ? 'in' : null
}

export const getJobIdentityKey = (source, jobId, country) => (
  `${source}:${source === 'adzuna' ? (country || 'in') : ''}:${String(jobId)}`
)

export const hasSavedJobSource = (savedJobs, jobId, source, country) => Array.isArray(savedJobs) && savedJobs.some((savedJob) => (
  String(savedJob.jobId) === String(jobId) &&
  getSavedJobSource(savedJob) === source &&
  (source !== 'adzuna' || country === undefined || getSavedJobCountry(savedJob) === country)
))
