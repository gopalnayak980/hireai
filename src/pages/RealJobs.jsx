import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import API from '../utils/api'
import { useAuth } from '../context/AuthContext'
import JobCard from '../components/JobCard'
import { Button, Badge, Input, Skeleton, EmptyState } from '../components/ui'
import { getSavedJobSource, hasSavedJobSource } from '../utils/jobSource'
import {
  HiOutlineMagnifyingGlass,
  HiOutlineMapPin,
  HiOutlineSparkles,
  HiOutlineArrowPath,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
} from 'react-icons/hi2'

const RealJobs = () => {
  const { user } = useAuth()
  const [what, setWhat] = useState('')
  const [where, setWhere] = useState('')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [savedIds, setSavedIds] = useState([])
  const [savingId, setSavingId] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const searchRequestId = useRef(0)

  // Fetch already saved jobs if user is logged in
  useEffect(() => {
    let isCurrent = true
    if (!user) {
      setSavedIds([])
      return () => { isCurrent = false }
    }

    API.get('/saved')
      .then((res) => {
        if (isCurrent && Array.isArray(res.data)) {
          setSavedIds(res.data
            .filter((job) => getSavedJobSource(job) === 'adzuna')
            .map((job) => String(job.jobId)))
        }
      })
      .catch(() => {
        if (isCurrent) setFeedback('Unable to load saved-job status. You can still browse live listings.')
      })

    return () => { isCurrent = false }
  }, [user])

  // Initial load search for popular tech roles
  const searchJobs = useCallback(async (searchWhat, searchWhere, searchPage = 1) => {
    const requestId = ++searchRequestId.current

    if (!searchWhat.trim()) {
      setError('Please enter a job title, skill, or role keyword.')
      setLoading(false)
      return
    }

    setError('')
    setLoading(true)
    setJobs([])
    setHasSearched(true)

    try {
      const res = await API.get('/jobs/search', {
        params: {
          what: searchWhat.trim(),
          where: searchWhere.trim() || 'india',
          country: 'in',
          page: searchPage,
        },
      })
      if (requestId === searchRequestId.current) {
        const results = Array.isArray(res.data?.jobs)
          ? res.data.jobs.map((job) => ({ ...job, source: 'adzuna' }))
          : []
        const resultTotal = Number.isFinite(res.data?.total) ? res.data.total : 0
        setJobs(results)
        setTotal(resultTotal)
        setHasNextPage(res.data?.hasMore === true)
      }
    } catch (err) {
      if (requestId === searchRequestId.current) {
        if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
          setError('Request timed out. The server took too long to respond. Please try again.')
        } else if (err.response?.data?.message) {
          setError(err.response.data.message)
        } else if (err.message?.includes('Network Error')) {
          setError('Unable to reach the backend server. Please verify your connection or try again.')
        } else {
          setError('Unable to load live jobs. Please verify your connection or try again.')
        }
      }
    } finally {
      if (requestId === searchRequestId.current) setLoading(false)
    }
  }, [])

  const handleSearchInputChange = (setter, value) => {
    searchRequestId.current += 1
    setLoading(false)
    setError('')
    setJobs([])
    setTotal(0)
    setPage(1)
    setHasNextPage(false)
    setHasSearched(false)
    setter(value)
  }

  useEffect(() => {
    void searchJobs('developer', 'india')
  }, [searchJobs])

  const handleSearch = (overrideWhat, overrideWhere) => {
    return searchJobs(
      overrideWhat !== undefined ? overrideWhat : what,
      overrideWhere !== undefined ? overrideWhere : where,
      page,
    )
  }

  const handlePageChange = (nextPage) => {
    if (loading || nextPage < 1 || (nextPage > page && !hasNextPage)) return
    setPage(nextPage)
    return searchJobs(what, where, nextPage)
  }

  const handleToggleSave = async (job) => {
    if (!user) {
      setFeedback('Please log in to bookmark and save live jobs!')
      setTimeout(() => setFeedback(''), 3500)
      return
    }

    const strId = String(job.id)
    const isSaved = savedIds.includes(strId)
    setSavingId(job.id)

    try {
      if (isSaved) {
        await API.delete(`/saved/${encodeURIComponent(strId)}`)
        setSavedIds((prev) => prev.filter((id) => id !== strId))
        setFeedback('Job removed from saved!')
      } else {
        await API.post('/saved', {
          jobId: job.id,
          title: job.title,
          company: job.company,
          source: 'adzuna',
          location: job.location,
          salary: job.salary,
          url: job.url || '',
        })
        setSavedIds((prev) => [...prev, strId])
        setFeedback('Job saved to your dashboard!')
      }
    } catch (err) {
      if (err.response?.data?.message === 'Job already saved!') {
        try {
          const savedResponse = await API.get('/saved')
          if (hasSavedJobSource(savedResponse.data, job.id, 'adzuna')) {
            setSavedIds((prev) => prev.includes(strId) ? prev : [...prev, strId])
            setFeedback('Job is already saved.')
          } else {
            setFeedback('A saved listing from another source uses this ID. Remove it from your dashboard before saving this listing.')
          }
        } catch {
          setFeedback('Unable to verify the existing saved job. Please try again.')
        }
      } else {
        setFeedback('Could not update saved job. Please try again.')
      }
    } finally {
      setSavingId(null)
      setTimeout(() => setFeedback(''), 3000)
    }
  }

  const handleQuickTagClick = (tag) => {
    setWhat(tag)
    setPage(1)
    return searchJobs(tag, where, 1)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="success" size="sm" dot>
                  Live Market Feed
                </Badge>
                <span className="text-xs text-slate-400 font-medium">
                  Live job search in India
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Live Job Opportunities
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Browse live listings from Adzuna and follow an external application link when one is available.
              </p>
              <Link to="/sample-jobs" className="inline-flex mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                Browse curated sample listings
              </Link>
              <Link to="/recruiter-jobs" className="ml-4 inline-flex mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                Browse recruiter listings
              </Link>
            </div>

            <Button
              variant="ai"
              size="md"
              leftIcon={<HiOutlineSparkles className="w-4 h-4" />}
              onClick={() => handleSearch(what || 'Software Engineer', where)}
            >
              Refresh Feed
            </Button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div className="mb-6 p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm font-medium flex items-center justify-between animate-in fade-in duration-200 shadow-sm">
            <span>{feedback}</span>
            <button
              onClick={() => setFeedback('')}
              className="text-indigo-400 hover:text-indigo-600 p-1"
            >
              <HiOutlineXMark className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search Bar Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
            
            {/* Job Title / Keywords Input */}
            <div className="sm:col-span-6 lg:col-span-6">
              <Input
                label="What role are you looking for?"
                placeholder="Job title or keyword (e.g. React Developer)..."
                leftIcon={<HiOutlineMagnifyingGlass className="w-4 h-4" />}
                value={what}
                onChange={(e) => handleSearchInputChange(setWhat, e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Location Input */}
            <div className="sm:col-span-4 lg:col-span-4">
              <Input
                label="Where?"
                placeholder="City or 'Remote' (e.g. Bangalore)..."
                leftIcon={<HiOutlineMapPin className="w-4 h-4" />}
                value={where}
                onChange={(e) => handleSearchInputChange(setWhere, e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Search Submit Button */}
            <div className="sm:col-span-2 lg:col-span-2">
              <Button
                variant="primary"
                size="md"
                className="w-full py-2.5 shadow-btn-primary"
                onClick={() => handleSearch()}
                isLoading={loading}
              >
                Search Jobs
              </Button>
            </div>
          </div>

          {/* Quick Keywords Chips */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 flex-wrap">
            <span className="text-xs font-semibold text-slate-400">Popular Searches:</span>
            {['React Developer', 'Node.js', 'Python Developer', 'Full Stack', 'Frontend', 'AI/ML', 'DevOps'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleQuickTagClick(tag)}
                className="text-xs bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 px-3 py-1 rounded-full font-medium transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-6 rounded-2xl bg-white border border-rose-200 shadow-subtle text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <HiOutlineExclamationTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Unable to load live jobs</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">{error}</p>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<HiOutlineArrowPath className="w-4 h-4" />}
              onClick={() => handleSearch()}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Total Results Count */}
        {!loading && !error && total > 0 && (
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-slate-700">
              Found <span className="text-indigo-600 font-bold">{total.toLocaleString()}</span> live positions in India
            </p>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton.JobCard key={idx} />
            ))}
          </div>
        )}

        {/* Real Job Results Grid */}
        {!loading && !error && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                source="adzuna"
                isSaved={savedIds.includes(String(job.id))}
                isSaving={savingId === job.id}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && jobs.length === 0 && hasSearched && (
          <EmptyState
            title="No matching live jobs found"
            description="We could not find any live listings matching your search terms. Try using broader keywords or searching for 'Developer'."
            action={
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setWhat('Developer')
                  setWhere('')
                  setPage(1)
                  return searchJobs('Developer', '', 1)
                }}
              >
                Search All Tech Jobs
              </Button>
            }
          />
        )}

        {!loading && ((jobs.length > 0 && !error) || (page > 1 && hasSearched)) && (
          <nav aria-label="Job search results pages" className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={loading || page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm font-semibold text-slate-700" aria-live="polite">
              Page {page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={Boolean(error) || !hasNextPage}
            >
              Next
            </Button>
          </nav>
        )}

      </div>
    </div>
  )
}

export default RealJobs
