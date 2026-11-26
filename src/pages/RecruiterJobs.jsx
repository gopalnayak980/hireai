import React, { useCallback, useEffect, useRef, useState } from 'react'
import API from '../utils/api'
import JobCard from '../components/JobCard'
import { Button, Badge, EmptyState, Skeleton } from '../components/ui'
import { HiOutlineArrowPath, HiOutlineExclamationTriangle } from 'react-icons/hi2'

const RecruiterJobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestId, setRequestId] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const requestVersion = useRef(0)

  const loadJobs = useCallback(async () => {
    const requestId = ++requestVersion.current
    setLoading(true)
    setError('')
    try {
      const response = await API.get('/jobs', { params: { page } })
      if (requestId !== requestVersion.current) return
      setJobs(Array.isArray(response.data) ? response.data : [])
      setHasMore(response.headers['x-has-more'] === 'true')
    } catch {
      if (requestId === requestVersion.current) setError('Unable to load recruiter listings. Please try again.')
    } finally {
      if (requestId === requestVersion.current) setLoading(false)
    }
  }, [page])

  useEffect(() => {
    void loadJobs()
    return () => { requestVersion.current += 1 }
  }, [loadJobs, requestId])

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Badge variant="primary" size="sm">Recruiter listings</Badge>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Jobs posted on HireAI</h1>
          <p className="mt-1 text-sm text-slate-600">Browse job details published by HireAI recruiters.</p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => <Skeleton.JobCard key={index} />)}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-white p-6 text-center">
            <HiOutlineExclamationTriangle className="mx-auto mb-3 h-6 w-6 text-rose-600" />
            <p role="alert" className="mb-4 text-sm text-slate-600">{error}</p>
            <Button variant="outline" size="sm" leftIcon={<HiOutlineArrowPath className="h-4 w-4" />} onClick={() => setRequestId((current) => current + 1)}>
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => {
              const id = job._id || job.id
              return <JobCard key={String(id)} job={{ ...job, id: String(id), source: 'recruiter' }} source="recruiter" />
            })}
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <nav aria-label="Recruiter job pages" className="mt-8 flex items-center justify-center gap-3">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
            <span className="text-xs text-slate-600">Page {page}</span>
            <Button variant="secondary" size="sm" disabled={!hasMore} onClick={() => setPage((current) => current + 1)}>Next</Button>
          </nav>
        )}

        {!loading && !error && jobs.length === 0 && (
          <EmptyState
            title="No recruiter listings available"
            description="New recruiter-posted opportunities will appear here when available."
          />
        )}
      </div>
    </div>
  )
}

export default RecruiterJobs
