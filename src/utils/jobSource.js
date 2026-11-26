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

export const hasSavedJobSource = (savedJobs, jobId, source) => Array.isArray(savedJobs) && savedJobs.some((savedJob) =>
  String(savedJob.jobId) === String(jobId) && getSavedJobSource(savedJob) === source
)
