import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Card, Input } from '../components/ui'
import {
  HiOutlineSparkles,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineCheck,
  HiOutlineArrowLeft,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    
    if (!form.email || !form.password) {
      setError('Please enter both your email address and password.')
      return
    }

    setError('')
    setLoading(true)

    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to sign in. Please verify your email and password.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Brand Showcase (5 cols on lg) */}
        <div className="hidden lg:block lg:col-span-5 space-y-6 pr-4">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2 focus:outline-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <HiOutlineSparkles className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Hire<span className="text-gradient-ai">AI</span>
            </span>
          </Link>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Find opportunities. Match smarter. Get hired.
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            Sign in to access your personal candidate dashboard, track saved jobs, and analyze resumes with Gemini AI.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <HiOutlineCheck className="w-3.5 h-3.5" />
              </div>
              <span>Real-time Live Job Feed with Direct Apply</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <HiOutlineCheck className="w-3.5 h-3.5" />
              </div>
              <span>Instant ATS Resume Compatibility Analysis</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <HiOutlineCheck className="w-3.5 h-3.5" />
              </div>
              <span>Targeted AI Interview Practice Questions</span>
            </div>
          </div>
        </div>

        {/* Right Column: Login Card Container (7 cols on lg) */}
        <div className="lg:col-span-7">
          <Card padding="lg" className="border-slate-200 shadow-card max-w-md mx-auto w-full">
            
            {/* Header */}
            <div className="mb-6 text-center lg:text-left">
              <div className="lg:hidden flex justify-center mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <HiOutlineSparkles className="w-5 h-5" />
                </div>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Enter your credentials to access your HireAI account
              </p>
            </div>

            {/* Error Notification Alert */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
                <HiOutlineExclamationTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Field */}
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  required
                  placeholder="name@company.com"
                  leftIcon={<HiOutlineEnvelope className="w-4 h-4" />}
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              {/* Password Field */}
              <div>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="••••••••"
                  leftIcon={<HiOutlineLockClosed className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 focus:outline-none pointer-events-auto"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <HiOutlineEyeSlash className="w-4 h-4" />
                      ) : (
                        <HiOutlineEye className="w-4 h-4" />
                      )}
                    </button>
                  }
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full shadow-btn-primary py-3"
                  isLoading={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </div>

            </form>

            {/* Registration Shortcut */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Don't have an account yet?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline ml-1"
                >
                  Create an account
                </Link>
              </p>
            </div>

            {/* Back Link */}
            <div className="mt-4 text-center">
              <Link
                to="/"
                className="text-xs font-medium text-slate-400 hover:text-slate-600 inline-flex items-center gap-1"
              >
                <HiOutlineArrowLeft className="w-3.5 h-3.5" /> Back to home
              </Link>
            </div>

          </Card>
        </div>

      </div>
    </div>
  )
}

export default Login