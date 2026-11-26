import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../utils/api'
import getSafeExternalUrl from '../utils/safeExternalUrl'
import formatSalary from '../utils/formatSalary'
import { getJobDetailPath, getSavedJobSource } from '../utils/jobSource'
import { Button, Badge, Card, StatCard, EmptyState } from '../components/ui'
import {
  HiOutlineSparkles,
  HiOutlineBookmark,
  HiOutlineMagnifyingGlass,
  HiOutlineChatBubbleLeftRight,
  HiOutlineBriefcase,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineCurrencyRupee,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlineArrowPath,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
} from 'react-icons/hi2'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [savedJobs, setSavedJobs] = useState([])
  const [savedTotal, setSavedTotal] = useState(0)
  const [savedPage, setSavedPage] = useState(1)
  const [savedHasMore, setSavedHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState(null)
  const [feedback, setFeedback] = useState('')
  const savedRequestVersion = useRef(0)

  const fetchSavedJobs = useCallback(async () => {
    const requestId = ++savedRequestVersion.current
    setLoading(true)
    setError('')
    try {
      const res = await API.get('/saved', { params: { page: savedPage } })
      if (requestId !== savedRequestVersion.current) return
      if (Array.isArray(res.data)) {
        setSavedJobs(res.data)
        const total = Number(res.headers['x-total-count'])
        setSavedTotal(Number.isSafeInteger(total) && total >= 0 ? total : res.data.length)
        setSavedHasMore(res.headers['x-has-more'] === 'true')
      }
    } catch {
      if (requestId === savedRequestVersion.current) setError('Unable to load saved jobs. Please verify your connection.')
    } finally {
      if (requestId === savedRequestVersion.current) setLoading(false)
    }
  }, [savedPage])

  useEffect(() => {
    if (user) void fetchSavedJobs()
    else setLoading(false)
    return () => { savedRequestVersion.current += 1 }
  }, [user, fetchSavedJobs])

  const handleUnsave = async (jobId) => {
    const normalizedId = String(jobId)
    setRemovingId(normalizedId)
    try {
      await API.delete(`/saved/${encodeURIComponent(normalizedId)}`)
      setSavedJobs((prev) => prev.filter((job) => String(job.jobId) !== normalizedId))
      setSavedTotal((current) => Math.max(0, current - 1))
      if (savedJobs.length === 1 && savedPage > 1) setSavedPage((current) => current - 1)
      setFeedback('Job removed from saved list.')
    } catch {
      setFeedback('Failed to remove job. Please try again.')
    } finally {
      setRemovingId(null)
      setTimeout(() => setFeedback(''), 3000)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <Card padding="lg" className="text-center shadow-card border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <HiOutlineUser className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to view Dashboard</h2>
            <p className="text-sm text-slate-600 mb-6">
              Please sign in to your HireAI account to access your candidate dashboard, saved jobs, and profile settings.
            </p>
            <div className="flex flex-col gap-2.5">
              <Button as={Link} to="/login" variant="primary" size="lg" className="w-full">
                Sign In
              </Button>
              <Button as={Link} to="/register" variant="secondary" size="md" className="w-full">
                Create Account
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Banner Card */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 mb-8 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-xl flex items-center justify-center shadow-md shrink-0">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Welcome back, {user.name}
                  </h1>
                  <span className="text-xl">👋</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="capitalize font-medium">
                    {user.role === 'jobseeker' ? 'Candidate / Job Seeker' : 'Recruiter Account'}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Account
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white shrink-0 self-start sm:self-auto"
              leftIcon={<HiOutlineArrowRightOnRectangle className="w-4 h-4" />}
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div className="mb-6 p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm font-medium flex items-center justify-between shadow-subtle animate-in fade-in duration-200">
            <span>{feedback}</span>
            <button onClick={() => setFeedback('')} className="text-indigo-400 hover:text-indigo-600 p-1">
              <HiOutlineXMark className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Saved Positions"
            value={loading ? '-' : savedTotal}
            icon={<HiOutlineBookmark className="w-5 h-5 text-indigo-600" />}
            description="Bookmarked for application"
            variant="primary"
            isLoading={loading}
          />
          <StatCard
            title="Account Status"
            value="Active"
            icon={<HiOutlineShieldCheck className="w-5 h-5 text-emerald-600" />}
            description="Signed in to your HireAI account"
            variant="success"
          />
          <StatCard
            title="Account Type"
            value={user.role === 'jobseeker' ? 'Job Seeker' : 'Recruiter'}
            icon={<HiOutlineUser className="w-5 h-5 text-violet-600" />}
            description={user.email}
            variant="ai"
          />
        </div>

        {/* Quick Actions Bar */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/real-jobs" className="group">
              <Card hover padding="md" className="border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <HiOutlineMagnifyingGlass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Live Job Search
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Search current listings from the live job feed</p>
                </div>
              </Card>
            </Link>

            <Link to="/ai-match" className="group">
              <Card hover padding="md" className="border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center shrink-0 group-hover:bg-violet-600 group-hover:text-white transition-all">
                  <HiOutlineSparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                    AI Resume Match
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Check ATS fit & skill gaps</p>
                </div>
              </Card>
            </Link>

            <Link to="/interview-prep" className="group">
              <Card hover padding="md" className="border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center shrink-0 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                  <HiOutlineChatBubbleLeftRight className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                    Interview Prep
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Practice technical Q&As</p>
                </div>
              </Card>
            </Link>

            <Link to="/applications" className="group">
              <Card hover padding="md" className="border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <HiOutlineBriefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Application Tracker</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Track status and follow-ups</p>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Main Content Grid: Saved Jobs (8 cols) + Profile Info (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Saved Jobs Section (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Saved Jobs</h2>
                <Badge variant="primary" size="sm">
                  {savedTotal}
                </Badge>
              </div>

              {savedJobs.length > 0 && (
                <Link to="/real-jobs" className="text-xs font-semibold text-indigo-600 hover:underline">
                  Find More Jobs →
                </Link>
              )}
            </div>

            {/* Error Loading State */}
            {error && (
              <Card padding="md" className="border-rose-200 bg-rose-50/50 text-center py-8">
                <HiOutlineExclamationTriangle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-900">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchSavedJobs}
                  className="mt-3"
                  leftIcon={<HiOutlineArrowPath className="w-4 h-4" />}
                >
                  Try Again
                </Button>
              </Card>
            )}

            {/* Loading Skeletons */}
            {loading && !error && (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse flex justify-between items-center">
                    <div className="space-y-2 w-2/3">
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                      <div className="h-3 bg-slate-200/70 rounded w-1/3" />
                    </div>
                    <div className="h-8 bg-slate-200 rounded-xl w-24" />
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && savedTotal > 0 && (
              <nav aria-label="Saved job pages" className="flex items-center justify-center gap-3 pt-2">
                <Button variant="secondary" size="sm" disabled={savedPage <= 1} onClick={() => setSavedPage((current) => Math.max(1, current - 1))}>Previous</Button>
                <span className="text-xs text-slate-600">Page {savedPage}</span>
                <Button variant="secondary" size="sm" disabled={!savedHasMore} onClick={() => setSavedPage((current) => current + 1)}>Next</Button>
              </nav>
            )}

            {/* Saved Jobs List */}
            {!loading && !error && savedJobs.length > 0 && (
              <div className="space-y-3">
                {savedJobs.map((job) => {
                  const source = getSavedJobSource(job)
                  const detailPath = getJobDetailPath(source, job.jobId)
                  const detailState = source === 'adzuna'
                    ? { job: { id: String(job.jobId), source, title: job.title, company: job.company, location: job.location, salary: job.salary, url: job.url } }
                    : undefined

                  return (
                    <div
                    key={job.jobId}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-card-hover transition-all"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {job.company ? job.company.slice(0, 2).toUpperCase() : 'CO'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {job.title}
                        </h3>
                        <p className="text-xs font-medium text-indigo-600 mt-0.5 flex items-center gap-1.5 truncate">
                          <HiOutlineBuildingOffice2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{job.company || 'Company'}</span>
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <HiOutlineMapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate max-w-[120px]">{job.location}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1 font-medium text-slate-600">
                            <HiOutlineCurrencyRupee className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatSalary(job.salary, job.salary_min, job.salary_max)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-end">
                      {detailPath && (
                        <Button as={Link} to={detailPath} state={detailState} variant="secondary" size="sm">
                          View Details
                        </Button>
                      )}

                      <Button
                        as={Link}
                        to="/applications"
                        state={{ newApplication: { id: String(job.jobId), source: source || 'manual', title: job.title, company: job.company, location: job.location, url: getSafeExternalUrl(job.url) || '' } }}
                        variant="ghost"
                        size="sm"
                      >
                        Track
                      </Button>

                      {getSafeExternalUrl(job.url) ? (
                        <Button
                          as="a"
                          href={getSafeExternalUrl(job.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="primary"
                          size="sm"
                          rightIcon={<HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5" />}
                        >
                          Apply
                        </Button>
                      ) : source === 'adzuna' ? (
                        <Button variant="secondary" size="sm" disabled>
                          Apply link unavailable
                        </Button>
                      ) : !detailPath ? (
                        <span className="text-xs text-slate-500">Listing details unavailable</span>
                      ) : (
                        null
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={removingId === String(job.jobId)}
                        onClick={() => handleUnsave(job.jobId)}
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 p-2"
                        aria-label="Remove saved job"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </Button>
                    </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && savedJobs.length === 0 && (
              <EmptyState
                icon={<HiOutlineBookmark className="w-7 h-7 text-slate-400" />}
                title="No saved jobs yet"
                description="Save jobs while browsing to keep interesting opportunities together on your dashboard."
                action={
                  <Button as={Link} to="/real-jobs" variant="primary" size="md">
                    Explore Live Jobs
                  </Button>
                }
              />
            )}
          </div>

          {/* Profile Summary Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Card padding="lg" className="border-slate-200 shadow-card">
              <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Candidate Profile
              </h2>

              <div className="space-y-3.5 text-xs">
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    Full Name
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{user.name}</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    Email Address
                  </span>
                  <span className="font-medium text-slate-800 text-xs truncate block">{user.email}</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    Role Category
                  </span>
                  <span className="font-semibold text-indigo-700 capitalize">
                    {user.role === 'jobseeker' ? 'Candidate (Job Seeker)' : 'Recruiter'}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    Security & Session
                  </span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    ✓ Authenticated via Secure JWT
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Button as={Link} to="/ai-match" variant="ai" size="sm" className="w-full">
                  Match Resume with AI
                </Button>
              </div>
            </Card>
          </div>

        </div>

      </div>
    </div>
  )
}

export default Dashboard
