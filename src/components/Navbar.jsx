import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <nav className="bg-blue-700 text-white px-8 py-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-2xl font-bold tracking-wide">HireAI 🚀</Link>

      <div className="flex gap-6 items-center">
        <Link to="/jobs" className="hover:text-yellow-300 transition font-medium">Jobs</Link>

        {user ? (
          <>
            <Link to="/ai-match" className="hover:text-yellow-300 transition font-medium">🤖 AI Match</Link>
            <Link to="/dashboard" className="hover:text-yellow-300 transition font-medium">Dashboard</Link>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-yellow-300 hover:text-blue-900 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-yellow-300 transition font-medium">Login</Link>
            <Link
              to="/register"
              className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-300 transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar