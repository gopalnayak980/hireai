import { useAuth } from "../context/AuthContext"
import { Link, useNavigate } from "react-router-dom"

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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

      {/* Header */}
      <div className="bg-blue-700 text-white px-8 py-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user.name}! 👋</h1>
            <p className="text-blue-200 mt-1">{user.role === 'jobseeker' ? 'Job Seeker' : 'Recruiter'} Account</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-700 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h2 className="text-3xl font-bold text-blue-700">6</h2>
            <p className="text-gray-500 mt-1">Jobs Available</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h2 className="text-3xl font-bold text-green-600">0</h2>
            <p className="text-gray-500 mt-1">Applications Sent</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h2 className="text-3xl font-bold text-yellow-500">0</h2>
            <p className="text-gray-500 mt-1">Saved Jobs</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/jobs" className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center hover:bg-blue-100 transition">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-bold text-blue-700">Browse Jobs</h3>
              <p className="text-gray-500 text-sm mt-1">Find your dream job</p>
            </Link>
            <Link to="/ai-match" className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center hover:bg-purple-100 transition">
              <div className="text-3xl mb-2">🤖</div>
              <h3 className="font-bold text-purple-700">AI Resume Match</h3>
              <p className="text-gray-500 text-sm mt-1">Match resume with jobs</p>
            </Link>
          </div>
        </div>

        {/* Profile Info */}
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