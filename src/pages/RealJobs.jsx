import { useState } from "react"
import API from "../utils/api"
import { useAuth } from "../context/AuthContext"

const RealJobs = () => {
  const { user } = useAuth()
  const [what, setWhat] = useState("")
  const [where, setWhere] = useState("")
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [total, setTotal] = useState(0)
  const [savedIds, setSavedIds] = useState([])

  const handleSearch = async () => {
    if (!what) return setError("Please enter a job title!")
    setError("")
    setLoading(true)
    setJobs([])
    try {
      const res = await API.get('/jobs/search', {
        params: { what, where: where || 'india', country: 'in' }
      })
      setJobs(res.data.jobs)
      setTotal(res.data.total)
    } catch (err) {
      setError("Job search failed. Try again!")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (job) => {
    if (!user) return alert("Please login first!")
    try {
      await API.post('/saved', {
        jobId: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        url: job.url
      })
      setSavedIds(prev => [...prev, job.id])
    } catch (err) {
      if (err.response?.data?.message === 'Job already saved!') {
        alert("Job already saved!")
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-2">🔍 Search Real Jobs</h1>
      <p className="text-gray-500 mb-8">Search from thousands of real jobs across India!</p>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Job title, skill... (e.g. React Developer)"
            className="border border-gray-300 rounded-lg px-4 py-3 flex-1 focus:outline-none focus:border-blue-500"
            value={what}
            onChange={e => setWhat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <input
            type="text"
            placeholder="Location (e.g. Bangalore)"
            className="border border-gray-300 rounded-lg px-4 py-3 w-48 focus:outline-none focus:border-blue-500"
            value={where}
            onChange={e => setWhere(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search Jobs"}
          </button>
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          <span className="text-gray-400 text-sm">Quick:</span>
          {["React Developer", "Node.js", "Python Developer", "Full Stack", "Frontend"].map(tag => (
            <button
              key={tag}
              onClick={() => setWhat(tag)}
              className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">{error}</div>}
      {total > 0 && <p className="text-gray-500 mb-4">{total}+ jobs found</p>}

      {loading && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4 animate-bounce">🔍</div>
          <p className="text-blue-600 font-bold text-xl">Searching real jobs...</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {jobs.map(job => (
          <div key={job.id} className="bg-white rounded-xl shadow hover:shadow-md transition p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{job.title}</h2>
                <p className="text-blue-600 font-medium">{job.company}</p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                Live Job
              </span>
            </div>

            <div className="flex gap-4 text-gray-500 text-sm mb-3">
              <span>📍 {job.location}</span>
              <span>💰 {job.salary}</span>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              {job.description?.slice(0, 150)}...
            </p>

            <div className="flex gap-3">
              
                <a href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition font-medium text-sm"
              >
                Apply Nows
              </a>
              <button
                onClick={() => handleSave(job)}
                disabled={savedIds.includes(job.id)}
                className={`px-6 py-2 rounded-lg font-medium text-sm transition border ${savedIds.includes(job.id) ? 'bg-green-50 text-green-600 border-green-300' : 'border-blue-300 text-blue-700 hover:bg-blue-50'}`}
              >
                {savedIds.includes(job.id) ? '✅ Saved' : '🔖 Save Job'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {jobs.length === 0 && !loading && !error && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">💼</div>
          <h3 className="text-xl font-bold text-gray-600">Search for jobs above!</h3>
          <p className="text-gray-400 mt-2">Real jobs from across India</p>
        </div>
      )}
    </div>
  )
}

export default RealJobs