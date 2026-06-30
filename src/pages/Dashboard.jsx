import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { Link, useNavigate } from "react-router-dom"
import API from "../utils/api"

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [savedJobs, setSavedJobs] = useState([])

  useEffect(() => {
    if (user) {
      API.get('/saved').then(res => setSavedJobs(res.data))
    }
  }, [user])

  const handleUnsave = async (jobId) => {
    await API.delete(`/saved/${jobId}`)
    setSavedJobs(prev => prev.filter(j => j.jobId !== jobId))
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Please login first!</h2>
          <Link to="/login" className="bg-blue-700 text-white px-6 py-3 rounded-lg">Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-blue-700 text-white px-8 py-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user.name}! 👋</h1>
            <p className="text-blue-200 mt-1">{user.role === 'jobseeker' ? 'Job Seeker' : 'Recruiter'} Account</p>
          </div>
          <button onClick={handleLogout} className="bg-white text-blue-700 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h2 className="text-3xl font-bold text-blue-700">3833+</h2>
            <p className="text-gray-500 mt-1">Jobs Available</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h2 className="text-3xl font-bold text-green-600">{savedJobs.length}</h2>
            <p className="text-gray-500 mt-1">Saved Jobs</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h2 className="text-3xl font-bold text-yellow-500">0</h2>
            <p className="text-gray-500 mt-1">Applications Sent</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-4">
            <Link to="/real-jobs" className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center hover:bg-blue-100 transition">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-bold text-blue-700">Live Jobs</h3>
              <p className="text-gray-500 text-sm mt-1">Search real jobs</p>
            </Link>
            <Link to="/ai-match" className="bg-purple-50 border border-purple-200 rounded-xl p-5 text-center hover:bg-purple-100 transition">
              <div className="text-3xl mb-2">🤖</div>
              <h3 className="font-bold text-purple-700">AI Resume Match</h3>
              <p className="text-gray-500 text-sm mt-1">Match with jobs</p>
            </Link>
            <Link to="/interview-prep" className="bg-green-50 border border-green-200 rounded-xl p-5 text-center hover:bg-green-100 transition">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-bold text-green-700">Interview Prep</h3>
              <p className="text-gray-500 text-sm mt-1">Practice questions</p>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🔖 Saved Jobs ({savedJobs.length})</h2>
          {savedJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No saved jobs yet!</p>
              <Link to="/real-jobs" className="text-blue-600 hover:underline text-sm mt-2 inline-block">Browse Live Jobs</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {savedJobs.map(job => (
                <div key={job.jobId} className="border border-gray-100 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <h3 className="font-semibold text-gray-800">{job.title}</h3>
                    <p className="text-blue-600 text-sm">{job.company}</p>
                    <p className="text-gray-400 text-xs mt-1">📍 {job.location} 💰 {job.salary}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition">
                      Apply
                    </a>
                    <button onClick={() => handleUnsave(job.jobId)} className="border border-red-300 text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Profile Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Full Name</p>
              <p className="font-semibold text-gray-800 mt-1">{user.name}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Email</p>
              <p className="font-semibold text-gray-800 mt-1">{user.email}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Account Type</p>
              <p className="font-semibold text-gray-800 mt-1">{user.role === 'jobseeker' ? '👤 Job Seeker' : '🏢 Recruiter'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Status</p>
              <p className="font-semibold text-green-600 mt-1">✅ Active</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard