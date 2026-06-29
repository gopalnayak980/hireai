import { useState } from "react"
import API from "../utils/api"
import { useAuth } from "../context/AuthContext"
import { Link } from "react-router-dom"

const jobsData = [
  { id: 1, title: "Frontend Developer", company: "Google", description: "Build and maintain high-quality web applications", skills: ["React", "JavaScript", "CSS"] },
  { id: 2, title: "Backend Developer", company: "Amazon", description: "Build scalable microservices and APIs", skills: ["Node.js", "MongoDB", "Express"] },
  { id: 3, title: "Full Stack Developer", company: "Flipkart", description: "Work on cutting-edge e-commerce solutions", skills: ["React", "Node.js", "MongoDB"] },
  { id: 4, title: "Python Developer", company: "Microsoft", description: "Build enterprise-grade applications and automation tools", skills: ["Python", "Flask", "SQL"] },
  { id: 5, title: "React Developer", company: "Zomato", description: "Enhance food delivery platform with new features", skills: ["React", "JavaScript", "Tailwind"] },
  { id: 6, title: "AI/ML Engineer", company: "Infosys", description: "Develop intelligent solutions for enterprise clients", skills: ["Python", "TensorFlow", "AI"] },
]

const AIMatch = () => {
  const { user } = useAuth()
  const [resumeText, setResumeText] = useState("")
  const [selectedJob, setSelectedJob] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleMatch = async () => {
    if (!resumeText) return setError("Please paste your resume!")
    if (!selectedJob) return setError("Please select a job!")
    setError("")
    setLoading(true)
    setResult(null)
    try {
      const res = await API.post('/ai/match', {
        resumeText,
        jobTitle: selectedJob.title,
        jobDescription: selectedJob.description,
        skills: selectedJob.skills
      })
      setResult(res.data)
    } catch (err) {
      setError("AI analysis failed. Try again!")
    } finally {
      setLoading(false)
    }
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
    <div className="min-h-screen bg-gray-50 px-8 py-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-2">🤖 AI Resume Match</h1>
      <p className="text-gray-500 mb-8">Paste your resume and select a job — AI will analyze your match!</p>

      <div className="grid grid-cols-2 gap-8">

        {/* Left — Input */}
        <div>
          {/* Resume Input */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">📄 Paste Your Resume</h2>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 resize-none"
              rows={10}
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
            />
          </div>

          {/* Job Selection */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">💼 Select a Job</h2>
            <div className="flex flex-col gap-3">
              {jobsData.map(job => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`border rounded-lg px-4 py-3 cursor-pointer transition ${selectedJob?.id === job.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                >
                  <p className="font-semibold text-gray-800">{job.title}</p>
                  <p className="text-sm text-gray-500">{job.company}</p>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mt-4 text-sm">{error}</div>}

          <button
            onClick={handleMatch}
            disabled={loading}
            className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-600 transition mt-6 disabled:opacity-50"
          >
            {loading ? "🤖 Analyzing..." : "🚀 Analyze My Resume"}
          </button>
        </div>

        {/* Right — Result */}
        <div>
          {!result && !loading && (
            <div className="bg-white rounded-xl shadow p-8 text-center h-full flex items-center justify-center">
              <div>
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">AI Ready!</h3>
                <p className="text-gray-400">Paste resume + select job → Click Analyze</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-xl shadow p-8 text-center h-full flex items-center justify-center">
              <div>
                <div className="text-6xl mb-4 animate-bounce">🤖</div>
                <h3 className="text-xl font-bold text-blue-600">Analyzing your resume...</h3>
                <p className="text-gray-400 mt-2">Please wait!</p>
              </div>
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-4">

              {/* Match Score */}
              <div className="bg-white rounded-xl shadow p-6 text-center">
                <p className="text-gray-500 mb-2">Match Score</p>
                <div className={`text-6xl font-bold ${result.matchScore >= 70 ? 'text-green-600' : result.matchScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {result.matchScore}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                  <div
                    className={`h-3 rounded-full ${result.matchScore >= 70 ? 'bg-green-500' : result.matchScore >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                    style={{ width: `${result.matchScore}%` }}
                  />
                </div>
                <p className="text-gray-600 mt-3 font-medium">{result.verdict}</p>
              </div>

              {/* Strengths */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-green-700 mb-3">✅ Your Strengths</h3>
                <ul className="flex flex-col gap-2">
                  {result.strengths?.map((s, i) => (
                    <li key={i} className="text-gray-600 text-sm bg-green-50 px-3 py-2 rounded-lg">• {s}</li>
                  ))}
                </ul>
              </div>

              {/* Missing */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-red-600 mb-3">❌ Missing Skills</h3>
                <ul className="flex flex-col gap-2">
                  {result.missing?.map((m, i) => (
                    <li key={i} className="text-gray-600 text-sm bg-red-50 px-3 py-2 rounded-lg">• {m}</li>
                  ))}
                </ul>
              </div>

              {/* Suggestions */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-blue-700 mb-3">💡 AI Suggestions</h3>
                <ul className="flex flex-col gap-2">
                  {result.suggestions?.map((s, i) => (
                    <li key={i} className="text-gray-600 text-sm bg-blue-50 px-3 py-2 rounded-lg">• {s}</li>
                  ))}
                </ul>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIMatch
