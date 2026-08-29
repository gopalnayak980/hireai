import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Card, Input, Select } from '../components/ui'
import {
  HiOutlineSparkles,
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineCheck,
  HiOutlineArrowLeft,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2'

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'jobseeker',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Please fill in all required fields.')
      return
    }

    if (form.password.length < 6) {
      setError('Password should be at least 6 characters long.')
      return
    }

    setError('')
    setLoading(true)

    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration failed. Please verify your details or try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Benefits & Value Proposition (5 cols on lg) */}
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
            Accelerate your career with AI-powered hiring.
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            Join candidates using AI to discover live tech jobs, optimize their resumes for ATS systems, and master technical interviews.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <HiOutlineCheck className="w-3.5 h-3.5" />
              </div>
              <span>Free Candidate Dashboard & Job Bookmarking</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <HiOutlineCheck className="w-3.5 h-3.5" />
              </div>
              <span>Full AI Resume ATS Compatibility Scanner</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <HiOutlineCheck className="w-3.5 h-3.5" />
              </div>
              <span>Role-Specific Interview Q&A Generation</span>
            </div>
          </div>
        </div>

        {/* Right Column: Register Card Container (7 cols on lg) */}
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
                Create Account
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Start discovering opportunities and matching with AI
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
              
              {/* Full Name */}
              <div>
                <Input
                  label="Full Name"
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Gopal Kumar"
                  leftIcon={<HiOutlineUser className="w-4 h-4" />}
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>

              {/* Email Address */}
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  leftIcon={<HiOutlineEnvelope className="w-4 h-4" />}
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="At least 6 characters"
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
                  autoComplete="new-password"
                />
              </div>

              {/* Role Selection */}
              <div>
                <Select
                  label="I am joining as a"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  options={[
                    { value: 'jobseeker', label: 'Job Seeker (Candidate)' },
                    { value: 'recruiter', label: 'Recruiter (Hiring Manager)' },
                  ]}
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full shadow-btn-primary py-3"
                  isLoading={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Free Account'}
                </Button>
              </div>

            </form>

            {/* Login Shortcut */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline ml-1"
                >
                  Sign in here
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

export default Register