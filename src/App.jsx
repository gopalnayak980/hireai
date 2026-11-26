import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { SESSION_EXPIRED_EVENT } from './utils/api'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import Login from './pages/Login'
import Register from './pages/Register'
import JobDetail from './pages/JobDetail'
import SourceJobDetail from './pages/SourceJobDetail'
import Dashboard from './pages/Dashboard'
import AIMatch from './pages/AIMatch'
import RealJobs from './pages/RealJobs'
import RecruiterJobs from './pages/RecruiterJobs'
import Applications from './pages/Applications'
import InterviewPrep from './pages/InterviewPrep'
import Layout from './components/layout/Layout'

const SessionExpiryRedirect = () => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const redirectToLogin = () => {
      if (location.pathname !== '/login' && location.pathname !== '/register') {
        navigate('/login', { replace: true, state: { from: location.pathname } })
      }
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, redirectToLogin)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, redirectToLogin)
  }, [location.pathname, navigate])

  return null
}

const LegacySampleJobRedirect = () => {
  const { id } = useParams()
  return <Navigate to={`/jobs/sample/${encodeURIComponent(id)}`} replace />
}

function App() {
  return (
    <Router>
      <SessionExpiryRedirect />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<RealJobs />} />
          <Route path="/sample-jobs" element={<Jobs />} />
          <Route path="/jobs/sample/:id" element={<JobDetail />} />
          <Route path="/jobs/:source/:id" element={<SourceJobDetail />} />
          <Route path="/jobs/:id" element={<LegacySampleJobRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/ai-match" element={<AIMatch />} />
          <Route path="/real-jobs" element={<Navigate to="/jobs" replace />} />
          <Route path="/recruiter-jobs" element={<RecruiterJobs />} />
          <Route path="/interview-prep" element={<InterviewPrep />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
