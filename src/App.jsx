import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import Login from './pages/Login'
import Register from './pages/Register'
import JobDetail from './pages/JobDetail'
import Dashboard from './pages/Dashboard'
import AIMatch from './pages/AIMatch'
import RealJobs from './pages/RealJobs'
import InterviewPrep from './pages/InterviewPrep'
import Layout from './components/layout/Layout'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-match" element={<AIMatch />} />
          <Route path="/real-jobs" element={<RealJobs />} />
          <Route path="/interview-prep" element={<InterviewPrep />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App