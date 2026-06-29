import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    setError("")
    setLoading(true)
    try {
      await login(form)
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.message || "Login failed!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">

        <h1 className="text-3xl font-bold text-blue-700 text-center mb-2">Welcome Back!</h1>
        <p className="text-gray-400 text-center mb-8">Login to your HireAI account</p>

        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

        <div className="mb-5">
          <label className="block text-gray-600 font-medium mb-2">Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="gopal@gmail.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 font-medium mb-2">Password</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-gray-400 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">Register here</Link>
        </p>

      </div>
    </div>
  )
}

export default Login