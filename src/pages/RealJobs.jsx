import React, { useState, useEffect } from 'react'
import API from '../utils/api'
import { useAuth } from '../context/AuthContext'
import JobCard from '../components/JobCard'
import { Button, Badge, Input, Skeleton, EmptyState } from '../components/ui'
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
  const [savedIds, setSavedIds] = useState([])
  const [savingId, setSavingId] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  // Fetch already saved jobs if user is logged in
  useEffect(() => {
    if (user) {
      API.get('/saved')
        .then((res) => {
          if (Array.isArray(res.data)) {
            setSavedIds(res.data.map((j) => String(j.jobId)))
          }
        })
        .catch(() => {})
    }
  }, [user])

  // Initial load search for popular tech roles
  useEffect(() => {
    handleSearch('developer', 'india')
  }, [])

  const handleSearch = async (overrideWhat, overrideWhere) => {
    const searchWhat = overrideWhat !== undefined ? overrideWhat : what
    const searchWhere = overrideWhere !== undefined ? overrideWhere : where

    if (!searchWhat.trim()) {
      setError('Please enter a job title, skill, or role keyword.')
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
        },
      })
      setJobs(res.data.jobs || [])
      setTotal(res.data.total || 0)
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. The server took too long to respond. Please make sure the backend is running and try again.')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.message?.includes('Network Error')) {
        setError('Unable to reach the backend server. Please verify your connection or try again.')
      } else {
        setError('Unable to load live jobs. Please verify your connection or try again.')
      }
    } finally {
      setLoading(false)
    }
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
        await API.delete(`/saved/${job.id}`)
        setSavedIds((prev) => prev.filter((id) => id !== strId))
        setFeedback('Job removed from saved!')
      } else {
        await API.post('/saved', {
          jobId: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          url: job.url || '',
        })
        setSavedIds((prev) => [...prev, strId])
        setFeedback('Job saved to your dashboard!')
      }
    } catch (err) {
      if (err.response?.data?.message === 'Job already saved!') {
        setSavedIds((prev) => [...prev, strId])
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
    handleSearch(tag, where)
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
                  Real-time India openings
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Live Job Opportunities
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Discover and apply to verified live jobs across India with real-time company links.
              </p>
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
                placeholder="Job title, tech stack (e.g. React Developer)..."
                leftIcon={<HiOutlineMagnifyingGlass className="w-4 h-4" />}
                value={what}
                onChange={(e) => setWhat(e.target.value)}
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
                onChange={(e) => setWhere(e.target.value)}
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
                  handleSearch('Developer', '')
                }}
              >
                Search All Tech Jobs
              </Button>
            }
          />
        )}

      </div>
    </div>
  )
}

export default RealJobs