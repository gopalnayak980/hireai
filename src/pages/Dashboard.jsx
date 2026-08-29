import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../utils/api'
import { Button, Badge, Card, StatCard, EmptyState } from '../components/ui'
import {
  HiOutlineSparkles,
  HiOutlineBookmark,
  HiOutlineMagnifyingGlass,
  HiOutlineChatBubbleLeftRight,
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState(null)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    if (user) {
      fetchSavedJobs()
    }
  }, [user])

  const fetchSavedJobs = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await API.get('/saved')
      if (Array.isArray(res.data)) {
        setSavedJobs(res.data)
      }
    } catch (err) {
      setError('Unable to load saved jobs. Please verify your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleUnsave = async (jobId) => {
    setRemovingId(jobId)
    try {
      await API.delete(`/saved/${jobId}`)
      setSavedJobs((prev) => prev.filter((j) => j.jobId !== jobId))
      setFeedback('Job removed from saved list.')
    } catch (err) {
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
              <Link to="/login">
                <Button variant="primary" size="lg" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="md" className="w-full">
                  Create Account
                </Button>
              </Link>
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
            value={loading ? '-' : savedJobs.length}
            icon={<HiOutlineBookmark className="w-5 h-5 text-indigo-600" />}
            description="Bookmarked for application"
            variant="primary"
            isLoading={loading}
          />
          <StatCard
            title="Account Status"
            value="Active"
            icon={<HiOutlineShieldCheck className="w-5 h-5 text-emerald-600" />}
            description="Profile verified & ready"
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
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick AI Workflows</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/real-jobs" className="group">
              <Card hover padding="md" className="border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <HiOutlineMagnifyingGlass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Live Job Search
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Explore 3,800+ live openings</p>
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
                  {savedJobs.length}
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

            {/* Saved Jobs List */}
            {!loading && !error && savedJobs.length > 0 && (
              <div className="space-y-3">
                {savedJobs.map((job) => (
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
                          {job.salary && (
                            <span className="flex items-center gap-1 font-medium text-slate-600">
                              <HiOutlineCurrencyRupee className="w-3.5 h-3.5 text-slate-400" />
                              <span>{job.salary}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-end shrink-0">
                      {job.url ? (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="primary"
                            size="sm"
                            rightIcon={<HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5" />}
                          >
                            Apply
                          </Button>
                        </a>
                      ) : (
                        <Link to={`/jobs/${job.jobId}`}>
                          <Button variant="secondary" size="sm">
                            View Job
                          </Button>
                        </Link>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={removingId === job.jobId}
                        onClick={() => handleUnsave(job.jobId)}
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 p-2"
                        aria-label="Remove saved job"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && savedJobs.length === 0 && (
              <EmptyState
                icon={<HiOutlineBookmark className="w-7 h-7 text-slate-400" />}
                title="No saved jobs yet"
                description="Save jobs you are interested in while browsing and they will appear here for easy tracking."
                action={
                  <Link to="/real-jobs">
                    <Button variant="primary" size="md">
                      Explore Live Jobs
                    </Button>
                  </Link>
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
                <Link to="/ai-match">
                  <Button variant="ai" size="sm" className="w-full">
                    Match Resume with AI
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

        </div>

      </div>
    </div>
  )
}

export default Dashboard