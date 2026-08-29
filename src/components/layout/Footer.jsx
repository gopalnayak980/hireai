import React from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineSparkles } from 'react-icons/hi2'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand & Slogan Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 inline-flex focus:outline-none">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <HiOutlineSparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Hire<span className="text-gradient-ai">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Next-generation career platform powered by AI. Match resumes with precision, discover live opportunities, and master technical interviews with real-time feedback.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-400">
                AI Engine & Live Feed Active
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/real-jobs" className="hover:text-white transition-colors duration-150 flex items-center gap-1.5">
                  <span>Live Job Search</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-1.5 py-0.2 rounded font-medium">LIVE</span>
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="hover:text-white transition-colors duration-150">
                  Featured Roles
                </Link>
              </li>
              <li>
                <Link to="/ai-match" className="hover:text-white transition-colors duration-150 flex items-center gap-1.5">
                  <span>AI Resume Match</span>
                  <span className="text-[10px] bg-violet-950 text-violet-400 border border-violet-800/80 px-1.5 py-0.2 rounded font-medium">AI</span>
                </Link>
              </li>
              <li>
                <Link to="/interview-prep" className="hover:text-white transition-colors duration-150">
                  AI Interview Prep
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors duration-150">
                  User Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/interview-prep" className="hover:text-white transition-colors duration-150">
                  Interview Question Bank
                </Link>
              </li>
              <li>
                <Link to="/ai-match" className="hover:text-white transition-colors duration-150">
                  Resume ATS Scanner
                </Link>
              </li>
              <li>
                <Link to="/real-jobs" className="hover:text-white transition-colors duration-150">
                  Salary & Market Insights
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="hover:text-white transition-colors duration-150">
                  Skill Match Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Account
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="hover:text-white transition-colors duration-150">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors duration-150">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors duration-150">
                  Saved Jobs
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors duration-150">
                  Application Tracker
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom divider and copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} HireAI Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
