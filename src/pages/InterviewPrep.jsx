import { useState } from "react"
import API from "../utils/api"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const jobRoles = [
  "Frontend Developer",
  "Backend Developer", 
  "Full Stack Developer",
  "React Developer",
  "Node.js Developer",
  "Python Developer",
  "AI/ML Engineer",
  "DevOps Engineer",
  "Data Scientist",
  "Mobile Developer"
]

const InterviewPrep = () => {
  const { user } = useAuth()
  const [selectedRole, setSelectedRole] = useState("")
  const [experience, setExperience] = useState("fresher")
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeQ, setActiveQ] = useState(null)

  const handleGenerate = async () => {
    if (!selectedRole) return setError("Please select a job role!")
    setError("")
    setLoading(true)
    setQuestions([])
    setActiveQ(null)
    try {
      const res = await API.post('/ai/interview', {
        role: selectedRole,
        experience
      })
      setQuestions(res.data.questions)
    } catch (err) {
      setError("Failed to generate questions. Try again!")
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
      <h1 className="text-3xl font-bold text-blue-700 mb-2">🎯 AI Interview Prep</h1>
      <p className="text-gray-500 mb-8">Select your role — AI will generate interview questions with answers!</p>

      {/* Selection Card */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="grid grid-cols-2 gap-6">

          {/* Role Selection */}
          <div>
            <h2 className="font-bold text-gray-700 mb-3">Select Job Role</h2>
            <div className="flex flex-col gap-2">
              {jobRoles.map(role => (
                <div
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`border rounded-lg px-4 py-2 cursor-pointer transition text-sm ${selectedRole === role ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 hover:border-blue-300'}`}
                >
                  {role}
                </div>
              ))}
            </div>
          </div>

          {/* Experience + Generate */}
          <div>
            <h2 className="font-bold text-gray-700 mb-3">Experience Level</h2>
            <div className="flex flex-col gap-3 mb-6">
              {[
                { value: "fresher", label: "🎓 Fresher (0-1 year)" },
                { value: "junior", label: "💼 Junior (1-3 years)" },
                { value: "mid", label: "🚀 Mid Level (3-5 years)" },
              ].map(exp => (
                <div
                  key={exp.value}
                  onClick={() => setExperience(exp.value)}
                  className={`border rounded-lg px-4 py-3 cursor-pointer transition ${experience === exp.value ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 hover:border-blue-300'}`}
                >
                  {exp.label}
                </div>
              ))}
            </div>

            {selectedRole && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-blue-700 text-sm font-medium">Selected: {selectedRole}</p>
                <p className="text-blue-500 text-xs mt-1">Level: {experience}</p>
              </div>
            )}

            {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition disabled:opacity-50"
            >
              {loading ? "🤖 Generating..." : "🎯 Generate Questions"}
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 animate-bounce">🤖</div>
          <h3 className="text-xl font-bold text-blue-600">Generating interview questions...</h3>
          <p className="text-gray-400 mt-2">Please wait!</p>
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            📋 {questions.length} Questions for {selectedRole}
          </h2>
          <div className="flex flex-col gap-4">
            {questions.map((q, i) => (
              <div key={i} className="bg-white rounded-xl shadow overflow-hidden">
                {/* Question */}
                <div
                  onClick={() => setActiveQ(activeQ === i ? null : i)}
                  className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-700 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="font-medium text-gray-800">{q.question}</p>
                  </div>
                  <span className="text-gray-400 text-xl ml-4">{activeQ === i ? '▲' : '▼'}</span>
                </div>

                {/* Answer */}
                {activeQ === i && (
                  <div className="border-t border-gray-100 p-5 bg-green-50">
                    <p className="text-xs font-bold text-green-700 mb-2">✅ ANSWER:</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{q.answer}</p>
                    {q.tip && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                        <p className="text-xs font-bold text-yellow-700">💡 TIP: {q.tip}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {questions.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-gray-600">Ready to practice!</h3>
          <p className="text-gray-400 mt-2">Select role + level → Generate questions</p>
        </div>
      )}
    </div>
  )
}

export default InterviewPrep